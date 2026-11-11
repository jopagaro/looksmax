import { FaceLandmarkerResult } from '@mediapipe/tasks-vision';

// ═════════════════════════════════════════════════════════════════════════════
// LOOKSMAX measurement engine v2
//
// Why scores used to feel randomized, and what fixes it here:
//  1. POSE GATING — a few degrees of head yaw/roll shifts every width ratio
//     and nukes symmetry. Frames are now scored only when the head is
//     actually frontal (roll + nose-offset checks). Scanner shows a hint
//     when frames are being rejected.
//  2. MEDIAN, NOT MEAN — one blurry/turned frame can no longer drag the
//     average. The median of accepted frames is the result.
//  3. MORE METRICS, WEIGHTED — 9 geometry metrics + teeth. No single noisy
//     ratio can swing the overall score by much.
// ═════════════════════════════════════════════════════════════════════════════

export interface FacialMetrics {
  symmetry: number;
  canthalTilt: number;
  fwhr: number;
  midfaceRatio: number;
  jawlineDefinition: number;
  gonialAngle: number;
  eyeSpacing: number;
  lowerThird: number;
  mouthNose: number;
  /** Null when no open-mouth smile was captured. */
  teethWhiteness: number | null;
  actualMeasurements: {
    symmetryScore: number;
    canthalTiltDegrees: number;
    fwhrValue: number;
    midfaceRatioValue: number;
    jawlineAngle: number; // jaw/cheek width ratio (legacy field name)
    gonialAngleDegrees: number;
    eyeSpacingValue: number; // IPD / bizygomatic width (ES ratio)
    lowerThirdValue: number; // chin-height / philtrum-height
    mouthNoseValue: number; // mouth width / nose width
    teethYellowness: number | null; // yellow index, lower = whiter
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
  foreheadTop: 10,
  chinBottom: 152,
  leftCheek: 234, // zygomatic left (widest face point left)
  rightCheek: 454, // zygomatic right
  leftEyeOuter: 33,
  leftEyeInner: 133,
  rightEyeInner: 362,
  rightEyeOuter: 263,
  leftGonion: 172, // jaw width point left
  rightGonion: 397, // jaw width point right
  leftJawCorner: 58, // mandible angle region left
  rightJawCorner: 288, // mandible angle region right
  noseTip: 4,
  subnasale: 2,
  upperLipTop: 0,
  upperLipInner: 13,
  lowerLipInner: 14,
  lowerLipBottom: 17,
  mouthLeft: 61,
  mouthRight: 291,
  mouthInnerLeft: 78,
  mouthInnerRight: 308,
  leftIris: 468, // present with 478-landmark model
  rightIris: 473,
};

// Nose alar-width candidate pairs (left, right). The widest spread across
// these nose-region pairs approximates alar width robustly.
const ALAR_PAIRS: [number, number][] = [
  [48, 278],
  [98, 327],
  [64, 294],
  [129, 358],
];

const ASPECT = 16 / 9;

// Gaussian score: 100 at `ideal`, smooth falloff with tolerance `sigma`.
function bandScore(value: number, ideal: number, sigma: number): number {
  const z = (value - ideal) / sigma;
  return Math.max(0, Math.min(100, 100 * Math.exp(-0.5 * z * z)));
}

// ─── Head pose check ─────────────────────────────────────────────────────────
// Frames where the head is turned or tilted produce garbage ratios.
export interface PoseCheck {
  rollDeg: number; // head tilt (eye-line angle)
  noseOffset: number; // nose-tip x offset from face center, as fraction of face width
  frontal: boolean;
}

export function computePose(lm: any[], aspect: number = ASPECT): PoseCheck {
  const lo = lm[L.leftEyeOuter],
    ro = lm[L.rightEyeOuter],
    lc = lm[L.leftCheek],
    rc = lm[L.rightCheek],
    nose = lm[L.noseTip];
  if (!lo || !ro || !lc || !rc || !nose) {
    return { rollDeg: 0, noseOffset: 0, frontal: false };
  }

  const rollDeg =
    Math.atan2(ro.y - lo.y, (ro.x - lo.x) * aspect) * (180 / Math.PI);

  const faceWidth = Math.abs(rc.x - lc.x) || 0.001;
  const midX = (rc.x + lc.x) / 2;
  const noseOffset = (nose.x - midX) / faceWidth;

  const frontal = Math.abs(rollDeg) < 6 && Math.abs(noseOffset) < 0.07;
  return { rollDeg, noseOffset, frontal };
}

// ─── 1. Canthal tilt ─────────────────────────────────────────────────────────
export function computeCanthalTilt(lm: any[], aspect: number = ASPECT): { score: number; degrees: number } {
  const lo = lm[L.leftEyeOuter],
    li = lm[L.leftEyeInner],
    ri = lm[L.rightEyeInner],
    ro = lm[L.rightEyeOuter];
  if (!lo || !li || !ri || !ro) return { score: 50, degrees: 0 };

  const leftDeg = Math.atan2(li.y - lo.y, (li.x - lo.x) * aspect) * (180 / Math.PI);
  const rightDeg = Math.atan2(ri.y - ro.y, (ro.x - ri.x) * aspect) * (180 / Math.PI);
  const avg = (leftDeg + rightDeg) / 2;

  // Attractive range +3° to +10°, ideal ~+6°.
  return { score: bandScore(avg, 6, 7), degrees: Math.round(avg * 10) / 10 };
}

// ─── 2. fWHR (width / full forehead-to-chin height) ──────────────────────────
export function computeFwhr(lm: any[], aspect: number = ASPECT): { score: number; value: number } {
  const lc = lm[L.leftCheek],
    rc = lm[L.rightCheek],
    ft = lm[L.foreheadTop],
    cb = lm[L.chinBottom];
  if (!lc || !rc || !ft || !cb) return { score: 50, value: 0 };

  const realWidth = Math.abs(rc.x - lc.x) * aspect;
  const realHeight = Math.abs(cb.y - ft.y);
  if (realHeight === 0) return { score: 50, value: 0 };

  const fwhr = realWidth / realHeight;
  // Calibrated to THIS formula's output (width / full-face height ≈ 0.70–0.95).
  return { score: bandScore(fwhr, 0.82, 0.15), value: Math.round(fwhr * 100) / 100 };
}

// ─── 3. Midface ratio ────────────────────────────────────────────────────────
export function computeMidfaceRatio(lm: any[], aspect: number = ASPECT): { score: number; value: number } {
  const lo = lm[L.leftEyeOuter],
    ro = lm[L.rightEyeOuter],
    ul = lm[L.upperLipInner],
    cb = lm[L.chinBottom];
  if (!lo || !ro || !ul || !cb) return { score: 50, value: 0 };

  const realEyeSpan = Math.abs(ro.x - lo.x) * aspect;
  const realLowerFace = Math.abs(cb.y - ul.y);
  if (realLowerFace === 0) return { score: 50, value: 0 };

  const ratio = realEyeSpan / realLowerFace;
  return { score: bandScore(ratio, 1.9, 0.45), value: Math.round(ratio * 100) / 100 };
}

// ─── 4. Jawline definition (jaw width / cheek width) ─────────────────────────
export function computeJawlineAngle(lm: any[]): { score: number; angle: number } {
  const lg = lm[L.leftGonion],
    rg = lm[L.rightGonion],
    lc = lm[L.leftCheek],
    rc = lm[L.rightCheek];
  if (!lg || !rg || !lc || !rc) return { score: 50, angle: 0 };

  const faceWidth = Math.abs(rc.x - lc.x);
  if (faceWidth === 0) return { score: 50, angle: 0 };

  const ratio = Math.abs(rg.x - lg.x) / faceWidth;
  return { score: bandScore(ratio, 0.78, 0.12), angle: Math.round(ratio * 100) / 100 };
}

// ─── 5. Symmetry ─────────────────────────────────────────────────────────────
// Midline = average of all pair midpoints (more stable than nose tip alone).
export function computeSymmetry(lm: any[]): { score: number; value: number } {
  const pairs: [number, number][] = [
    [L.leftEyeInner, L.rightEyeInner],
    [L.leftEyeOuter, L.rightEyeOuter],
    [L.leftGonion, L.rightGonion],
    [L.leftCheek, L.rightCheek],
    [L.mouthLeft, L.mouthRight],
  ];

  const valid = pairs.filter(([a, b]) => lm[a] && lm[b]);
  if (valid.length === 0) return { score: 50, value: 0 };

  const midX =
    valid.reduce((s, [a, b]) => s + (lm[a].x + lm[b].x) / 2, 0) / valid.length;

  let totalAsymmetry = 0;
  for (const [a, b] of valid) {
    const lDist = Math.abs(lm[a].x - midX);
    const rDist = Math.abs(lm[b].x - midX);
    const avg = (lDist + rDist) / 2 || 0.001;
    totalAsymmetry += Math.abs(lDist - rDist) / avg;
  }

  const avgAsym = totalAsymmetry / valid.length;
  const score = Math.max(0, Math.min(100, 100 * (1 - avgAsym / 0.25)));
  return { score, value: Math.round((1 - avgAsym) * 100) / 100 };
}

// ─── 6. Gonial angle (forum-famous jaw corner angle) ─────────────────────────
// Angle at the mandible corner between the ear direction and the chin
// direction, averaged over both sides. Front-view proxy for the lateral
// gonial angle the forums obsess over (ideal lateral ≈ 115–125°).
export function computeGonialAngle(lm: any[], aspect: number = ASPECT): { score: number; degrees: number } {
  const angleAt = (g: any, a: any, b: any): number | null => {
    if (!g || !a || !b) return null;
    const v1 = { x: (a.x - g.x) * aspect, y: a.y - g.y };
    const v2 = { x: (b.x - g.x) * aspect, y: b.y - g.y };
    const m1 = Math.hypot(v1.x, v1.y),
      m2 = Math.hypot(v2.x, v2.y);
    if (m1 === 0 || m2 === 0) return null;
    const cos = Math.max(-1, Math.min(1, (v1.x * v2.x + v1.y * v2.y) / (m1 * m2)));
    return (Math.acos(cos) * 180) / Math.PI;
  };

  const left = angleAt(lm[L.leftJawCorner], lm[L.leftCheek], lm[L.chinBottom]);
  const right = angleAt(lm[L.rightJawCorner], lm[L.rightCheek], lm[L.chinBottom]);
  const angles = [left, right].filter((a): a is number => a !== null);
  if (angles.length === 0) return { score: 50, degrees: 0 };

  const avg = angles.reduce((s, a) => s + a, 0) / angles.length;
  // Calibrated to this front-view formula's output. Ideal ~120°, sigma 14.
  return { score: bandScore(avg, 120, 14), degrees: Math.round(avg * 10) / 10 };
}

// ─── 7. Eye spacing (ES ratio) ───────────────────────────────────────────────
// Interpupillary distance / bizygomatic width. The forums' "ES ratio".
export function computeEyeSpacing(lm: any[]): { score: number; value: number } {
  const lc = lm[L.leftCheek],
    rc = lm[L.rightCheek];
  if (!lc || !rc) return { score: 50, value: 0 };

  // Iris centers when the 478-landmark model provides them; else eye-corner midpoints.
  let lx: number, rx: number;
  if (lm[L.leftIris] && lm[L.rightIris]) {
    lx = lm[L.leftIris].x;
    rx = lm[L.rightIris].x;
  } else if (lm[L.leftEyeOuter] && lm[L.leftEyeInner] && lm[L.rightEyeOuter] && lm[L.rightEyeInner]) {
    lx = (lm[L.leftEyeOuter].x + lm[L.leftEyeInner].x) / 2;
    rx = (lm[L.rightEyeOuter].x + lm[L.rightEyeInner].x) / 2;
  } else {
    return { score: 50, value: 0 };
  }

  const faceWidth = Math.abs(rc.x - lc.x);
  if (faceWidth === 0) return { score: 50, value: 0 };

  const ratio = Math.abs(rx - lx) / faceWidth;
  // IPD ~63mm over bizygomatic ~139mm ≈ 0.45. Ideal 0.46, sigma 0.035.
  return { score: bandScore(ratio, 0.46, 0.035), value: Math.round(ratio * 1000) / 1000 };
}

// ─── 8. Lower-third harmony (philtrum vs chin height) ────────────────────────
// Classic 1:2 rule — chin segment should be about twice the philtrum.
export function computeLowerThird(lm: any[]): { score: number; value: number } {
  const sn = lm[L.subnasale],
    ult = lm[L.upperLipTop],
    llb = lm[L.lowerLipBottom],
    cb = lm[L.chinBottom];
  if (!sn || !ult || !llb || !cb) return { score: 50, value: 0 };

  const philtrum = Math.abs(ult.y - sn.y);
  const chinSeg = Math.abs(cb.y - llb.y);
  if (philtrum === 0) return { score: 50, value: 0 };

  const ratio = chinSeg / philtrum;
  // Ideal chin:philtrum ≈ 2.2, sigma 0.55.
  return { score: bandScore(ratio, 2.2, 0.55), value: Math.round(ratio * 100) / 100 };
}

// ─── 9. Mouth-to-nose width ratio ────────────────────────────────────────────
// Golden-ish proportion: mouth ≈ 1.5–1.6 × nose width.
export function computeMouthNose(lm: any[]): { score: number; value: number } {
  const ml = lm[L.mouthLeft],
    mr = lm[L.mouthRight];
  if (!ml || !mr) return { score: 50, value: 0 };

  let noseWidth = 0;
  for (const [a, b] of ALAR_PAIRS) {
    if (lm[a] && lm[b]) noseWidth = Math.max(noseWidth, Math.abs(lm[b].x - lm[a].x));
  }
  if (noseWidth === 0) return { score: 50, value: 0 };

  const ratio = Math.abs(mr.x - ml.x) / noseWidth;
  return { score: bandScore(ratio, 1.55, 0.25), value: Math.round(ratio * 100) / 100 };
}

// ─── 10. Teeth whiteness (needs an open-mouth smile + pixel access) ──────────
// Samples pixels inside the inner-mouth region, filters for plausible tooth
// pixels (bright, desaturated, not red), and scores the yellow index.
export function sampleTeethColor(
  source: CanvasImageSource,
  lm: any[],
  srcW: number,
  srcH: number,
  workCanvas: HTMLCanvasElement
): { score: number; yellowIndex: number } | null {
  const li = lm[L.mouthInnerLeft],
    ri = lm[L.mouthInnerRight],
    ui = lm[L.upperLipInner],
    lo = lm[L.lowerLipInner];
  if (!li || !ri || !ui || !lo) return null;

  // Inner-mouth box in source pixels
  let x0 = Math.min(li.x, ri.x) * srcW;
  let x1 = Math.max(li.x, ri.x) * srcW;
  let y0 = ui.y * srcH;
  let y1 = lo.y * srcH;

  const w = x1 - x0,
    h = y1 - y0;
  // Mouth must actually be open enough to show teeth
  if (h < 7 || w < 16 || h < w * 0.12) return null;

  // Inset to avoid lip edges
  x0 += w * 0.14;
  x1 -= w * 0.14;
  y0 += h * 0.12;
  y1 -= h * 0.2; // larger bottom inset — tongue/shadow live there

  const bw = Math.max(1, Math.round(x1 - x0));
  const bh = Math.max(1, Math.round(y1 - y0));
  workCanvas.width = bw;
  workCanvas.height = bh;
  const ctx = workCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  try {
    ctx.drawImage(source, x0, y0, bw, bh, 0, 0, bw, bh);
    const data = ctx.getImageData(0, 0, bw, bh).data;

    let rSum = 0,
      gSum = 0,
      bSum = 0,
      count = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      const max = Math.max(r, g, b),
        min = Math.min(r, g, b);
      const brightness = (r + g + b) / 3;
      const sat = max === 0 ? 0 : (max - min) / max;
      // Tooth pixels: bright, low saturation, not red-dominant (lips/gums/tongue)
      if (brightness > 72 && sat < 0.42 && r - g < 55 && g >= b - 12) {
        rSum += r;
        gSum += g;
        bSum += b;
        count++;
      }
    }

    // Need a real patch of tooth pixels, not noise
    if (count < 40) return null;

    const r = rSum / count,
      g = gSum / count,
      b = bSum / count;
    const yellowIndex = Math.max(0, (r + g) / 2 - b); // 0 = pure neutral white
    // Whitened teeth ≈ 5–18, average ≈ 20–35, stained ≈ 40+
    const score = Math.max(5, Math.min(100, 100 - Math.max(0, yellowIndex - 14) * 2.4));
    return { score: Math.round(score), yellowIndex: Math.round(yellowIndex) };
  } catch {
    return null; // tainted canvas or decode issue
  }
}

