// Discovery harvest — finds what the looksmaxxing world actually talks about, to grow the wiki.
//   1. looksmax.org thread index (Wayback Machine CDX, paged with resume keys) → research/discovery/looksmax-threads.tsv
//   2. Wikipedia category members for drug/peptide/procedure/diet families   → research/discovery/wikipedia-categories.json
//   3. Term popularity: how many looksmax threads mention each candidate     → research/discovery/candidates.json
// Resumable (keeps the last resume key). Run: node wiki/scripts/discover.mjs [--pages 80]
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'research', 'discovery');
mkdirSync(dir, { recursive: true });
const UA = 'Mozilla/5.0 (compatible; looksmax-wiki-research/1.0)';
const MAX_PAGES = Number(process.argv.includes('--pages') ? process.argv[process.argv.indexOf('--pages') + 1] : 80);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(240000) });
      if (r.ok) { const t = await r.text(); if (!/Temporarily Offline/.test(t)) return t; }
    } catch {}
    await sleep(15000 * (i + 1));
  }
  return null;
}

// ── 1. looksmax.org thread index
const tsv = join(dir, 'looksmax-threads.tsv');
const keyFile = join(dir, 'cdx-resume.key');
const seen = new Set(existsSync(tsv) ? readFileSync(tsv, 'utf8').split('\n').map((l) => l.split('\t')[0]).filter(Boolean) : []);
let key = existsSync(keyFile) ? readFileSync(keyFile, 'utf8').trim() : '';
if (key !== 'DONE') {
  for (let page = 0; page < MAX_PAGES; page++) {
    const url = `https://web.archive.org/cdx/search/cdx?url=looksmax.org/threads/&matchType=prefix&collapse=urlkey&fl=original&filter=statuscode:200&limit=20000&showResumeKey=true${key ? '&resumeKey=' + encodeURIComponent(key) : ''}`;
    const body = await get(url);
    if (!body) { console.log('CDX page failed; stopping (rerun to resume)'); break; }
    const lines = body.split('\n');
    const blank = lines.lastIndexOf('');
    let next = '';
    // Resume key = last non-empty line after a blank line.
    const tailIdx = lines.findIndex((l, i) => l === '' && i < lines.length - 1 && lines[i + 1] && !lines[i + 1].startsWith('http'));
    if (tailIdx >= 0) next = lines[tailIdx + 1].trim();
    let added = 0;
    const out = [];
    for (const l of lines) {
      const m = l.match(/looksmax\.org\/threads\/([^/?#]+?)\.(\d+)\//);
      if (!m || seen.has(m[2])) continue;
      seen.add(m[2]); out.push(`${m[2]}\t${m[1]}`); added++;
    }
    if (out.length) appendFileSync(tsv, out.join('\n') + '\n');
    console.log(`CDX page ${page + 1}: +${added} threads (total ${seen.size})${next ? '' : ' — end of index'}`);
    if (!next) { writeFileSync(keyFile, 'DONE'); break; }
    key = next; writeFileSync(keyFile, key);
    await sleep(3000);
  }
}

// ── 2. Wikipedia categories
const CATS = [
  'Peptide hormones', 'Selective androgen receptor modulators', 'Growth hormone secretagogues', 'Anabolic–androgenic steroids',
  'Antiandrogens', '5α-Reductase inhibitors', 'Anti-obesity drugs', 'GLP-1 receptor agonists', 'Melanocortin receptor agonists',
  'Nootropics', 'Senolytics', 'Hair loss', 'Hair removal', 'Cosmetic surgery', 'Plastic surgical procedures', 'Facial cosmetic surgery',
  'Dietary supplements', 'Fad diets', 'Skin care', 'Cosmetic dermatology', 'Orthodontics', 'Tooth whitening', 'Aromatase inhibitors',
  'Synthetic estrogens', 'Thyroid hormones', 'Stimulants', 'Peptides', 'Copper complexes', 'Retinoids', 'Sunscreening agents', 'Tanning',
  'Pseudoscience', 'Alternative medicine', 'Height', 'Body modification', 'Masculinity', 'Bodybuilding supplements', 'Doping in sport',
];
const catFile = join(dir, 'wikipedia-categories.json');
const cats = existsSync(catFile) ? JSON.parse(readFileSync(catFile, 'utf8')) : {};
for (const c of CATS) {
  if (cats[c]) continue;
  const r = await get(`https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent('Category:' + c)}&cmlimit=500&cmtype=page&format=json`);
  try { cats[c] = JSON.parse(r).query.categorymembers.map((m) => m.title); } catch { cats[c] = []; }
  console.log(`Wikipedia Category:${c} → ${cats[c].length}`);
  await sleep(200);
}
writeFileSync(catFile, JSON.stringify(cats, null, 1));

// ── 3. Popularity: count threads per candidate term + frequent slug n-grams
const threads = readFileSync(tsv, 'utf8').split('\n').filter(Boolean).map((l) => ' ' + l.split('\t')[1].replace(/-/g, ' ') + ' ');
const norm = (t) => t.toLowerCase().replace(/\s*\(.*?\)\s*/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
const candidates = new Map();
for (const [c, titles] of Object.entries(cats)) for (const t of titles) {
  const n = norm(t);
  if (n.length < 4 || n.split(' ').length > 4) continue;
  if (!candidates.has(n)) candidates.set(n, { term: n, wikipedia: t, cats: [] });
  candidates.get(n).cats.push(c);
}
for (const c of candidates.values()) c.threads = threads.filter((t) => t.includes(' ' + c.term + ' ')).length;
const ranked = [...candidates.values()].filter((c) => c.threads > 0).sort((a, b) => b.threads - a.threads);
// Unknown slang/metas: frequent unigrams + bigrams across thread titles
const STOP = new Set('the a an and or of to in on for is it my i you me be this that with how what why do does are can im its your if at as so just about from not no anyone have has get got any any he she they we us was were will would should could vs best new good bad really much very more most only than then there their theyre dont isnt whats who when which all one two out up down over like guys guy need help question rate pls please'.split(' '));
const uni = new Map(), bi = new Map();
for (const t of threads) {
  const w = t.trim().split(' ').filter((x) => x.length > 2 && !/^\d+$/.test(x) && !STOP.has(x));
  new Set(w).forEach((x) => uni.set(x, (uni.get(x) || 0) + 1));
  const b = new Set(); for (let i = 0; i < w.length - 1; i++) b.add(w[i] + ' ' + w[i + 1]);
  b.forEach((x) => bi.set(x, (bi.get(x) || 0) + 1));
}
const top = (m, n) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([term, count]) => ({ term, count }));
writeFileSync(join(dir, 'candidates.json'), JSON.stringify({ threadCount: threads.length, wikipediaCandidates: ranked.slice(0, 600), topWords: top(uni, 900), topBigrams: top(bi, 900) }, null, 1));
console.log(`DONE: ${threads.length} threads indexed; ${ranked.length} Wikipedia candidates with forum mentions`);
