// Extra source pass → research/extra/<slug>.json (separate files, so it can run alongside scrape.mjs)
//   • OpenAlex           — most-cited + most-relevant works, with citation counts and abstracts
//   • Europe PMC         — more studies, open-access full-text links
//   • ClinicalTrials.gov — registered trials (compounds)
//   • openFDA labels     — boxed warnings, adverse reactions, mechanism (Rx/OTC drugs) → DailyMed link
// Resumable; --force to redo. Run: node wiki/scripts/scrape-extra.mjs
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'research', 'extra');
mkdirSync(outDir, { recursive: true });
const ctx = { window: {} };
vm.runInNewContext(readFileSync(join(root, 'assets', 'data.js'), 'utf8'), ctx);
const D = ctx.window.LM_DATA;
const FORCE = process.argv.includes('--force');
const REPAIR = process.argv.includes('--repair');
const UA = 'Mozilla/5.0 (compatible; looksmax-wiki-research/1.0)';
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function throttle(ms) {
  let last = 0, chain = Promise.resolve();
  return () => (chain = chain.then(async () => { const w = last + ms - Date.now(); if (w > 0) await new Promise((r) => setTimeout(r, w)); last = Date.now(); }));
}
const gate = { 'api.openalex.org': throttle(250), 'www.ebi.ac.uk': throttle(250), 'clinicaltrials.gov': throttle(400), 'api.fda.gov': throttle(400) };
let OA_OFF = false; // OpenAlex free daily budget exhausted → stop calling it this run
async function getJSON(url, tries = 3) {
  const host = new URL(url).host;
  if (host === 'api.openalex.org' && OA_OFF) return null;
  for (let i = 0; i < tries; i++) {
    if (gate[host]) await gate[host]();
    try {
      const r = await fetch(url, { headers: { 'user-agent': UA, accept: 'application/json' }, signal: AbortSignal.timeout(40000) });
      if (r.status === 404) return null;
      if (r.status === 429 && host === 'api.openalex.org') { OA_OFF = true; console.log('OpenAlex daily budget exhausted — skipping it for the rest of this run'); return null; }
      if (r.status === 429 || r.status >= 500) { await new Promise((s) => setTimeout(s, 3000 * (i + 1))); continue; }
      if (!r.ok) return null;
      return await r.json();
    } catch { await new Promise((s) => setTimeout(s, 2000 * (i + 1))); }
  }
  return null;
}

// Reuse the scraper's tuned search terms when its raw file exists.
function termsFor(item) {
  const raw = join(root, 'research', 'raw', slug(item.name) + '.json');
  if (existsSync(raw)) { try { const t = JSON.parse(readFileSync(raw, 'utf8')).terms; if (t && t.length) return t; } catch {} }
  if (Array.isArray(item.terms) && item.terms.length) return item.terms.map((x) => String(x).toLowerCase());
  const t = [item.name.replace(/\s*\(.*?\)\s*/g, ' ').trim()];
  if (item.aka) item.aka.split('/').map((s) => s.trim()).filter(Boolean).forEach((s) => t.push(s));
  return [...new Set(t.map((s) => s.toLowerCase()))];
}
const deInvert = (inv) => {
  if (!inv) return null;
  const words = [];
  for (const [w, pos] of Object.entries(inv)) for (const p of pos) words[p] = w;
  return words.filter(Boolean).join(' ');
};
// Appearance context keeps generic terms (e.g. "clippers", "sunglasses") on topic.
const CONTEXT = { pigment: 'skin', skin: 'skin', fat: 'obesity OR weight', muscle: 'muscle', hair: 'hair', bone: 'bone', recovery: '', longevity: 'aging', depuff: 'edema OR skin',
  teeth: 'teeth OR dental', faceDevices: 'skin OR facial', hairGear: 'hair', grooming: 'hair OR shaving', hairRemoval: 'hair removal', training: 'exercise', posture: 'posture',
  tanGear: 'skin OR tanning', bodyCare: 'skin OR nail', sleep: 'sleep', style: 'appearance OR clothing' };

async function openalex(item, terms) {
  const f = `title_and_abstract.search:${encodeURIComponent('"' + terms[0] + '"')},has_abstract:true`;
  const sel = 'id,doi,display_name,publication_year,cited_by_count,primary_location,abstract_inverted_index,type,open_access';
  const out = new Map();
  for (const sort of ['cited_by_count:desc', 'publication_year:desc']) {
    const r = await getJSON(`https://api.openalex.org/works?filter=${f}&sort=${sort}&per-page=8&select=${sel}`);
    for (const w of r?.results || []) {
      if (out.has(w.id)) continue;
      const url = w.doi || w.primary_location?.landing_page_url || w.id;
      out.set(w.id, { title: w.display_name, year: w.publication_year, cites: w.cited_by_count, source: w.primary_location?.source?.display_name || null,
        type: w.type, url, oa: w.open_access?.oa_url || null, abstract: (deInvert(w.abstract_inverted_index) || '').slice(0, 1600) });
    }
  }
  return [...out.values()].slice(0, 14);
}

