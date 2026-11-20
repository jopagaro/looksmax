// Shared entry list for every script: the app's Index (assets/data.js) plus wiki-only
// entries (assets/wiki-entries.js — new compounds, gear and metas discovered for the wiki).
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function loadData() {
  const ctx = { window: {} };
  vm.runInNewContext(readFileSync(join(root, 'assets', 'data.js'), 'utf8'), ctx);
  const w = join(root, 'assets', 'wiki-entries.js');
  if (existsSync(w)) vm.runInNewContext(readFileSync(w, 'utf8'), ctx);
  return { D: ctx.window.LM_DATA, W: ctx.window.LM_WIKI || { entries: [], metaCategories: {} } };
}

/** [{ kind: 'compound'|'gear'|'meta', item, wikiOnly }] — includes not-yet-classified wiki entries when withPending. */
export function allEntries({ withPending = true } = {}) {
  const { D, W } = loadData();
  const pending = [];
  try { pending.push(...JSON.parse(readFileSync(join(root, 'research', 'new-entries.json'), 'utf8'))); } catch {}
  const known = new Set([...D.compounds, ...D.gear, ...(W.entries || [])].map((x) => x.name.toLowerCase()));
  return [
    ...D.compounds.map((item) => ({ kind: 'compound', item, wikiOnly: false })),
    ...D.gear.map((item) => ({ kind: 'gear', item, wikiOnly: false })),
    ...(W.entries || []).map((item) => ({ kind: item.kind, item, wikiOnly: true })),
    ...(withPending ? pending.filter((x) => !known.has(x.name.toLowerCase())).map((item) => ({ kind: item.kind, item, wikiOnly: true, pending: true })) : []),
  ];
}

// Social search (HN, Lemmy) is keyword-only, so most hits are off-topic. Keep a thread only when its title names the
// entry as a whole phrase, isn't a tech/meme post, and either reads as a health/looks thread or names a multi-word term.
export const OFF_COMM = /meme|shitpost|comic|^196$|politic|news|technology|linux|fediverse|europe|^world$|^til$|showerthought|joke|^cats?$|onion|motorsport|osrs|^pics$|ecosocial|pravda|game|programming|privacy|android|selfhost|asklemmy|ask_?reddit|nostupidquestions|movies|music|anime|lemmy_?support|dataisbeautiful|mildly|aww|^art$|books|pcgaming|steam|wikipedia/i;
const TECH = /\b(programming|software|startup|crypto|bitcoin|javascript|typescript|python|rust|golang|linux|api|github|apple|google|netflix|microsoft|ember|compiler|llm|gpt|kernel|database|sql|framework|browser|show hn: .*(app|tool|library)|ycombinator|\.js|c\+\+|struct|function pointers?)\b/i;
const BODY = /\b(health|hair|bald|alopecia|skin|acne|derm\w*|face|facial|body|weight|fat|obes\w*|muscle|fitness|gym|lift\w*|diet|nutrition|sleep|drug|medic\w*|supplement|trial|testosterone|hormone|estrogen|beauty|cosmetic|surger\w*|aging|ageing|longevity|height|tall|teeth|dental|posture|exercise|workout|look\w*|appearance|attractive\w*|steroid|peptide|vitamin|fda|doctor|patients?|clinical|brain|cancer|heart|men|women|male|female|tan\w*|sun|wrinkle\w*|collagen|shav\w*|beard|groom\w*|fashion|style|cloth\w*|confidence|anxiety|mental)\b/i;
export function socialFilter(item, raw) {
  const strip = (t) => String(t || '').replace(/\s*\(.*?\)\s*/g, ' ').trim().toLowerCase();
  const split = (t) => strip(t).split(/\s*(?:\/|,|\bor\b|\+|&)\s*/).map((x) => x.trim()).filter((x) => x.length >= 4);
  // The entry's own name/aliases count as-is; extra search terms only when they're multi-word (single words are too generic).
  const phrases = [...new Set([...split(item.name), ...split(item.aka), ...[...(item.terms || []), ...(raw.terms || [])].flatMap(split).filter((x) => /[\s-]/.test(x))])];
  const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rx = phrases.map((p) => ({ multi: /[\s-]/.test(p) && p.length >= 8, re: new RegExp('(^|[^a-z0-9])' + esc(p) + '(s|es)?([^a-z0-9]|$)', 'i') }));
  return (title) => {
    const t = String(title || '');
    if (TECH.test(t)) return false;
    const hit = rx.filter((r) => r.re.test(t));
    return hit.length > 0 && BODY.test(t);
  };
}

