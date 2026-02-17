import { MultiAngleSessionData } from './store';
import {
  FacialMetrics,
  BaselineData,
  computeCanthalTilt as calculateCanthalTilt,
  computeFwhr as calculateFwhr,
  computeMidfaceRatio as calculateMidfaceRatio,
  calculateBaseline,
} from './calculations';

// stub — kept only to satisfy old imports; not called by the new app
const calculateSkinSmoothness = (_lm: any[]) => 70;

const IPD_CONSTANT_MM = 63;

interface Point2D {
  x: number;
  y: number;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

function calculateDistance2D(p1: Point2D, p2: Point2D): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function calculateDistance3D(p1: Point3D, p2: Point3D): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = p2.z - p1.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function calculateAngle2D(
  point1: Point2D,
  vertex: Point2D,
  point2: Point2D
): number {
  const v1 = { x: point1.x - vertex.x, y: point1.y - vertex.y };
  const v2 = { x: point2.x - vertex.x, y: point2.y - vertex.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  const angle = Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2 || 0.001))));
  return (angle * 180) / Math.PI;
}

function getPixelToMmRatio(frontLandmarks: any[], videoWidth: number): number {
  let leftPupil = frontLandmarks[468];
  let rightPupil = frontLandmarks[473];

  if (!leftPupil || !rightPupil) {
    leftPupil = frontLandmarks[33];
    rightPupil = frontLandmarks[263];
  }

  if (!leftPupil || !rightPupil) {
    return 1;
  }

  const pixelDistance = calculateDistance2D(
    { x: leftPupil.x * videoWidth, y: leftPupil.y * videoWidth },
    { x: rightPupil.x * videoWidth, y: rightPupil.y * videoWidth }
  );

  if (pixelDistance === 0) return 1;

  const ipdConstant = leftPupil === frontLandmarks[468] ? IPD_CONSTANT_MM : IPD_CONSTANT_MM * 0.85;
  return ipdConstant / pixelDistance;
}

function calculateTrueGonialAngle(profileLandmarks: any[], videoWidth: number, isRightProfile: boolean): number {
  const gonial = isRightProfile ? profileLandmarks[397] : profileLandmarks[172];
  const menton = profileLandmarks[152];
  const earRegion = isRightProfile ? profileLandmarks[454] : profileLandmarks[234];

  if (!gonial || !menton) {
    return 120;
  }

  let referencePoint;
  if (earRegion) {
    referencePoint = { x: earRegion.x * videoWidth, y: earRegion.y * videoWidth };
  } else {
    const forehead = profileLandmarks[10];
    if (forehead) {
      referencePoint = { 
        x: (forehead.x + gonial.x) / 2 * videoWidth, 
        y: (forehead.y + gonial.y) / 2 * videoWidth 
      };
    } else {
      referencePoint = { 
        x: gonial.x * videoWidth, 
        y: (gonial.y - 0.1) * videoWidth 
      };
    }
  }

  const gonial2D = { x: gonial.x * videoWidth, y: gonial.y * videoWidth };
  const menton2D = { x: menton.x * videoWidth, y: menton.y * videoWidth };

  return calculateAngle2D(referencePoint, gonial2D, menton2D);
}

function calculateNoseChinProjection(profileLandmarks: any[], videoWidth: number): {
  noseProjection: number;
  chinProjection: number;
} {
  const philtrum = profileLandmarks[2];
  const noseTip = profileLandmarks[1];
  const chinTip = profileLandmarks[152];

  if (!philtrum || !noseTip || !chinTip) {
    return { noseProjection: 0, chinProjection: 0 };
  }

  const philtrumX = philtrum.x * videoWidth;
  const noseTipX = noseTip.x * videoWidth;
  const chinTipX = chinTip.x * videoWidth;

  const noseProjection = Math.abs(noseTipX - philtrumX);
  const chinProjection = Math.abs(chinTipX - philtrumX);

  return { noseProjection, chinProjection };
}

function reconstructZDepth(
  frontLandmarks: any[],
  rightProfileLandmarks: any[],
  leftProfileLandmarks: any[],
  videoWidth: number,
  pixelToMm: number
): any[] {
  const philtrum = frontLandmarks[2];
  if (!philtrum) {
    return frontLandmarks.map(l => ({ x: l.x, y: l.y, z: l.z || 0 }));
  }

  const philtrumX = philtrum.x;
  
  const rightNoseTip = rightProfileLandmarks[1];
  const leftNoseTip = leftProfileLandmarks[1];
  const rightChin = rightProfileLandmarks[152];
  const leftChin = leftProfileLandmarks[152];

  let noseZDepth = 0;
  let chinZDepth = 0;
  let maxZDepth = 0;

  if (rightNoseTip && leftNoseTip) {
    const rightNoseX = rightNoseTip.x;
    const leftNoseX = leftNoseTip.x;
    const avgNoseX = (rightNoseX + leftNoseX) / 2;
    noseZDepth = Math.abs(avgNoseX - philtrumX);
    maxZDepth = Math.max(maxZDepth, noseZDepth);
  }

  if (rightChin && leftChin) {
    const rightChinX = rightChin.x;
    const leftChinX = leftChin.x;
    const avgChinX = (rightChinX + leftChinX) / 2;
    chinZDepth = Math.abs(avgChinX - philtrumX);
    maxZDepth = Math.max(maxZDepth, chinZDepth);
  }

  if (maxZDepth === 0) {
    return frontLandmarks.map(l => ({ x: l.x, y: l.y, z: l.z || 0 }));
  }

  const zNormalization = 1.0 / (maxZDepth * 2);

  const fusedLandmarks = frontLandmarks.map((landmark, index) => {
    const frontX = landmark.x;
    const frontY = landmark.y;
    let z = landmark.z || 0;

    if (index === 1 && noseZDepth > 0) {
      z = noseZDepth * zNormalization;
    } else if (index === 152 && chinZDepth > 0) {
      z = chinZDepth * zNormalization;
    } else {
      const baseZ = Math.min(noseZDepth, chinZDepth) || 0;
      const relativeZ = Math.abs(landmark.x - philtrumX) * zNormalization;
      z = relativeZ * 0.5;
    }

    if (!isFinite(z) || isNaN(z)) {
      z = landmark.z || 0;
    }

    return { x: frontX, y: frontY, z };
  });

  return fusedLandmarks;
}

