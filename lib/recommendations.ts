// Issue → product mapping: turns scan weaknesses and survey flags into
// ranked recommendations from the Index (gear + compounds).

import { COMPOUNDS, Compound } from './compounds';
import { GEAR, GearItem } from './gear';
import { FacialMetrics } from './calculations';

export type IndexEntry =
  | { kind: 'compound'; item: Compound }
  | { kind: 'gear'; item: GearItem };

export interface Recommendation {
  entry: IndexEntry;
  /** Why this is being recommended — shown on the card. */
  reason: string;
}

const gearByName = new Map(GEAR.map((g) => [g.name, g]));
const compoundByName = new Map(COMPOUNDS.map((c) => [c.name, c]));

function resolve(name: string): IndexEntry | null {
  const g = gearByName.get(name);
  if (g) return { kind: 'gear', item: g };
  const c = compoundByName.get(name);
  if (c) return { kind: 'compound', item: c };
  return null;
}

interface Rule {
  /** Fires when any of these survey flags are present… */
  flags?: string[];
  /** …or when this metric predicate is true. */
  metric?: (m: FacialMetrics) => boolean;
  reason: string;
  items: string[]; // Index item names, best first
}

// Priority order: the first rules that fire supply the top cards.
const RULES: Rule[] = [
  {
    flags: ['teeth-color', 'never-whitened', 'staining-drinks'],
    metric: (m) => m.teethWhiteness !== null && m.teethWhiteness < 70,
    reason: 'Teeth running yellow',
    items: ['Whitening strips', 'Whitening gel trays', 'Electric toothbrush'],
  },
  {
    flags: ['acne', 'severe-acne', 'mild-acne'],
    reason: 'Breakouts flagged',
    items: ['Adapalene', 'Salicylic acid', 'Pimple patches'],
  },
  {
    flags: ['no-spf', 'low-spf', 'no-spf-reapply'],
    reason: 'Zero UV defense',
    items: ['Broad-spectrum sunscreen', 'Tinted facial SPF'],
  },
  {
    flags: ['hair-loss', 'hair-loss-early', 'hair-loss-untreated'],
    reason: 'Thinning hair',
    items: ['Minoxidil', 'Laser hair-growth cap', 'Hair fibers'],
  },
  {
    metric: (m) => m.jawlineDefinition < 65,
    flags: ['submental-fat', 'bodyfat-high', 'bodyfat'],
    reason: 'Jawline = body fat',
    items: ['Walking pad', 'Smart scale', 'Measuring tape'],
  },
  {
    metric: (m) => m.canthalTilt < 55 || (m.darkCircles !== null && m.darkCircles < 65),
    flags: ['dark-circles', 'puffiness'],
    reason: 'Tired eye area',
    items: ['Caffeine (topical)', 'Under-eye cooling mask', 'Ice roller'],
  },
  {
    metric: (m) => m.skinEvenness !== null && m.skinEvenness < 65,
    reason: 'Uneven skin tone',
    items: ['Vitamin C (topical)', 'Niacinamide', 'Tinted facial SPF'],
  },
  {
    flags: ['no-actives', 'scarring'],
    reason: 'Skin texture & aging',
    items: ['Retinol', 'Vitamin C (topical)', 'Red light LED mask'],
  },
  {
    flags: ['redness'],
    metric: (m) => m.skinRedness !== null && m.skinRedness < 65,
    reason: 'Persistent redness',
    items: ['Azelaic acid', 'Niacinamide'],
  },
  {
    flags: ['dry-skin', 'no-ceramides'],
    reason: 'Barrier needs repair',
    items: ['Ceramides', 'Hyaluronic acid'],
  },
  {
    flags: ['oily-skin', 'pores'],
    reason: 'Oil & clogged pores',
    items: ['Niacinamide', 'Salicylic acid'],
  },
  {
    metric: (m) => m.gonialAngle < 60,
    flags: ['forward-head', 'tech-neck', 'rounded-shoulders'],
    reason: 'Posture drags the jaw',
    items: ['Resistance bands', 'Neck training harness', 'Standing desk / riser'],
  },
  {
    flags: ['sleep-debt', 'sleep-quality', 'sleep-schedule', 'sleep-environment'],
    reason: 'Sleep is the base layer',
    items: ['Blackout curtains', 'Sleep mask', 'Sunrise alarm clock'],
  },
  {
    flags: ['stomach-sleeping', 'cotton-pillowcase', 'dirty-pillowcase'],
    reason: 'Your pillow is sabotage',
    items: ['Silk pillowcase'],
  },
  {
    flags: ['mouth-breathing-sleep', 'snoring'],
    reason: 'Night breathing',
    items: ['Nasal dilator / strips'],
  },
  {
    flags: ['no-training', 'no-progression', 'no-vtaper'],
    reason: 'Build the frame',
    items: ['Adjustable dumbbells', 'Resistance bands', 'Pull-up bar'],
  },
  {
    flags: ['no-creatine', 'low-protein'],
    reason: 'Easy muscle wins',
    items: ['Creatine monohydrate', 'Whey protein'],
  },
  {
    flags: ['thin-neck'],
    reason: 'Thin neck, small frame',
    items: ['Neck training harness'],
  },
  {
    flags: ['facial-hair', 'beard-patchy'],
    reason: 'Beard needs intent',
    items: ['Precision beard trimmer', 'Beard oil'],
  },
  {
    flags: ['grooming-neglect', 'no-edge-tool'],
    reason: 'Grooming cadence',
    items: ['Pro clippers + edge trimmer', 'Precision beard trimmer'],
  },
  {
    flags: ['brows', 'sparse-lashes'],
    reason: 'Brow game weak',
    items: ['Brow tweezers + scissors', 'Clear brow gel', 'Brow tint kit'],
  },
  {
    flags: ['razor-burn'],
    reason: 'Razor burn',
    items: ['Safety razor'],
  },
  {
    flags: ['fit', 'no-tailor', 'no-style'],
    reason: 'Fit is instant',
    items: ['Tailoring (any clothes)', 'Clothes steamer', 'Compression undershirt'],
  },
  {
    flags: ['clothes-care'],
    reason: 'Wrinkled reads lazy',
    items: ['Clothes steamer', 'Fabric shaver'],
  },
  {
    flags: ['no-omega3'],
    reason: 'Missing omega-3s',
    items: ['Omega-3 (EPA/DHA)'],
  },
  {
    flags: ['no-vitd'],
    reason: 'Vitamin D unknown',
    items: ['Vitamin D'],
  },
];