// ─── Overall score: weighted composite ───────────────────────────────────────
const WEIGHTS: { key: keyof FacialMetrics; w: number }[] = [
  { key: 'symmetry', w: 0.16 },
  { key: 'canthalTilt', w: 0.12 },
  { key: 'fwhr', w: 0.1 },
  { key: 'midfaceRatio', w: 0.1 },
  { key: 'jawlineDefinition', w: 0.13 },
  { key: 'gonialAngle', w: 0.12 },
  { key: 'eyeSpacing', w: 0.12 },
  { key: 'lowerThird', w: 0.08 },
  { key: 'mouthNose', w: 0.05 },
  { key: 'teethWhiteness', w: 0.07 },
];

export function computeOverallScore(m: FacialMetrics): number {
  let total = 0,
    weightSum = 0;
  for (const { key, w } of WEIGHTS) {
    const v = m[key];
    if (typeof v === 'number') {
      total += v * w;
      weightSum += w;
    }
  }
  return weightSum > 0 ? Math.round(total / weightSum) : 0;
}

// ─── Baseline ────────────────────────────────────────────────────────────────
export function calculateBaseline(_lm: any[]): BaselineData {
  return {
    baselineType: 'balanced',
    idealCanthalTilt: 6,
    idealFwhr: 0.82,
    idealMidfaceRatio: 1.9,
    idealJawlineDefinition: 78,
  };
}

