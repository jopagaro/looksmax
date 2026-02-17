'use client';

import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Recommendations from './Recommendations';

export default function Results() {
  const { metrics, baseline } = useAppStore();

  if (!metrics) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-orange-50 border-orange-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 75) return <TrendingUp className="w-4 h-4" />;
    if (score >= 50) return <Minus className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  const metricsList = [
    {
      name: 'Symmetry',
      score: (metrics as any).symmetry ?? 70,
      description: 'Left-right facial balance',
      ideal: 'Measured across eyes, jaw, cheeks',
      actual: `${Math.round(((metrics as any).actualMeasurements?.symmetryScore ?? 0) * 100)}%`,
    },
    {
      name: 'Canthal Tilt',
      score: metrics.canthalTilt,
      description: 'Eye angle — outer vs inner corner',
      ideal: '+3° to +8° upward tilt',
      actual: `${metrics.actualMeasurements.canthalTiltDegrees.toFixed(1)}°`,
    },
    {
      name: 'Face Ratio',
      score: metrics.fwhr,
      description: 'Width-to-height proportion',
      ideal: '~0.82 ideal',
      actual: `${metrics.actualMeasurements.fwhrValue.toFixed(2)}`,
    },
    {
      name: 'Midface Harmony',
      score: metrics.midfaceRatio,
      description: 'Eye span vs lower-face height',
      ideal: '~1.6 ratio',
      actual: `${metrics.actualMeasurements.midfaceRatioValue.toFixed(2)}`,
    },
    {
      name: 'Jawline',
      score: metrics.jawlineDefinition,
      description: 'Jaw width vs cheekbone width',
      ideal: '~0.78 jaw/face ratio',
      actual: `${metrics.actualMeasurements.jawlineAngle.toFixed(2)}`,
    },
  ];

  const overallScore = Math.round(
    metricsList.reduce((sum, m) => sum + m.score, 0) / metricsList.length
  );

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 border border-primary-200"
      >
        <div className="text-center">
          <p className="text-sm font-medium text-primary-700 mb-2">Overall Score</p>
          <div className={`text-6xl font-bold mb-3 ${getScoreColor(overallScore)}`}>
            {overallScore}
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            {getScoreIcon(overallScore)}
            <span>
              {overallScore >= 75 ? 'Excellent' : overallScore >= 50 ? 'Good' : 'Room for improvement'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Individual Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Analysis</h3>
        <div className="grid gap-4">
          {metricsList.map((metric, index) => (
            <motion.div
              key={metric.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl border ${getScoreBgColor(metric.score)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">{metric.name}</h4>
                  <p className="text-sm text-gray-600">{metric.description}</p>
                </div>
                <div className={`text-3xl font-bold ${getScoreColor(metric.score)}`}>
                  {Math.round(metric.score)}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.score}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className={`h-full rounded-full ${
                      metric.score >= 80 ? 'bg-green-500' :
                      metric.score >= 60 ? 'bg-yellow-500' :
                      'bg-orange-500'
                    }`}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <p className="text-xs text-gray-500">{metric.ideal}</p>
                  <p className="text-xs font-mono text-gray-700">You: {metric.actual}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <Recommendations metrics={metrics} />
    </div>
  );
}