// Wikipedia matching falls back to full-text search and to loose alias titles, which sometimes lands on an unrelated
// article (a car, a novella, a TV episode). Treat a match as usable only when its title or lead actually shares a
// meaningful word with the entry's name, aliases or search terms.
const WSTOP = new Set(['the', 'and', 'for', 'with', 'your', 'from', 'that', 'this', 'into', 'diet', 'method', 'protocol', 'routine', 'therapy', 'treatment', 'training', 'face', 'facial', 'hair', 'skin', 'body', 'oil', 'use', 'kit', 'theory', 'style', 'look', 'looks', 'max', 'maxxing', 'home', 'natural', 'daily', 'black', 'white', 'cream', 'mask', 'supplement', 'supplements', 'extract', 'serum', 'gel', 'products', 'product', 'device', 'tool', 'tools', 'test', 'high', 'low', 'deep', 'mini', 'shaping', 'growth', 'loss']);
const wstem = (w) => w.replace(/(ings?|es|s|ed)$/, '');
const wtoks = (s) => String(s || '').toLowerCase().replace(/[α]/g, 'alpha').split(/[^a-z0-9]+/).filter((w) => w.length >= 4 && !WSTOP.has(w)).map(wstem);
let WKEEP = null, WREJECT = null; // hand-reviewed matches the word check would wrongly reject (broader topic, alias spelling)
export function wikiRelevant(item, raw, W) {
  if (!W || !W.title) return false;
  if (/^(List|Lists|Index|Outline) of /i.test(W.title)) return false;
  if (!WKEEP) { try { WKEEP = new Set(JSON.parse(readFileSync(join(root, 'research', 'wiki-keep.json'), 'utf8'))); } catch { WKEEP = new Set(); } }
  if (!WREJECT) { // reviewed wrong-topic matches (research/wikireview/out-*.json: slug -> "wrong")
    WREJECT = new Set();
    try { for (const f of readdirSync(join(root, 'research', 'wikireview')).filter((f) => /^out-\d+\.json$/.test(f))) for (const [k, v] of Object.entries(JSON.parse(readFileSync(join(root, 'research', 'wikireview', f), 'utf8')))) if (v === 'wrong') WREJECT.add(k); } catch {}
  }
  const sl = slug(item?.name || raw?.name || '');
  if (WREJECT.has(sl)) return false;
  if (WKEEP.has(sl)) return true;
  const mine = new Set([item?.name, item?.aka, raw?.name, raw?.aka, ...(item?.terms || []), ...(raw?.terms || [])].flatMap(wtoks));
  if (!mine.size) return true;
  const near = (w) => mine.has(w) || [...mine].some((m) => m.length >= 5 && w.length >= 5 && (w.startsWith(m) || m.startsWith(w)));
  if (wtoks(W.title).some(near)) return true;
  const lead = ((W.sections || [])[0]?.text || '').slice(0, 2500);
  return wtoks(lead).some(near);
}

// Looksmax goals: writers produced ~500 free-form labels; fold them into the canonical list used for filtering.
export const GOALS = ['Skin', 'Acne', 'Anti-aging', 'Tan & skin tone', 'Hair (scalp)', 'Hair (facial/body)', 'Body hair removal', 'Jawline & face shape',
  'Facial fat & puffiness', 'Eyes & eye area', 'Nose', 'Lips', 'Ears', 'Teeth & smile', 'Height', 'Posture', 'Physique', 'Muscle', 'Fat loss',
  'Hormones (T / E2)', 'Sleep & recovery', 'Voice', 'Grooming', 'Style & presentation', 'Photos & framing', 'Confidence & presence',
  'Body odor & breath', 'Nails', 'Overall look', 'General health'];
