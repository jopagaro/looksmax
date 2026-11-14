// Builds research/quick2/in/batch-NNN.json — inputs for the "how it helps" Quick take rewrite.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { root, slug, allEntries, loadData } from './entries.mjs';
const { D, W } = loadData();
const rd = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; } };
const dir = (d) => join(root, 'research', d);
const merge = (d) => Object.assign({}, ...readdirSync(dir(d)).filter((f) => f.endsWith('.json')).map((f) => rd(join(dir(d), f)) || {}));
const ANG = merge('angles/out'), DONE = merge('quick2/out');
const catName = (k, c) => (k === 'compound' ? D.categoryMeta : k === 'gear' ? D.gearCategoryMeta : W.metaCategories)[c]?.name || c;
const rows = [];
for (const { kind, item, pending } of allEntries()) {
  const s = slug(item.name);
  if (DONE[s]) continue;
  const e = rd(join(root, 'data', 'entries', s + '.json'));
  const d = rd(join(dir('deep'), s + '.json'));
  if (!e || (d && d.skip)) continue;
  const c = e.casual || {};
  rows.push({ slug: s, name: item.name, kind, category: catName(kind, item.category), angle: ANG[s] || e.angle || null,
    summary: item.summary || '', note: item.note || null,
    currentQuick: [...(c.lead || []), ...(c.sections || []).map((x) => x.h + ': ' + (x.paras || []).join(' '))].join('\n').slice(0, 1800),
    deepLead: (e.lead || []).join('\n').replace(/\[\d+\]/g, '').slice(0, 1500) });
}
const N = 20; let b = 0;
for (let i = 0; i < rows.length; i += N) writeFileSync(join(dir('quick2/in'), `batch-${String(++b).padStart(3, '0')}.json`), JSON.stringify(rows.slice(i, i + N), null, 1));
console.log(rows.length, 'entries in', b, 'batches');
