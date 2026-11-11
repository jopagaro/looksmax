'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Sparkles, Zap, ClipboardList, Microscope, PhoneCall } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import {
  CATEGORIES,
  TIER_META,
  SurveyTier,
  getQuestionsForTier,
  scoreSurvey,
} from '@/lib/survey';

const TIER_ORDER: { tier: SurveyTier; icon: typeof Zap; accent: boolean }[] = [
  { tier: 'quick', icon: Zap, accent: false },
  { tier: 'full', icon: ClipboardList, accent: true },
  { tier: 'deep', icon: Microscope, accent: false },
];

export default function Survey() {
  const { surveyTier, setSurveyTier, surveyAnswers, answerQuestion, finishSurvey } = useAppStore();
  const [index, setIndex] = useState(0);
  const [isDemo, setIsDemo] = useState(false);

  const questions = useMemo(
    () => (surveyTier ? getQuestionsForTier(surveyTier) : []),
    [surveyTier]
  );

  // Resume at the first unanswered question of this tier
  useEffect(() => {
    if (!surveyTier) return;
    const firstUnanswered = questions.findIndex((q) => surveyAnswers[q.id] === undefined);
    setIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surveyTier]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('demo=1')) {
      setIsDemo(true);
    }
  }, []);

  // ── Tier picker ─────────────────────────────────────────────────────────────
  if (!surveyTier) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
        <div>
          <h2 className="font-display text-4xl sm:text-5xl uppercase leading-[0.95] tracking-tight mb-3">
            How deep do you<br />want to <span className="text-pop">go?</span>
          </h2>
          <p className="text-base font-medium">
            Deeper = more specific issues found = more exact fixes and products.
          </p>
        </div>

        <div className="grid gap-5">
          {TIER_ORDER.map(({ tier, icon: Icon, accent }) => {
            const meta = TIER_META[tier];
            return (
              <button
                key={tier}
                onClick={() => setSurveyTier(tier)}
                className={`card-brutal text-left p-6 flex items-center gap-5 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-pressed transition-all ${
                  accent ? '!bg-ink !shadow-brutal-pop' : ''
                }`}
              >
                <div
                  className={`w-12 h-12 border-[3px] shadow-brutal-xs flex items-center justify-center shrink-0 ${
                    accent ? 'border-pop bg-pop text-white' : 'border-ink bg-pop text-white'
                  }`}
                >
                  <Icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <h3 className={`font-display text-xl uppercase ${accent ? 'text-cream' : ''}`}>
                      {meta.name}
                    </h3>
                    {accent && (
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-pop text-white px-1.5 py-0.5">
                        Most popular
                      </span>
                    )}
                  </div>
                  <p className={`text-sm font-medium mt-0.5 ${accent ? 'text-cream/70' : 'text-ink-soft'}`}>
                    {meta.tagline}
                  </p>
                </div>
                <div className={`text-right shrink-0 ${accent ? 'text-cream' : ''}`}>
                  <p className="font-display text-2xl tabular-nums">{meta.count}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${accent ? 'text-cream/60' : 'text-ink-mute'}`}>
                    questions · {meta.minutes}
                  </p>
                </div>
              </button>
            );
          })}

          {/* Consultant teaser */}
          <div className="border-[3px] border-dashed border-ink/40 p-5 flex items-center gap-4">
            <PhoneCall className="w-5 h-5 text-pop shrink-0" strokeWidth={2.5} />
            <p className="text-sm font-bold uppercase tracking-wide text-ink-mute">
              Beyond the deep scan: 1-on-1 looks consult, $199 —{' '}
              <span className="text-pop">coming soon</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Questions ───────────────────────────────────────────────────────────────
  const question = questions[Math.min(index, questions.length - 1)];
  const category = CATEGORIES.find((c) => c.id === question.category)!;
  const categoryIndex = CATEGORIES.findIndex((c) => c.id === question.category);
  const progress = (index / questions.length) * 100;
  const selected = surveyAnswers[question.id];

  const advance = (nextAnswers: Record<string, number>) => {
    if (index + 1 >= questions.length) {
      finishSurvey(scoreSurvey(nextAnswers));
    } else {
      setIndex(index + 1);
    }
  };

  const handleSelect = (optionIndex: number) => {
    answerQuestion(question.id, optionIndex);
    const nextAnswers = { ...surveyAnswers, [question.id]: optionIndex };
    setTimeout(() => advance(nextAnswers), 180);
  };

  // Dev helper: answer everything randomly (demo mode only)
  const handleAutofill = () => {
    const filled: Record<string, number> = { ...surveyAnswers };
    for (const q of questions) {
      if (filled[q.id] === undefined) {
        filled[q.id] = Math.floor(Math.random() * q.options.length);
      }
      answerQuestion(q.id, filled[q.id]);
    }
    finishSurvey(scoreSurvey(filled));
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress header */}
      <div className="card-brutal mb-8">
        <div className="flex items-center justify-between px-4 py-3 border-b-[3px] border-ink">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (index > 0 ? setIndex(index - 1) : setSurveyTier(null))}
              className="w-8 h-8 border-2 border-ink bg-white shadow-brutal-xs flex items-center justify-center hover:bg-cream transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="font-display text-sm uppercase">
              {category.name}
              <span className="text-ink-mute font-sans font-bold text-xs ml-2">
                {categoryIndex + 1}/{CATEGORIES.length}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-ink text-cream px-1.5 py-0.5">
              {TIER_META[surveyTier].name}
            </span>
            <span className="font-display text-sm tabular-nums">
              {index + 1}<span className="text-ink-mute">/{questions.length}</span>
            </span>
            {isDemo && (
              <button
                onClick={handleAutofill}
                className="inline-flex items-center gap-1 text-xs font-bold text-pop hover:underline"
              >
                <Sparkles className="w-3 h-3" />
                autofill
              </button>
            )}
          </div>
        </div>
        <div className="h-4 bg-white">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-pop border-r-[3px] border-ink"
            style={{ borderRightWidth: progress > 0 && progress < 100 ? 3 : 0 }}
          />
        </div>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.18 }}
        >
          <h2 className="font-display text-3xl sm:text-4xl uppercase leading-[1.05] mb-8 text-balance">
            {question.text}
          </h2>

          <div className="grid gap-4">
            {question.options.map((option, i) => {
              const isSelected = selected === i;
              return (
                <button
                  key={option.label}
                  onClick={() => handleSelect(i)}
                  className={`flex items-center justify-between text-left px-5 py-4 border-[3px] border-ink font-bold transition-all duration-100 ${
                    isSelected
                      ? 'bg-pop text-white shadow-brutal-pressed translate-x-[2px] translate-y-[2px]'
                      : 'bg-white shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-pressed'
                  }`}
                >
                  <span>{option.label}</span>
                  <span
                    className={`w-6 h-6 border-[3px] flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-white bg-white text-pop' : 'border-ink bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4" strokeWidth={4} />}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <p className="text-center text-[11px] font-bold uppercase tracking-wide text-ink-mute mt-10">
        Honest answers = an accurate plan · Nothing leaves your browser
      </p>
    </div>
  );
}
