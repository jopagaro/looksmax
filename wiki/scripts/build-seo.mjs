// SEO layer for the deployable site (runs from build-public.mjs, writes into dist/):
//   dist/<kind>/<slug>.html — a real page per article: its own <title>, description, canonical URL, social preview
//     tags, JSON-LD, and the full article text as plain HTML, so search engines can read it without JavaScript.
//     The app boots on top of it and takes over as normal.
//   dist/wiki/<slug>.html — the same for the long-form guides.
//   dist/sitemap.xml + robots.txt
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { root, slug, allEntries } from './entries.mjs';

const SITE = 'https://lookmaxxin.com';
const out = join(root, 'dist');
const shell = readFileSync(join(out, 'index.html'), 'utf8');
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const plain = (s) => String(s ?? '').replace(/\[(\d+)\]/g, '').replace(/\s+/g, ' ').trim();
const clip = (s, n) => { s = plain(s); return s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…'; };
const abs = (u) => (!u ? null : /^https?:\/\//.test(u) ? u : SITE + '/' + String(u).replace(/^\//, ''));
const P = (arr) => (arr || []).map((p) => `<p>${esc(plain(p))}</p>`).join('');
const KIND = { compound: 'Compound', gear: 'Gear', meta: 'Meta' };

function page({ path, title, description, image, bodyHtml, jsonld }) {
  const head = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}">`,
    `<link rel="canonical" href="${SITE}${path}">`,
    `<meta property="og:type" content="article">`,
    `<meta property="og:site_name" content="LOOKSMAX Wiki">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:url" content="${SITE}${path}">`,
    image ? `<meta property="og:image" content="${esc(image)}">` : '',
    `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(description)}">`,
    image ? `<meta name="twitter:image" content="${esc(image)}">` : '',
    jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>` : '',
  ].filter(Boolean).join('\n');
  return shell
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta name="description"[^>]*>/, '')
    .replace('</head>', head + '\n</head>')
    .replace('<div class="wrap" id="app" aria-live="polite"></div>', `<div class="wrap" id="app" aria-live="polite">${bodyHtml}</div>`);
}

// Help-first one-line summaries (assets/angles.js: slug -> [goal, effect, summary]) beat the older index summaries.
let ANG = {};
try { const ctx = { window: {} }; vm.runInNewContext(readFileSync(join(root, 'assets', 'angles.js'), 'utf8'), ctx); ANG = ctx.window.LM_ANGLES || {}; } catch {}
const urls = [{ loc: '/', pri: '1.0' }];
let n = 0;
const ENTRIES = allEntries().map(({ kind, item }) => ({ kind, item, s: slug(item.name) }))
  .filter((e) => existsSync(join(root, 'data', 'entries', e.s + '.json')));
const byCat = new Map();
for (const e of ENTRIES) { const k = e.kind + ':' + e.item.category; if (!byCat.has(k)) byCat.set(k, []); byCat.get(k).push(e); }

for (const e of ENTRIES) {
  const d = JSON.parse(readFileSync(join(root, 'data', 'entries', e.s + '.json'), 'utf8'));
  const lead = (d.lead && d.lead.length ? d.lead : d.casual && d.casual.lead) || [];
  const summary = (ANG[e.s] && ANG[e.s][2]) || (d.angle && d.angle.text) || e.item.summary || lead[0] || '';
  const description = clip(summary || `${e.item.name} on the LOOKSMAX Wiki.`, 158);
  const goal = (ANG[e.s] && ANG[e.s][0]) || (d.angle && d.angle.goal);
  const title = `${e.item.name}${goal ? ` — ${goal}` : ''} | LOOKSMAX Wiki`;
  const image = abs(d.image && d.image.url);
  const path = `/${e.kind}/${e.s}`;
  const sections = (d.sections || []).map((sec) => `<h2>${esc(sec.h)}</h2>${P(sec.paras)}${(sec.subs || []).map((x) => `<h3>${esc(x.h)}</h3>${P(x.paras)}`).join('')}`).join('');
  const quick = (d.casual && d.casual.sections || []).map((sec) => `<h2>${esc(sec.h)}</h2>${P(sec.paras)}`).join('');
  const claims = d.lore && d.lore.claims && d.lore.claims.length ? `<h2>What people claim</h2>${d.lore.claims.map((c) => `<h3>${esc(c.claim)}</h3><p>${esc(plain(c.believers))}</p><p>${esc(plain(c.experts))}</p>`).join('')}` : '';
  const refs = (d.refs || []).length ? `<h2>References</h2><ol>${d.refs.map((r) => `<li><a href="${esc(r.url)}" rel="nofollow noopener">${esc(r.title)}</a></li>`).join('')}</ol>` : '';
  const related = (byCat.get(e.kind + ':' + e.item.category) || []).filter((x) => x.s !== e.s).slice(0, 12);
  const rel = related.length ? `<h2>See also</h2><ul>${related.map((x) => `<li><a href="/${x.kind}/${x.s}">${esc(x.item.name)}</a></li>`).join('')}</ul>` : '';
  const body = `<article class="seo-prerender"><p><a href="/">LOOKSMAX Wiki</a> › <a href="/index">The Index</a> › ${esc(KIND[e.kind])}</p>` +
    `<h1>${esc(e.item.name)}</h1>${image ? `<img src="${esc(image)}" alt="${esc(e.item.name)}" width="320">` : ''}` +
    (d.angle && d.angle.text ? `<p><strong>Looksmax angle${goal ? ` · ${esc(goal)}` : ''}:</strong> ${esc(plain(d.angle.text))}</p>` : '') +
    P(lead) + quick + sections + claims + refs + rel + `</article>`;
  const jsonld = { '@context': 'https://schema.org', '@type': 'Article', headline: e.item.name, description, url: SITE + path,
    image: image || undefined, publisher: { '@type': 'Organization', name: 'LOOKSMAX Wiki', url: SITE }, about: goal || undefined };
  mkdirSync(join(out, e.kind), { recursive: true });
  writeFileSync(join(out, e.kind, e.s + '.html'), page({ path, title, description, image, bodyHtml: body, jsonld }));
  urls.push({ loc: path, pri: d.deep ? '0.8' : '0.6' });
  n++;
}

// Long-form guides (assets/guides.js)
let guides = [];
try { const ctx = { window: {} }; vm.runInNewContext(readFileSync(join(root, 'assets', 'guides.js'), 'utf8'), ctx); guides = ctx.window.LM_GUIDES || []; } catch {}
mkdirSync(join(out, 'wiki'), { recursive: true });
for (const g of guides) {
  const path = `/wiki/${g.slug}`;
  const body = `<article class="seo-prerender"><h1>${esc(g.title)}</h1><p>${esc(g.summary || '')}</p>${(g.sections || []).map((x) => `<h2>${esc(x.h)}</h2><p>${esc(plain(String(x.body || '').replace(/<[^>]+>/g, ' ').replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, a, b) => b || a)))}</p>`).join('')}</article>`;
  writeFileSync(join(out, 'wiki', g.slug + '.html'), page({ path, title: `${g.title} | LOOKSMAX Wiki`, description: clip(g.summary || g.title, 158), image: null, bodyHtml: body, jsonld: { '@context': 'https://schema.org', '@type': 'Article', headline: g.title, url: SITE + path } }));
  urls.push({ loc: path, pri: '0.9' });
}
for (const p of ['/index', '/topics', '/az']) urls.push({ loc: p, pri: '0.7' });

const today = new Date().toISOString().slice(0, 10);
writeFileSync(join(out, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map((u) => `<url><loc>${SITE}${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.pri}</priority></url>`).join('\n') + '\n</urlset>\n');
writeFileSync(join(out, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`SEO: ${n} article pages, ${guides.length} guide pages, sitemap with ${urls.length} URLs`);