async function europepmc(item, terms) {
  const q = terms.slice(0, 2).map((t) => `TITLE_ABS:"${t}"`).join(' OR ');
  const r = await getJSON(`https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent('(' + q + ')')}&format=json&pageSize=12&sort=${encodeURIComponent('CITED desc')}&resultType=core`);
  return (r?.resultList?.result || []).map((x) => ({
    title: x.title, year: Number(x.pubYear) || null, source: x.journalInfo?.journal?.title || x.bookOrReportDetails?.publisher || null, cites: x.citedByCount,
    url: x.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${x.pmid}/` : x.doi ? `https://doi.org/${x.doi}` : `https://europepmc.org/article/${x.source}/${x.id}`,
    fullText: x.pmcid ? `https://europepmc.org/article/PMC/${x.pmcid}` : null, types: x.pubTypeList?.pubType || [],
    abstract: (x.abstractText || '').replace(/<[^>]+>/g, '').slice(0, 1400),
  })).filter((x) => x.title);
}

async function trials(item, terms) {
  const r = await getJSON(`https://clinicaltrials.gov/api/v2/studies?query.intr=${encodeURIComponent(terms[0])}&pageSize=10&sort=${encodeURIComponent('@relevance')}`);
  return (r?.studies || []).map((s) => {
    const p = s.protocolSection || {};
    return { nct: p.identificationModule?.nctId, title: p.identificationModule?.briefTitle, status: p.statusModule?.overallStatus, phase: (p.designModule?.phases || []).join('/'),
      start: p.statusModule?.startDateStruct?.date, conditions: (p.conditionsModule?.conditions || []).slice(0, 4), enrollment: p.designModule?.enrollmentInfo?.count,
      url: `https://clinicaltrials.gov/study/${p.identificationModule?.nctId}` };
  }).filter((x) => x.nct);
}

async function fdaLabel(item, terms) {
  for (const t of terms.slice(0, 2)) {
    const r = await getJSON(`https://api.fda.gov/drug/label.json?search=${encodeURIComponent(`openfda.generic_name:"${t}"`)}&limit=1`);
    const l = r?.results?.[0];
    if (!l) continue;
    const g = (k) => (Array.isArray(l[k]) ? l[k].join(' ') : '').replace(/\s+/g, ' ').slice(0, 1800);
    const setid = l.set_id || l.openfda?.spl_set_id?.[0];
    return { generic: l.openfda?.generic_name?.[0], brands: (l.openfda?.brand_name || []).slice(0, 8), route: l.openfda?.route || [], manufacturer: l.openfda?.manufacturer_name?.[0],
      url: setid ? `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${setid}` : null,
      boxedWarning: g('boxed_warning'), indications: g('indications_and_usage'), warnings: g('warnings_and_cautions') || g('warnings'),
      adverse: g('adverse_reactions'), mechanism: g('mechanism_of_action'), pregnancy: g('pregnancy') };
  }
  return null;
}

const { allEntries } = await import('./entries.mjs');
const ENTRIES = allEntries();
let done = 0, idx = 0;
async function work({ kind, item }) {
  const out = join(outDir, slug(item.name) + '.json');
  // Skip finished entries; with --repair, redo only entries whose OpenAlex list is empty.
  if (existsSync(out) && !FORCE && !(REPAIR && !(JSON.parse(readFileSync(out, 'utf8')).openalex || []).length)) { done++; return; }
  const terms = termsFor(item);
  const prevFile = existsSync(out) ? JSON.parse(readFileSync(out, 'utf8')) : null;
  const [oa, ep, ct, fda] = await Promise.all([
    prevFile && prevFile.openalex?.length ? prevFile.openalex : openalex(item, terms).catch(() => []),
    europepmc(item, terms).catch(() => []),
    kind === 'compound' || (kind === 'meta' && ['hardmaxx', 'protocols', 'height'].includes(item.category)) ? trials(item, terms).catch(() => []) : [],
    kind === 'compound' && item.status !== 'research' ? fdaLabel(item, terms).catch(() => null) : null,
  ]);
  writeFileSync(out, JSON.stringify({ name: item.name, terms, openalex: oa, europepmc: ep, trials: ct, fda }, null, 1));
  done++;
  console.log(`[${done}/${ENTRIES.length}] ${item.name} — openalex:${oa.length} europepmc:${ep.length} trials:${ct.length} fda:${fda ? 'y' : '-'}`);
}
await Promise.all(Array.from({ length: 4 }, async () => { while (idx < ENTRIES.length) await work(ENTRIES[idx++]); }));
console.log('DONE', done);
