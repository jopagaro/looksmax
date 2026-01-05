'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface MetricBarProps {
  label: string;
  value: number;
  ideal: number;
  delay?: number;
}

export default function MetricBar({ label, value, ideal, delay = 0 }: MetricBarProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  const percentage = Math.min(100, Math.max(0, displayValue));
  const deviation = Math.abs(value - ideal);
  const color = deviation < 10 ? '#00E5FF' : deviation < 20 ? '#FFA500' : '#FF0055';

  return (
    <div className="glass rounded-lg p-4 border border-primary/30">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-primary/80 font-mono">{label}</span>
        <span className="text-lg font-bold text-glow" style={{ color }}>
          {Math.round(displayValue)}
        </span>
      </div>
      <div className="relative h-2 bg-black/40 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, delay: delay / 1000, ease: 'easeOut' }}
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-primary"
          style={{ left: `${ideal}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-primary/50 font-mono">
        Ideal: {ideal} | Deviation: {deviation.toFixed(1)}
      </div>
    </div>
  );
}

