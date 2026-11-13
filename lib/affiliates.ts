// ═════════════════════════════════════════════════════════════════════════════
// AFFILIATE CONFIG — the only file you touch as programs get approved.
//
// Works with ZERO accounts today:
//   • OTC items link to plain Amazon search results (buttons work, unpaid).
//   • Rx items show "prescription only" until a telehealth partner URL is set.
//
// As access arrives:
//   1. Amazon Associates approved → paste your tag into AMAZON_TAG
//      ('looksmax-20' style). Every Amazon link site-wide becomes a paying one.
//   2. Telehealth program approved (Hims / Keeps / Ro / Curology…) → paste your
//      tracking URL into RX_PARTNERS below. That compound's card instantly
//      shows a "Start online visit" button instead of the Rx-only box.
//   3. Direct/brand program approved (CurrentBody, Braun…) or you start selling
//      an item yourself → set `buyLink` on the item in gear.ts / compounds.ts;
//      it always wins over the Amazon fallback.
// ═════════════════════════════════════════════════════════════════════════════

import { Compound } from './compounds';
import { GearItem } from './gear';

/** Your Amazon Associates tag, e.g. 'looksmax-20'. Empty = untagged links. */
export const AMAZON_TAG = '';

/** Telehealth partners for Rx compounds. Fill `url` with your tracking link
 *  from Impact / ShareASale / FlexOffers / AWIN once approved. */
export const RX_PARTNERS: Record<string, { partner: string; url: string }> = {
  Finasteride: { partner: 'Hims', url: '' },
  Dutasteride: { partner: 'Hims', url: '' },
  Tretinoin: { partner: 'Curology', url: '' },
  Tazarotene: { partner: 'Curology', url: '' },
  Spironolactone: { partner: 'Curology', url: '' },
  Clascoterone: { partner: 'Curology', url: '' },
  Hydroquinone: { partner: 'Curology', url: '' },
  Semaglutide: { partner: 'Ro', url: '' },
  Tirzepatide: { partner: 'Ro', url: '' },
  Liraglutide: { partner: 'Ro', url: '' },
  Bimatoprost: { partner: 'Hers', url: '' },
};

/** Items whose names make bad Amazon searches — better query per item. */
const QUERY_OVERRIDES: Record<string, string> = {
  // Gear
  'Pro clippers + edge trimmer': 'hair clippers edge trimmer set',
  'Blow dryer + round brush': 'hair dryer round brush set',
  'Nasal dilator / strips': 'nasal breathing strips',
  'Multi-head facial tool': 'multi-use facial skincare device',
  'Laser hair-growth cap': 'laser hair growth cap FDA cleared',
  'IPL hair removal device': 'IPL hair removal device',
  'Brow tweezers + scissors': 'eyebrow grooming kit tweezers scissors',
  'Glass nail file + buffer': 'glass nail file',
  'Shoe trees + polish kit': 'shoe care kit shoe trees polish',
  'Standing desk / riser': 'standing desk converter',
  'Whitening strips': 'teeth whitening strips',
  'Whitening gel trays': 'teeth whitening gel tray kit',
  'Jaw exerciser': 'jaw exerciser',
  'Hairline concealer / powder': 'hairline powder concealer',
  'Self-tanning drops': 'self tanning drops face',
  'Korean exfoliating mitt': 'korean exfoliating mitt',
  'Derma roller (home)': 'derma roller',
  'Caffeine (topical)': 'caffeine under eye serum',
  // Compounds
  'Vitamin C (topical)': 'vitamin c serum face',
  'Omega-3 (EPA/DHA)': 'omega 3 fish oil EPA DHA',
  'Melatonin (topical)': 'topical melatonin scalp serum',
  'Dihydroxyacetone': 'self tanning mousse',
  'GHK-Cu': 'copper peptide serum GHK-Cu',
  Matrixyl: 'matrixyl peptide serum',
  Argireline: 'argireline peptide serum',
  'SNAP-8': 'snap-8 peptide serum',
  Ceramides: 'ceramide moisturizer',
  'Hyaluronic acid': 'hyaluronic acid serum',
  'Salicylic acid': 'salicylic acid 2% exfoliant',
  'Glycolic acid': 'glycolic acid toner',
  'Lactic acid': 'lactic acid serum',
  'Azelaic acid': 'azelaic acid 10% suspension',
  'Alpha-arbutin': 'alpha arbutin serum',
  'Kojic acid': 'kojic acid serum',
  Cysteamine: 'cysteamine cream',
  'Tranexamic acid': 'tranexamic acid serum',
  Niacinamide: 'niacinamide 10% serum',
  Retinol: 'retinol serum',
  Adapalene: 'adapalene gel 0.1%',
  Urea: 'urea 10 cream',
  'Creatine monohydrate': 'creatine monohydrate powder',
  'Whey protein': 'whey protein powder',
  'L-Carnitine': 'l-carnitine supplement',
  'Beta-alanine': 'beta alanine powder',
  Leucine: 'l-leucine powder',
  'Citrulline malate': 'citrulline malate powder',
  'Vitamin D': 'vitamin d3 k2 supplement',
  'N-Acetylcysteine': 'NAC n-acetylcysteine supplement',
  Glutathione: 'glutathione supplement',
  'Coenzyme Q10': 'coq10 supplement',
  'Alpha-lipoic acid': 'alpha lipoic acid supplement',
  'Alpha-ketoglutarate': 'alpha ketoglutarate supplement',
  'Nicotinamide riboside': 'nicotinamide riboside supplement',
  NMN: 'NMN supplement',
};

/** Things you can't buy with a link: services, dentist-only, or hard-skips. */
const NO_BUY = new Set(['Tailoring (any clothes)', 'Clear aligners', 'UV tanning bed']);

export function amazonSearchUrl(query: string): string {
  const base = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
  return AMAZON_TAG ? `${base}&tag=${encodeURIComponent(AMAZON_TAG)}` : base;
}

export type BuyAction =
  | { kind: 'direct'; url: string; label: string }
  | { kind: 'amazon'; url: string; label: string }
  | { kind: 'telehealth'; url: string; label: string; partner: string }
  | null;

/** Resolve the buy action for any Index item. Null = no button (Rx without a
 *  partner link, research chems, and non-purchasable services). */
export function buyActionFor(
  entry: { kind: 'compound'; item: Compound } | { kind: 'gear'; item: GearItem }
): BuyAction {
  const { item } = entry;

  // Explicit link always wins (direct program, or selling it ourselves)
  if (item.buyLink) return { kind: 'direct', url: item.buyLink, label: 'Get It' };

  if (entry.kind === 'compound') {
    if (entry.item.status === 'research') return null; // never sold, never linked
    if (entry.item.status === 'rx') {
      const p = RX_PARTNERS[item.name];
      if (p?.url) {
        return { kind: 'telehealth', url: p.url, label: `Online visit via ${p.partner}`, partner: p.partner };
      }
      return null; // Rx-only box
    }
  }

  if (NO_BUY.has(item.name)) return null;

  const query = QUERY_OVERRIDES[item.name] ?? item.name;
  return { kind: 'amazon', url: amazonSearchUrl(query), label: 'Find on Amazon' };
}
