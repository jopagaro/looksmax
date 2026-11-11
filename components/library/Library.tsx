'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import {
  COMPOUNDS,
  CATEGORY_META,
  EVIDENCE_META,
  STATUS_META,
  Evidence,
  CompoundCategory,
} from '@/lib/compounds';
import { GEAR, GEAR_CATEGORY_META, OUTCOME_META, GearCategory } from '@/lib/gear';
import ItemModal, { LibraryItem } from './ItemModal';

type Kind = 'compound' | 'gear';

const EVIDENCE_CHIP: Record<Evidence, string> = {
  strong: 'bg-ink text-cream border-ink',
  moderate: 'bg-white border-ink',
  limited: 'bg-cream border-ink',
  unproven: 'bg-pop text-white border-ink',
};

const EVIDENCE_ORDER: Evidence[] = ['strong', 'moderate', 'limited', 'unproven'];

export default function Library() {
  const [kind, setKind] = useState<Kind>('compound');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [evidence, setEvidence] = useState<Evidence | 'all'>('all');
  const [selected, setSelected] = useState<LibraryItem | null>(null);

  const categories = useMemo(
    () =>
      kind === 'compound'
        ? (Object.entries(CATEGORY_META) as [CompoundCategory, { name: string; blurb: string }][])
        : (Object.entries(GEAR_CATEGORY_META) as [GearCategory, { name: string; blurb: string }][]),
    [kind]
  );

  const items: LibraryItem[] = useMemo(() => {
    const q = query.toLowerCase().trim();
    const base: LibraryItem[] =
      kind === 'compound'
        ? COMPOUNDS.map((item) => ({ kind: 'compound' as const, item }))
        : GEAR.map((item) => ({ kind: 'gear' as const, item }));

    return base.filter(({ item }) => {
      if (category !== 'all' && item.category !== category) return false;
      if (evidence !== 'all' && item.evidence !== evidence) return false;
      if (!q) return true;
      const aka = 'aka' in item ? item.aka ?? '' : '';
      return [item.name, aka, item.summary, item.note ?? '']
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [kind, query, category, evidence]);

  const activeBlurb =
    category !== 'all'
      ? kind === 'compound'
        ? CATEGORY_META[category as CompoundCategory]?.blurb
        : GEAR_CATEGORY_META[category as GearCategory]?.blurb
      : null;

  const switchKind = (k: Kind) => {
    setKind(k);
    setCategory('all');
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Title */}
      <div className="max-w-2xl">
        <h2 className="font-display text-4xl sm:text-6xl uppercase leading-[0.95] tracking-tight mb-4">
          The <span className="text-pop">Index</span>
        </h2>
        <p className="text-base font-medium leading-relaxed">
          Every compound and every piece of gear in the looksmaxxing universe — rated by actual
          evidence, not marketing. Click anything for the full file.
        </p>
      </div>

      {/* Kind tabs */}
      <div className="card-brutal overflow-hidden">
        <div className="grid grid-cols-2 border-b-[3px] border-ink">
          <button
            onClick={() => switchKind('compound')}
            className={`font-display text-sm uppercase py-3.5 transition-colors ${
              kind === 'compound' ? 'bg-ink text-cream' : 'bg-white hover:bg-cream'
            }`}
          >
            Compounds <span className={kind === 'compound' ? 'text-pop' : 'text-ink-mute'}>({COMPOUNDS.length})</span>
          </button>
          <button
            onClick={() => switchKind('gear')}
            className={`font-display text-sm uppercase py-3.5 border-l-[3px] border-ink transition-colors ${
              kind === 'gear' ? 'bg-ink text-cream' : 'bg-white hover:bg-cream'
            }`}
          >
            Gear <span className={kind === 'gear' ? 'text-pop' : 'text-ink-mute'}>({GEAR.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 px-4 py-3 border-b-[3px] border-ink bg-white">
          <Search className="w-5 h-5 shrink-0" strokeWidth={2.5} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={kind === 'compound' ? 'Search compounds, mechanisms…' : 'Search gear, devices…'}
            className="w-full bg-transparent font-bold text-sm placeholder:text-ink-mute focus:outline-none uppercase tracking-wide"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs font-bold uppercase text-pop hover:underline shrink-0"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 px-4 py-3 border-b-[3px] border-ink bg-cream">
          <button
            onClick={() => setCategory('all')}
            className={`text-[11px] font-bold uppercase tracking-wide border-2 border-ink px-2.5 py-1 transition-colors ${
              category === 'all' ? 'bg-ink text-cream' : 'bg-white hover:bg-cream'
            }`}
          >
            All
          </button>
          {categories.map(([id, meta]) => (
            <button
              key={id}
              onClick={() => setCategory(category === id ? 'all' : id)}
              className={`text-[11px] font-bold uppercase tracking-wide border-2 border-ink px-2.5 py-1 transition-colors ${
                category === id ? 'bg-pop text-white' : 'bg-white hover:bg-cream'
              }`}
            >
              {meta.name}
            </button>
          ))}
        </div>

        {/* Evidence filter + count */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-white">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setEvidence('all')}
              className={`text-[11px] font-bold uppercase tracking-wide border-2 border-ink px-2.5 py-1 ${
                evidence === 'all' ? 'bg-ink text-cream' : 'bg-white hover:bg-cream'
              }`}
            >
              All evidence
            </button>
            {EVIDENCE_ORDER.map((e) => (
              <button
                key={e}
                onClick={() => setEvidence(evidence === e ? 'all' : e)}
                className={`text-[11px] font-bold uppercase tracking-wide border-2 px-2.5 py-1 ${
                  evidence === e ? EVIDENCE_CHIP[e] : 'bg-white border-ink hover:bg-cream'
                }`}
              >
                {EVIDENCE_META[e].label}
              </button>
            ))}
          </div>
          <span className="font-display text-sm tabular-nums">
            {items.length} <span className="text-ink-mute text-xs">results</span>
          </span>
        </div>
      </div>

      {activeBlurb && (
        <p className="text-sm font-bold uppercase tracking-wide bg-ink text-cream px-4 py-2.5 border-[3px] border-ink shadow-brutal-xs inline-block">
          {activeBlurb}
        </p>
      )}

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((entry) => {
          const { item } = entry;
          const aka = 'aka' in item ? item.aka : undefined;
          return (
            <button
              key={`${entry.kind}-${item.name}`}
              onClick={() => setSelected(entry)}
              className="text-left border-[3px] border-ink bg-white shadow-brutal-xs p-4 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex flex-col gap-2.5"
            >
              <div>
                <h4 className="font-display text-sm uppercase leading-tight">{item.name}</h4>
                {aka && (
                  <p className="text-[10px] font-bold text-ink-mute uppercase tracking-wide mt-0.5">
                    {aka}
                  </p>
                )}
              </div>
              <p className="text-xs font-medium text-ink-soft leading-relaxed line-clamp-2">
                {item.summary}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider border-2 px-1.5 py-0.5 ${EVIDENCE_CHIP[item.evidence]}`}
                >
                  {EVIDENCE_META[item.evidence].label}
                </span>
                {entry.kind === 'compound' && entry.item.status !== 'otc' && (
                  <span className="text-[9px] font-bold uppercase tracking-wider border-2 border-ink bg-cream px-1.5 py-0.5">
                    {STATUS_META[entry.item.status].label}
                  </span>
                )}
                {entry.kind === 'gear' && (
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider border-2 border-ink px-1.5 py-0.5 ${
                      entry.item.outcome === 'unsupported' ? 'bg-pop text-white' : 'bg-cream'
                    }`}
                  >
                    {OUTCOME_META[entry.item.outcome].label}
                  </span>
                )}
                {entry.kind === 'gear' && entry.item.price && (
                  <span className="text-[9px] font-bold uppercase tracking-wider border-2 border-ink bg-white px-1.5 py-0.5">
                    {entry.item.price}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {items.length === 0 && (
        <p className="text-center font-bold py-10 uppercase tracking-wide text-ink-mute">
          Nothing matches. Loosen the filters.
        </p>
      )}

      <p className="text-center text-[11px] font-bold uppercase tracking-wide text-ink-mute">
        Education, not endorsement or medical advice. Rx = doctor territory. Research chems are not
        approved for human use.
      </p>

      <AnimatePresence>
        {selected && <ItemModal selected={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
