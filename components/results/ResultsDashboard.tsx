'use client';

import { useAppStore } from '@/lib/store';
import MetricBar from './MetricBar';
import { motion } from 'framer-motion';
import { Activity, TrendingUp } from 'lucide-react';

export default function ResultsDashboard() {
  const { metrics, baseline } = useAppStore();

  if (!metrics || !baseline) {
    return null;
  }

  const metricConfigs = [
    {
      label: 'Canthal Tilt',
      value: metrics.canthalTilt,
      ideal: 85,
      actualValue: metrics.actualMeasurements.canthalTiltDegrees,
      unit: '°',
      term: 'Eye Angle',
    },
    {
      label: 'Face Width-to-Height Ratio',
      value: metrics.fwhr,
      ideal: 85,
      actualValue: metrics.actualMeasurements.fwhrValue,
      unit: '',
      term: 'fWHR',
    },
    {
      label: 'Midface Ratio',
      value: metrics.midfaceRatio,
      ideal: 85,
      actualValue: metrics.actualMeasurements.midfaceRatioValue,
      unit: '',
      term: 'Eye-to-Mouth Ratio',
    },
    {
      label: 'Jawline Angle',
      value: metrics.jawlineDefinition,
      ideal: 85,
      actualValue: metrics.actualMeasurements.jawlineAngle,
      unit: '°',
      term: 'Gonial Angle',
    },
    {
      label: 'Skin Quality',
      value: metrics.skinSmoothness,
      ideal: 85,
      term: 'Dermal Integrity',
    },
  ];

  const overallScore =
    metricConfigs.reduce((sum, m) => sum + m.value, 0) / metricConfigs.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <div className="glass-strong rounded-lg p-6 border-2 border-primary/50 glow-primary">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-glow flex items-center gap-2">
            <Activity className="w-6 h-6" />
            ANALYSIS COMPLETE
          </h2>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary text-glow">
              {Math.round(overallScore)}
            </div>
            <div className="text-xs text-primary/60">Overall Score</div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {metricConfigs.map((config, index) => (
            <motion.div
              key={config.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <MetricBar
                label={config.label}
                value={config.value}
                ideal={config.ideal}
                actualValue={config.actualValue}
                unit={config.unit}
                delay={index * 100}
              />
            </motion.div>
          ))}
        </div>
      </div>
      <div className="glass rounded-lg p-4 border border-primary/30">
        <div className="flex items-center gap-2 text-sm text-primary/70">
          <TrendingUp className="w-4 h-4" />
          <span>
            Structural Baseline: Optimized
          </span>
        </div>
      </div>
    </motion.div>
  );
}

