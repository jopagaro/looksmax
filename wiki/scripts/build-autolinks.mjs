// Builds assets/autolink.js: the phrases that, when they appear in article text, link to another entry (Wikipedia-style
// in-text links). Rules keep false links out: generic words are excluded; single words that are ordinary English
// (per /usr/share/dict/words) only link when written with the entry's own capitalisation; technical names and
// multi-word names link case-insensitively. Run: node scripts/build-autolinks.mjs (build-entries runs it too).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { root, slug, allEntries } from './entries.mjs';

const GENERIC = new Set(('water sleep diet cream serum mask tape soap sugar salt milk coffee mirror light heat cold sun ice pillow brush ' +
  'razor comb shoes belt hat glasses gum oil honey tea acne hair skin face home topical cosmetic teeth tooth body oral scalp beard nail ' +
  'nails lip lips eye eyes jaw neck chin nose hand hands foot feet legs arm arms gel spray powder lotion balm wax patch patches pad pads ' +
  'drops tablets pills supplement supplements extract device tool tools kit set men women daily natural organic fasting training ' +
  'cardio running walking lifting posture style fashion confidence status height weight muscle fat protein surgery filler fillers ' +
  'implant implants laser peel peels massage therapy treatment routine protocol method theory exercise exercises stretching yoga ' +
  'meditation sunlight shaving makeup tanning grooming fragrance perfume cologne haircut hairstyle clothing clothes jacket shirt boots ' +
  'sneakers watch jewelry ring rings cap caps vitamin vitamins mineral minerals peptide peptides hormone hormones steroid steroids ' +
  'testosterone estrogen collagen retinoid retinoids sunscreen moisturizer cleanser toner shampoo conditioner deodorant toothpaste ' +
  'floss mouthwash').split(/\s+/));
const dict = new Set();
const inDict = (w) => { w = w.toLowerCase(); return [w, w.replace(/s$/, ''), w.replace(/es$/, ''), w.replace(/ies$/, 'y'), w.replace(/ing$/, ''), w.replace(/ing$/, 'e'), w.replace(/ed$/, ''), w.replace(/ed$/, 'e'), w.replace(/ers?$/, '')].some((x) => x.length > 2 && dict.has(x)); };
if (existsSync('/usr/share/dict/words')) for (const w of readFileSync('/usr/share/dict/words', 'utf8').split('\n')) if (w) dict.add(w.toLowerCase());

// phrase(lowercase) -> best claim. Priority: 0 = the entry's own full name, 1 = a part of its name, 2 = alias/bracket.
// Ties between different entries go to the shorter (more canonical) entry name; exact ties are dropped as ambiguous.
const seen = new Map();
const ambiguous = new Set();
const add = (phrase, kind, s, prio, nameLen) => {
  const p = phrase.replace(/\s+/g, ' ').trim();
  const acronym = /^[A-Z0-9][A-Z0-9-]{2,5}$/.test(p) && /[A-Z]/.test(p);
  if (p.length < (acronym ? 3 : 4)) return;
  const low = p.toLowerCase();
  if (GENERIC.has(low)) return;
  const words = p.split(' ');
  if (words.length === 1 && p.length < 5 && !acronym) return;
  if (words.every((w) => GENERIC.has(w.toLowerCase()))) return;
  // Aliases and name parts (prio >= 1) must look like a real name, not an everyday word or phrase.
  if (prio >= 1 && !acronym) {
    if (words.length === 1 && inDict(p)) return;
    if (words.length > 1 && !words.some((w) => w.length >= 5)) return;
    if (prio === 2 && words.length > 1 && words.every((w) => inDict(w))) return;
  }
  const ci = acronym ? 0 : words.length > 1 || !inDict(low) ? 1 : 0; // 0 = ordinary English word: exact case only
  const cur = seen.get(low);
  const cand = { v: [p, kind, s, ci], prio, nameLen };
  if (!cur) { seen.set(low, cand); return; }
  if (cur.v[2] === s) { if (prio < cur.prio) seen.set(low, cand); return; }
  if (prio < cur.prio || (prio === cur.prio && nameLen < cur.nameLen)) { seen.set(low, cand); ambiguous.delete(low); }
  else if (prio === cur.prio && nameLen === cur.nameLen) ambiguous.add(low);
};
for (const { kind, item } of allEntries()) {
  const s = slug(item.name);
  if (!existsSync(join(root, 'data', 'entries', s + '.json'))) continue;
  const nl = item.name.length;
  const base = String(item.name).replace(/\s*\(.*?\)\s*/g, ' ').trim();
  add(base, kind, s, 0, nl);
  base.split(/\s*[\/,;]\s*|\s+or\s+/).forEach((p) => add(p, kind, s, 1, nl));
  for (const src of [item.name, item.aka]) {
    if (!src) continue;
    // Bracketed aliases: acronyms (BSSO, DHT) and technical multi-word names (orthognathic surgery) only.
    (String(src).match(/\((.*?)\)/g) || []).forEach((m) => m.slice(1, -1).split(/\s*[\/,;]\s*/).forEach((p) => {
      p = p.trim(); const ws = p.split(/\s+/);
      if ((ws.length === 1 && /^[A-Z0-9][A-Z0-9-]{2,}$/.test(p)) || (ws.length > 1 && ws.some((w) => w.length >= 5 && !inDict(w)))) add(p, kind, s, 2, nl);
    }));
    if (src === item.aka) String(src).replace(/\s*\(.*?\)\s*/g, ' ').split(/\s*[\/,;]\s*|\s+or\s+/).forEach((p) => add(p, kind, s, 2, nl));
  }
}
// Hand-added phrases (research/autolink-aliases.json) always win.
try {
  const kindOf = new Map(allEntries().map(({ kind, item }) => [slug(item.name), kind]));
  for (const [phrase, s] of Object.entries(JSON.parse(readFileSync(join(root, 'research', 'autolink-aliases.json'), 'utf8')))) {
    if (phrase.startsWith('_') || !kindOf.has(s)) continue;
    seen.set(phrase.toLowerCase(), { v: [phrase, kindOf.get(s), s, /^[A-Z0-9][A-Z0-9-]{1,5}$/.test(phrase) ? 0 : 1], prio: -1, nameLen: 0 }); ambiguous.delete(phrase.toLowerCase());
  }
} catch {}
const list = [...seen.entries()].filter(([low]) => !ambiguous.has(low)).map(([, c]) => c.v).sort((a, b) => b[0].length - a[0].length);
writeFileSync(join(root, 'assets', 'autolink.js'), '// GENERATED by scripts/build-autolinks.mjs — phrases that link to other entries in article text.\n' +
  '// [phrase, kind, slug, caseInsensitive]\nwindow.LM_AUTOLINK = ' + JSON.stringify(list) + ';\n');
console.log(`${list.length} link phrases (${ambiguous.size} ambiguous dropped)`);
