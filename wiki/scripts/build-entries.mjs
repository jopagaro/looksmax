// Builds data/entries/<slug>.json — one file per article — by merging:
//   research/raw/<slug>.json    (deep scrape: Wikipedia, Grokipedia, PubMed, Reddit, looksmax.org)
//   research/NN-*.json          (first research pass: descriptions, studies, forums, photos)
//   research/deep/<slug>.json   (long-form Wikipedia-style write-up)
// Any reference URL in a write-up that doesn't appear in the scraped sources is dropped,
// so the site can only ever cite links that were actually found.
// Run: node wiki/scripts/build-entries.mjs
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'data', 'entries');
mkdirSync(outDir, { recursive: true });
const ctx = { window: {} };
vm.runInNewContext(readFileSync(join(root, 'assets', 'data.js'), 'utf8'), ctx);
const D = ctx.window.LM_DATA;
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const readJSON = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; } };
const okUrl = (u) => typeof u === 'string' && /^https:\/\/[^\s"<>]+$/.test(u);
const norm = (u) => String(u || '').replace(/^https?:\/\/(www\.)?/, '').replace(/[?#].*$/, '').replace(/\/+$/, '').toLowerCase();

const first = {};
for (const f of readdirSync(join(root, 'research')).filter((f) => /^\d\d-.*\.json$/.test(f))) Object.assign(first, readJSON(join(root, 'research', f)) || {});

const stats = { entries: 0, raw: 0, deep: 0, droppedRefs: 0, studies: 0, reddit: 0, forum: 0, images: 0 };
const ENTRIES = [...D.compounds.map((item) => ({ kind: 'compound', item })), ...D.gear.map((item) => ({ kind: 'gear', item }))];

for (const { kind, item } of ENTRIES) {
  const s = slug(item.name);
  const raw = readJSON(join(root, 'research', 'raw', s + '.json')) || {};
  const fp = first[item.name] || {};
  const deep = readJSON(join(root, 'research', 'deep', s + '.json'));
  stats.entries++; if (raw.name) stats.raw++; if (deep) stats.deep++;

  const W = raw.wikipedia && !raw.wikipedia.error ? raw.wikipedia : null;
  const G = raw.grokipedia && !raw.grokipedia.error ? raw.grokipedia : null;
  const PM = Array.isArray(raw.pubmed) ? raw.pubmed : [];
  const RD = Array.isArray(raw.reddit) ? raw.reddit : [];
  const LM = Array.isArray(raw.looksmax) ? raw.looksmax : [];

  // ── Studies: PubMed (verified via E-utilities) + first-pass scholarly, de-duplicated
  const studies = [];
  const seenS = new Set();
  const addStudy = (x) => { const k = norm(x.url); if (!okUrl(x.url) || seenS.has(k)) return; seenS.add(k); studies.push(x); };
  PM.forEach((p) => addStudy({ title: p.title, url: p.url, source: p.source, year: p.year, kind: (p.types || []).find((t) => /meta-analysis|systematic|review|randomized|clinical trial/i.test(t)) || null }));
  (fp.scholarly || []).forEach((x) => addStudy({ title: x.title, url: x.url, source: x.source, year: x.year || null, kind: null }));

  // ── Community: Reddit (archive API) + looksmax.org (Wayback index) + first-pass forums
  const reddit = RD.slice(0, 14).map((p) => ({ title: p.title, url: p.url, sub: p.sub, score: p.score, comments: p.comments, year: p.year }));
  const forums = [];
  const seenF = new Set();
  const addForum = (x) => { const k = norm(x.url); if (!okUrl(x.url) || seenF.has(k)) return; seenF.add(k); forums.push(x); };
  LM.slice(0, 16).forEach((t) => addForum({ title: t.title, url: t.url, site: 'looksmax.org', archived: t.archived || `https://web.archive.org/web/${t.ts}/${t.url}` }));
  (fp.forums || []).forEach((x) => { if (!/reddit\.com/.test(x.url) || !reddit.some((r) => norm(r.url) === norm(x.url))) addForum({ title: x.title, url: x.url, site: x.site }); });

  // ── Image: gear prefers the item photo the first pass picked; compounds prefer Wikipedia's lead image
  let image = null;
  const wImg = W?.image?.url && /^https:\/\/upload\.wikimedia\.org\//.test(W.image.url) ? { url: W.image.url, credit: W.image.page, caption: W.title, source: 'Wikimedia Commons via Wikipedia' } : null;
  const fImg = okUrl(fp.image) ? { url: fp.image, credit: fp.imageCredit, caption: item.name, source: 'Wikimedia Commons' } : null;
  image = kind === 'gear' ? (fImg || (W && !W.viaSearch ? wImg : null) || wImg) : (wImg || null);
  if (image) stats.images++;

  // ── Allowed citation URLs = everything we actually scraped or the first pass verified
  const allowed = new Set([
    W?.url, ...(W?.citedLinks || []), G?.url, fp.grokipedia,
    ...PM.flatMap((p) => [p.url, p.pmc]), ...RD.map((p) => p.url), ...LM.flatMap((t) => [t.url, t.archived]),
    ...(fp.scholarly || []).map((x) => x.url), ...(fp.forums || []).map((x) => x.url),
  ].filter(Boolean).map(norm));

  let refs = [], lead = null, sections = null, infobox = [], lore = null, timeline = [];
  if (deep) {
    const keep = new Map();
    (deep.refs || []).forEach((r) => {
      if (r && okUrl(r.url) && allowed.has(norm(r.url))) keep.set(Number(r.id), r);
      else stats.droppedRefs++;
    });
    // Renumber kept refs 1..n in order of first citation.
    const order = [];
    const scan = (t) => String(t || '').replace(/\[(\d+(?:\s*,\s*\d+)*)\]/g, (m, ids) => { ids.split(',').map((x) => Number(x.trim())).forEach((id) => { if (keep.has(id) && !order.includes(id)) order.push(id); }); return m; });
    const allText = [...(deep.lead || []), ...(deep.sections || []).flatMap((x) => [...(x.paras || []), ...(x.subs || []).flatMap((y) => y.paras || [])]), ...((deep.lore?.claims) || []).map((c) => c.claim + ' ' + c.note), deep.lore?.intro, ...(deep.timeline || []).map((t) => t.event)];
    allText.forEach(scan);
    [...keep.keys()].forEach((id) => { if (!order.includes(id)) order.push(id); });
    const remap = new Map(order.map((id, i) => [id, i + 1]));
    const fix = (t) => String(t || '').replace(/\[(\d+(?:\s*,\s*\d+)*)\]/g, (m, ids) => {
      const n = ids.split(',').map((x) => remap.get(Number(x.trim()))).filter(Boolean);
      return n.length ? n.map((x) => `[${x}]`).join('') : '';
    }).replace(/\s+([.,;:])/g, '$1').trim();
    refs = order.map((id) => { const r = keep.get(id); return { title: String(r.title || r.url), url: r.url, source: r.source || '', year: Number(r.year) || null, type: r.type || '' }; });
    lead = (deep.lead || []).map(fix).filter(Boolean);
    sections = (deep.sections || []).map((x) => ({ h: String(x.h), paras: (x.paras || []).map(fix).filter(Boolean), subs: (x.subs || []).map((y) => ({ h: String(y.h), paras: (y.paras || []).map(fix).filter(Boolean) })).filter((y) => y.paras.length) })).filter((x) => x.paras.length || x.subs.length);
    infobox = (deep.infobox || []).filter((r) => Array.isArray(r) && r[0] && r[1]).map(([k, v]) => [String(k), fix(String(v))]).slice(0, 12);
    if (deep.lore && (deep.lore.claims || []).length) {
      lore = { intro: fix(deep.lore.intro), claims: deep.lore.claims.map((c) => ({ claim: fix(c.claim), verdict: ['supported', 'mixed', 'unsupported', 'unknown', 'dangerous'].includes(c.verdict) ? c.verdict : 'unknown', note: fix(c.note) })) };
    }
    timeline = (deep.timeline || []).filter((t) => t && t.year && t.event).map((t) => ({ year: String(t.year), event: fix(t.event) })).slice(0, 14);
  } else {
    // First-pass fallback
    lead = (fp.overview || '').split(/\n\s*\n/).filter(Boolean);
    sections = [
      fp.mechanism && { h: 'How it works', paras: [fp.mechanism], subs: [] },
      fp.risks && { h: 'Risks and caveats', paras: [fp.risks], subs: [] },
    ].filter(Boolean);
  }

  stats.studies += studies.length; stats.reddit += reddit.length; stats.forum += forums.length;
  writeFileSync(join(outDir, s + '.json'), JSON.stringify({
    name: item.name, deep: !!deep, image,
    // Quick take = the short first-pass write-up; always present.
    casual: {
      lead: (fp.overview || '').split(/\n\s*\n/).filter(Boolean),
      sections: [fp.mechanism && { h: 'How it works', paras: [fp.mechanism], subs: [] }, fp.risks && { h: 'Risks and caveats', paras: [fp.risks], subs: [] }].filter(Boolean),
    },
    wikipedia: W ? { title: W.title, url: W.url } : null,
    grokipedia: G?.url || fp.grokipedia || null,
    lead, infobox, sections, lore, timeline, refs, studies: studies.slice(0, 16), reddit, forums,
  }));
}
console.log(JSON.stringify(stats));
