import { FaceLandmarkerResult } from '@mediapipe/tasks-vision';

export interface FacialMetrics {
  canthalTilt: number;
  fwhr: number;
  midfaceRatio: number;
  jawlineDefinition: number;
  symmetry: number;
  actualMeasurements: {
    canthalTiltDegrees: number;
    fwhrValue: number;
    midfaceRatioValue: number;
    jawlineAngle: number;
    symmetryScore: number;
  };
}

export interface BaselineData {
  baselineType: 'balanced' | 'wide' | 'narrow';
  idealCanthalTilt: number;
  idealFwhr: number;
  idealMidfaceRatio: number;
  idealJawlineDefinition: number;
}

// ─── MediaPipe 478-point landmark indices ────────────────────────────────────
const L = {
  foreheadTop:    10,
  chinBottom:    152,
  leftCheek:     234,   // zygomatic left (widest face point left)
  rightCheek:    454,   // zygomatic right
  leftEyeOuter:   33,   // left eye lateral canthus
  leftEyeInner:  133,   // left eye medial canthus
  rightEyeInner: 362,   // right eye medial canthus
  rightEyeOuter: 263,   // right eye lateral canthus
  leftGonion:    172,   // lower jaw, left side
  rightGonion:   397,   // lower jaw, right side
  noseTip:         4,
  upperLip:       13,
};

// MediaPipe gives normalised [0,1] coords in SCREEN space.
// Video is 16:9, so 1 x-unit ≠ 1 y-unit in real pixels.
// We correct every mixed horizontal/vertical calculation by this factor.
const ASPECT = 16 / 9; // videoWidth / videoHeight

// Convert normalised landmark to aspect-corrected "pixel-proportional" space
function px(lm: { x: number; y: number }) {
  return { x: lm.x * ASPECT, y: lm.y };
}

// Score that peaks at `ideal`, is 100 there, and falls to 0 at ±`tolerance`
function bandScore(value: number, ideal: number, tolerance: number): number {
  return Math.max(0, Math.min(100, 100 * (1 - Math.abs(value - ideal) / tolerance)));
}

// ─── 1. Canthal tilt ─────────────────────────────────────────────────────────
// Positive = outer eye corner is HIGHER than inner (aesthetically desirable)
// Corrected atan2 direction + aspect ratio applied to x component.
export function computeCanthalTilt(lm: any[]): { score: number; degrees: number } {
  const lo = lm[L.leftEyeOuter],  li = lm[L.leftEyeInner];
  const ri = lm[L.rightEyeInner], ro = lm[L.rightEyeOuter];
  if (!lo || !li || !ri || !ro) return { score: 50, degrees: 0 };

  // Left eye: vector from outer (33) → inner (133)
  // In screen coords: outer is LEFT, inner is RIGHT.
  // Positive tilt ⟹ outer is HIGHER ⟹ inner.y > outer.y ⟹ dy > 0
  const leftDeg = Math.atan2(
    li.y - lo.y,              // dy — positive when outer is higher ✓
    (li.x - lo.x) * ASPECT   // dx corrected for aspect ratio
  ) * (180 / Math.PI);

  // Right eye: vector from inner (362) → outer (263)
  // Outer is RIGHT of inner. Positive tilt ⟹ outer is higher ⟹ inner.y > outer.y
  const rightDeg = Math.atan2(
    ri.y - ro.y,              // dy — positive when outer is higher ✓
    (ro.x - ri.x) * ASPECT   // dx corrected
  ) * (180 / Math.PI);

  const avg = (leftDeg + rightDeg) / 2;

  // Attractive range: +3° to +10°, ideal ~+6°. Tolerance ±10°.
  const score = bandScore(avg, 6, 10);
  return { score, degrees: Math.round(avg * 10) / 10 };
}

// ─── 2. Face Width-to-Height Ratio ───────────────────────────────────────────
// Uses aspect-corrected pixel proportions for a real-world ratio.
export function computeFwhr(lm: any[]): { score: number; value: number } {
  const lc = lm[L.leftCheek], rc = lm[L.rightCheek];
  const ft = lm[L.foreheadTop], cb = lm[L.chinBottom];
  if (!lc || !rc || !ft || !cb) return { score: 50, value: 0 };

  // Horizontal distance — multiply by ASPECT for real pixel proportions
  const realWidth  = Math.abs(rc.x - lc.x) * ASPECT;
  // Vertical distance — no correction needed
  const realHeight = Math.abs(cb.y - ft.y);
  if (realHeight === 0) return { score: 50, value: 0 };

  const fwhr = realWidth / realHeight;

  // After 16:9 aspect correction, total face width/height for real humans:
  // Typical range: 0.60–0.95. Ideal (well-proportioned face): ~0.77.
  // Tolerance ±0.22 covers essentially everyone (0.55 → 0.99).
  const score = bandScore(fwhr, 0.77, 0.22);
  return { score, value: Math.round(fwhr * 100) / 100 };
}

// ─── 3. Midface Ratio ────────────────────────────────────────────────────────
// Eye span (horizontal) vs lower-face height (vertical), aspect-corrected.
export function computeMidfaceRatio(lm: any[]): { score: number; value: number } {
  const lo = lm[L.leftEyeOuter], ro = lm[L.rightEyeOuter];
  const ul = lm[L.upperLip],     cb = lm[L.chinBottom];
  if (!lo || !ro || !ul || !cb) return { score: 50, value: 0 };

  const realEyeSpan   = Math.abs(ro.x - lo.x) * ASPECT;
  const realLowerFace = Math.abs(cb.y - ul.y);
  if (realLowerFace === 0) return { score: 50, value: 0 };

  const ratio = realEyeSpan / realLowerFace;

  // After 16:9 aspect correction, eye span / lower-face height:
  // Typical range: 1.2–2.2. Ideal (balanced midface): ~1.65.
  // Tolerance ±0.55 covers essentially everyone.
  const score = bandScore(ratio, 1.65, 0.55);
  return { score, value: Math.round(ratio * 100) / 100 };
}

