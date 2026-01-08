export interface Landmark {
  x: number;
  y: number;
  z?: number;
}

export function aggregateLandmarks(landmarkSets: Landmark[][]): Landmark[] {
  if (!landmarkSets || landmarkSets.length === 0) {
    return [];
  }

  const validSets = landmarkSets.filter(set => set && set.length > 0);
  if (validSets.length === 0) {
    return [];
  }

  const landmarkCount = validSets[0].length;
  const aggregated: Landmark[] = [];

  for (let i = 0; i < landmarkCount; i++) {
    let sumX = 0;
    let sumY = 0;
    let sumZ = 0;
    let count = 0;

    validSets.forEach(set => {
      if (set[i] && typeof set[i].x === 'number' && typeof set[i].y === 'number') {
        sumX += set[i].x;
        sumY += set[i].y;
        sumZ += set[i].z || 0;
        count++;
      }
    });

    if (count > 0) {
      aggregated.push({
        x: sumX / count,
        y: sumY / count,
        z: sumZ / count,
      });
    } else {
      aggregated.push({ x: 0, y: 0, z: 0 });
    }
  }

  return aggregated;
}

export function calculateFacePose(landmarks: Landmark[]): {
  yaw: number;
  pitch: number;
  roll: number;
} {
  if (!landmarks || landmarks.length < 10) {
    return { yaw: 0, pitch: 0, roll: 0 };
  }

  const noseTip = landmarks[1] || landmarks[0];
  const leftEye = landmarks[33];
  const rightEye = landmarks[263];
  const chin = landmarks[152];

  if (!noseTip || !leftEye || !rightEye || !chin) {
    return { yaw: 0, pitch: 0, roll: 0 };
  }

  const eyeCenter = {
    x: (leftEye.x + rightEye.x) / 2,
    y: (leftEye.y + rightEye.y) / 2,
    z: ((leftEye.z || 0) + (rightEye.z || 0)) / 2,
  };

  const eyeVector = {
    x: rightEye.x - leftEye.x,
    y: rightEye.y - leftEye.y,
    z: (rightEye.z || 0) - (leftEye.z || 0),
  };

  const roll = Math.atan2(eyeVector.y, eyeVector.x) * (180 / Math.PI);

  const faceVector = {
    x: noseTip.x - eyeCenter.x,
    y: noseTip.y - eyeCenter.y,
    z: (noseTip.z || 0) - (eyeCenter.z || 0),
  };

  const faceLength = Math.sqrt(
    faceVector.x * faceVector.x +
    faceVector.y * faceVector.y +
    faceVector.z * faceVector.z
  );

  const pitch = Math.asin(Math.max(-1, Math.min(1, faceVector.y / (faceLength || 0.001)))) * (180 / Math.PI);
  const yaw = Math.atan2(faceVector.x, faceVector.z) * (180 / Math.PI);

  return { yaw, pitch, roll };
}

export function filterLandmarksByPose(
  landmarkSets: { landmarks: Landmark[]; timestamp: number }[],
  maxYawDeviation: number = 45,
  maxPitchDeviation: number = 30
): Landmark[][] {
  if (!landmarkSets || landmarkSets.length === 0) {
    return [];
  }

  const validSets = landmarkSets
    .map(set => {
      const pose = calculateFacePose(set.landmarks);
      return {
        landmarks: set.landmarks,
        pose,
        timestamp: set.timestamp,
      };
    })
    .filter(set => {
      return (
        Math.abs(set.pose.yaw) <= maxYawDeviation &&
        Math.abs(set.pose.pitch) <= maxPitchDeviation
      );
    });

  return validSets.map(set => set.landmarks);
}


