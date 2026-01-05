'use client';

import { useAppStore } from '@/lib/store';
import MetricBar from './MetricBar';
import { motion } from 'framer-motion';
import { Activity, TrendingUp } from 'lucide-react';

export default function ResultsDashboard() {
  const { metrics, demographic } = useAppStore();

  if (!metrics || !demographic) {
    return null;
  }

  const metricConfigs = [
    {
      label: 'Canthal Tilt',
      value: metrics.canthalTilt,
      ideal: demographic.idealCanthalTilt,
      term: 'Orbital Vector',
    },
    {
      label: 'fWHR',
      value: metrics.fwhr,
      ideal: demographic.idealFwhr * 50,
      term: 'Maxillary Prominence',
    },
    {
      label: 'Midface Ratio',
      value: metrics.midfaceRatio,
      ideal: demographic.idealMidfaceRatio * 100,
      term: 'Zygomatic Width',
    },
    {
      label: 'Jawline Definition',
      value: metrics.jawlineDefinition,
      ideal: demographic.idealJawlineDefinition,
      term: 'Gonial Angle',
    },
    {
      label: 'Skin Smoothness',
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
            Calibrated against {demographic.ethnicity} aesthetic benchmarks
          </span>
        </div>
      </div>
    </motion.div>
  );
}

