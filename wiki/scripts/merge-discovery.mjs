// Merges a discovery wave (research/<dir>/*.json candidate arrays) into research/new-entries.json, dropping anything
// already in the wiki (by name, alias or parenthetical) or duplicated across scouts. Run: node wiki/scripts/merge-discovery.mjs new3
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { root, loadData, allEntries } from './entries.mjs';

const dirName = process.argv[2] || 'new3';
const dir = join(root, 'research', dirName);
const { D } = loadData();
const VALID = { compound: Object.keys(D.categoryMeta), gear: Object.keys(D.gearCategoryMeta), meta: ['hardmaxx', 'bonehacks', 'height', 'protocols', 'lifestyle', 'fringe', 'frameworks', 'stylemetas'] };
const key = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
const keysOf = (name, aka) => {
  const out = new Set();
  const add = (s) => { const k = key(s); if (k.length >= 3) out.add(k); };
  for (const s of [name, aka]) {
    if (!s) continue;
    add(s); add(String(s).replace(/\s*\(.*?\)\s*/g, ' '));
    (String(s).match(/\((.*?)\)/g) || []).forEach((m) => add(m.slice(1, -1)));
    String(s).split(/\s*[\/,]\s*/).forEach(add);
  }
  return out;
};
const seen = new Set();
for (const { item } of allEntries()) keysOf(item.name, item.aka).forEach((k) => seen.add(k));
const queuePath = join(root, 'research', 'new-entries.json');
const queue = JSON.parse(readFileSync(queuePath, 'utf8'));
queue.forEach((q) => keysOf(q.name, q.aka).forEach((k) => seen.add(k)));

let added = 0, dup = 0, bad = 0;
const byFile = {};
for (const f of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  let arr; try { arr = JSON.parse(readFileSync(join(dir, f), 'utf8')); } catch (e) { console.warn('skip', f, e.message); continue; }
  for (const c of Array.isArray(arr) ? arr : []) {
    if (!c?.name || !VALID[c.kind]?.includes(c.category)) { bad++; continue; }
    const ks = keysOf(c.name, c.aka);
    if ([...ks].some((k) => seen.has(k))) { dup++; continue; }
    ks.forEach((k) => seen.add(k));
    queue.push({ name: String(c.name).trim(), kind: c.kind, category: c.category, aka: c.aka || null,
      terms: (c.terms || []).map((t) => String(t).toLowerCase()).slice(0, 3), why: c.why || null, seenAt: c.seenAt || null, wave: dirName });
    added++; byFile[f] = (byFile[f] || 0) + 1;
  }
}
if (!process.argv.includes('--dry')) writeFileSync(queuePath, JSON.stringify(queue, null, 1));
console.log(`+${added} new (dup ${dup}, invalid ${bad}); queue ${queue.length}`, byFile);
