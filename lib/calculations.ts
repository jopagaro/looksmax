import { FaceLandmarkerResult } from '@mediapipe/tasks-vision';

export interface FacialMetrics {
  canthalTilt: number;
  fwhr: number;
  midfaceRatio: number;
  jawlineDefinition: number;
  skinSmoothness: number;
}

export interface DemographicData {
  ethnicity: string;
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

function detectDemographic(landmarks: any[]): DemographicData {
  const noseTip = landmarks[4];
  const noseLeft = landmarks[131];
  const noseRight = landmarks[360];
  const leftEyeInner = landmarks[33];
  const rightEyeInner = landmarks[263];
  const leftEyeOuter = landmarks[7];
  const rightEyeOuter = landmarks[249];

  const nasalWidth = calculateDistance(noseLeft, noseRight);
  const nasalHeight = Math.abs(noseTip.y - (noseLeft.y + noseRight.y) / 2);
  const nasalIndex = nasalWidth / nasalHeight;

  const intercanthalDistance = calculateDistance(leftEyeInner, rightEyeInner);
  const eyeWidth = calculateDistance(leftEyeOuter, rightEyeOuter);
  const intercanthalRatio = intercanthalDistance / eyeWidth;

  let ethnicity = 'White';
  
  if (nasalIndex > 0.7 && intercanthalRatio < 0.4) {
    ethnicity = 'Asian';
  } else if (nasalIndex > 0.8) {
    ethnicity = 'Black';
  } else if (nasalIndex < 0.6 && intercanthalRatio > 0.45) {
    ethnicity = 'White';
  }

  const idealMetrics: Record<string, DemographicData> = {
    Asian: {
      ethnicity: 'Asian',
      idealCanthalTilt: 5,
      idealFwhr: 1.85,
      idealMidfaceRatio: 0.95,
      idealJawlineDefinition: 75,
    },
    Black: {
      ethnicity: 'Black',
      idealCanthalTilt: 2,
      idealFwhr: 1.95,
      idealMidfaceRatio: 0.90,
      idealJawlineDefinition: 70,
    },
    White: {
      ethnicity: 'White',
      idealCanthalTilt: 8,
      idealFwhr: 1.80,
      idealMidfaceRatio: 1.0,
      idealJawlineDefinition: 80,
    },
  };

  return idealMetrics[ethnicity] || idealMetrics['White'];
}

export function calculateCanthalTilt(landmarks: any[]): number {
  const leftEyeInner = landmarks[33];
  const leftEyeOuter = landmarks[7];
  const rightEyeInner = landmarks[263];
  const rightEyeOuter = landmarks[249];

  const leftAngle = Math.atan2(
    leftEyeOuter.y - leftEyeInner.y,
    leftEyeOuter.x - leftEyeInner.x
  );
  const rightAngle = Math.atan2(
    rightEyeOuter.y - rightEyeInner.y,
    rightEyeOuter.x - rightEyeInner.x
  );

  const avgAngle = ((leftAngle + rightAngle) / 2) * (180 / Math.PI);
  
  const idealTilt = 8;
  const deviation = Math.abs(avgAngle - idealTilt);
  const score = Math.max(0, 100 - deviation * 5);
  
  return Math.min(100, Math.max(0, score));
}

export function calculateFwhr(landmarks: any[]): number {
  const leftCheek = landmarks[234];
  const rightCheek = landmarks[454];
  const foreheadTop = landmarks[10];
  const chinBottom = landmarks[175];

  const faceWidth = calculateDistance(leftCheek, rightCheek);
  const faceHeight = Math.abs(foreheadTop.y - chinBottom.y);

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
  const leftGonial = landmarks[172];
  const rightGonial = landmarks[397];
  const chin = landmarks[175];
  const leftCheek = landmarks[234];
  const rightCheek = landmarks[454];

  const leftAngle = calculateAngle(leftGonial, chin, leftCheek);
  const rightAngle = calculateAngle(rightGonial, chin, rightCheek);
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
  demographic: DemographicData;
  landmarks: any[];
} {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
    throw new Error('No face landmarks detected');
  }

  const landmarks = result.faceLandmarks[0];

  const demographic = detectDemographic(landmarks);

  const metrics: FacialMetrics = {
    canthalTilt: calculateCanthalTilt(landmarks),
    fwhr: calculateFwhr(landmarks),
    midfaceRatio: calculateMidfaceRatio(landmarks),
    jawlineDefinition: calculateJawlineDefinition(landmarks),
    skinSmoothness: calculateSkinSmoothness(landmarks),
  };

  return { metrics, demographic, landmarks };
}

