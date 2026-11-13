'use client';

import { useMemo, useState } from 'react';
import { FacialMetrics } from '@/lib/calculations';
import { buildRecommendations, Recommendation } from '@/lib/recommendations';
import { EVIDENCE_META } from '@/lib/compounds';
import { useAppStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown, Sparkles } from 'lucide-react';
import ItemModal, { LibraryItem } from '@/components/library/ItemModal';

const INITIAL_COUNT = 3;
const MAX_COUNT = 12;

interface RecommendationsProps {
  metrics: FacialMetrics;
}

export default function Recommendations({ metrics }: RecommendationsProps) {
  const { surveyResult, openLibrary } = useAppStore();
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<LibraryItem | null>(null);

  const recs: Recommendation[] = useMemo(
    () => buildRecommendations(metrics, surveyResult?.flags ?? []).slice(0, MAX_COUNT),
    [metrics, surveyResult]
  );

  const visible = expanded ? recs : recs.slice(0, INITIAL_COUNT);
  const hiddenCount = recs.length - INITIAL_COUNT;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-pop" strokeWidth={2.5} />
          <h3 className="font-display text-2xl uppercase">
            The <span className="text-pop">Gear</span>
          </h3>
        </div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-ink-mute">
          Matched to your weak spots — not a generic list
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {visible.map(({ entry, reason }, index) => {
          const { item } = entry;
          const price = entry.kind === 'gear' ? entry.item.price : undefined;
          return (
            <motion.button
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (index % INITIAL_COUNT) * 0.08 }}
              onClick={() => setSelected(entry)}
              className="text-left border-[3px] border-ink bg-white shadow-brutal-sm p-5 flex flex-col gap-2.5 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            >
              <span className="chip-brutal !shadow-none self-start !bg-pop !text-white !border-ink">
                {reason}
              </span>
              <h4 className="font-display text-sm uppercase leading-tight">{item.name}</h4>
              <p className="text-xs font-medium text-ink-soft leading-relaxed line-clamp-2">
                {item.summary}
              </p>
              <div className="flex items-center justify-between mt-auto pt-3 border-t-2 border-ink/15">
                <span className="text-[10px] font-bold uppercase tracking-widest text-ink-mute">
                  {EVIDENCE_META[item.evidence].label} evidence
                </span>
                <span className="font-display text-sm">{price ?? 'View'}</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {hiddenCount > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="btn-brutal bg-white text-ink text-xs px-5 py-3 mx-auto flex mt-5"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
          {expanded ? 'Show less' : `Show ${hiddenCount} more fixes`}
        </button>
      )}

      <button
        onClick={openLibrary}
        className="w-full mt-6 border-[3px] border-ink bg-ink text-cream shadow-brutal-sm p-5 flex items-center justify-between gap-4 text-left hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
      >
        <div>
          <p className="font-display text-lg uppercase leading-tight">
            Browse the full <span className="text-pop">Index</span>
          </p>
          <p className="text-xs font-bold text-cream/70 mt-1 uppercase tracking-wide">
            Every compound &amp; every piece of gear, rated by evidence
          </p>
        </div>
        <ArrowRight className="w-6 h-6 shrink-0 text-pop" strokeWidth={3} />
      </button>

      <p className="text-[11px] font-bold uppercase tracking-wide text-ink-mute text-center mt-6">
        * We earn a commission on qualifying purchases — costs you nothing extra
      </p>

      <AnimatePresence>
        {selected && <ItemModal selected={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
