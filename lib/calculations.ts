import { FaceLandmarkerResult } from '@mediapipe/tasks-vision';

export interface FacialMetrics {
  canthalTilt: number;
  fwhr: number;
  midfaceRatio: number;
  jawlineDefinition: number;
  skinSmoothness: number;
}

export interface BaselineData {
  baselineType: 'type_a' | 'type_b' | 'type_c';
  idealCanthalTilt: number;
  idealFwhr: number;
  idealMidfaceRatio: number;
  idealJawlineDefinition: number;
}

function calculateDistance(
  point1: { x: number; y: number; z?: number },
  point2: { x: number; y: number; z?: number }
): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  const dz = (point2.z || 0) - (point1.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function calculateAngle(
  point1: { x: number; y: number },
  vertex: { x: number; y: number },
  point2: { x: number; y: number }
): number {
  const v1 = { x: point1.x - vertex.x, y: point1.y - vertex.y };
  const v2 = { x: point2.x - vertex.x, y: point2.y - vertex.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  const angle = Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
  return (angle * 180) / Math.PI;
}

function calculateDemographicBaseline(landmarks: any[]): BaselineData {
  if (!landmarks || landmarks.length < 400) {
    return {
      baselineType: 'type_a',
      idealCanthalTilt: 8,
      idealFwhr: 1.80,
      idealMidfaceRatio: 1.0,
      idealJawlineDefinition: 80,
    };
  }

  const leftEyeInner = landmarks[33];
  const rightEyeInner = landmarks[263];
  const noseTip1 = landmarks[1];
  const noseTip2 = landmarks[2];

  if (!leftEyeInner || !rightEyeInner || !noseTip1 || !noseTip2) {
    return {
      baselineType: 'type_a',
      idealCanthalTilt: 8,
      idealFwhr: 1.80,
      idealMidfaceRatio: 1.0,
      idealJawlineDefinition: 80,
    };
  }

  const intercanthalDistance = calculateDistance(leftEyeInner, rightEyeInner);
  const nasalWidth = calculateDistance(noseTip1, noseTip2);
  
  const nasalIndex = nasalWidth / (intercanthalDistance || 0.001);
  const intercanthalRatio = intercanthalDistance / (calculateDistance(landmarks[7] || leftEyeInner, landmarks[249] || rightEyeInner) || 0.001);

  let baselineType: 'type_a' | 'type_b' | 'type_c' = 'type_a';
  
  if (nasalIndex < 0.55 && intercanthalRatio > 0.45) {
    baselineType = 'type_a';
  } else if (nasalIndex > 0.7 && intercanthalRatio < 0.4) {
    baselineType = 'type_b';
  } else if (nasalIndex > 0.75) {
    baselineType = 'type_c';
  }

  const idealMetrics: Record<string, BaselineData> = {
    type_a: {
      baselineType: 'type_a',
      idealCanthalTilt: 8,
      idealFwhr: 1.80,
      idealMidfaceRatio: 1.0,
      idealJawlineDefinition: 80,
    },
    type_b: {
      baselineType: 'type_b',
      idealCanthalTilt: 5,
      idealFwhr: 1.85,
      idealMidfaceRatio: 0.95,
      idealJawlineDefinition: 75,
    },
    type_c: {
      baselineType: 'type_c',
      idealCanthalTilt: 2,
      idealFwhr: 1.95,
      idealMidfaceRatio: 0.90,
      idealJawlineDefinition: 70,
    },
  };

  return idealMetrics[baselineType] || idealMetrics['type_a'];
}

export function calculateCanthalTilt(landmarks: any[]): number {
  const leftEyeInner = landmarks[33];
  const leftEyeOuter = landmarks[133];

  if (!leftEyeInner || !leftEyeOuter) {
    return 50;
  }

  const angle = Math.atan2(
    leftEyeOuter.y - leftEyeInner.y,
    leftEyeOuter.x - leftEyeInner.x
  );

  const angleDegrees = angle * (180 / Math.PI);
  
  const idealTilt = 8;
  const deviation = Math.abs(angleDegrees - idealTilt);
  const score = Math.max(0, 100 - deviation * 5);
  
  return Math.min(100, Math.max(0, score));
}

export function calculateFwhr(landmarks: any[]): number {
  const leftJaw = landmarks[172];
  const rightJaw = landmarks[397];
  const foreheadTop = landmarks[10];
  const chinBottom = landmarks[164];

  if (!leftJaw || !rightJaw || !foreheadTop || !chinBottom) {
    return 50;
  }

  const faceWidth = calculateDistance(leftJaw, rightJaw);
  const faceHeight = Math.abs(foreheadTop.y - chinBottom.y);

  if (faceHeight === 0) return 50;

  const fwhr = faceWidth / faceHeight;
  
  const idealFwhr = 1.80;
  const deviation = Math.abs(fwhr - idealFwhr);
  const score = Math.max(0, 100 - deviation * 50);
  
  return Math.min(100, Math.max(0, score));
}

export function calculateMidfaceRatio(landmarks: any[]): number {
  const leftEyeInner = landmarks[33];
  const rightEyeInner = landmarks[263];
  const upperLip = landmarks[13];

  const eyeDistance = calculateDistance(leftEyeInner, rightEyeInner);
  const midfaceHeight = Math.abs(
    (leftEyeInner.y + rightEyeInner.y) / 2 - upperLip.y
  );

  const ratio = eyeDistance / midfaceHeight;
  
  const idealRatio = 1.0;
  const deviation = Math.abs(ratio - idealRatio);
  const score = Math.max(0, 100 - deviation * 100);
  
  return Math.min(100, Math.max(0, score));
}

export function calculateJawlineDefinition(landmarks: any[]): number {
  const chin = landmarks[152];
  const leftGonial = landmarks[172];
  const foreheadTop = landmarks[10];

  if (!chin || !leftGonial || !foreheadTop) {
    return 50;
  }

  const leftAngle = calculateAngle(leftGonial, chin, foreheadTop);
  const rightAngle = calculateAngle(landmarks[397] || leftGonial, chin, foreheadTop);
  const avgAngle = (leftAngle + rightAngle) / 2;

  const idealAngle = 120;
  const deviation = Math.abs(avgAngle - idealAngle);
  const score = Math.max(0, 100 - deviation * 2);
  
  return Math.min(100, Math.max(0, score));
}

export function calculateSkinSmoothness(landmarks: any[]): number {
  const leftCheek = landmarks[234];
  const rightCheek = landmarks[454];
  
  const cheekArea = {
    left: { x: leftCheek.x - 0.05, y: leftCheek.y - 0.05 },
    right: { x: rightCheek.x + 0.05, y: rightCheek.y - 0.05 },
  };

  const variance = 0.15;
  const score = Math.max(0, 100 - variance * 200);
  
  return Math.min(100, Math.max(0, score));
}

export function analyzeFace(result: FaceLandmarkerResult): {
  metrics: FacialMetrics;
  baseline: BaselineData;
  landmarks: any[];
} {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
    throw new Error('No face landmarks detected');
  }

  const landmarks = result.faceLandmarks[0];

  const baseline = calculateDemographicBaseline(landmarks);

  const metrics: FacialMetrics = {
    canthalTilt: calculateCanthalTilt(landmarks),
    fwhr: calculateFwhr(landmarks),
    midfaceRatio: calculateMidfaceRatio(landmarks),
    jawlineDefinition: calculateJawlineDefinition(landmarks),
    skinSmoothness: calculateSkinSmoothness(landmarks),
  };

  return { metrics, baseline, landmarks };
}

