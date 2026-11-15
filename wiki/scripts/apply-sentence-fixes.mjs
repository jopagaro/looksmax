// Applies research/fixup/sent/out-*.json sentence rewrites to research/deep/*.json by exact match on parsed strings.
// Run: node wiki/scripts/apply-sentence-fixes.mjs
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { root } from './entries.mjs';
const dir = join(root, 'research', 'fixup', process.argv[2] || 'sent');
const IN = new Map(), OUT = new Map();
for (const f of readdirSync(dir)) {
  const a = JSON.parse(readFileSync(join(dir, f), 'utf8'));
  if (f.startsWith('in-')) a.forEach((x) => IN.set(x.id, x)); else if (f.startsWith('out-')) a.forEach((x) => OUT.set(x.id, x.new));
}
const byFile = new Map();
for (const [id, x] of IN) if (OUT.has(id)) { if (!byFile.has(x.f)) byFile.set(x.f, []); byFile.get(x.f).push([x.s, String(OUT.get(id) || '').trim()]); }
let files = 0, done = 0, missed = 0;
for (const [slug, pairs] of byFile) {
  const p = join(root, 'research', 'deep', slug + '.json');
  let d; try { d = JSON.parse(readFileSync(p, 'utf8')); } catch { missed += pairs.length; continue; }
  let hit = 0;
  const fix = (v, k) => {
    if (typeof v === 'string') {
      let t = v;
      for (const [a, b] of pairs) if (t.includes(a)) { t = t.replace(a, b); hit++; }
      return t.replace(/ {2,}/g, ' ').replace(/\s+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    }
    if (Array.isArray(v)) return v.map((x) => fix(x)).filter((x) => x !== '' || k === 'chain');
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([kk, x]) => [kk, kk === 'refs' || kk === 'webSources' ? x : fix(x, kk)]));
    return v;
  };
  const nd = fix(d);
  if (hit) { writeFileSync(p, JSON.stringify(nd, null, 1)); files++; done += hit; }
  missed += pairs.length - Math.min(hit, pairs.length);
}
console.log(`${done} sentences fixed in ${files} articles; ${missed} not found (article since rewritten)`);
