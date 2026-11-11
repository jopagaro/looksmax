'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Zap, Hammer, Mountain, PhoneCall } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { computeOverallScore } from '@/lib/calculations';
import { CATEGORIES, FIXES, Fix } from '@/lib/survey';
import Recommendations from '@/components/results/Recommendations';

const DIFFICULTY_GROUPS: {
  key: Fix['difficulty'];
  title: string;
  blurb: string;
  icon: typeof Zap;
}[] = [
  { key: 'easy', title: 'Quick Wins', blurb: 'Start these today — low effort, visible payoff', icon: Zap },
  { key: 'moderate', title: 'Core Protocol', blurb: 'The habits that move your rating most', icon: Hammer },
  { key: 'hard', title: 'Big Moves', blurb: 'Long-horizon changes with the deepest impact', icon: Mountain },
];

export default function Plan() {
  const { metrics, surveyResult } = useAppStore();

  const faceScore = useMemo(() => (metrics ? computeOverallScore(metrics) : null), [metrics]);

  const habitsScore = surveyResult?.overallScore ?? null;

  const combined = useMemo(() => {
    if (faceScore === null && habitsScore === null) return null;
    if (faceScore === null) return habitsScore;
    if (habitsScore === null) return faceScore;
    return Math.round(faceScore * 0.5 + habitsScore * 0.5);
  }, [faceScore, habitsScore]);

  // Merge survey flags with scan-derived weaknesses
  const flags = useMemo(() => {
    const out = [...(surveyResult?.flags ?? [])];
    const add = (f: string) => {
      if (!out.includes(f)) out.push(f);
    };
    if (metrics) {
      if (metrics.jawlineDefinition < 65) {
        add('tongue-posture');
        add('soft-diet');
      }
      if (metrics.symmetry < 65) add('stomach-sleeping');
      if (metrics.canthalTilt < 50) add('sleep-debt');
      if (metrics.gonialAngle < 60) add('forward-head');
      if (metrics.teethWhiteness !== null && metrics.teethWhiteness < 65) add('teeth-color');
    }
    return out.filter((f) => FIXES[f]);
  }, [surveyResult, metrics]);

  const grouped = useMemo(() => {
    const g: Record<Fix['difficulty'], { flag: string; fix: Fix }[]> = {
      easy: [],
      moderate: [],
      hard: [],
    };
    for (const flag of flags) {
      const fix = FIXES[flag];
      g[fix.difficulty].push({ flag, fix });
    }
    return g;
  }, [flags]);

  const weakestCategories = useMemo(() => {
    if (!surveyResult) return [];
    return CATEGORIES
      .map((c) => ({ ...c, score: surveyResult.categoryScores[c.id] }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);
  }, [surveyResult]);

  return (
    <div className="space-y-12 animate-slide-up max-w-3xl">
      {/* Combined hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-brutal !shadow-brutal-pop overflow-hidden"
      >
        <div className="px-6 py-3 border-b-[3px] border-ink bg-ink">
          <p className="font-display text-xs uppercase tracking-widest text-cream">
            ★ Your Looksmax Profile
          </p>
        </div>
        <div className="grid grid-cols-3 divide-x-[3px] divide-ink">
          <div className="p-6 text-center">
            <p className="font-display text-[10px] uppercase tracking-widest text-ink-mute mb-1">Face</p>
            <span className="font-display text-5xl tabular-nums">{faceScore ?? '—'}</span>
          </div>
          <div className="p-6 text-center bg-pop text-white">
            <p className="font-display text-[10px] uppercase tracking-widest mb-1">Overall</p>
            <span className="font-display text-5xl tabular-nums">{combined ?? '—'}</span>
          </div>
          <div className="p-6 text-center">
            <p className="font-display text-[10px] uppercase tracking-widest text-ink-mute mb-1">Habits</p>
            <span className="font-display text-5xl tabular-nums">{habitsScore ?? '—'}</span>
          </div>
        </div>
        {weakestCategories.length > 0 && (
          <div className="px-6 py-3.5 border-t-[3px] border-ink bg-cream">
            <p className="text-xs font-bold uppercase tracking-wide text-center">
              Biggest drag:{' '}
              {weakestCategories.map((c, i) => (
                <span key={c.id}>
                  <span className="bg-ink text-cream px-1.5 py-0.5">{c.name}</span>
                  {i < weakestCategories.length - 1 ? ' ' : ''}
                </span>
              ))}
            </p>
          </div>
        )}
      </motion.div>

      {/* Category breakdown */}
      {surveyResult && (
        <div>
          <h3 className="font-display text-2xl uppercase mb-5">Habit Breakdown</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {CATEGORIES.map((c, i) => {
              const score = surveyResult.categoryScores[c.id];
              const weak = score < 60;
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`border-[3px] border-ink px-4 py-3 shadow-brutal-xs ${
                    weak ? 'bg-pop text-white' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display text-xs uppercase">{c.name}</span>
                    <span className="font-display text-xl tabular-nums">{score}</span>
                  </div>
                  <div className={`h-3 border-2 ${weak ? 'border-white bg-pop' : 'border-ink bg-white'}`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 0.6, delay: i * 0.04 }}
                      className={`h-full ${weak ? 'bg-white' : 'bg-ink'}`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fix plan */}
      <div className="space-y-10">
        <div className="card-brutal !bg-ink p-7 text-center">
          <h3 className="font-display text-3xl uppercase text-cream leading-tight">
            Your <span className="text-pop">Fix</span> Plan
          </h3>
          <p className="text-sm font-medium text-cream/70 mt-2">
            {flags.length} targeted actions, built from your scan and your answers
          </p>
        </div>

        {flags.length === 0 && (
          <p className="text-center font-bold py-8">
            No major issues flagged — you&apos;re already running a tight ship. Maintain the fundamentals.
          </p>
        )}

        {DIFFICULTY_GROUPS.map(({ key, title, blurb, icon: Icon }) => {
          const items = grouped[key];
          if (items.length === 0) return null;
          return (
            <div key={key}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 border-[3px] border-ink bg-pop text-white shadow-brutal-xs flex items-center justify-center">
                  <Icon className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="font-display text-lg uppercase leading-tight">{title}</h4>
                  <p className="text-xs font-bold text-ink-mute uppercase tracking-wide">{blurb}</p>
                </div>
              </div>
              <div className="grid gap-4">
                {items.map(({ flag, fix }, i) => (
                  <motion.div
                    key={flag}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-[3px] border-ink bg-white shadow-brutal-sm p-5"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h5 className="font-display text-sm uppercase">{fix.title}</h5>
                      <span className="chip-brutal shrink-0 !shadow-none">{fix.timeframe}</span>
                    </div>
                    <p className="text-sm font-medium text-ink-soft leading-relaxed">{fix.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 1-on-1 consult — coming soon */}
      <div className="card-brutal !shadow-brutal-pop overflow-hidden">
        <div className="px-6 py-3 border-b-[3px] border-ink bg-pop">
          <p className="font-display text-xs uppercase tracking-widest text-white">
            ★ Want a human to walk you through it?
          </p>
        </div>
        <div className="p-6 flex flex-wrap items-center gap-6 bg-white">
          <div className="w-14 h-14 border-[3px] border-ink bg-ink text-pop shadow-brutal-xs flex items-center justify-center shrink-0">
            <PhoneCall className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-[220px]">
            <h4 className="font-display text-xl uppercase leading-tight">
              1-on-1 Looks Consult
            </h4>
            <p className="text-sm font-medium text-ink-soft mt-1">
              A 60-minute video call with a consultant who reads your scan + survey and builds your
              roadmap live. Hyper-specific, no generic advice.
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-3xl">$199</p>
            <button
              disabled
              className="btn-brutal bg-white text-ink-mute text-xs px-4 py-2.5 mt-2 cursor-not-allowed"
              title="Coming soon"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>

      {/* Products */}
      {metrics && <Recommendations metrics={metrics} />}

      <p className="text-center text-[11px] font-bold uppercase tracking-wide text-ink-mute">
        Informational, not medical advice. Meds, procedures, or persistent issues → talk to a professional.
      </p>
    </div>
  );
}