const GOAL_RULES = [
  [/overall (look|attract|appear|facial)|general appearance|attractiveness|flaw|self-assess|looks outcome|harmony|proportion|first impression/i, 'Overall look'],
  [/fat reduc|waist|silhouette/i, 'Fat loss'],
  [/penis|genital|buttock|glute|chest|vascular/i, 'Physique'],
  [/focus|cogniti|discipline|habit|planning|prioriti|calibrat|feedback|dating|self-improvement|improvement/i, 'Confidence & presence'],
  [/cheek|face|facial|upper-face|projection|definition/i, 'Jawline & face shape'],
  [/acne|blemish|breakout|pimple|comedon/i, 'Acne'],
  [/odou?r|breath|sweat|scent|fragrance|smell/i, 'Body odor & breath'],
  [/tan\b|tanning|skin tone|pigment|melasma|dark spot|whiten|lighten|bronz|complexion/i, 'Tan & skin tone'],
  [/wrinkle|anti-?ag|ageing|aging|longevity|youth|lifting|tighten|sagging|collagen/i, 'Anti-aging'],
  [/remov|epilat|wax|laser hair|depilat/i, 'Body hair removal'],
  [/beard|facial hair|body hair|chest hair|brow|eyebrow|lash|moustache|mustache/i, 'Hair (facial/body)'],
  [/hair|scalp|hairline|bald|alopecia/i, 'Hair (scalp)'],
  [/jaw|chin|face shape|facial structure|cheekbone|midface|maxilla|bone|profile|facial (contour|bone|width|harmony|symmetry)|face width/i, 'Jawline & face shape'],
  [/puff|bloat|facial fat|face fat|water retention|lean face|facial (volume|fullness|leanness)/i, 'Facial fat & puffiness'],
  [/eye|canth|orbital|dark circle/i, 'Eyes & eye area'],
  [/nose|nasal/i, 'Nose'],
  [/lip/i, 'Lips'],
  [/\bear/i, 'Ears'],
  [/teeth|tooth|smile|dental|gum|oral/i, 'Teeth & smile'],
  [/height|tall/i, 'Height'],
  [/posture|neck|frame|shoulder width/i, 'Posture'],
  [/fat loss|weight|lean|body fat|appetite|cutting|slim|contour/i, 'Fat loss'],
  [/muscle|strength|hypertroph|gains/i, 'Muscle'],
  [/physique|body|figure|shape/i, 'Physique'],
  [/hormon|testosterone|estrogen|\bt\b|e2|libido|androgen/i, 'Hormones (T / E2)'],
  [/sleep|recover|energy|fatigue|stress/i, 'Sleep & recovery'],
  [/voice|speech/i, 'Voice'],
  [/nail|hand/i, 'Nails'],
  [/photo|camera|picture|selfie|dating profile/i, 'Photos & framing'],
  [/confiden|presence|charisma|social|status|mindset|motivat|mental|frame|aura|personality|psych/i, 'Confidence & presence'],
  [/style|fashion|outfit|cloth|wardrobe|presentation|aesthetic|accessor|eyewear|makeup|cosmetic/i, 'Style & presentation'],
  [/groom|hygiene|shav/i, 'Grooming'],
  [/skin|derm|pore|texture|glow|redness|barrier|eczema|scar|stretch mark|cellulite/i, 'Skin'],
  [/health|wellness|general|overall/i, 'General health'],
];
export function canonGoal(g) {
  if (!g) return null;
  const s = String(g).trim();
  const exact = GOALS.find((x) => x.toLowerCase() === s.toLowerCase());
  if (exact) return exact;
  for (const [re, goal] of GOAL_RULES) if (re.test(s)) return goal;
  return 'General health';
}
