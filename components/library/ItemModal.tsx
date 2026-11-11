'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, ExternalLink, ImageIcon } from 'lucide-react';
import {
  Compound,
  CATEGORY_META,
  EVIDENCE_META,
  structureUrl,
} from '@/lib/compounds';
import { GearItem, GEAR_CATEGORY_META, OUTCOME_META } from '@/lib/gear';

export type LibraryItem =
  | { kind: 'compound'; item: Compound }
  | { kind: 'gear'; item: GearItem };

const EVIDENCE_CHIP: Record<string, string> = {
  strong: 'bg-ink text-cream',
  moderate: 'bg-white',
  limited: 'bg-cream',
  unproven: 'bg-pop text-white',
};

export default function ItemModal({
  selected,
  onClose,
}: {
  selected: LibraryItem;
  onClose: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const { kind, item } = selected;

  useEffect(() => {
    setImgFailed(false);
  }, [item.name]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const categoryName =
    kind === 'compound'
      ? CATEGORY_META[item.category].name
      : GEAR_CATEGORY_META[item.category].name;

  const structure = kind === 'compound' ? item.structure : undefined;
  const gearImage = kind === 'gear' ? item.image : undefined;
  const showStructure = structure && !imgFailed;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/70"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.15 }}
        className="card-brutal !shadow-brutal-pop w-full max-w-md max-h-[90vh] overflow-y-auto bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b-[3px] border-ink bg-ink sticky top-0 z-10">
          <span className="font-display text-xs uppercase tracking-widest text-cream">
            {kind === 'compound' ? '★ Compound File' : '★ Gear File'}
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 border-2 border-cream text-cream flex items-center justify-center hover:bg-pop hover:border-pop transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={3} />
          </button>
        </div>

        {/* Visual: chemical structure (compounds) or product shot (gear) */}
        <div className="h-56 border-b-[3px] border-ink bg-white flex items-center justify-center p-4">
          {kind === 'compound' ? (
            showStructure ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={structureUrl(structure!)}
                alt={`${item.name} chemical structure`}
                className="max-h-full max-w-full object-contain"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <div className="text-center">
                <p className="font-display text-4xl text-ink/15 mb-2">★</p>
                <p className="text-xs font-bold uppercase tracking-wide text-ink-mute">
                  No 2D structure
                  <br />
                  (biologic, blend, or too big to draw)
                </p>
              </div>
            )
          ) : gearImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={gearImage}
              alt={item.name}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="text-center border-[3px] border-dashed border-ink/25 px-8 py-10 w-full">
              <ImageIcon className="w-8 h-8 mx-auto text-ink/25 mb-2" strokeWidth={2} />
              <p className="text-xs font-bold uppercase tracking-wide text-ink-mute">
                Product shot coming soon
              </p>
            </div>
          )}
        </div>
        {kind === 'compound' && showStructure && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-mute text-center py-1.5 border-b-[3px] border-ink bg-cream">
            2D structure · PubChem
          </p>
        )}

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <h3 className="font-display text-2xl uppercase leading-tight">{item.name}</h3>
            {'aka' in item && item.aka && (
              <p className="text-xs font-bold text-ink-mute uppercase tracking-wide mt-0.5">
                aka {item.aka}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="chip-brutal !shadow-none">{categoryName}</span>
            <span className={`chip-brutal !shadow-none ${EVIDENCE_CHIP[item.evidence]}`}>
              {EVIDENCE_META[item.evidence].label} evidence
            </span>
            {kind === 'gear' && (
              <span
                className={`chip-brutal !shadow-none ${
                  item.outcome === 'unsupported' ? '!bg-pop !text-white' : ''
                }`}
              >
                {OUTCOME_META[item.outcome].label}
              </span>
            )}
          </div>

          <p className="text-sm font-medium leading-relaxed">{item.summary}</p>

          {item.note && (
            <p className="text-xs font-bold leading-relaxed bg-cream border-[3px] border-ink px-3 py-2.5">
              ⚠ {item.note}
            </p>
          )}

          {/* Buy / status area */}
          <div className="pt-1">
            {kind === 'compound' && item.status === 'rx' ? (
              <div className="border-[3px] border-ink bg-cream px-4 py-3 text-center">
                <p className="font-display text-sm uppercase">℞ Prescription only</p>
                <p className="text-xs font-bold text-ink-mute mt-0.5">
                  This one goes through a doctor, not a cart.
                </p>
              </div>
            ) : kind === 'compound' && item.status === 'research' ? (
              <div className="border-[3px] border-ink bg-ink px-4 py-3 text-center">
                <p className="font-display text-sm uppercase text-pop">⚠ Research compound</p>
                <p className="text-xs font-bold text-cream/70 mt-0.5">
                  Not approved for human use. We don&apos;t sell it.
                </p>
              </div>
            ) : item.buyLink ? (
              <a
                href={item.buyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-brutal bg-pop text-white w-full justify-center text-sm px-5 py-3"
              >
                {kind === 'gear' && item.price ? `Get It · ${item.price}` : 'Get It'}
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <button
                disabled
                className="btn-brutal bg-white text-ink-mute w-full justify-center text-sm px-5 py-3 cursor-not-allowed"
              >
                {kind === 'gear' && item.price ? `${item.price} · Link coming soon` : 'Link coming soon'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
