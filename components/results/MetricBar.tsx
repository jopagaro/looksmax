'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface MetricBarProps {
  label: string;
  value: number;
  ideal: number;
  actualValue?: number | string;
  unit?: string;
  delay?: number;
}

export default function MetricBar({ label, value, ideal, actualValue, unit = '', delay = 0 }: MetricBarProps) {
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
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <span className="text-sm text-primary/80 font-mono block">{label}</span>
          {actualValue !== undefined && (
            <span className="text-xs text-primary/60 font-mono mt-1">
              Measured: {actualValue}{unit}
            </span>
          )}
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-glow block" style={{ color }}>
            {Math.round(displayValue)}%
          </span>
          <span className="text-xs text-primary/50 font-mono">
            Score
          </span>
        </div>
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
          className="absolute top-0 bottom-0 w-0.5 bg-primary/60"
          style={{ left: `${Math.min(100, ideal)}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-primary/50 font-mono flex justify-between">
        <span>Ideal Score: {ideal}%</span>
        {deviation > 0 && <span>Deviation: {deviation.toFixed(1)}%</span>}
      </div>
    </div>
  );
}

