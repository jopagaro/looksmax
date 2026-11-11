'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { QUESTIONS, CATEGORIES, scoreSurvey } from '@/lib/survey';

export default function Survey() {
  const { surveyAnswers, answerQuestion, finishSurvey } = useAppStore();
  const [index, setIndex] = useState(() => {
    // Resume where the user left off
    const firstUnanswered = QUESTIONS.findIndex((q) => surveyAnswers[q.id] === undefined);
    return firstUnanswered === -1 ? 0 : firstUnanswered;
  });
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('demo=1')) {
      setIsDemo(true);
    }
  }, []);

  const question = QUESTIONS[index];
  const category = useMemo(
    () => CATEGORIES.find((c) => c.id === question.category)!,
    [question]
  );
  const categoryIndex = CATEGORIES.findIndex((c) => c.id === question.category);
  const progress = (index / QUESTIONS.length) * 100;
  const selected = surveyAnswers[question.id];

  const advance = (nextAnswers: Record<string, number>) => {
    if (index + 1 >= QUESTIONS.length) {
      finishSurvey(scoreSurvey(nextAnswers));
    } else {
      setIndex(index + 1);
    }
  };

  const handleSelect = (optionIndex: number) => {
    answerQuestion(question.id, optionIndex);
    const nextAnswers = { ...surveyAnswers, [question.id]: optionIndex };
    // Small delay so the selection registers visually before advancing
    setTimeout(() => advance(nextAnswers), 180);
  };

  // Dev helper: answer everything randomly (demo mode only)
  const handleAutofill = () => {
    const filled: Record<string, number> = { ...surveyAnswers };
    for (const q of QUESTIONS) {
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
            {index > 0 && (
              <button
                onClick={() => setIndex(index - 1)}
                className="w-8 h-8 border-2 border-ink bg-white shadow-brutal-xs flex items-center justify-center hover:bg-cream transition-colors"
                aria-label="Previous question"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <span className="font-display text-sm uppercase">
              {category.name}
              <span className="text-ink-mute font-sans font-bold text-xs ml-2">
                {categoryIndex + 1}/{CATEGORIES.length}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-display text-sm tabular-nums">
              {index + 1}<span className="text-ink-mute">/{QUESTIONS.length}</span>
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
