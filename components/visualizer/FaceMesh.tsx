'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FaceMeshProps {
  landmarks: number[][];
}

export default function FaceMesh({ landmarks }: FaceMeshProps) {
  const meshRef = useRef<THREE.Points>(null);

  const { positions, indices } = useMemo(() => {
    if (!landmarks || landmarks.length === 0) {
      return { positions: new Float32Array(0), indices: [] };
    }

    const positions = new Float32Array(landmarks.length * 3);
    const indices: number[] = [];

    landmarks.forEach((landmark, i) => {
      positions[i * 3] = landmark[0];
      positions[i * 3 + 1] = -landmark[1];
      positions[i * 3 + 2] = landmark[2] || 0;
    });

    const faceOutline = [
      10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400,
      377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
    ];

    for (let i = 0; i < faceOutline.length - 1; i++) {
      indices.push(faceOutline[i], faceOutline[i + 1]);
    }
    indices.push(faceOutline[faceOutline.length - 1], faceOutline[0]);

    const leftEye = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
    for (let i = 0; i < leftEye.length - 1; i++) {
      indices.push(leftEye[i], leftEye[i + 1]);
    }
    indices.push(leftEye[leftEye.length - 1], leftEye[0]);

    const rightEye = [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466];
    for (let i = 0; i < rightEye.length - 1; i++) {
      indices.push(rightEye[i], rightEye[i + 1]);
    }
    indices.push(rightEye[rightEye.length - 1], rightEye[0]);

    return { positions, indices };
  }, [landmarks]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    if (indices.length > 0) {
      geo.setIndex(indices);
    }
    return geo;
  }, [positions, indices]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.mouse.x * 0.5;
      meshRef.current.rotation.x = state.mouse.y * 0.3;
    }
  });

  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        vertexShader: `
          varying vec3 vPosition;
          varying vec3 vNormal;
          void main() {
            vPosition = position;
            vNormal = normal;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = 2.0;
          }
        `,
        fragmentShader: `
          uniform float time;
          varying vec3 vPosition;
          void main() {
            vec3 color = vec3(0.0, 0.898, 1.0);
            float dist = length(gl_PointCoord - vec2(0.5));
            float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
            float pulse = sin(time * 2.0) * 0.3 + 0.7;
            gl_FragColor = vec4(color * pulse, alpha * 0.8);
          }
        `,
        uniforms: {
          time: { value: 0 },
        },
      }),
    []
  );

  useFrame((state) => {
    if (shaderMaterial.uniforms.time) {
      shaderMaterial.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  if (landmarks.length === 0) {
    return null;
  }

  return (
    <>
      <points ref={meshRef} geometry={geometry} material={shaderMaterial} />
      <lineSegments geometry={geometry}>
        <lineBasicMaterial color="#00E5FF" transparent opacity={0.3} />
      </lineSegments>
    </>
  );
}

