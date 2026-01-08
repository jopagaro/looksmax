'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import FaceMesh from './FaceMesh';
import { transformLandmarksFor3D } from '@/lib/transformLandmarks';

interface CompactFaceMeshProps {
  landmarks: any[];
  videoDimensions: { width: number; height: number };
}

export default function CompactFaceMesh({ landmarks, videoDimensions }: CompactFaceMeshProps) {
  if (!landmarks || landmarks.length === 0 || !videoDimensions) {
    return null;
  }

  const transformedLandmarks = transformLandmarksFor3D(landmarks, videoDimensions);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden glass border border-primary/30 bg-black/40">
      <Canvas className="bg-transparent" style={{ width: '100%', height: '100%' }}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 2.5]} fov={60} />
          <ambientLight intensity={0.7} />
          <pointLight position={[5, 5, 5]} intensity={1} color="#00E5FF" />
          <pointLight position={[-5, -5, -5]} intensity={0.5} color="#FF0055" />
          {transformedLandmarks && transformedLandmarks.length > 0 && (
            <FaceMesh landmarks={transformedLandmarks} />
          )}
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={1.5}
            maxDistance={3}
            target={[0, 0, 0]}
            enableZoom={false}
            enablePan={false}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

