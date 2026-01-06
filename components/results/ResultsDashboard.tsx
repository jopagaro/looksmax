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
      label: 'Orbital Vector',
      value: metrics.canthalTilt,
      ideal: baseline.idealCanthalTilt,
      term: 'Canthal Tilt',
    },
    {
      label: 'Mandibular Width',
      value: metrics.fwhr,
      ideal: baseline.idealFwhr * 50,
      term: 'fWHR',
    },
    {
      label: 'Midface Ratio',
      value: metrics.midfaceRatio,
      ideal: baseline.idealMidfaceRatio * 100,
      term: 'Zygomatic Width',
    },
    {
      label: 'Gonial Angle',
      value: metrics.jawlineDefinition,
      ideal: baseline.idealJawlineDefinition,
      term: 'Jawline Definition',
    },
    {
      label: 'Dermal Integrity',
      value: metrics.skinSmoothness,
      ideal: 85,
      term: 'Skin Smoothness',
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
                label={`${config.label} (${config.term})`}
                value={config.value}
                ideal={config.ideal}
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

