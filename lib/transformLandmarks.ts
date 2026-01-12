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

  const aspectRatio = videoDimensions.height / videoDimensions.width;
  
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  
  landmarks.forEach((landmark) => {
    if (landmark && typeof landmark.x === 'number' && typeof landmark.y === 'number') {
      minX = Math.min(minX, landmark.x);
      maxX = Math.max(maxX, landmark.x);
      minY = Math.min(minY, landmark.y);
      maxY = Math.max(maxY, landmark.y);
      const z = landmark.z || 0;
      minZ = Math.min(minZ, z);
      maxZ = Math.max(maxZ, z);
    }
  });

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const centerZ = (minZ + maxZ) / 2;

  const xRange = maxX - minX || 0.001;
  const yRange = maxY - minY || 0.001;
  const zRange = Math.abs(maxZ - minZ) || 0.001;
  
  const maxXYRange = Math.max(xRange, yRange * aspectRatio);
  
  const scale = 1.0;
  const zScale = (maxXYRange / zRange) * 0.8;

  return landmarks.map((landmark) => {
    if (!landmark || typeof landmark.x !== 'number' || typeof landmark.y !== 'number') {
      return { x: 0, y: 0, z: 0 };
    }

    const x = (landmark.x - centerX) * scale;
    const y = (landmark.y - centerY) * scale * aspectRatio;
    const z = ((landmark.z || 0) - centerZ) * zScale;

    return { x, y, z };
  });
}
