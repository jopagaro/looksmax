'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei';
import FaceMesh from './FaceMesh';
import { useAppStore } from '@/lib/store';
import { transformLandmarksFor3D } from '@/lib/transformLandmarks';
import { motion } from 'framer-motion';

export default function Visualizer() {
  const { landmarks, videoDimensions } = useAppStore();

  if (!landmarks || landmarks.length === 0) {
    return (
      <div className="glass rounded-lg h-full flex items-center justify-center">
        <p className="text-primary/50 text-sm">Awaiting scan data...</p>
      </div>
    );
  }

  if (!videoDimensions) {
    return (
      <div className="glass rounded-lg h-full flex items-center justify-center">
        <p className="text-primary/50 text-sm">Processing scan data...</p>
      </div>
    );
  }

  const transformedLandmarks = transformLandmarksFor3D(landmarks, videoDimensions);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden glass">
      <Canvas className="bg-black/20">
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[1, 0.5, 3]} fov={50} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#00E5FF" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FF0055" />
          <Grid
            args={[10, 10]}
            cellColor="#00E5FF"
            sectionColor="#00E5FF"
            cellThickness={0.5}
            sectionThickness={1}
            fadeDistance={15}
            fadeStrength={1}
          />
          <FaceMesh landmarks={transformedLandmarks} />
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={1.5}
            maxDistance={5}
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>
      <ScanningLaser />
    </div>
  );
}

function ScanningLaser() {
  return (
    <motion.div
      className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"
      style={{ top: '50%' }}
      animate={{
        y: ['-100%', '200%'],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}