// Always-solid picks if the scan/survey barely flagged anything.
const FALLBACK: { name: string; reason: string }[] = [
  { name: 'Broad-spectrum sunscreen', reason: 'The #1 proven anti-ager' },
  { name: 'Creatine monohydrate', reason: 'Most proven supplement, period' },
  { name: 'Whitening strips', reason: 'Fastest visible upgrade' },
  { name: 'Silk pillowcase', reason: '8 hours a night of payoff' },
];

export function buildRecommendations(
  metrics: FacialMetrics | null,
  flags: string[]
): Recommendation[] {
  const flagSet = new Set(flags);
  const out: Recommendation[] = [];
  const seen = new Set<string>();

  const push = (name: string, reason: string) => {
    if (seen.has(name)) return;
    const entry = resolve(name);
    if (!entry) return;
    seen.add(name);
    out.push({ entry, reason });
  };

  for (const rule of RULES) {
    const flagHit = rule.flags?.some((f) => flagSet.has(f)) ?? false;
    const metricHit = (metrics && rule.metric?.(metrics)) ?? false;
    if (flagHit || metricHit) {
      for (const name of rule.items) push(name, rule.reason);
    }
  }

  for (const fb of FALLBACK) {
    if (out.length >= 3) break;
    push(fb.name, fb.reason);
  }

  return out;
}