// ─── Median across frames (robust to outlier frames) ─────────────────────────
function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function medianMetrics(frames: FacialMetrics[]): FacialMetrics {
  if (frames.length === 0) throw new Error('No frames to aggregate');

  const med = (pick: (f: FacialMetrics) => number) => median(frames.map(pick));
  const medA = (pick: (f: FacialMetrics) => number) =>
    median(frames.map((f) => pick(f)));

  return {
    symmetry: med((f) => f.symmetry),
    canthalTilt: med((f) => f.canthalTilt),
    fwhr: med((f) => f.fwhr),
    midfaceRatio: med((f) => f.midfaceRatio),
    jawlineDefinition: med((f) => f.jawlineDefinition),
    gonialAngle: med((f) => f.gonialAngle),
    eyeSpacing: med((f) => f.eyeSpacing),
    lowerThird: med((f) => f.lowerThird),
    mouthNose: med((f) => f.mouthNose),
    teethWhiteness: null, // filled in separately from the smile phase
    actualMeasurements: {
      symmetryScore: medA((f) => f.actualMeasurements.symmetryScore),
      canthalTiltDegrees: medA((f) => f.actualMeasurements.canthalTiltDegrees),
      fwhrValue: medA((f) => f.actualMeasurements.fwhrValue),
      midfaceRatioValue: medA((f) => f.actualMeasurements.midfaceRatioValue),
      jawlineAngle: medA((f) => f.actualMeasurements.jawlineAngle),
      gonialAngleDegrees: medA((f) => f.actualMeasurements.gonialAngleDegrees),
      eyeSpacingValue: medA((f) => f.actualMeasurements.eyeSpacingValue),
      lowerThirdValue: medA((f) => f.actualMeasurements.lowerThirdValue),
      mouthNoseValue: medA((f) => f.actualMeasurements.mouthNoseValue),
      teethYellowness: null,
    },
  };
}