export interface FusedMetrics extends FacialMetrics {
  gonialSharpness: number;
  mandibularPlane: number;
  orbitalVector: number;
  trueGonialAngle: number;
  noseProjection: number;
  chinProjection: number;
}

export function calculateTrueMetrics(sessionData: MultiAngleSessionData): {
  fusedLandmarks: any[];
  metrics: FusedMetrics;
  baseline: BaselineData;
  pixelToMm: number;
} {
  const { front, rightProfile, leftProfile } = sessionData;
  const videoWidth = front.videoDimensions.width;
  const videoHeight = front.videoDimensions.height;

  const pixelToMm = getPixelToMmRatio(front.landmarks, videoWidth);

  const rightGonialAngle = calculateTrueGonialAngle(rightProfile.landmarks, videoWidth, true);
  const leftGonialAngle = calculateTrueGonialAngle(leftProfile.landmarks, videoWidth, false);
  const trueGonialAngle = (rightGonialAngle + leftGonialAngle) / 2;

  const rightProjection = calculateNoseChinProjection(rightProfile.landmarks, videoWidth);
  const leftProjection = calculateNoseChinProjection(leftProfile.landmarks, videoWidth);
  const noseProjection = ((rightProjection.noseProjection + leftProjection.noseProjection) / 2) * pixelToMm;
  const chinProjection = ((rightProjection.chinProjection + leftProjection.chinProjection) / 2) * pixelToMm;

  const baseline = calculateBaseline(front.landmarks);

  const fusedLandmarks = front.landmarks.map(l => ({
    x: l.x,
    y: l.y,
    z: l.z || 0,
    visibility: l.visibility || 1.0,
  }));

  const canthalTiltResult = calculateCanthalTilt(front.landmarks);
  const fwhrResult = calculateFwhr(front.landmarks);
  const midfaceRatioResult = calculateMidfaceRatio(front.landmarks);
  const skinSmoothness = calculateSkinSmoothness(front.landmarks);

  const idealGonialAngle = 120;
  const gonialDeviation = Math.abs(trueGonialAngle - idealGonialAngle);
  const gonialSharpness = Math.max(0, 100 - gonialDeviation * 2);

  const idealMandibularPlane = 25;
  const mandibularPlaneValue = trueGonialAngle - 90;
  const mandibularDeviation = Math.abs(mandibularPlaneValue - idealMandibularPlane);
  const mandibularPlane = Math.max(0, 100 - mandibularDeviation * 3);

  const leftEyeInner = front.landmarks[33];
  const rightEyeInner = front.landmarks[263];
  const leftEyeOuter = front.landmarks[133];
  const rightEyeOuter = front.landmarks[362];
  
  let orbitalVector = 50;
  if (leftEyeInner && rightEyeInner && leftEyeOuter && rightEyeOuter) {
    const intercanthalDist = calculateDistance2D(
      { x: leftEyeInner.x, y: leftEyeInner.y },
      { x: rightEyeInner.x, y: rightEyeInner.y }
    );
    const leftOrbitalWidth = calculateDistance2D(
      { x: leftEyeInner.x, y: leftEyeInner.y },
      { x: leftEyeOuter.x, y: leftEyeOuter.y }
    );
    const rightOrbitalWidth = calculateDistance2D(
      { x: rightEyeInner.x, y: rightEyeInner.y },
      { x: rightEyeOuter.x, y: rightEyeOuter.y }
    );
    const avgOrbitalWidth = (leftOrbitalWidth + rightOrbitalWidth) / 2;
    const orbitalRatio = intercanthalDist / (avgOrbitalWidth || 0.001);
    const idealRatio = 1.0;
    const deviation = Math.abs(orbitalRatio - idealRatio);
    orbitalVector = Math.max(0, 100 - deviation * 100);
  }

  const metrics: FusedMetrics = {
    canthalTilt: canthalTiltResult.score,
    fwhr: fwhrResult.score,
    midfaceRatio: midfaceRatioResult.score,
    jawlineDefinition: gonialSharpness,
    symmetry: 70,
    gonialSharpness,
    mandibularPlane,
    orbitalVector,
    trueGonialAngle,
    noseProjection,
    chinProjection,
    actualMeasurements: {
      canthalTiltDegrees: canthalTiltResult.degrees,
      fwhrValue: fwhrResult.value,
      midfaceRatioValue: midfaceRatioResult.value,
      jawlineAngle: trueGonialAngle,
      symmetryScore: 0,
    },
  };

  return {
    fusedLandmarks,
    metrics,
    baseline,
    pixelToMm,
  };
}

