// Deep scrape for every Index entry → research/raw/<slug>.json
// Sources (all public APIs, no search-engine scraping, no bot-wall bypassing):
//   • Wikipedia   — full article text by section, lead image, cited PubMed/DOI links
//   • Grokipedia  — article text (stored as untrusted source material)
//   • PubMed      — relevant reviews + top studies, with abstracts (NCBI E-utilities)
//   • Reddit      — posts via the Arctic Shift archive API
//   • looksmax.org — thread list via the Wayback Machine CDX index + archived first posts
// Resumable: entries with an existing raw file are skipped (use --force to redo).
// Run: node wiki/scripts/scrape.mjs [--force] [--only "Name"]
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const rawDir = join(root, 'research', 'raw');
mkdirSync(rawDir, { recursive: true });
const ctx = { window: {} };
vm.runInNewContext(readFileSync(join(root, 'assets', 'data.js'), 'utf8'), ctx);
const D = ctx.window.LM_DATA;
const FORCE = process.argv.includes('--force');
// Local credentials (wiki/.env.local, git-ignored): REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USER_AGENT
try {
  for (const line of readFileSync(join(root, '.env.local'), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {}
const ONLY = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
const UA = 'Mozilla/5.0 (compatible; looksmax-wiki-research/1.0)';
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// First-pass research gives us Grokipedia URLs the agents already confirmed.
const first = {};
for (const f of readdirSync(join(root, 'research')).filter((f) => /^\d\d-.*\.json$/.test(f))) {
  try { Object.assign(first, JSON.parse(readFileSync(join(root, 'research', f), 'utf8'))); } catch {}
}

// ───────── per-host throttles ─────────
function throttle(ms) {
  let last = 0, chain = Promise.resolve();
  return () => (chain = chain.then(async () => {
    const wait = last + ms - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    last = Date.now();
  }));
}
const gate = {
  'en.wikipedia.org': throttle(400),
  'eutils.ncbi.nlm.nih.gov': throttle(380),
  'arctic-shift.photon-reddit.com': throttle(6000),
  'web.archive.org': throttle(1500),
  'grokipedia.com': throttle(400),
  'oauth.reddit.com': throttle(800),
  'www.reddit.com': throttle(1000),
  't-nation.com': throttle(1300),
  'api.gdeltproject.org': throttle(9000),
  'hn.algolia.com': throttle(400),
  'lemmy.world': throttle(1200),
};
async function get(url, { json = false, tries = 3 } = {}) {
  if (url.includes('arctic-shift')) tries = Math.max(tries, 5);
  const host = new URL(url).host;
  for (let i = 0; i < tries; i++) {
    if (gate[host]) await gate[host]();
    try {
      const r = await fetch(url, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(url.includes('/cdx/') ? 120000 : 45000) });
      if (r.status === 429 || r.status >= 500) { await new Promise((s) => setTimeout(s, (host.includes('wiki') ? 20000 : 3000) * (i + 1))); continue; }
      if (!r.ok) return null;
      if (host === 'api.gdeltproject.org') { const t = await r.text(); if (/limit requests/i.test(t)) { await new Promise((s) => setTimeout(s, 90000)); continue; } try { return JSON.parse(t); } catch { return { articles: [] }; } }
      if (!json) return await r.text();
      const j = await r.json();
      // Arctic Shift reports overload as {data:null, error:"Timeout…"} with HTTP 200.
      if (j && j.error && /timeout|slow down/i.test(j.error)) { await new Promise((s) => setTimeout(s, 6000 * (i + 1))); continue; }
      return j;
    } catch { await new Promise((s) => setTimeout(s, 2000 * (i + 1))); }
  }
  return null;
}
const htmlToText = (h) => h
  .replace(/<(script|style|noscript|svg|nav|footer|header)[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, '\n')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'")
  .replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n\n').trim();

// ───────── search terms per entry ─────────
// Hand-tuned where the Index name is a product phrase rather than a topic.
const TERMS = {
  'Botulinum toxin A': ['botulinum toxin', 'botox'],
  'Vitamin C (topical)': ['ascorbic acid topical', 'vitamin c serum'],
  'Omega-3 (EPA/DHA)': ['omega-3', 'fish oil'],
  'PDRN / Polynucleotides': ['polydeoxyribonucleotide', 'pdrn'],
  'HGH Fragment 176-191': ['hgh fragment', 'frag 176'],
  'Caffeine (topical)': ['caffeine eye', 'caffeine topical'],
  'Melatonin (topical)': ['topical melatonin', 'melatonin hair'],
  'Creatine monohydrate': ['creatine'],
  'Whey protein': ['whey protein', 'whey'],
  'Citrulline malate': ['citrulline'],
  'Somatropin': ['growth hormone', 'hgh'],
  'Testosterone': ['testosterone replacement', 'trt'],
  'Follistatin-344': ['follistatin'],
  'IGF-1 LR3': ['igf-1 lr3', 'igf-1'],
  'Dihydroxyacetone': ['dihydroxyacetone', 'self tanner'],
  'Afamelanotide': ['afamelanotide', 'melanotan 1', 'scenesse'],
  'Melanotan II': ['melanotan'],
  'Isotretinoin': ['isotretinoin', 'accutane'],
  'Tretinoin': ['tretinoin', 'retin-a'],
  'Adapalene': ['adapalene', 'differin'],
  'Polypodium leucotomos': ['polypodium leucotomos', 'heliocare'],
  'Thymosin alpha-1': ['thymosin alpha'],
  'N-Acetylcysteine': ['n-acetylcysteine', 'nac'],
  'Nicotinamide riboside': ['nicotinamide riboside'],
  'Alpha-ketoglutarate': ['alpha-ketoglutarate', 'akg'],
  'Rapamycin': ['rapamycin', 'sirolimus'],
  'SS-31': ['elamipretide', 'ss-31'],
  // gear
  'Whitening strips': ['whitening strips', 'tooth whitening'],
  'Whitening gel trays': ['whitening trays', 'tooth bleaching tray'],
  'LED whitening kit': ['led whitening', 'light-activated tooth whitening'],
  'Clear aligners': ['clear aligners', 'invisalign'],
  'Bruxism night guard': ['night guard', 'occlusal splint bruxism'],
  'Jaw exerciser': ['jaw exerciser', 'jawzrsize'],
  'Mastic / hard gum': ['mastic gum', 'mastic'],
  'Mouth tape': ['mouth tape', 'mouth taping'],
  'Mewing appliances': ['mewing', 'orthotropics'],
  'Red light LED mask': ['red light therapy', 'led mask'],
  'Blue light acne device': ['blue light acne'],
  'At-home fractional laser': ['fractional laser', 'home laser'],
  'RF skin-tightening device': ['radiofrequency skin tightening', 'rf microneedling'],
  'Microcurrent device': ['microcurrent', 'nuface'],
  'Multi-head facial tool': ['theraface', 'facial device'],
  'Sonic cleansing brush': ['cleansing brush', 'clarisonic'],
  'Dermaplaning razor': ['dermaplaning'],
  'Derma roller (home)': ['derma roller', 'microneedling'],
  'Gua sha stone': ['gua sha'],
  'Ice roller': ['ice roller', 'facial icing'],
  'Pimple patches': ['pimple patch', 'hydrocolloid acne'],
  'Silicone scar sheets': ['silicone scar', 'silicone gel sheeting'],
  'Under-eye cooling mask': ['under eye mask', 'eye patches'],
  'High-frequency wand': ['high frequency wand', 'high frequency facial'],
  'Face slimming strap': ['face slimming', 'chin strap'],
  'Nose reshaping clip': ['nose clip', 'nose shaper'],
  'Facial lifting tape': ['face tape', 'facial taping'],
  'Lip plumping device': ['lip plumper', 'lip plumping'],
  'Facial exerciser': ['facial exercise', 'face yoga'],
  'Laser hair-growth cap': ['laser cap', 'low-level laser therapy hair'],
  'Laser comb': ['laser comb', 'hairmax'],
  'Scalp massager': ['scalp massage'],
  'Scalp microneedling roller': ['microneedling hair', 'dermaroller hair'],
  'Hair fibers': ['hair fibers', 'toppik'],
  'Hairline concealer / powder': ['hairline powder', 'hair concealer'],
  'Thickening spray': ['thickening spray', 'volumizing spray'],
  'Pro clippers + edge trimmer': ['clippers', 'haircut'],
  'Blow dryer + round brush': ['blow dryer', 'hair dryer'],
  'Silk pillowcase': ['silk pillowcase'],
  'Precision beard trimmer': ['beard trimmer'],
  'Beard shaping guide': ['beard shaping', 'beard line'],
  'Safety razor': ['safety razor', 'wet shaving'],
  'Heated beard straightener': ['beard straightener'],
  'Brow tweezers + scissors': ['eyebrow grooming', 'eyebrows'],
  'Brow lamination kit': ['brow lamination'],
  'Lash lift kit': ['lash lift'],
  'Beard growth roller': ['beard roller', 'beard minoxidil'],
  'IPL hair removal device': ['ipl hair removal', 'intense pulsed light'],
  'Home laser hair removal': ['laser hair removal'],
  'Electric body groomer': ['body groomer', 'manscaping'],
  'Nose + ear trimmer': ['nose hair trimmer', 'nose hair'],
  'Wax kit': ['waxing', 'body wax'],
  'Adjustable dumbbells': ['adjustable dumbbells', 'dumbbell'],
  'Barbell + plates': ['barbell', 'strength training'],
  'Weighted vest': ['weighted vest'],
  'Walking pad': ['walking pad', 'treadmill desk'],
  'EMS ab belt': ['ems belt', 'electrical muscle stimulation abs'],
  'Waist trainer': ['waist trainer'],
  'Posture corrector brace': ['posture corrector', 'posture brace'],
  'Neck training harness': ['neck harness', 'neck training'],
  'Chin tuck trainer': ['chin tuck', 'forward head posture'],
  'Cervical pillow': ['cervical pillow'],
  'Standing desk / riser': ['standing desk'],
  'Shoe lifts / elevator shoes': ['height insoles', 'elevator shoes', 'heightmax'],
  'Self-tanning mousse': ['self tanner', 'sunless tanning'],
  'Self-tanning drops': ['tanning drops', 'self tanner'],
  'Tinted facial SPF': ['tinted sunscreen'],
  'Broad-spectrum sunscreen': ['sunscreen'],
  'UV-protective sunglasses': ['sunglasses uv'],
  'UV tanning bed': ['tanning bed', 'sunbed'],
  'Glass nail file + buffer': ['glass nail file', 'nail care'],
  'Cuticle oil pen': ['cuticle oil'],
  'Electric foot file': ['foot file', 'callus remover'],
  'Korean exfoliating mitt': ['italy towel', 'korean exfoliating'],
  'Silicone scar tape': ['scar tape', 'silicone scar'],
  'Anti-wrinkle pillow': ['sleep wrinkles', 'anti wrinkle pillow'],
  'Nasal dilator / strips': ['nasal strips', 'nasal dilator'],
  'Sunrise alarm clock': ['sunrise alarm', 'dawn simulation'],
  'Tailoring (any clothes)': ['tailoring', 'clothes fit'],
  'Compression undershirt': ['compression shirt'],
  'Shoe trees + polish kit': ['shoe trees', 'shoe care'],
  'Good sunglasses': ['sunglasses'],
};
// Search terms: split "A / B", "A (B)" and "A or B" forms into separate terms so searches don't run on literal
// strings like "affirmations / self-talk" (which match nothing).
function splitTerm(t) {
  const s = String(t || '').toLowerCase();
  const inParen = [...s.matchAll(/\(([^)]*)\)/g)].map((m) => m[1]);
  const base = s.replace(/\s*\(.*?\)\s*/g, ' ');
  return [...base.split(/\s*(?:\/|,|;|\bor\b|\+|&)\s*/), ...inParen.flatMap((x) => x.split(/\s*(?:\/|,|;|\bor\b)\s*/))]
    .map((x) => x.replace(/\b(etc|e\.g\.?|aka|incl\.?)\b/g, '').replace(/[^a-z0-9 .'-]+/g, ' ').replace(/\s+/g, ' ').trim()).filter((x) => x.length >= 3);
}
function termsFor(item) {
  if (TERMS[item.name]) return TERMS[item.name];
  const t = [];
  if (Array.isArray(item.terms)) item.terms.forEach((x) => t.push(...splitTerm(x)));
  t.push(...splitTerm(item.name));
  if (item.aka) t.push(...splitTerm(item.aka));
  // Later single-word fragments ("cuts", "oil") are too generic to search on their own.
  return [...new Set(t)].filter((x, i) => i === 0 || x.includes(' ') || x.includes('-') || x.length >= 6).slice(0, 5);
}

const SUBS = {
  pigment: ['LooksmaxingAdvice', 'Looksmaxx', 'looksmaxing', 'SkincareAddiction', 'Peptides', 'tanning', 'Supplements'],
  skin: ['SkincareAddiction', 'LooksmaxingAdvice', 'Looksmaxx', 'looksmaxing', '30PlusSkinCare', 'tretinoin', 'Accutane', 'AsianBeauty'],
  fat: ['Semaglutide', 'loseit', 'Peptides', 'Supplements', 'LooksmaxingAdvice', 'Looksmaxx', 'looksmaxing', 'Mounjaro'],
  muscle: ['moreplatesmoredates', 'Peptides', 'Supplements', 'Fitness', 'steroids', 'Testosterone', 'sarmssourcetalk'],
  hair: ['tressless', 'LooksmaxingAdvice', 'Looksmaxx', 'looksmaxing', 'malehairadvice', 'Supplements', 'moreplatesmoredates'],
  bone: ['Supplements', 'LooksmaxingAdvice', 'Looksmaxx', 'looksmaxing', 'orthotropics', 'Osteoporosis'],
  recovery: ['Peptides', 'Supplements', 'moreplatesmoredates', 'Biohackers'],
  longevity: ['longevity', 'Biohackers', 'Supplements', 'Peptides', 'Nootropics'],
  depuff: ['LooksmaxingAdvice', 'Looksmaxx', 'looksmaxing', 'SkincareAddiction', 'Supplements', 'Biohackers'],
  teeth: ['LooksmaxingAdvice', 'Looksmaxx', 'looksmaxing', 'orthotropics', 'Teethwhitening', 'Invisalign', 'Dentistry', 'BuyItForLife'],
  faceDevices: ['SkincareAddiction', 'LooksmaxingAdvice', 'Looksmaxx', 'looksmaxing', '30PlusSkinCare', 'redlighttherapy', 'AsianBeauty'],
  hairGear: ['tressless', 'malehairadvice', 'LooksmaxingAdvice', 'Looksmaxx', 'looksmaxing', 'Hair'],
  grooming: ['malegrooming', 'Beardsandboners', 'beards', 'wicked_edge', 'LooksmaxingAdvice', 'Looksmaxx', 'looksmaxing', 'Eyebrows'],
  hairRemoval: ['malegrooming', 'IPL', 'laserhairremoval', 'LooksmaxingAdvice', 'Looksmaxx', 'looksmaxing'],
  training: ['Fitness', 'homegym', 'bodyweightfitness', 'LooksmaxingAdvice', 'Looksmaxx', 'looksmaxing', 'loseit'],
  posture: ['posture', 'LooksmaxingAdvice', 'Looksmaxx', 'looksmaxing', 'orthotropics', 'Fitness', 'short'],
  tanGear: ['SkincareAddiction', 'tanning', 'LooksmaxingAdvice', 'Looksmaxx', 'looksmaxing', 'malegrooming'],
  bodyCare: ['malegrooming', 'SkincareAddiction', 'RedditLaqueristas', 'LooksmaxingAdvice', 'Looksmaxx', 'looksmaxing'],
  sleep: ['sleep', 'Biohackers', 'LooksmaxingAdvice', 'Looksmaxx', 'looksmaxing', 'SleepApnea'],
  style: ['malefashionadvice', 'BuyItForLife', 'LooksmaxingAdvice', 'Looksmaxx', 'looksmaxing', 'goodyearwelt'],
  // Metas
  hardmaxx: ['PlasticSurgery', 'LooksmaxingAdvice', 'Looksmaxx', 'looksmaxing', 'CosmeticSurgery'],
  bonehacks: ['orthotropics', 'LooksmaxingAdvice', 'Looksmaxx', 'looksmaxing'],
  height: ['short', 'LooksmaxingAdvice', 'Looksmaxx', 'looksmaxing'],
  protocols: ['moreplatesmoredates', 'Peptides', 'steroids', 'LooksmaxingAdvice', 'Looksmaxx'],
  lifestyle: ['carnivore', 'NoFap', 'Biohackers', 'LooksmaxingAdvice', 'Looksmaxx'],
  fringe: ['LooksmaxingAdvice', 'Looksmaxx', 'looksmaxing', 'Biohackers', 'skeptic'],
  frameworks: ['LooksmaxingAdvice', 'Looksmaxx', 'looksmaxing', 'truerateme'],
  stylemetas: ['malefashionadvice', 'malehairadvice', 'LooksmaxingAdvice', 'Looksmaxx'],
};

// ───────── sources ─────────
async function wikipedia(item, terms) {
  const hint = first[item.name]?.grokipedia ? decodeURIComponent(first[item.name].grokipedia.split('/page/')[1] || '').replace(/_/g, ' ') : null;
  const candidates = [...new Set([item.name, ...terms, hint].filter(Boolean))];
  let page = null, nulls = 0;
  for (const c of candidates) {
    const q = await get(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(c)}&redirects=1&prop=info|pageimages|extracts|pageprops&explaintext=1&inprop=url&piprop=original|name&format=json`, { json: true });
    if (!q) nulls++;
    const p = q && Object.values(q.query?.pages || {})[0];
    if (p && !('missing' in p) && p.extract && p.extract.length > 400 && !('disambiguation' in (p.pageprops || {}))) { page = p; break; }
  }
  if (!page) {
    const s = await get(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(terms[0])}&srlimit=1&format=json`, { json: true });
    if (!s) nulls++;
    const t = s?.query?.search?.[0]?.title;
    if (t) {
      const q = await get(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(t)}&redirects=1&prop=info|pageimages|extracts|pageprops&explaintext=1&inprop=url&piprop=original|name&format=json`, { json: true });
      const p = q && Object.values(q.query?.pages || {})[0];
      if (p && !('missing' in p) && p.extract) page = { ...p, viaSearch: true };
    }
  }
  if (!page) return nulls ? { __failed: true } : null;
  const ext = await get(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(page.title)}&prop=extlinks&ellimit=500&format=json`, { json: true });
  const links = Object.values(ext?.query?.pages || {})[0]?.extlinks?.map((l) => l['*']) || [];
  const cited = [...new Set(links.filter((u) => /pubmed\.ncbi|ncbi\.nlm\.nih\.gov\/pmc|doi\.org\/10\./.test(u)).map((u) => u.replace(/^\/\//, 'https://')))].slice(0, 40);
  // Split plain-text extract into sections
  const sections = [];
  let cur = { h: 'Lead', level: 1, text: '' };
  for (const line of page.extract.split('\n')) {
    const m = line.match(/^(=+)\s*(.+?)\s*=+$/);
    if (m) { sections.push(cur); cur = { h: m[2], level: m[1].length - 1, text: '' }; }
    else cur.text += line + '\n';
  }
  sections.push(cur);
  let image = null;
  if (page.original?.source) {
    image = { url: page.original.source.split('?')[0], width: page.original.width, height: page.original.height, file: page.pageimage,
      page: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(page.pageimage || '')}` };
  }
  return {
    title: page.title, url: page.fullurl, viaSearch: !!page.viaSearch, image, citedLinks: cited,
    sections: sections.filter((s) => s.text.trim() && !/^(References|External links|See also|Further reading|Notes|Sources|Bibliography)$/i.test(s.h))
      .map((s) => ({ h: s.h, level: s.level, text: s.text.trim() })),
  };
}

async function grokipedia(item, terms) {
  const known = first[item.name]?.grokipedia;
  const urls = [known, ...[item.name, ...terms].map((t) => `https://grokipedia.com/page/${encodeURIComponent(t.replace(/ /g, '_').replace(/^./, (c) => c.toUpperCase()))}`)].filter(Boolean);
  for (const u of [...new Set(urls)].slice(0, 3)) {
    const h = await get(u);
    if (!h) continue;
    const main = (h.match(/<article[\s\S]*?<\/article>/i) || h.match(/<main[\s\S]*?<\/main>/i) || [h])[0];
    const text = htmlToText(main);
    if (text.length < 500) continue;
    return { url: u, text: text.slice(0, 30000) };
  }
  return null;
}

async function pubmed(item, terms) {
  const ids = [];
  const t = terms.slice(0, 2).map((x) => `"${x}"[tiab]`).join(' OR ');
  const qs = [
    `(${t}) AND (review[pt] OR meta-analysis[pt] OR systematic[sb])`,
    `(${t}) AND (clinical trial[pt] OR randomized controlled trial[pt])`,
    `(${t})`,
  ];
  for (const q of qs) {
    const r = await get(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(q)}&retmax=6&sort=relevance&retmode=json`, { json: true });
    (r?.esearchresult?.idlist || []).forEach((id) => { if (!ids.includes(id)) ids.push(id); });
  }
  const list = ids.slice(0, 14);
  if (!list.length) return [];
  const s = await get(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${list.join(',')}&retmode=json`, { json: true });
  const abs = await get(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${list.slice(0, 8).join(',')}&rettype=abstract&retmode=xml`);
  const abstracts = {};
  if (abs) for (const art of abs.split(/<Pubmed(?:Book)?Article>/).slice(1)) {
    if (/^\s*<BookDocument>/.test(art)) continue;
    const pmid = (art.match(/<PMID[^>]*>(\d+)<\/PMID>/) || [])[1];
    const txt = [...art.matchAll(/<AbstractText([^>]*)>([\s\S]*?)<\/AbstractText>/g)].map((m) => {
      const label = (m[1].match(/Label="([^"]+)"/) || [])[1];
      return (label ? label + ': ' : '') + m[2].replace(/<[^>]+>/g, '');
    }).join(' ');
    if (pmid) abstracts[pmid] = txt.slice(0, 2500);
  }
  return list.map((id) => {
    const d = s?.result?.[id];
    if (!d) return null;
    // Skip reference-book records (LactMed, StatPearls, GeneReviews…) — not citable studies.
    if (d.booktitle || /LactMed|StatPearls|GeneReviews|Drugs and Lactation/i.test(d.source || '') || !(d.fulljournalname || d.source)) return null;
    const pmc = (d.articleids || []).find((a) => a.idtype === 'pmc')?.value;
    return {
      pmid: id, title: (d.title || '').replace(/<[^>]+>/g, ''), source: d.fulljournalname || d.source, year: Number((d.pubdate || '').slice(0, 4)) || null,
      types: d.pubtype || [], url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`, pmc: pmc ? `https://pmc.ncbi.nlm.nih.gov/articles/${pmc}/` : null,
      abstract: abstracts[id] || null,
    };
  }).filter(Boolean);
}

async function reddit(item, terms) {
  const subs = (SUBS[item.category] || ['LooksmaxingAdvice', 'Looksmaxx']).slice(0, 3);
  const seen = new Map();
  let calls = 0, fails = 0;
  for (const sub of subs) {
    for (const term of terms.slice(0, /looksmax/i.test(sub) ? 2 : 1)) {
      const r = await get(`https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=${sub}&title=${encodeURIComponent(term)}&limit=50`, { json: true });
      calls++; if (!r || !Array.isArray(r.data)) fails++;
      for (const p of r?.data || []) {
        if (seen.has(p.id) || p.removed_by_category || p.selftext === '[removed]') continue;
        seen.set(p.id, {
          id: p.id, sub: p.subreddit, title: p.title, score: p.score || 0, comments: p.num_comments || 0,
          year: new Date((p.created_utc || 0) * 1000).getUTCFullYear(),
          url: `https://www.reddit.com${p.permalink}`, text: (p.selftext || '').slice(0, 1200),
        });
      }
    }
  }
  if (calls && fails / calls > 0.5) return { __failed: true };
  const posts = [...seen.values()].sort((a, b) => (b.score + b.comments * 2) - (a.score + a.comments * 2)).slice(0, 18);
  // Top comments for the 3 biggest threads — this is where the real lore lives.
  for (const p of posts.slice(0, 3)) {
    const c = await get(`https://arctic-shift.photon-reddit.com/api/comments/search?link_id=${p.id}&limit=60`, { json: true });
    p.topComments = (c?.data || []).filter((x) => x.body && x.body.length > 40 && x.body !== '[deleted]' && x.body !== '[removed]')
      .sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 6).map((x) => ({ score: x.score, text: x.body.slice(0, 700) }));
  }
  return posts;
}

// Local copy of the looksmax.org thread index (built once by discover.mjs) — far faster than per-entry CDX queries.
let LMX_INDEX = null;
function lmxIndex() {
  if (LMX_INDEX) return LMX_INDEX;
  const tsv = join(root, 'research', 'discovery', 'looksmax-threads.tsv');
  const key = join(root, 'research', 'discovery', 'cdx-resume.key');
  if (!existsSync(tsv) || !existsSync(key) || readFileSync(key, 'utf8').trim() !== 'DONE') return null;
  LMX_INDEX = readFileSync(tsv, 'utf8').split('\n').filter(Boolean).map((l) => { const [id, sl, ts] = l.split('\t'); return { id: Number(id), slug: sl, ts: ts || '' }; });
  return LMX_INDEX;
}
async function looksmaxOrg(item, terms) {
  const pats = terms.map((t) => slug(t)).filter((s) => s.length >= 3);
  if (!pats.length) return [];
  const idx = lmxIndex();
  if (idx) {
    const rx = new RegExp(`(^|-)(${pats.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(-|$)`);
    const hits = idx.filter((t) => rx.test(t.slug)).map((t) => ({ url: `https://looksmax.org/threads/${t.slug}.${t.id}/`, ts: t.ts, id: t.id, title: t.slug.replace(/-/g, ' ') }));
    const list = hits.sort((a, b) => {
      const sa = pats.some((p) => a.title.startsWith(p.replace(/-/g, ' '))) ? 1 : 0;
      const sb = pats.some((p) => b.title.startsWith(p.replace(/-/g, ' '))) ? 1 : 0;
      return sb - sa || b.id - a.id;
    }).slice(0, 30);
    for (const t of list.slice(0, 3)) await fetchArchivedThread(t);
    return list;
  }
  const re = `.*(${pats.join('|')}).*`;
  const cdx = await get(`https://web.archive.org/cdx/search/cdx?url=looksmax.org/threads/&matchType=prefix&filter=original:${encodeURIComponent(re)}&filter=statuscode:200&collapse=urlkey&limit=400&fl=original,timestamp`);
  if (cdx === null || /Temporarily Offline/i.test(cdx)) return { __failed: true };
  const threads = new Map();
  for (const line of cdx.split('\n').filter(Boolean)) {
    const [orig, ts] = line.split(' ');
    const m = orig.match(/looksmax\.org\/threads\/([^/?#]+?)\.(\d+)\//);
    if (!m) continue;
    const base = `https://looksmax.org/threads/${m[1]}.${m[2]}/`;
    if (!threads.has(base) || threads.get(base).ts < ts) threads.set(base, { url: base, ts, id: Number(m[2]), title: m[1].replace(/-/g, ' ') });
  }
  // Prefer titles that start with / strongly feature the term, then newest.
  const list = [...threads.values()].sort((a, b) => {
    const sa = pats.some((p) => a.title.startsWith(p.replace(/-/g, ' '))) ? 1 : 0;
    const sb = pats.some((p) => b.title.startsWith(p.replace(/-/g, ' '))) ? 1 : 0;
    return sb - sa || b.id - a.id;
  }).slice(0, 25);
  // Pull archived first posts for the top 4 (the long "guides" and theories).
  for (const t of list.slice(0, 4)) await fetchArchivedThread(t);
  return list;
}
async function fetchArchivedThread(t) {
  const h = await get(`https://web.archive.org/web/${t.ts ? t.ts + 'id_' : '2id_'}/${t.url}`, { tries: 2 });
  t.archived = `https://web.archive.org/web/${t.ts || '2'}/${t.url}`;
  if (!h) return;
  const realTitle = (h.match(/<h1 class="p-title-value">([\s\S]*?)<\/h1>/) || [])[1];
  if (realTitle) t.title = htmlToText(realTitle);
  const posts = [...h.matchAll(/<div class="bbWrapper">([\s\S]*?)<\/div>\s*(?:<div class="js-selectToQuote|<\/div>\s*<\/article>|<div class="message-lastEdit|<\/article>)/g)].map((m) => htmlToText(m[1]));
  t.posts = posts.filter((p) => p.length > 60).slice(0, 4).map((p) => p.slice(0, 1800));
}

// Reddit via the official API (app-only OAuth, read-only). Needs REDDIT_CLIENT_ID/SECRET in .env.local.
let REDDIT_TOKEN = null, REDDIT_TOKEN_EXP = 0;
async function redditToken() {
  if (REDDIT_TOKEN && Date.now() < REDDIT_TOKEN_EXP) return REDDIT_TOKEN;
  const id = process.env.REDDIT_CLIENT_ID, secret = process.env.REDDIT_CLIENT_SECRET;
  if (!id || !secret) throw new Error('missing REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET in wiki/.env.local');
  const r = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST', body: 'grant_type=client_credentials',
    headers: { authorization: 'Basic ' + Buffer.from(id + ':' + secret).toString('base64'), 'content-type': 'application/x-www-form-urlencoded', 'user-agent': redditUA() },
  });
  if (!r.ok) throw new Error('reddit token ' + r.status);
  const j = await r.json();
  REDDIT_TOKEN = j.access_token; REDDIT_TOKEN_EXP = Date.now() + (j.expires_in - 60) * 1000;
  return REDDIT_TOKEN;
}
const redditUA = () => process.env.REDDIT_USER_AGENT || 'script:looksmax-wiki:1.0';
async function redditGet(path) {
  for (let i = 0; i < 4; i++) {
    await gate['oauth.reddit.com']();
    const r = await fetch('https://oauth.reddit.com' + path, { headers: { authorization: 'Bearer ' + (await redditToken()), 'user-agent': redditUA() }, signal: AbortSignal.timeout(30000) }).catch(() => null);
    if (r && r.ok) return r.json();
    if (r && r.status === 401) { REDDIT_TOKEN = null; continue; }
    await new Promise((s) => setTimeout(s, 5000 * (i + 1)));
  }
  return null;
}
async function redditOfficial(item, terms) {
  const subs = (SUBS[item.category] || ['LooksmaxingAdvice', 'Looksmaxx']).slice(0, 4);
  const seen = new Map();
  let calls = 0, fails = 0;
  for (const sub of subs) {
    for (const term of terms.slice(0, 2)) {
      const j = await redditGet(`/r/${sub}/search?q=${encodeURIComponent('"' + term + '"')}&restrict_sr=1&sort=relevance&t=all&limit=25&raw_json=1`);
      calls++; if (!j) { fails++; continue; }
      for (const c of j.data?.children || []) {
        const p = c.data;
        if (!p || seen.has(p.id) || p.removed_by_category || p.selftext === '[removed]' || p.over_18) continue;
        seen.set(p.id, { id: p.id, sub: p.subreddit, title: p.title, score: p.score || 0, comments: p.num_comments || 0,
          year: new Date((p.created_utc || 0) * 1000).getUTCFullYear(), url: `https://www.reddit.com${p.permalink}`, text: (p.selftext || '').slice(0, 1200) });
      }
    }
  }
  if (calls && fails / calls > 0.5) return { __failed: true };
  const posts = [...seen.values()].sort((a, b) => (b.score + b.comments * 2) - (a.score + a.comments * 2)).slice(0, 20);
  for (const p of posts.slice(0, 3)) {
    const j = await redditGet(`/comments/${p.id}?sort=top&limit=8&depth=1&raw_json=1`);
    const cs = (j && j[1]?.data?.children) || [];
    p.topComments = cs.map((c) => c.data).filter((c) => c && c.body && c.body.length > 40 && c.body !== '[deleted]' && c.body !== '[removed]')
      .slice(0, 6).map((c) => ({ score: c.score, text: c.body.slice(0, 700) }));
  }
  return posts;
}

// T Nation forums (Discourse JSON search — open, no bot wall). Strong on steroids, peptides, TRT, training.
async function tnation(item, terms) {
  const topics = new Map();
  let calls = 0, fails = 0;
  for (const term of terms.slice(0, 2)) {
    const r = await get(`https://t-nation.com/search.json?q=${encodeURIComponent(term)}`, { json: true });
    calls++; if (!r) { fails++; continue; }
    const blurbs = new Map();
    (r.posts || []).forEach((p) => { if (!blurbs.has(p.topic_id)) blurbs.set(p.topic_id, (p.blurb || '').replace(/\s+/g, ' ').slice(0, 400)); });
    for (const t of r.topics || []) {
      if (topics.has(t.id)) continue;
      topics.set(t.id, { id: t.id, title: t.title, url: `https://t-nation.com/t/${t.slug}/${t.id}`, posts: t.posts_count || 0,
        year: Number(String(t.created_at || '').slice(0, 4)) || null, blurb: blurbs.get(t.id) || '' });
    }
  }
  if (calls && fails === calls) return { __failed: true };
  return [...topics.values()].sort((a, b) => b.posts - a.posts).slice(0, 15);
}

// News coverage — GDELT DOC 2.0 API (open research API; asks for ≤1 request per 5 s).
async function gdelt(item, terms) {
  const q = terms.slice(0, 2).map((t) => (t.includes(' ') || t.includes('-') ? `"${t}"` : t)).join(' OR ');
  const r = await get(`https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(terms.length > 1 ? '(' + q + ')' : q)}%20sourcelang:english&mode=artlist&format=json&maxrecords=40&sort=hybridrel&startdatetime=20170102000000`, { json: true });
  if (!r) return { __failed: true };
  const words = terms.flatMap((t) => t.split(/[\s-]+/)).filter((w) => w.length > 3);
  const seen = new Set();
  return (r.articles || []).filter((a) => a.url && a.title && words.some((w) => a.title.toLowerCase().includes(w)))
    .filter((a) => { const k = a.title.toLowerCase().slice(0, 60); if (seen.has(k)) return false; seen.add(k); return true; })
    .slice(0, 20).map((a) => ({ title: a.title.replace(/\s+/g, ' ').trim(), url: a.url, site: a.domain, date: String(a.seendate || '').slice(0, 8) }));
}

// Hacker News (Algolia API) — stories and their comment counts.
async function hackernews(item, terms) {
  const out = new Map(); let calls = 0, fails = 0;
  for (const term of terms.slice(0, 2)) {
    const r = await get(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent('"' + term + '"')}&tags=story&hitsPerPage=20`, { json: true });
    calls++; if (!r) { fails++; continue; }
    for (const h of r.hits || []) if (h.title && !out.has(h.objectID) && h.title.toLowerCase().includes(term.split(' ')[0]))
      out.set(h.objectID, { title: h.title, url: `https://news.ycombinator.com/item?id=${h.objectID}`, link: h.url || null, points: h.points || 0, comments: h.num_comments || 0, year: Number(String(h.created_at).slice(0, 4)) || null });
  }
  if (calls && fails === calls) return { __failed: true };
  return [...out.values()].sort((a, b) => b.points + b.comments - a.points - a.comments).slice(0, 15);
}

// Lemmy (federated Reddit alternative) — lemmy.world search across all instances it knows.
async function lemmy(item, terms) {
  const out = new Map(); let calls = 0, fails = 0;
  for (const term of terms.slice(0, 2)) {
    const r = await get(`https://lemmy.world/api/v3/search?q=${encodeURIComponent(term)}&type_=Posts&sort=TopAll&limit=20&listing_type=All`, { json: true });
    calls++; if (!r) { fails++; continue; }
    for (const p of r.posts || []) {
      if (p.post?.nsfw || p.community?.nsfw || !p.post?.name || !p.post.name.toLowerCase().includes(term.split(' ')[0])) continue;
      out.set(p.post.ap_id, { title: p.post.name, url: p.post.ap_id, community: p.community?.name, score: p.counts?.score || 0, comments: p.counts?.comments || 0,
        year: Number(String(p.post.published).slice(0, 4)) || null, text: String(p.post.body || '').slice(0, 500) });
    }
  }
  if (calls && fails === calls) return { __failed: true };
  return [...out.values()].sort((a, b) => b.score + b.comments - a.score - a.comments).slice(0, 15);
}

// ───────── run ─────────
// --sources wiki,grok,pubmed,reddit,looksmax (default: all). Results merge into the
// existing raw file; a source is only re-fetched if it previously failed or is missing.
const SRC_ARG = process.argv.includes('--sources') ? process.argv[process.argv.indexOf('--sources') + 1].split(',') : ['wiki', 'grok', 'pubmed', 'reddit', 'looksmax'];
const CONC = Number(process.argv.includes('--conc') ? process.argv[process.argv.indexOf('--conc') + 1] : 5);
const FN = { news: ['news', gdelt], hn: ['hackernews', hackernews], lemmy: ['lemmy', lemmy], redditapi: ['reddit', redditOfficial], tnation: ['tnation', tnation], wiki: ['wikipedia', wikipedia], grok: ['grokipedia', grokipedia], pubmed: ['pubmed', pubmed], reddit: ['reddit', reddit], looksmax: ['looksmax', looksmaxOrg] };
const { allEntries } = await import('./entries.mjs');
let ENTRIES = allEntries().filter((e) => !ONLY || e.item.name === ONLY);
if (process.argv.includes('--reverse')) ENTRIES = ENTRIES.reverse();
if (process.argv.includes('--slow-wiki')) gate['en.wikipedia.org'] = throttle(2000);

let done = 0;
async function work(e) {
  const out = join(rawDir, slug(e.item.name) + '.json');
  const prev = existsSync(out) ? JSON.parse(readFileSync(out, 'utf8')) : { name: e.item.name, kind: e.kind, item: e.item, status: {} };
  prev.status = prev.status || {};
  const terms = termsFor(e.item);
  prev.terms = terms;
  const todo = SRC_ARG.filter((k) => FORCE || prev.status[k] !== 'ok');
  if (!todo.length) { done++; return; }
  const t0 = Date.now();
  await Promise.all(todo.map(async (k) => {
    const [field, fn] = FN[k];
    try {
      const v = await fn(e.item, terms);
      if (v && v.__failed) throw new Error('source unavailable');
      prev[field] = v; prev.status[k] = 'ok';
    } catch (x) { prev.status[k] = 'fail:' + String(x.message || x).slice(0, 80); }
  }));
  prev.scrapedAt = new Date().toISOString();
  // Re-read and merge only what this run fetched, so concurrent passes never clobber each other.
  let cur = {};
  try { cur = JSON.parse(readFileSync(out, 'utf8')); } catch {}
  const merged = { ...cur, name: prev.name, kind: prev.kind, item: prev.item, terms, scrapedAt: prev.scrapedAt, status: { ...(cur.status || {}) } };
  for (const k of todo) { merged[FN[k][0]] = prev[FN[k][0]]; merged.status[k] = prev.status[k]; }
  writeFileSync(out, JSON.stringify(merged, null, 1));
  done++;
  const c = (k, v) => `${k}:${prev.status[k] === 'ok' ? v : prev.status[k] ? 'FAIL' : '·'}`;
  console.log(`[${done}/${ENTRIES.length}] ${e.item.name} — ${c('wiki', prev.wikipedia?.title || '-')} ${c('grok', prev.grokipedia ? 'y' : '-')} ${c('pubmed', prev.pubmed?.length ?? 0)} ${c('reddit', prev.reddit?.length ?? 0)} ${c('looksmax', prev.looksmax?.length ?? 0)} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}
let idx = 0;
await Promise.all(Array.from({ length: CONC }, async () => { while (idx < ENTRIES.length) await work(ENTRIES[idx++]); }));
console.log('DONE', done);
