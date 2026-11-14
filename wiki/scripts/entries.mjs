// Shared entry list for every script: the app's Index (assets/data.js) plus wiki-only
// entries (assets/wiki-entries.js — new compounds, gear and metas discovered for the wiki).
import { readFileSync, existsSync } from 'node:fs';
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
