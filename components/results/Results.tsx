'use client';

import { useAppStore } from '@/lib/store';
import { computeOverallScore } from '@/lib/calculations';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Recommendations from './Recommendations';

export default function Results() {
  const { metrics, setStage } = useAppStore();

  if (!metrics) return null;

  const a = metrics.actualMeasurements;
  const metricsList: {
    name: string;
    score: number | null;
    description: string;
    ideal: string;
    actual: string;
  }[] = [
    {
      name: 'Symmetry',
      score: metrics.symmetry ?? 70,
      description: 'Left–right facial balance',
      ideal: 'Across eyes, jaw, cheeks',
      actual: `${Math.round((a?.symmetryScore ?? 0) * 100)}%`,
    },
    {
      name: 'Canthal Tilt',
      score: metrics.canthalTilt,
      description: 'Eye angle — outer vs inner corner',
      ideal: 'Ideal +3° to +8°',
      actual: `${a.canthalTiltDegrees.toFixed(1)}°`,
    },
    {
      name: 'Eye Spacing',
      score: metrics.eyeSpacing ?? null,
      description: 'ES ratio — pupil distance vs face width',
      ideal: 'Ideal ~0.46',
      actual: a.eyeSpacingValue ? a.eyeSpacingValue.toFixed(3) : '—',
    },
    {
      name: 'fWHR',
      score: metrics.fwhr,
      description: 'Width-to-height proportion',
      ideal: 'Ideal ~0.82',
      actual: a.fwhrValue.toFixed(2),
    },
    {
      name: 'Midface',
      score: metrics.midfaceRatio,
      description: 'Eye span vs lower-face height',
      ideal: 'Ideal ~1.9',
      actual: a.midfaceRatioValue.toFixed(2),
    },
    {
      name: 'Jawline',
      score: metrics.jawlineDefinition,
      description: 'Jaw width vs cheekbone width',
      ideal: 'Ideal ~0.78',
      actual: a.jawlineAngle.toFixed(2),
    },
    {
      name: 'Gonial Angle',
      score: metrics.gonialAngle ?? null,
      description: 'Jaw corner sharpness',
      ideal: 'Ideal ~120°',
      actual: a.gonialAngleDegrees ? `${a.gonialAngleDegrees.toFixed(0)}°` : '—',
    },
    {
      name: 'Lower Third',
      score: metrics.lowerThird ?? null,
      description: 'Philtrum vs chin height (1:2 rule)',
      ideal: 'Ideal ~2.2',
      actual: a.lowerThirdValue ? a.lowerThirdValue.toFixed(2) : '—',
    },
    {
      name: 'Mouth : Nose',
      score: metrics.mouthNose ?? null,
      description: 'Mouth width vs nose width',
      ideal: 'Ideal ~1.55',
      actual: a.mouthNoseValue ? a.mouthNoseValue.toFixed(2) : '—',
    },
    {
      name: 'Teeth',
      score: metrics.teethWhiteness,
      description: 'Whiteness from your smile',
      ideal: 'Lower yellow = better',
      actual:
        a.teethYellowness !== null && a.teethYellowness !== undefined
          ? `Yellow idx ${a.teethYellowness}`
          : 'No smile caught',
    },
    {
      name: 'Skin Tone',
      score: metrics.skinEvenness,
      description: 'Tone evenness across forehead, cheeks, chin',
      ideal: 'Lower drift = better',
      actual: a.chromaSpread !== null && a.chromaSpread !== undefined ? `Drift ${a.chromaSpread}` : '—',
    },
    {
      name: 'Redness',
      score: metrics.skinRedness,
      description: 'Cheek flush vs rest of face',
      ideal: 'Even = best',
      actual: a.rednessDelta !== null && a.rednessDelta !== undefined ? `Cheeks +${Math.max(0, a.rednessDelta)}` : '—',
    },
    {
      name: 'Dark Circles',
      score: metrics.darkCircles,
      description: 'Under-eye shadow vs cheek brightness',
      ideal: 'Ideal ~100%',
      actual:
        a.underEyeRatio !== null && a.underEyeRatio !== undefined
          ? `${Math.round(a.underEyeRatio * 100)}% bright`
          : '—',
    },
  ];

  const overallScore = computeOverallScore(metrics);

  const verdict =
    overallScore >= 80 ? 'Elite tier. Barely.' :
    overallScore >= 65 ? 'Above average. Not done.' :
    overallScore >= 50 ? 'Solid base. Work to do.' :
    'High growth potential.';

  const scored = metricsList.filter(
    (m): m is typeof m & { score: number } => m.score !== null
  );
  const weakest = [...scored].sort((x, y) => x.score - y.score)[0];

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
            Pick your depth: 24, 68, or 124 questions · zero sugarcoating · your personal fix plan
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
            const na = metric.score === null;
            const weak = !na && metric.score! < 65;
            return (
              <motion.div
                key={metric.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`border-[3px] border-ink p-5 shadow-brutal-sm ${
                  weak ? 'bg-pop text-white' : na ? 'bg-cream' : 'bg-white'
                }`}
              >
                <div className="flex items-baseline justify-between mb-3">
                  <span className="font-display text-sm uppercase">{metric.name}</span>
                  <span className="font-display text-4xl tabular-nums">
                    {na ? '—' : Math.round(metric.score!)}
                  </span>
                </div>
                <div className={`h-3.5 border-[3px] ${weak ? 'border-white bg-pop' : 'border-ink bg-white'}`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.score ?? 0}%` }}
                    transition={{ duration: 0.7, delay: index * 0.05 }}
                    className={`h-full ${weak ? 'bg-white' : 'bg-ink'}`}
                  />
                </div>
                <div className="flex justify-between mt-2.5 text-xs font-bold">
                  <span className={weak ? 'text-white/80' : 'text-ink-mute'}>{metric.ideal}</span>
                  <span>You: {metric.actual}</span>
                </div>
                <p className={`text-xs font-medium mt-1 ${weak ? 'text-white/80' : 'text-ink-mute'}`}>
                  {na
                    ? 'Not captured — rescan and smile when prompted.'
                    : weak
                    ? '← your weak spot. fixable.'
                    : metric.description}
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
