// Builds data/entries/<slug>.json — one file per article — by merging:
//   research/raw/<slug>.json    (deep scrape: Wikipedia, Grokipedia, PubMed, Reddit, looksmax.org)
//   research/NN-*.json          (first research pass: descriptions, studies, forums, photos)
//   research/deep/<slug>.json   (long-form Wikipedia-style write-up)
// Any reference URL in a write-up that doesn't appear in the scraped sources is dropped,
// so the site can only ever cite links that were actually found.
// Run: node wiki/scripts/build-entries.mjs
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { root, slug, allEntries } from './entries.mjs';

const outDir = join(root, 'data', 'entries');
mkdirSync(outDir, { recursive: true });
const readJSON = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; } };
// Thread titles from forums are shown verbatim, so drop any containing slurs or explicit sexual content.
const BLOCK = /\b(n[i1]gg\w*|f[a4]gg?\w*|tr[a4]nn\w*|retard\w*|k[i1]ke\w*|ch[i1]nk\w*|sp[i1]c\w*|beast\w*|bestial\w*|zoophil\w*|rape\w*|rapist\w*|porn\w*|p[o0]rn\w*|nsfw|cum\w*|jerk(ing)? off|masturbat\w*|penis|dick\w*|cock\w*|pussy|pedo\w*|paedo\w*|loli\w*|suicide|kys|rope\w*|necro\w*|gay\w*|fetish\w*|orgasm\w*|raped)\b/i;
const cleanTitle = (t) => !BLOCK.test(String(t || ''));
const okUrl = (u) => typeof u === 'string' && /^https:\/\/[^\s"<>]+$/.test(u);
const norm = (u) => String(u || '').replace(/^https?:\/\/(www\.)?/, '').replace(/[?#].*$/, '').replace(/\/+$/, '').toLowerCase();

const neutral = {};
try { for (const f of readdirSync(join(root, 'research', 'neutral')).filter((f) => /\.json$/.test(f))) Object.assign(neutral, readJSON(join(root, 'research', 'neutral', f)) || {}); } catch {}
const first = {};
for (const f of readdirSync(join(root, 'research')).filter((f) => /^\d\d-.*\.json$/.test(f))) Object.assign(first, readJSON(join(root, 'research', f)) || {});

// Looksmax angle (research/angles/out/*.json): why each entry matters for appearance — shown at the top of every article.
const ANGLES = {};
try { for (const f of readdirSync(join(root, 'research', 'angles', 'out')).filter((f) => f.endsWith('.json'))) Object.assign(ANGLES, readJSON(join(root, 'research', 'angles', 'out', f)) || {}); } catch {}
// Quick take rewrite ("how it helps") — research/quick2/out/*.json: slug → { summary, quick: { overview, how, risks } }.
const QUICK2 = {};
try { for (const f of readdirSync(join(root, 'research', 'quick2', 'out')).filter((f) => f.endsWith('.json'))) Object.assign(QUICK2, readJSON(join(root, 'research', 'quick2', 'out', f)) || {}); } catch {}
// Articles written with their own angle (newer entries) fill any gaps.
try { for (const f of readdirSync(join(root, 'research', 'deep'))) { const k = f.replace(/\.json$/, ''); if (ANGLES[k]) continue; const d = readJSON(join(root, 'research', 'deep', f)); if (d && d.angle && d.angle.goal) ANGLES[k] = d.angle; } } catch {}
// Quick-take pass also refreshes the angle's text/effect in the help-first tone.
for (const [k, q] of Object.entries(QUICK2)) if (ANGLES[k] && q && q.angle && q.angle.text) ANGLES[k] = { ...ANGLES[k], text: q.angle.text, effect: q.angle.effect || ANGLES[k].effect };
const stats = { entries: 0, raw: 0, deep: 0, droppedRefs: 0, studies: 0, reddit: 0, forum: 0, images: 0 };
const ENTRIES = allEntries({ withPending: false });
// Forum popularity: how many indexed looksmax.org thread titles mention each entry.
const LMX = (() => { try { return readFileSync(join(root, 'research', 'discovery', 'looksmax-threads.tsv'), 'utf8').split('\n').filter(Boolean).map((l) => '-' + l.split('\t')[1] + '-'); } catch { return []; } })();
function mentionsFor(item, raw) {
  if (!LMX.length) return null;
  const terms = [...new Set([...(raw.terms || []), ...(item.terms || []), item.name].map((t) => slug(String(t).replace(/\s*\(.*?\)\s*/g, ' '))).filter((t) => t.length >= 4))];
  if (!terms.length) return null;
  let n = 0;
  for (const t of LMX) if (terms.some((k) => t.includes('-' + k + '-'))) n++;
  return n;
}

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
  const NW = Array.isArray(raw.news) ? raw.news.filter((n) => cleanTitle(n.title) && okUrl(n.url)) : [];
  const HN = Array.isArray(raw.hackernews) ? raw.hackernews.filter((n) => cleanTitle(n.title)) : [];
  const LY = Array.isArray(raw.lemmy) ? raw.lemmy.filter((n) => cleanTitle(n.title) && okUrl(n.url)) : [];

  // ── Studies: PubMed (verified via E-utilities) + first-pass scholarly, de-duplicated
  const studies = [];
  const seenS = new Set();
  const addStudy = (x) => { const k = norm(x.url); if (!okUrl(x.url) || seenS.has(k)) return; seenS.add(k); studies.push(x); };
  // Quick-take "Clinical studies" = only studies a researcher confirmed are about this entry
  // (first-pass picks + refs the in-depth writer cited as studies). Raw keyword hits stay in links.studies.
  (fp.scholarly || []).forEach((x) => addStudy({ title: x.title, url: x.url, source: x.source, year: x.year || null, kind: null }));
  const relevantPM = PM;

  // ── Community: Reddit (archive API) + looksmax.org (Wayback index) + first-pass forums
  const reddit = RD.filter((p) => cleanTitle(p.title)).slice(0, 14).map((p) => ({ title: p.title, url: p.url, sub: p.sub, score: p.score, comments: p.comments, year: p.year }));
  const forums = [];
  const seenF = new Set();
  const addForum = (x) => { const k = norm(x.url); if (!okUrl(x.url) || seenF.has(k)) return; seenF.add(k); forums.push(x); };
  const TN = Array.isArray(raw.tnation) ? raw.tnation : [];
  LM.filter((t) => cleanTitle(t.title)).slice(0, 16).forEach((t) => addForum({ title: t.title, url: t.url, site: 'looksmax.org', archived: t.archived || `https://web.archive.org/web/${t.ts}/${t.url}` }));
  TN.filter((t) => cleanTitle(t.title)).slice(0, 6).forEach((t) => addForum({ title: t.title, url: t.url, site: `T Nation · ${t.posts} posts${t.year ? ' · ' + t.year : ''}` }));
  (fp.forums || []).forEach((x) => { if (!/reddit\.com/.test(x.url) || !reddit.some((r) => norm(r.url) === norm(x.url))) addForum({ title: x.title, url: x.url, site: x.site }); });

  const X = readJSON(join(root, 'research', 'extra', s + '.json')) || {};
  const IMG = readJSON(join(root, 'research', 'images', s + '.json')) || {};
  const galleryRaw = (IMG.images || []).filter((g) => okUrl(g.url) && okUrl(g.page || ''))
    .map((g) => ({ url: g.thumb || g.url, full: g.url, title: g.title, license: g.license, creator: g.creator, page: g.page, source: g.source }));
  // ── Image: only use a picture we're confident actually shows THIS entry.
  const normT = (t) => String(t || '').toLowerCase().replace(/\s*\(.*?\)\s*/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
  // Name, aka and the single most specific search term only — broader terms ("microneedling") picked wrong photos.
  const termList = [...new Set([item.name, item.aka, (raw.terms || item.terms || [])[0]].filter(Boolean).flatMap((t) => String(t).split('/')).map(normT).filter((t) => t.length > 2))];
  const matches = (text) => { const n = ' ' + normT(text) + ' '; return termList.some((t) => n.includes(' ' + t + ' ') || (t.split(' ').length > 1 && t.split(' ').every((w) => n.includes(' ' + w)))); };
  let image = null;
  const wikiIsAboutIt = W && !W.viaSearch && matches(W.title);
  const wImg = wikiIsAboutIt && W?.image?.url && /^https:\/\/upload\.wikimedia\.org\//.test(W.image.url) ? { url: W.image.url, credit: W.image.page, caption: W.title, source: 'Wikimedia Commons via Wikipedia' } : null;
  const fImg = okUrl(fp.image) ? { url: fp.image, credit: fp.imageCredit, caption: item.name, source: 'Wikimedia Commons' } : null;
  const gallery = galleryRaw.filter((g) => matches(g.title)).slice(0, 12);
  const gImg = gallery[0];
  image = kind === 'compound' ? wImg : (fImg || wImg || (gImg ? { url: gImg.url, credit: gImg.page, caption: gImg.title, source: gImg.source } : null));
  if (image) stats.images++;

  // ── Allowed citation URLs = everything we actually scraped or the first pass verified
  const allowed = new Set([
    ...(X.openalex || []).flatMap((w) => [w.url, w.oa]), ...(X.europepmc || []).flatMap((x) => [x.url, x.fullText]),
    ...(X.trials || []).map((t) => t.url), X.fda?.url,
    ...((deep && deep.webSources) || []).map((w) => w && w.url),
    W?.url, ...(W?.citedLinks || []), G?.url, fp.grokipedia,
    ...PM.flatMap((p) => [p.url, p.pmc]), ...RD.map((p) => p.url), ...TN.map((t) => t.url), ...NW.map((n) => n.url), ...HN.flatMap((n) => [n.url, n.link]), ...LY.map((n) => n.url), ...LM.flatMap((t) => [t.url, t.archived]),
    ...(fp.scholarly || []).map((x) => x.url), ...(fp.forums || []).map((x) => x.url),
  ].filter(Boolean).map(norm));

  // ── All links, ranked by popularity (citations for papers, score for threads)
  const allStudies = [];
  const seenA = new Set();
  const addA = (x) => { const k = norm(x.url); if (!okUrl(x.url) || seenA.has(k)) return; seenA.add(k); allStudies.push(x); };
  (X.openalex || []).forEach((w) => addA({ title: w.title, url: w.url, source: w.source, year: w.year, cites: w.cites ?? null, kind: w.type === 'review' ? 'Review' : null }));
  (X.europepmc || []).forEach((x) => addA({ title: x.title, url: x.url, source: x.source, year: x.year, cites: x.cites ?? null, kind: (x.types || []).find((t) => /review|meta|trial/i.test(t)) || null }));
  studies.forEach((x) => addA({ ...x, cites: null }));
  relevantPM.forEach((p) => addA({ title: p.title, url: p.url, source: p.source, year: p.year, cites: null, kind: (p.types || []).find((t) => /meta-analysis|systematic|review|randomized|clinical trial/i.test(t)) || null }));
  allStudies.sort((a, b) => (b.cites ?? -1) - (a.cites ?? -1) || (b.year || 0) - (a.year || 0));
  const links = {
    studies: allStudies,
    trials: (X.trials || []).map((t) => ({ title: t.title, url: t.url, nct: t.nct, status: t.status, phase: t.phase, start: t.start, enrollment: t.enrollment })),
    label: X.fda?.url ? { url: X.fda.url, brands: X.fda.brands, generic: X.fda.generic } : null,
    reddit: RD.filter((p) => cleanTitle(p.title)).map((p) => ({ title: p.title, url: p.url, sub: p.sub, score: p.score, comments: p.comments, year: p.year })).sort((a, b) => (b.score + b.comments) - (a.score + a.comments)),
    forums: [...forums, ...TN.filter((t) => cleanTitle(t.title)).slice(6).map((t) => ({ title: t.title, url: t.url, site: `T Nation · ${t.posts} posts${t.year ? ' · ' + t.year : ''}` })), ...LM.filter((t) => cleanTitle(t.title)).slice(16).map((t) => ({ title: t.title, url: t.url, site: 'looksmax.org', archived: t.archived || `https://web.archive.org/web/${t.ts}/${t.url}` }))],
    news: NW.map((n) => ({ title: n.title, url: n.url, site: n.site, date: n.date })),
    social: [...HN.map((n) => ({ title: n.title, url: n.url, site: 'Hacker News', score: n.points, comments: n.comments, year: n.year })),
      ...LY.map((n) => ({ title: n.title, url: n.url, site: 'Lemmy · ' + (n.community || ''), score: n.score, comments: n.comments, year: n.year }))].sort((a, b) => b.score + b.comments - a.score - a.comments),
    web: [W && { title: W.title + ' — Wikipedia', url: W.url }, G && { title: item.name + ' — Grokipedia', url: G.url }, ...((deep && deep.webSources) || []).filter((w) => w && okUrl(w.url)).map((w) => ({ title: w.title || w.url, url: w.url }))].filter(Boolean),
  };

  let refs = [], lead = null, sections = null, infobox = [], lore = null, timeline = [];
  if (deep) {
    const keep = new Map();
    const alias = new Map(); // duplicate URLs → first id
    const byUrl = new Map();
    (deep.refs || []).forEach((r) => {
      if (!(r && okUrl(r.url) && allowed.has(norm(r.url)))) { stats.droppedRefs++; return; }
      const k = norm(r.url);
      if (byUrl.has(k)) { alias.set(Number(r.id), byUrl.get(k)); return; }
      byUrl.set(k, Number(r.id)); keep.set(Number(r.id), r);
    });
    const canon = (id) => alias.get(id) ?? id;
    // Renumber kept refs 1..n in order of first citation.
    const order = [];
    const scan = (t) => String(t || '').replace(/\[(\d+(?:\s*,\s*\d+)*)\]/g, (m, ids) => { ids.split(',').map((x) => canon(Number(x.trim()))).forEach((id) => { if (keep.has(id) && !order.includes(id)) order.push(id); }); return m; });
    const allText = [...(deep.lead || []), ...(deep.sections || []).flatMap((x) => [...(x.paras || []), ...(x.subs || []).flatMap((y) => y.paras || [])]), ...((deep.lore?.claims) || []).map((c) => c.claim + ' ' + c.note), deep.lore?.intro, ...(deep.timeline || []).map((t) => t.event)];
    allText.forEach(scan);
    [...keep.keys()].forEach((id) => { if (!order.includes(id)) order.push(id); });
    const remap = new Map(order.map((id, i) => [id, i + 1]));
    const fix = (t) => String(t || '').replace(/\[(\d+(?:\s*,\s*\d+)*)\]/g, (m, ids) => {
      const n = [...new Set(ids.split(',').map((x) => remap.get(canon(Number(x.trim())))).filter(Boolean))];
      return n.length ? n.map((x) => `[${x}]`).join('') : '';
    }).replace(/\s+([.,;:])/g, '$1').trim();
    refs = order.map((id) => {
      const r = keep.get(id);
      let title = String(r.title || r.url);
      // Forum thread titles can be crude; keep the link, neutralise the wording.
      if (!cleanTitle(title) || !cleanTitle(r.url)) title = `${r.source || 'Forum'} thread`;
      return { title, url: r.url, source: r.source || '', year: Number(r.year) || null, type: r.type || '' };
    });
    lead = (deep.lead || []).map(fix).filter(Boolean);
    sections = (deep.sections || []).map((x) => ({ h: String(x.h), paras: (x.paras || []).map(fix).filter(Boolean), subs: (x.subs || []).map((y) => ({ h: String(y.h), paras: (y.paras || []).map(fix).filter(Boolean) })).filter((y) => y.paras.length) })).filter((x) => x.paras.length || x.subs.length);
    infobox = (deep.infobox || []).filter((r) => Array.isArray(r) && r[0] && r[1]).map(([k, v]) => [String(k), fix(String(v))]).slice(0, 12);
    if (deep.lore && (deep.lore.claims || []).length) {
      lore = { intro: fix(deep.lore.intro), claims: deep.lore.claims.map((c) => ({ claim: fix(c.claim), verdict: ['supported', 'mixed', 'unsupported', 'unknown', 'dangerous'].includes(c.verdict) ? c.verdict : 'unknown', note: fix(c.note) })) };
    }
    timeline = (deep.timeline || []).filter((t) => t && t.year && t.event).map((t) => ({ year: String(t.year), event: fix(t.event) })).slice(0, 14);
    // Clinical studies for the quick take = exactly the refs cited in the article's "Clinical studies" section.
    const cs = sections.find((x) => /clinical stud/i.test(x.h));
    if (cs) {
      const ids = new Set();
      [...cs.paras, ...cs.subs.flatMap((y) => y.paras)].join(' ').replace(/\[(\d+)\]/g, (m, n) => { ids.add(Number(n)); return m; });
      studies.length = 0;
      [...ids].sort((a, b) => a - b).map((n) => refs[n - 1]).filter(Boolean).forEach((r) => studies.push({ title: r.title, url: r.url, source: r.source, year: r.year, kind: null }));
    }
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
    name: item.name, deep: !!deep, image, mentions: mentionsFor(item, raw),
    // Quick take = the short first-pass write-up; always present.
    casual: (() => {
      const q2 = QUICK2[s] && QUICK2[s].quick;
      if (q2 && q2.overview) return {
        lead: String(q2.overview).split(/\n\s*\n/).filter(Boolean),
        sections: [q2.how && { h: 'How people use it', paras: [q2.how], subs: [] }, q2.risks && { h: 'Risks & side effects', paras: [q2.risks], subs: [] }].filter(Boolean),
      };
      const q = neutral[item.name] && neutral[item.name].overview ? neutral[item.name] : fp.overview ? fp : (deep && deep.quick) || {};
      return {
        lead: String(q.overview || '').split(/\n\s*\n/).filter(Boolean),
        sections: [q.mechanism && { h: 'How it works', paras: [q.mechanism], subs: [] }, q.risks && { h: 'Risks and caveats', paras: [q.risks], subs: [] }].filter(Boolean),
      };
    })(),
    gallery, links, angle: ANGLES[s] || (deep && deep.angle && deep.angle.goal ? deep.angle : null),
    wikipedia: W ? { title: W.title, url: W.url } : null,
    grokipedia: G?.url || fp.grokipedia || null,
    lead, infobox, sections, lore, timeline, refs, studies: studies.slice(0, 16), reddit, forums,
  }));
}
// Popularity index for the Index sort + home page (name → looksmax.org thread-title mentions).
const pop = {};
for (const f of readdirSync(outDir)) { try { const d = JSON.parse(readFileSync(join(outDir, f), 'utf8')); if (d.mentions) pop[d.name] = d.mentions; } catch {} }
writeFileSync(join(root, 'assets', 'angles.js'), '// GENERATED by scripts/build-entries.mjs — Looksmax angle per entry: slug → [goal, effect].\nwindow.LM_ANGLES = ' +
  JSON.stringify(Object.fromEntries(Object.entries(ANGLES).filter(([, a]) => a && a.goal).map(([k, a]) => [k, [a.goal, a.effect || null, (QUICK2[k] && QUICK2[k].summary) || null]]))) + ';\n');
writeFileSync(join(root, 'assets', 'popularity.js'), '// GENERATED by scripts/build-entries.mjs — looksmax.org thread-title mentions per entry.\nwindow.LM_POP = ' + JSON.stringify(pop) + ';\n');
console.log(JSON.stringify(stats));
