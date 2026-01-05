'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Node {
  id: number;
  x: number;
  y: number;
  delay: number;
}

export default function DataNodes() {
  const [nodes, setNodes] = useState<Node[]>([]);

  useEffect(() => {
    setNodes(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
      }))
    );
  }, []);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      {nodes.map((node) => (
        <motion.div
          key={node.id}
          className="absolute w-1 h-1 bg-primary rounded-full"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3,
            delay: node.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