/** @deprecated kept for compatibility; medianMetrics is more robust */
export const averageMetrics = medianMetrics;

// ─── Single frame analysis ───────────────────────────────────────────────────
export function analyzeFrame(landmarks: any[], aspect: number = ASPECT): FacialMetrics {
  const ct = computeCanthalTilt(landmarks, aspect);
  const fw = computeFwhr(landmarks, aspect);
  const mf = computeMidfaceRatio(landmarks, aspect);
  const jw = computeJawlineAngle(landmarks);
  const sy = computeSymmetry(landmarks);
  const ga = computeGonialAngle(landmarks, aspect);
  const es = computeEyeSpacing(landmarks);
  const lt = computeLowerThird(landmarks);
  const mn = computeMouthNose(landmarks);

  return {
    symmetry: sy.score,
    canthalTilt: ct.score,
    fwhr: fw.score,
    midfaceRatio: mf.score,
    jawlineDefinition: jw.score,
    gonialAngle: ga.score,
    eyeSpacing: es.score,
    lowerThird: lt.score,
    mouthNose: mn.score,
    teethWhiteness: null,
    actualMeasurements: {
      symmetryScore: sy.value,
      canthalTiltDegrees: ct.degrees,
      fwhrValue: fw.value,
      midfaceRatioValue: mf.value,
      jawlineAngle: jw.angle,
      gonialAngleDegrees: ga.degrees,
      eyeSpacingValue: es.value,
      lowerThirdValue: lt.value,
      mouthNoseValue: mn.value,
      teethYellowness: null,
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
