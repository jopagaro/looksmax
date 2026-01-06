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
  const depthScale = 2.0;

  const noseTip = landmarks[NOSE_TIP_INDEX] || landmarks[0];
  if (!noseTip) return [];

  const noseTipX = noseTip.x;
  const noseTipY = noseTip.y;
  const noseTipZ = noseTip.z || 0;

  return landmarks.map((landmark) => {
    if (!landmark || typeof landmark.x !== 'number' || typeof landmark.y !== 'number') {
      return { x: 0, y: 0, z: 0 };
    }

    const x = (landmark.x - noseTipX) - 0.5;
    const y = ((landmark.y - noseTipY) - 0.5) * aspectRatio;
    const z = ((landmark.z || 0) - noseTipZ) * depthScale;

    return { x, y, z };
  });
}
