// Builds research/angles/in/batch-NNN.json — compact per-entry briefs for the "Looksmax angle" pass.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { root, slug, allEntries, loadData } from './entries.mjs';
const { D, W } = loadData();
const ctx = { window: {} }; vm.runInNewContext(readFileSync(join(root, 'assets', 'issues.js'), 'utf8'), ctx);
const topics = new Map();
for (const i of ctx.window.LM_ISSUES) for (const a of i.approaches) { const k = a.name.toLowerCase(); if (!topics.has(k)) topics.set(k, []); topics.get(k).push(i.name); }
const catName = (k, c) => (k === 'compound' ? D.categoryMeta : k === 'gear' ? D.gearCategoryMeta : W.metaCategories)[c]?.name || c;
const done = new Set(readdirSync(join(root, 'research', 'angles', 'out')).flatMap((f) => { try { return Object.keys(JSON.parse(readFileSync(join(root, 'research', 'angles', 'out', f), 'utf8'))); } catch { return []; } }));
const rows = [];
for (const { kind, item, pending } of allEntries()) {
  const s = slug(item.name);
  if (done.has(s)) continue;
  const p = join(root, 'research', 'deep', s + '.json');
  const d = existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null;
  if (pending && !(d && d.card)) continue;
  if (d && d.skip) continue;
  const lore = (Array.isArray(d?.lore) ? d.lore : d?.lore?.claims || []).slice(0, 4).map((l) => l.claim || l.believers || '').filter(Boolean).map((x) => String(x).slice(0, 160));
  rows.push({ slug: s, name: item.name, kind, category: catName(kind, item.category), topics: topics.get(item.name.toLowerCase()) || [],
    summary: item.summary || d?.card?.summary || '', lead: String((d?.lead || [])[0] || '').replace(/\[\d+\]/g, '').slice(0, 700), claims: lore });
}
const N = 30; let b = 0;
for (let i = 0; i < rows.length; i += N) writeFileSync(join(root, 'research', 'angles', 'in', `batch-${String(++b).padStart(3, '0')}.json`), JSON.stringify(rows.slice(i, i + N), null, 1));
console.log(rows.length, 'entries in', b, 'batches');
