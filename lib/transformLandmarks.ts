export interface Landmark3D {
  x: number;
  y: number;
  z: number;
}

export interface VideoDimensions {
  width: number;
  height: number;
}

export function transformLandmarksFor3D(
  landmarks: Landmark3D[] | any[],
  videoDimensions: VideoDimensions
): Landmark3D[] {
  if (!landmarks || landmarks.length === 0) {
    return [];
  }

  if (!videoDimensions || !videoDimensions.width || !videoDimensions.height) {
    return [];
  }

  const NOSE_TIP_INDEX = 1;
  const aspectRatio = videoDimensions.height / videoDimensions.width;
  
  const noseTip = landmarks[NOSE_TIP_INDEX] || landmarks[0];
  if (!noseTip) return [];

  const noseTipX = noseTip.x;
  const noseTipY = noseTip.y;
  const noseTipZ = noseTip.z || 0;

  let minZ = Infinity;
  let maxZ = -Infinity;
  
  landmarks.forEach((landmark) => {
    if (landmark && typeof landmark.z === 'number') {
      const z = landmark.z - noseTipZ;
      minZ = Math.min(minZ, z);
      maxZ = Math.max(maxZ, z);
    }
  });

  const zRange = maxZ - minZ || 0.1;
  const depthScale = Math.max(1.5, Math.min(3.0, 0.3 / zRange));

  return landmarks.map((landmark) => {
    if (!landmark || typeof landmark.x !== 'number' || typeof landmark.y !== 'number') {
      return { x: 0, y: 0, z: 0 };
    }

    const normalizedX = landmark.x - noseTipX;
    const normalizedY = (landmark.y - noseTipY) * aspectRatio;
    const normalizedZ = ((landmark.z || 0) - noseTipZ) * depthScale;

    const x = normalizedX - 0.5;
    const y = normalizedY - 0.5;
    const z = normalizedZ;

    return { x, y, z };
  });
}
