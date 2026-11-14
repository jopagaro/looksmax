// Checks every research URL (scholarly, forums, Grokipedia, images) and reports
// dead ones. With --prune, removes links that return 404/410 from research/*.json.
// Sites that block bots (403/429, e.g. Reddit) are reported as "unverified", never pruned.
// Run: node wiki/scripts/check-links.mjs [--prune]
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'research');
const prune = process.argv.includes('--prune');
const files = readdirSync(dir).filter((f) => /^\d\d-.*\.json$/.test(f)).sort();
const UA = 'Mozilla/5.0 (compatible; wiki-link-check/1.0)';

async function status(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const r = await fetch(url, { method, redirect: 'follow', headers: { 'user-agent': UA }, signal: AbortSignal.timeout(15000) });
      if (method === 'HEAD' && (r.status === 405 || r.status === 403 || r.status >= 500)) continue;
      return r.status;
    } catch { if (method === 'GET') return 0; }
  }
  return 0;
}

const jobs = [];
const data = {};
for (const f of files) {
  data[f] = JSON.parse(readFileSync(join(dir, f), 'utf8'));
  for (const [name, r] of Object.entries(data[f])) {
    for (const k of ['scholarly', 'forums']) (r[k] || []).forEach((x) => x && x.url && jobs.push({ f, name, k, x, url: x.url }));
    for (const k of ['grokipedia', 'image']) if (r[k]) jobs.push({ f, name, k, url: r[k] });
  }
}
const seen = new Map();
let i = 0;
async function worker() {
  while (i < jobs.length) {
    const j = jobs[i++];
    if (!seen.has(j.url)) seen.set(j.url, status(j.url));
    j.status = await seen.get(j.url);
  }
}
await Promise.all(Array.from({ length: 12 }, worker));

const dead = jobs.filter((j) => j.status === 404 || j.status === 410);
const unver = jobs.filter((j) => j.status !== 404 && j.status !== 410 && (j.status === 0 || j.status >= 400));
console.log(`${jobs.length} links | ok ${jobs.length - dead.length - unver.length} | dead ${dead.length} | unverified ${unver.length}`);
dead.forEach((j) => console.log('DEAD', j.status, j.name, j.k, j.url));
unver.forEach((j) => console.log('UNVERIFIED', j.status, j.name, j.k, j.url));

if (prune && dead.length) {
  for (const j of dead) {
    const r = data[j.f][j.name];
    if (j.k === 'scholarly' || j.k === 'forums') r[j.k] = r[j.k].filter((x) => x !== j.x);
    else { r[j.k] = null; if (j.k === 'image') r.imageCredit = null; }
  }
  for (const f of files) writeFileSync(join(dir, f), JSON.stringify(data[f], null, 1));
  console.log('pruned', dead.length, 'dead links — now run build-research.mjs');
}