// ─── 4. Jawline Definition ───────────────────────────────────────────────────
// Jaw width relative to total face width — purely horizontal, no aspect needed.
// Wider jaw relative to cheekbones = more defined, masculine jaw.
export function computeJawlineAngle(lm: any[]): { score: number; angle: number } {
  const lg = lm[L.leftGonion], rg = lm[L.rightGonion];
  const lc = lm[L.leftCheek],  rc = lm[L.rightCheek];
  if (!lg || !rg || !lc || !rc) return { score: 50, angle: 0 };

  const jawWidth  = Math.abs(rg.x - lg.x);
  const faceWidth = Math.abs(rc.x - lc.x);
  if (faceWidth === 0) return { score: 50, angle: 0 };

  // Jaw-to-face width ratio. ~0.7–0.85 is well-defined. Ideal ~0.78.
  const ratio = jawWidth / faceWidth;
  const score = bandScore(ratio, 0.78, 0.2);

  // Return ratio × 100 as the "angle" field so the UI can display it
  return { score, angle: Math.round(ratio * 100) / 100 };
}

// ─── 5. Facial Symmetry ──────────────────────────────────────────────────────
// Compares mirror-distances of key landmark pairs from the nose midline.
// No aspect ratio correction needed — both sides are same axis (horizontal).
export function computeSymmetry(lm: any[]): { score: number; value: number } {
  const midX = lm[L.noseTip]?.x ?? 0.5;

  const pairs: [number, number][] = [
    [L.leftEyeInner,  L.rightEyeInner],
    [L.leftEyeOuter,  L.rightEyeOuter],
    [L.leftGonion,    L.rightGonion],
    [L.leftCheek,     L.rightCheek],
  ];

  let totalAsymmetry = 0, validPairs = 0;

  for (const [li, ri] of pairs) {
    const l = lm[li], r = lm[ri];
    if (!l || !r) continue;
    const lDist = Math.abs(l.x - midX);
    const rDist = Math.abs(r.x - midX);
    const avg   = (lDist + rDist) / 2 || 0.001;
    totalAsymmetry += Math.abs(lDist - rDist) / avg;
    validPairs++;
  }

  if (validPairs === 0) return { score: 50, value: 0 };

  const avgAsym = totalAsymmetry / validPairs;
  // ~0% asymmetry = 100, ~25% average asymmetry = 0
  const score = Math.max(0, Math.min(100, 100 * (1 - avgAsym / 0.25)));
  return { score, value: Math.round((1 - avgAsym) * 100) / 100 };
}

// ─── Baseline ────────────────────────────────────────────────────────────────
export function calculateBaseline(_lm: any[]): BaselineData {
  return {
    baselineType: 'balanced',
    idealCanthalTilt: 6,
    idealFwhr: 1.75,
    idealMidfaceRatio: 1.0,
    idealJawlineDefinition: 78,
  };
}

// ─── Average multiple frames for stability ───────────────────────────────────
export function averageMetrics(frames: FacialMetrics[]): FacialMetrics {
  if (frames.length === 0) throw new Error('No frames to average');

  const n = frames.length;
  const sum = (key: keyof FacialMetrics) =>
    frames.reduce((s, f) => s + (f[key] as number), 0) / n;

  return {
    canthalTilt:      sum('canthalTilt'),
    fwhr:             sum('fwhr'),
    midfaceRatio:     sum('midfaceRatio'),
    jawlineDefinition: sum('jawlineDefinition'),
    symmetry:         sum('symmetry'),
    actualMeasurements: {
      canthalTiltDegrees: frames.reduce((s, f) => s + f.actualMeasurements.canthalTiltDegrees, 0) / n,
      fwhrValue:          frames.reduce((s, f) => s + f.actualMeasurements.fwhrValue, 0) / n,
      midfaceRatioValue:  frames.reduce((s, f) => s + f.actualMeasurements.midfaceRatioValue, 0) / n,
      jawlineAngle:       frames.reduce((s, f) => s + f.actualMeasurements.jawlineAngle, 0) / n,
      symmetryScore:      frames.reduce((s, f) => s + f.actualMeasurements.symmetryScore, 0) / n,
    },
  };
}

// ─── Single frame analysis ───────────────────────────────────────────────────
export function analyzeFrame(landmarks: any[]): FacialMetrics {
  const ct = computeCanthalTilt(landmarks);
  const fw = computeFwhr(landmarks);
  const mf = computeMidfaceRatio(landmarks);
  const jw = computeJawlineAngle(landmarks);
  const sy = computeSymmetry(landmarks);

  return {
    canthalTilt:       ct.score,
    fwhr:              fw.score,
    midfaceRatio:      mf.score,
    jawlineDefinition: jw.score,
    symmetry:          sy.score,
    actualMeasurements: {
      canthalTiltDegrees: ct.degrees,
      fwhrValue:          fw.value,
      midfaceRatioValue:  mf.value,
      jawlineAngle:       jw.angle,
      symmetryScore:      sy.value,
    },
  };
}

// ─── Entry point ─────────────────────────────────────────────────────────────
export function analyzeFace(result: FaceLandmarkerResult): {
  metrics: FacialMetrics;
  baseline: BaselineData;
  landmarks: any[];
} {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
    throw new Error('No face landmarks detected');
  }
  const landmarks = result.faceLandmarks[0];
  return { metrics: analyzeFrame(landmarks), baseline: calculateBaseline(landmarks), landmarks };
}
