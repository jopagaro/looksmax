'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FaceLandmarker } from '@mediapipe/tasks-vision';

interface FaceMeshProps {
  landmarks: Array<{ x: number; y: number; z: number }>;
}

export default function FaceMesh({ landmarks }: FaceMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    if (!landmarks || landmarks.length === 0) {
      return null;
    }

    const scale = 3;
    const positions = new Float32Array(landmarks.length * 3);
    
    landmarks.forEach((landmark, i) => {
      positions[i * 3] = landmark.x * scale;
      positions[i * 3 + 1] = -landmark.y * scale;
      positions[i * 3 + 2] = landmark.z * scale;
    });

    const tesselation = FaceLandmarker.FACE_LANDMARKS_TESSELATION;
    if (!tesselation || tesselation.length === 0) {
      return null;
    }

    const lineIndices: number[] = [];
    for (let i = 0; i < tesselation.length; i++) {
      const connection = tesselation[i] as any;
      if (connection && typeof connection.start === 'number' && typeof connection.end === 'number') {
        if (connection.start < landmarks.length && connection.end < landmarks.length) {
          lineIndices.push(connection.start, connection.end);
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    if (lineIndices.length > 0) {
      geo.setIndex(lineIndices);
    }
    geo.computeVertexNormals();
    
    return geo;
  }, [landmarks]);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        wireframe: true,
        color: new THREE.Color('#00E5FF'),
        emissive: new THREE.Color('#00E5FF'),
        emissiveIntensity: 0.3,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
      }),
    []
  );

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.mouse.x * 0.5;
      meshRef.current.rotation.x = state.mouse.y * 0.3;
    }
  });

  if (!geometry || landmarks.length === 0) {
    return null;
  }

  return <mesh ref={meshRef} geometry={geometry} material={material} />;
}

