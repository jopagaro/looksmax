// Image pass → research/images/<slug>.json: freely licensed photos per entry from
// Wikimedia Commons + Openverse (CC-licensed, with creator + licence for attribution).
// Resumable; --force to redo. Run: node wiki/scripts/scrape-images.mjs
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { root, slug, allEntries } from './entries.mjs';

const outDir = join(root, 'research', 'images');
mkdirSync(outDir, { recursive: true });
const FORCE = process.argv.includes('--force');
const UA = 'Mozilla/5.0 (compatible; looksmax-wiki-research/1.0)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let lastC = 0, lastO = 0;
async function getJSON(url, host) {
  for (let i = 0; i < 3; i++) {
    const gap = host === 'o' ? 1100 : 1200; const last = host === 'o' ? lastO : lastC;
    const w = last + gap - Date.now(); if (w > 0) await sleep(w);
    if (host === 'o') lastO = Date.now(); else lastC = Date.now();
    try {
      const r = await fetch(url, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(30000) });
      if (r.status === 429) { await sleep(30000 * (i + 1)); continue; }
      if (!r.ok) return null;
      return await r.json();
    } catch { await sleep(3000); }
  }
  return null;
}
const strip = (h) => String(h || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

function termsFor(item) {
  const raw = join(root, 'research', 'raw', slug(item.name) + '.json');
  if (existsSync(raw)) { try { const t = JSON.parse(readFileSync(raw, 'utf8')).terms; if (t?.length) return t; } catch {} }
  if (item.terms?.length) return item.terms;
  return [item.name.replace(/\s*\(.*?\)\s*/g, ' ').trim().toLowerCase()];
}

async function commons(term) {
  const d = await getJSON(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(term)}&gsrlimit=12&prop=imageinfo&iiprop=url|extmetadata|size|mime&iiurlwidth=900&format=json`, 'c');
  if (d === null) return null;
  return Object.values(d?.query?.pages || {}).sort((a, b) => a.index - b.index).map((p) => {
    const ii = p.imageinfo?.[0] || {}; const m = ii.extmetadata || {};
    return { title: p.title.replace(/^File:/, '').replace(/\.[a-z0-9]+$/i, ''), url: ii.url, thumb: ii.thumburl || ii.url, width: ii.width, height: ii.height, mime: ii.mime,
      license: strip(m.LicenseShortName?.value), creator: strip(m.Artist?.value).slice(0, 80), page: ii.descriptionurl, source: 'Wikimedia Commons' };
  }).filter((x) => x.url && /image\/(jpeg|png|webp|svg\+xml|gif)/.test(x.mime || '') && (x.width || 0) >= 200);
}
async function openverse(term) {
  const d = await getJSON(`https://api.openverse.org/v1/images/?q=${encodeURIComponent(term)}&page_size=12&mature=false`, 'o');
  return (d?.results || []).filter((r) => r.source !== 'wikimedia').map((r) => ({ title: r.title, url: r.url, thumb: r.thumbnail || r.url, width: r.width, height: r.height,
    license: `${String(r.license || '').toUpperCase()} ${r.license_version || ''}`.trim(), creator: (r.creator || '').slice(0, 80), page: r.foreign_landing_url, source: r.source === 'flickr' ? 'Flickr' : r.provider || r.source }));
}

const ENTRIES = allEntries();
let done = 0, idx = 0;
async function work({ item }) {
  const out = join(outDir, slug(item.name) + '.json');
  if (existsSync(out) && !FORCE) { done++; return; }
  const terms = termsFor(item);
  const words = terms.flatMap((t) => t.split(/\s+/)).filter((w) => w.length > 2);
  const relevant = (x) => words.some((w) => (x.title || '').toLowerCase().includes(w));
  const [c, o] = await Promise.all([commons(terms[0]).catch(() => null), openverse(terms[0]).catch(() => [])]);
  if (c === null) { console.log(`[skip] ${item.name} — Commons unavailable, will retry next run`); done++; return; }
  const seen = new Set();
  const images = [...c.filter(relevant), ...o.filter(relevant), ...c.filter((x) => !relevant(x)).slice(0, 2)]
    .filter((x) => { if (seen.has(x.url)) return false; seen.add(x.url); return true; }).slice(0, 14);
  writeFileSync(out, JSON.stringify({ name: item.name, terms, images }, null, 1));
  done++;
  console.log(`[${done}/${ENTRIES.length}] ${item.name} — ${images.length} images (${images.filter((x) => x.source === 'Wikimedia Commons').length} Commons)`);
}
await Promise.all(Array.from({ length: 3 }, async () => { while (idx < ENTRIES.length) await work(ENTRIES[idx++]); }));
console.log('DONE', done);
