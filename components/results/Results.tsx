'use client';

import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Recommendations from './Recommendations';
import { QUESTIONS } from '@/lib/survey';

export default function Results() {
  const { metrics, setStage } = useAppStore();

  if (!metrics) return null;

  const metricsList = [
    {
      name: 'Symmetry',
      score: metrics.symmetry ?? 70,
      description: 'Left–right facial balance',
      ideal: 'Across eyes, jaw, cheeks',
      actual: `${Math.round((metrics.actualMeasurements?.symmetryScore ?? 0) * 100)}%`,
    },
    {
      name: 'Canthal Tilt',
      score: metrics.canthalTilt,
      description: 'Eye angle — outer vs inner corner',
      ideal: 'Ideal +3° to +8°',
      actual: `${metrics.actualMeasurements.canthalTiltDegrees.toFixed(1)}°`,
    },
    {
      name: 'fWHR',
      score: metrics.fwhr,
      description: 'Width-to-height proportion',
      ideal: 'Ideal ~0.82',
      actual: `${metrics.actualMeasurements.fwhrValue.toFixed(2)}`,
    },
    {
      name: 'Midface',
      score: metrics.midfaceRatio,
      description: 'Eye span vs lower-face height',
      ideal: 'Ideal ~1.9',
      actual: `${metrics.actualMeasurements.midfaceRatioValue.toFixed(2)}`,
    },
    {
      name: 'Jawline',
      score: metrics.jawlineDefinition,
      description: 'Jaw width vs cheekbone width',
      ideal: 'Ideal ~0.78',
      actual: `${metrics.actualMeasurements.jawlineAngle.toFixed(2)}`,
    },
  ];

  const overallScore = Math.round(
    metricsList.reduce((sum, m) => sum + m.score, 0) / metricsList.length
  );

  const verdict =
    overallScore >= 80 ? 'Elite tier. Barely.' :
    overallScore >= 65 ? 'Above average. Not done.' :
    overallScore >= 50 ? 'Solid base. Work to do.' :
    'High growth potential.';

  const weakest = [...metricsList].sort((a, b) => a.score - b.score)[0];

  return (
    <div className="space-y-10 animate-slide-up max-w-3xl">
      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-brutal p-8 flex flex-wrap items-center gap-8"
      >
        <div>
          <p className="font-display text-xs uppercase tracking-widest mb-2">The Number</p>
          <div className="flex items-baseline">
            <span className="font-display text-8xl leading-none tabular-nums">{overallScore}</span>
            <span className="font-display text-2xl text-ink-mute">/100</span>
          </div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <p className="font-display text-xl uppercase leading-tight mb-2">{verdict}</p>
          <p className="text-sm font-medium text-ink-soft">
            Weakest link: <b className="bg-pop text-white px-1.5 py-0.5 uppercase text-xs font-display">{weakest.name}</b>{' '}
            — fixable. The survey finds out how.
          </p>
        </div>
      </motion.div>

      {/* Survey CTA */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        onClick={() => setStage('survey')}
        className="w-full card-brutal !bg-ink !shadow-brutal-pop p-7 flex items-center justify-between gap-6 text-left group hover:!shadow-[4px_4px_0_#FF4D00] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
      >
        <div>
          <p className="font-display text-2xl uppercase text-cream leading-tight">
            Find out <span className="text-pop">why</span> you&apos;re not a 90.
          </p>
          <p className="text-sm font-medium text-cream/70 mt-1.5">
            {QUESTIONS.length} questions · 10 categories · zero sugarcoating · your personal fix plan
          </p>
        </div>
        <span className="btn-brutal bg-pop text-white text-sm px-5 py-3 shrink-0 pointer-events-none">
          Start <ArrowRight className="w-4 h-4" />
        </span>
      </motion.button>

      {/* Individual Metrics */}
      <div>
        <h3 className="font-display text-2xl uppercase mb-5">
          The <span className="text-pop">Damage</span> Report
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {metricsList.map((metric, index) => {
            const weak = metric.score < 65;
            return (
              <motion.div
                key={metric.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07 }}
                className={`border-[3px] border-ink p-5 shadow-brutal-sm ${
                  weak ? 'bg-pop text-white' : 'bg-white'
                }`}
              >
                <div className="flex items-baseline justify-between mb-3">
                  <span className="font-display text-sm uppercase">{metric.name}</span>
                  <span className="font-display text-4xl tabular-nums">{Math.round(metric.score)}</span>
                </div>
                <div className={`h-3.5 border-[3px] ${weak ? 'border-white bg-pop' : 'border-ink bg-white'}`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.score}%` }}
                    transition={{ duration: 0.7, delay: index * 0.07 }}
                    className={`h-full ${weak ? 'bg-white' : 'bg-ink'}`}
                  />
                </div>
                <div className="flex justify-between mt-2.5 text-xs font-bold">
                  <span className={weak ? 'text-white/80' : 'text-ink-mute'}>{metric.ideal}</span>
                  <span>You: {metric.actual}</span>
                </div>
                <p className={`text-xs font-medium mt-1 ${weak ? 'text-white/80' : 'text-ink-mute'}`}>
                  {weak ? '← your weak spot. fixable.' : metric.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <Recommendations metrics={metrics} />
    </div>
  );
}
