/* LOOKSMAX Wiki — tiny hash-routed static site. No build step, no deps. */
(function () {
  'use strict';

  const D = window.LM_DATA;
  const GUIDES = window.LM_GUIDES || [];
  const app = document.getElementById('app');

  // ───────── helpers ─────────
  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const EV_ORDER = ['strong', 'moderate', 'limited', 'unproven'];
  const evTag = (e) => `<span class="tag tag-${e}">${esc(D.evidenceMeta[e].label)}</span>`;

  // ───────── unified entries ─────────
  const ENTRIES = [
    ...D.compounds.map((item) => ({ kind: 'compound', item, slug: slug(item.name) })),
    ...D.gear.map((item) => ({ kind: 'gear', item, slug: slug(item.name) })),
  ];
  const byName = new Map(ENTRIES.map((e) => [e.item.name.toLowerCase(), e]));
  const bySlug = { compound: new Map(), gear: new Map() };
  ENTRIES.forEach((e) => bySlug[e.kind].set(e.slug, e));
  const guideBySlug = new Map(GUIDES.map((g) => [g.slug, g]));

  const catMeta = (kind) => (kind === 'compound' ? D.categoryMeta : D.gearCategoryMeta);
  const entryHref = (e) => `#/${e.kind}/${e.slug}`;
  const catHref = (kind, id) => `#/category/${kind}/${id}`;

  function structureUrl(q) {
    return `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(q)}/PNG?record_type=2d&image_size=large`;
  }

  const RESEARCH = window.LM_RESEARCH || {};
  const BUY_LINKS = window.LM_BUY_LINKS || {};
  const okLink = (u) => typeof u === 'string' && /^https?:\/\//.test(u.trim());

  // Port of looksmax/lib/affiliates.ts → buyActionFor, plus the wiki's
  // assets/buy-links.js "Buy now" slot (wins over everything except research chems).
  function buyActionFor(e) {
    const { item } = e;
    const A = D.affiliates;
    const slot = BUY_LINKS[item.name];
    if (e.kind === 'compound' && item.status === 'research') return null; // never sold, never linked
    if (e.kind === 'compound' && item.status === 'rx') {
      if (okLink(slot)) return { kind: 'telehealth', url: slot.trim(), label: 'Start online visit' };
      const p = A.rxPartners[item.name];
      if (p && p.url) return { kind: 'telehealth', url: p.url, label: `Online visit via ${p.partner}` };
      return null;
    }
    if (okLink(slot)) return { kind: 'direct', url: slot.trim(), label: 'Buy now' };
    if (item.buyLink) return { kind: 'direct', url: item.buyLink, label: 'Buy now' };
    if (A.noBuy.includes(item.name)) return null;
    const q = A.queryOverrides[item.name] ?? item.name;
    let url = `https://www.amazon.com/s?k=${encodeURIComponent(q)}`;
    if (A.amazonTag) url += `&tag=${encodeURIComponent(A.amazonTag)}`;
    return { kind: 'amazon', url, label: 'Find on Amazon' };
  }

  // ───────── wiki-link markup ─────────
  function resolveLink(target) {
    if (target.startsWith('guide:')) {
      const g = guideBySlug.get(target.slice(6));
      return g ? { href: `#/guide/${g.slug}`, label: g.title } : null;
    }
    if (target.startsWith('cat:')) {
      const id = target.slice(4);
      if (D.categoryMeta[id]) return { href: catHref('compound', id), label: D.categoryMeta[id].name };
      if (D.gearCategoryMeta[id]) return { href: catHref('gear', id), label: D.gearCategoryMeta[id].name };
      return null;
    }
    const e = byName.get(target.toLowerCase());
    return e ? { href: entryHref(e), label: e.item.name } : null;
  }
  function renderWiki(html) {
    return html.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, label) => {
      const r = resolveLink(target.trim());
      const text = esc(label || (r && r.label) || target);
      return r ? `<a class="wl" href="${r.href}">${text}</a>` : `<span class="wl red" title="No article yet">${text}</span>`;
    });
  }

  // Backlinks: which guides mention which entries
  const BACKLINKS = new Map();
  GUIDES.forEach((g) => {
    const body = g.sections.map((s) => s.body).join(' ');
    for (const m of body.matchAll(/\[\[([^\]|]+)/g)) {
      const e = byName.get(m[1].trim().toLowerCase());
      if (!e) continue;
      const k = e.kind + ':' + e.slug;
      if (!BACKLINKS.has(k)) BACKLINKS.set(k, new Set());
      BACKLINKS.get(k).add(g.slug);
    }
  });

  // ───────── shared bits ─────────
  function entryTags(e) {
    const { item } = e;
    let t = evTag(item.evidence);
    if (e.kind === 'compound' && item.status !== 'otc') t += `<span class="tag">${esc(D.statusMeta[item.status].label)}</span>`;
    if (e.kind === 'gear') {
      t += `<span class="tag ${item.outcome === 'unsupported' ? 'tag-unproven' : ''}">${esc(D.outcomeMeta[item.outcome].label)}</span>`;
      if (item.price) t += `<span class="tag tag-white">${esc(item.price)}</span>`;
    }
    return t;
  }
  function entryCard(e) {
    const { item } = e;
    return `<a class="entry" href="${entryHref(e)}">
      <div><h4>${esc(item.name)}</h4>${item.aka ? `<p class="aka">${esc(item.aka)}</p>` : ''}</div>
      <p>${esc(item.summary)}</p>
      <div class="tags">${entryTags(e)}</div>
    </a>`;
  }
  const crumbs = (parts) =>
    `<nav class="crumbs" aria-label="Breadcrumb">${parts
      .map((p, i) => (p[1] && i < parts.length - 1 ? `<a href="${p[1]}">${esc(p[0])}</a>` : `<span>${esc(p[0])}</span>`))
      .join('<span>/</span>')}</nav>`;
  const searchIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`;
  const disclaimer = `<p class="disclaimer">Education, not endorsement or medical advice. Rx = doctor territory. Research chems are not approved for human use.</p>`;

  function dailyPick() {
    const pool = ENTRIES.filter((e) => e.item.evidence === 'strong' || e.item.evidence === 'unproven');
    const day = Math.floor(Date.now() / 86400000);
    return pool[day % pool.length];
  }

  // ───────── pages ─────────
  function pageHome() {
    const pick = dailyPick();
    const nC = D.compounds.length, nG = D.gear.length;
    const strong = ENTRIES.filter((e) => e.item.evidence === 'strong').length;
    const unproven = ENTRIES.filter((e) => e.item.evidence === 'unproven').length;
    const tick = ENTRIES.filter((e) => e.item.evidence === 'unproven').slice(0, 14)
      .map((e) => `<span>${esc(e.item.name)}</span><span class="s">✕ unproven</span>`).join('');
    const portals = (kind) => {
      const list = kind === 'compound' ? D.compounds : D.gear;
      return Object.entries(catMeta(kind)).map(([id, m]) => {
        const n = list.filter((x) => x.category === id).length;
        return `<a class="portal" href="${catHref(kind, id)}"><span class="pt"><span class="pn">${esc(m.name)}</span><span class="pc">${n}</span></span><span class="pb">${esc(m.blurb)}</span></a>`;
      }).join('');
    };
    return `<div class="page stack">
      <section class="hero">
        <div>
          <span class="kicker">★ The evidence-first looksmaxxing encyclopedia</span>
          <h1 class="h-hero">Every claim.<br><span class="text-outline">Checked.</span> <span class="pop">Rated.</span></h1>
          <p class="lede" style="margin-top:24px">${ENTRIES.length} compounds and pieces of gear, rated by <span class="inkmark">actual evidence</span> — not marketing. Plus the guides that tell you what to do first.</p>
          <form class="big-search" data-search role="search">${searchIcon}<input name="q" placeholder="Search tretinoin, mewing, LED masks…" aria-label="Search the wiki" autocomplete="off"><button class="btn popb" type="submit">Search</button></form>
        </div>
        <div class="card stats">
          <div class="stat"><b>${nC}</b><span>Compounds</span></div>
          <div class="stat"><b>${nG}</b><span>Pieces of gear</span></div>
          <div class="stat"><b class="pop">${strong}</b><span>Strong evidence</span></div>
          <div class="stat"><b>${unproven}</b><span>Unproven claims</span></div>
        </div>
      </section>

      <div class="ticker" aria-hidden="true" style="margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw)"><div class="ticker-track">${tick}${tick}</div></div>

      <section>
        <h2 class="section-h">Start here <small>${GUIDES.length} guides</small></h2>
        <div class="guide-grid">${GUIDES.slice(0, 6).map((g, i) => guideCard(g, i === 0)).join('')}</div>
        <p style="margin-top:16px"><a class="btn" href="#/guides">All guides →</a></p>
      </section>

      <section class="hero" style="align-items:stretch">
        <div class="fact">
          <span class="kicker">★ Entry of the day</span>
          <h3><a href="${entryHref(pick)}">${esc(pick.item.name)}</a></h3>
          <p>${esc(pick.item.summary)}</p>
          <div class="tags">${entryTags(pick)}</div>
          <p style="margin-top:18px"><a class="btn popb" href="${entryHref(pick)}">Read the file →</a></p>
        </div>
        <div class="card" style="padding:20px">
          <span class="kicker">Evidence key</span>
          <div style="display:grid;gap:10px">
            ${EV_ORDER.map((e) => `<a class="chip" style="justify-content:space-between" href="#/index?ev=${e}">${evTag(e)}<span>${ENTRIES.filter((x) => x.item.evidence === e).length} entries →</span></a>`).join('')}
          </div>
          <p style="margin-top:14px;font-size:13px;font-weight:600"><a class="wl" href="#/guide/index-explained">How ratings work</a></p>
        </div>
      </section>

      <section>
        <h2 class="section-h">Compounds <small>${Object.keys(D.categoryMeta).length} categories</small></h2>
        <div class="portal-grid">${portals('compound')}</div>
      </section>
      <section>
        <h2 class="section-h">Gear <small>${Object.keys(D.gearCategoryMeta).length} categories</small></h2>
        <div class="portal-grid">${portals('gear')}</div>
      </section>
      ${disclaimer}
    </div>`;
  }

  function guideCard(g, feature) {
    return `<a class="guide-card${feature ? ' feature' : ''}" href="#/guide/${g.slug}"><span class="gk">${esc(g.kicker)}</span><span class="gt">${esc(g.title)}</span><span class="gs">${esc(g.summary)}</span></a>`;
  }

  function pageGuides() {
    return `<div class="page">
      ${crumbs([['Wiki', '#/'], ['Guides']])}
      <h1 class="h-page" style="margin-bottom:16px">The <span class="pop">Guides</span></h1>
      <p class="lede" style="margin-bottom:32px">Long-form articles: what to do, in what order, and what to ignore.</p>
      <div class="guide-grid">${GUIDES.map((g, i) => guideCard(g, i === 0)).join('')}</div>
    </div>`;
  }

  function pageGuide(s) {
    const g = guideBySlug.get(s);
    if (!g) return pageNotFound();
    const i = GUIDES.indexOf(g);
    const prev = GUIDES[i - 1], next = GUIDES[i + 1];
    const toc = g.sections.map((sec, n) => `<li><a href="#/guide/${g.slug}" data-jump="s${n}">${esc(sec.h)}</a></li>`).join('');
    return `<div class="page article">
      <aside class="side"><div class="toc"><div class="th">Contents</div><ol>${toc}</ol></div></aside>
      <article>
        ${crumbs([['Wiki', '#/'], ['Guides', '#/guides'], [g.title]])}
        <header class="art-head"><span class="kicker">${esc(g.kicker)}</span><h1 class="h-page">${esc(g.title)}</h1></header>
        <div class="prose">
          <p class="lead-sum">${esc(g.summary)}</p>
          ${g.sections.map((sec, n) => `<h2 id="s${n}">${esc(sec.h)}</h2>${wrapTables(renderWiki(sec.body))}`).join('')}
        </div>
        <div class="prevnext">
          ${prev ? `<a href="#/guide/${prev.slug}"><small>← Previous</small><b>${esc(prev.title)}</b></a>` : '<span></span>'}
          ${next ? `<a class="nx" href="#/guide/${next.slug}"><small>Next →</small><b>${esc(next.title)}</b></a>` : '<span></span>'}
        </div>
        ${disclaimer}
      </article>
    </div>`;
  }
  const wrapTables = (h) => h.replace(/<table class="wtable">([\s\S]*?)<\/table>/g, '<div class="wtable-wrap"><table class="wtable">$1</table></div>');

  function pageIndex(params) {
    const kind = params.get('kind') === 'gear' ? 'gear' : 'compound';
    const cat = params.get('cat') || 'all';
    const ev = EV_ORDER.includes(params.get('ev')) ? params.get('ev') : 'all';
    const q = (params.get('q') || '').trim().toLowerCase();
    const meta = catMeta(kind);
    const items = ENTRIES.filter((e) => {
      if (e.kind !== kind) return false;
      if (cat !== 'all' && e.item.category !== cat) return false;
      if (ev !== 'all' && e.item.evidence !== ev) return false;
      if (!q) return true;
      return [e.item.name, e.item.aka || '', e.item.summary, e.item.note || ''].join(' ').toLowerCase().includes(q);
    });
    const link = (over) => {
      const p = new URLSearchParams({ kind, cat, ev, q: params.get('q') || '', ...over });
      [...p.keys()].forEach((k) => { if (!p.get(k) || p.get(k) === 'all') p.delete(k); });
      if (p.get('kind') === 'compound') p.delete('kind');
      const s = p.toString();
      return '#/index' + (s ? '?' + s : '');
    };
    const evClass = (e) => ({ strong: 'on', moderate: 'on', limited: 'on', unproven: 'on-pop' }[e]);
    const blurb = cat !== 'all' && meta[cat] ? meta[cat].blurb : null;
    return `<div class="page stack" style="--gap:32px">
      <div>
        ${crumbs([['Wiki', '#/'], ['The Index']])}
        <h1 class="h-page" style="margin-bottom:16px">The <span class="pop">Index</span></h1>
        <p class="lede">Every compound and every piece of gear in the looksmaxxing universe — rated by actual evidence, not marketing. Click anything for the full file.</p>
      </div>
      <div style="display:grid;gap:24px">
        <div class="card filters">
          <div class="kind-tabs">
            <a href="${link({ kind: 'compound', cat: 'all' })}" class="${kind === 'compound' ? 'on' : ''}">Compounds <span class="n">(${D.compounds.length})</span></a>
            <a href="${link({ kind: 'gear', cat: 'all' })}" class="${kind === 'gear' ? 'on' : ''}">Gear <span class="n">(${D.gear.length})</span></a>
          </div>
          <form class="f-search" data-index-search>${searchIcon}<input name="q" value="${esc(params.get('q') || '')}" placeholder="${kind === 'compound' ? 'Search compounds, mechanisms…' : 'Search gear, devices…'}" aria-label="Filter the Index" autocomplete="off">${q ? `<a class="clear" href="${link({ q: '' })}">Clear</a>` : ''}</form>
          <div class="f-row cats">
            <a class="chip ${cat === 'all' ? 'on' : ''}" href="${link({ cat: 'all' })}">All</a>
            ${Object.entries(meta).map(([id, m]) => `<a class="chip ${cat === id ? 'on-pop' : ''}" href="${link({ cat: cat === id ? 'all' : id })}">${esc(m.name)}</a>`).join('')}
          </div>
          <div class="f-row ev">
            <div class="chips">
              <a class="chip ${ev === 'all' ? 'on' : ''}" href="${link({ ev: 'all' })}">All evidence</a>
              ${EV_ORDER.map((e) => `<a class="chip ${ev === e ? evClass(e) : ''}" href="${link({ ev: ev === e ? 'all' : e })}">${esc(D.evidenceMeta[e].label)}</a>`).join('')}
            </div>
            <span class="count">${items.length} <small>results</small></span>
          </div>
        </div>
        ${blurb ? `<div><p class="blurb-bar">${esc(blurb)}</p></div>` : ''}
        <div class="grid">${items.map(entryCard).join('')}</div>
        ${items.length ? '' : '<p class="empty">Nothing matches. Loosen the filters.</p>'}
      </div>
      ${disclaimer}
    </div>`;
  }

  // ───────── entry article (Wikipedia-style) ─────────
  // Quick take (default) vs In-depth — remembered per viewer.
  let VIEW = 'quick'; // set by the router: #/<kind>/<slug> = quick take, #/<kind>/<slug>/deep = in-depth
  const DETAIL = new Map(); // slug → loaded data/entries/<slug>.json (or 'error')
  function loadDetail(s) {
    if (DETAIL.has(s)) return Promise.resolve(DETAIL.get(s));
    return fetch(`data/entries/${s}.json`).then((r) => (r.ok ? r.json() : null)).catch(() => null)
      .then((d) => { DETAIL.set(s, d || 'error'); return DETAIL.get(s); });
  }
  const VERDICT = { supported: ['Supported', 'tag-strong'], mixed: ['Mixed', 'tag-moderate'], unsupported: ['Unsupported', 'tag-unproven'], dangerous: ['Dangerous', 'tag-unproven'], unknown: ['Unknown', 'tag-limited'] };

  function pageEntry(kind, s, view) {
    VIEW = view === 'deep' ? 'deep' : 'quick';
    const e = bySlug[kind] && bySlug[kind].get(s);
    if (!e) return pageNotFound();
    const { item } = e;
    const X = DETAIL.get(e.slug);
    const loading = X === undefined;
    let R = X && X !== 'error' ? X : { lead: [], sections: [], refs: [], studies: [], reddit: [], forums: [], infobox: [], timeline: [] };
    const hasDeep = !!R.deep;
    const deepView = VIEW === 'deep' && hasDeep;
    if (!deepView) {
      // Quick take: the short write-up, trimmed lists, no citations/lore/timeline.
      const c = R.casual || {};
      R = { ...R, lead: c.lead || (hasDeep ? [] : R.lead), sections: c.sections || (hasDeep ? [] : R.sections), timeline: [], lore: null, infobox: [], refs: [] };
    }
    const meta = catMeta(kind)[item.category];
    const siblings = ENTRIES.filter((x) => x.kind === kind && x.item.category === item.category);
    const idx = siblings.indexOf(e);
    const prev = siblings[idx - 1], next = siblings[idx + 1];
    const related = siblings.filter((x) => x !== e)
      .sort((a, b) => D.evidenceMeta[a.item.evidence].rank - D.evidenceMeta[b.item.evidence].rank).slice(0, 6);
    const back = [...(BACKLINKS.get(kind + ':' + e.slug) || [])].map((g) => guideBySlug.get(g));
    const here = `#/${kind}/${e.slug}${VIEW === 'deep' ? '/deep' : ''}`;
    // Escaped prose with [n] → superscript citation links
    const cite = (t) => esc(t).replace(/\[(\d+)\]/g, (m, n) => (R.refs[n - 1] ? `<sup class="ref"><a href="${here}" data-jump="ref-${n}" title="${esc(R.refs[n - 1].title)}">[${n}]</a></sup>` : ''));
    const P = (arr) => (arr || []).map((p) => `<p>${cite(p)}</p>`).join('');

    // ── Infobox image (top of the box, like Wikipedia)
    let visual;
    if (R.image) {
      visual = `<div class="ib-img"><img src="${esc(R.image.url)}" alt="${esc(item.name)}" loading="lazy" data-photo></div><p class="ib-cap">${esc(R.image.caption || item.name)}${R.image.credit ? ` · <a href="${esc(R.image.credit)}" target="_blank" rel="noopener">${esc(R.image.source || 'Wikimedia Commons')}</a>` : ''}</p>`;
    } else if (kind === 'compound' && item.structure) {
      visual = `<div class="ib-img"><img src="${structureUrl(item.structure)}" alt="${esc(item.name)} chemical structure" loading="lazy" data-structure></div><p class="ib-cap">2D structure · PubChem</p>`;
    } else {
      visual = `<div class="ib-img"><div class="ph"><b>★</b>${kind === 'compound' ? 'No 2D structure<br>(biologic, blend, or too big to draw)' : 'No photo yet'}</div></div>`;
    }

    // ── Buy now slot
    const buy = buyActionFor(e);
    let action;
    if (buy && buy.kind === 'telehealth') action = `<a class="btn popb lg block" href="${esc(buy.url)}" target="_blank" rel="noopener noreferrer sponsored">${esc(buy.label)} ↗</a><p class="fine">℞ A licensed provider decides if it's right for you</p>`;
    else if (kind === 'compound' && item.status === 'rx') action = `<div class="statusbox cream"><b>℞ Prescription only</b><span>This one goes through a doctor, not a cart.</span></div>`;
    else if (kind === 'compound' && item.status === 'research') action = `<div class="statusbox dark"><b>⚠ Research compound</b><span>Not approved for human use. We don't sell it.</span></div>`;
    else if (buy) { const price = kind === 'gear' ? item.price : null; action = `<a class="btn popb lg block" href="${esc(buy.url)}" target="_blank" rel="noopener noreferrer sponsored">${esc(price ? `${buy.label} · ${price}` : buy.label)} ↗</a><p class="fine">${buy.kind === 'amazon' ? 'Amazon search · may earn a commission' : 'May earn a commission · not an endorsement'}</p>`; }
    else action = `<div class="statusbox"><b>Sourced in person</b><span>No link for this one.</span></div>`;

    // ── Infobox rows, grouped like Wikipedia
    const row = (k, v, raw) => `<tr><th>${esc(k)}</th><td>${raw ? v : cite(v)}</td></tr>`;
    const group = (h, rows) => (rows.length ? `<tr class="ib-h"><th colspan="2">${esc(h)}</th></tr>${rows.join('')}` : '');
    const basics = [row('Type', kind === 'compound' ? 'Compound' : 'Gear'), row('Category', `<a href="${catHref(kind, item.category)}">${esc(meta.name)}</a>`, true)];
    if (item.aka) basics.push(row('Also known as', item.aka));
    if (kind === 'gear' && item.price) basics.push(row('Street price', item.price));
    const rating = [row('Evidence', evTag(item.evidence), true),
      kind === 'compound' ? row('Status', esc(D.statusMeta[item.status].label), true) : row('Outcome', esc(D.outcomeMeta[item.outcome].label), true)];
    if (R.studies.length) rating.push(row('Studies indexed', String(R.studies.length)));
    if (R.reddit.length + R.forums.length) rating.push(row('Forum threads', String(R.reddit.length + R.forums.length)));
    const details = R.infobox.map(([k, v]) => row(k, v));
    const links = [];
    if (R.wikipedia) links.push(row('Wikipedia', `<a href="${esc(R.wikipedia.url)}" target="_blank" rel="noopener">${esc(R.wikipedia.title)} ↗</a>`, true));
    if (R.grokipedia) links.push(row('Grokipedia', `<a href="${esc(R.grokipedia)}" target="_blank" rel="noopener">Article ↗</a>`, true));
    const infobox = `<aside class="infobox wp-box">
      <div class="ib-title">${esc(item.name)}</div>
      ${visual}
      <table>${group('Overview', basics)}${group(kind === 'compound' ? 'Clinical & chemical data' : 'Details', details)}${group('LOOKSMAX rating', rating)}${group('Sources', links)}</table>
      <div class="act"><span class="kicker" style="margin-bottom:8px">Buy now</span>${action}</div>
    </aside>`;

    // ── Body sections
    const outcomeLine = kind === 'gear'
      ? { durable: 'The result is a lasting change — it sticks after you stop.', temporary: 'The effect lasts only while you keep using it.', unsupported: 'The structural claim this is usually sold on has no supporting evidence.' }[item.outcome]
      : { otc: 'Available over the counter as a supplement or cosmetic.', rx: 'Prescription only — this goes through a doctor.', research: 'A research compound, not approved for human use. Documented here so you know what it is, not as a recommendation.' }[item.status];
    const evLine = { strong: 'Multiple good human trials or clinical consensus support it for this use.', moderate: 'There is some decent human data; expect a real but modest effect.', limited: 'Evidence is small, early, or mostly from lab and animal work.', unproven: 'There is no meaningful human evidence for the appearance claim.' }[item.evidence];

    const S = []; // [id, title, html, level]
    (R.sections || []).forEach((sec, i) => {
      const id = 'sec-' + i;
      S.push([id, sec.h, P(sec.paras) + (sec.subs || []).map((sub, j) => `<h3 id="${id}-${j}">${esc(sub.h)}</h3>${P(sub.paras)}`).join(''), sec.subs || []]);
    });
    if (R.timeline && R.timeline.length) S.push(['timeline', 'Timeline', `<ol class="timeline">${R.timeline.map((t) => `<li><b>${esc(t.year)}</b><span>${cite(t.event)}</span></li>`).join('')}</ol>`]);
    S.push(['rating', 'LOOKSMAX evidence rating', `<p>Rated ${evTag(item.evidence)} for its appearance use. ${evLine} <a href="#/guide/index-explained">How ratings work</a>.</p><p><b>${kind === 'gear' ? 'Outcome' : 'Status'}:</b> ${esc(outcomeLine)}</p>${item.note ? `<p class="warn">⚠ ${esc(item.note)}</p>` : ''}`]);
    if (R.lore) S.push(['lore', 'Forum lore & theories', `${R.lore.intro ? `<p>${cite(R.lore.intro)}</p>` : ''}<div class="lore">${R.lore.claims.map((c) => `<div class="lore-row"><span class="tag ${VERDICT[c.verdict][1]}">${VERDICT[c.verdict][0]}</span><div><b>“${cite(c.claim)}”</b><p>${cite(c.note)}</p></div></div>`).join('')}</div><p class="mute" style="font-size:12px">Forum claims are collected so you know what's out there — the verdict is ours, based on the sources above.</p>`]);
    S.push(['research', 'Research', R.studies.length
      ? `<ul class="linklist">${R.studies.map((r) => `<li><a href="${esc(r.url)}" target="_blank" rel="noopener"><b>${esc(r.title)}</b><span>${esc([r.kind, r.source, r.year].filter(Boolean).join(' · '))} ↗</span></a></li>`).join('')}</ul>`
      : `<p class="mute">${loading ? 'Loading…' : 'No studies indexed yet.'} <a href="https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(item.name)}" target="_blank" rel="noopener">Search PubMed ↗</a></p>`]);
    const reddit = R.reddit.map((r) => `<li><a href="${esc(r.url)}" target="_blank" rel="noopener"><b>${esc(r.title)}</b><span>r/${esc(r.sub)} · ▲ ${r.score} · ${r.comments} comments${r.year ? ' · ' + r.year : ''} ↗</span></a></li>`).join('');
    const forums = R.forums.map((r) => `<li><a href="${esc(r.url)}" target="_blank" rel="noopener"><b>${esc(r.title)}</b><span>${esc(r.site || '')} ↗</span></a>${r.archived ? `<a class="arch" href="${esc(r.archived)}" target="_blank" rel="noopener">archived copy</a>` : ''}</li>`).join('');
    S.push(['community', 'Community discussion', (reddit || forums)
      ? `${reddit ? `<h3>Reddit</h3><ul class="linklist forum">${reddit}</ul>` : ''}${forums ? `<h3>Forums</h3><ul class="linklist forum">${forums}</ul>` : ''}<p class="mute" style="font-size:12px">Forum posts are anecdotes, not evidence.</p>`
      : `<p class="mute">${loading ? 'Loading…' : 'No threads indexed yet.'} <a href="https://www.reddit.com/search/?q=${encodeURIComponent(item.name)}" target="_blank" rel="noopener">Search Reddit ↗</a></p>`]);
    S.push(['where', 'Where to buy', `<div class="buyslot">${action}</div>`]);
    if (related.length) S.push(['see-also', 'See also', `<div class="grid">${related.map(entryCard).join('')}</div>${back.length ? `<p class="backlinks" style="margin-top:14px">Mentioned in: ${back.map((g) => `<a href="#/guide/${g.slug}">${esc(g.title)}</a>`).join(', ')}</p>` : ''}`]);
    if (R.refs.length) S.push(['references', 'References', `<ol class="refs">${R.refs.map((r, i) => `<li id="ref-${i + 1}"><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.title)}</a>${r.source ? `. <i>${esc(r.source)}</i>` : ''}${r.year ? ` (${r.year})` : ''}.</li>`).join('')}</ol>`]);
    const ext = [
      R.wikipedia && `<li><a href="${esc(R.wikipedia.url)}" target="_blank" rel="noopener">${esc(R.wikipedia.title)}</a> on Wikipedia</li>`,
      R.grokipedia && `<li><a href="${esc(R.grokipedia)}" target="_blank" rel="noopener">${esc(item.name)}</a> on Grokipedia</li>`,
      `<li><a href="https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(item.name)}" target="_blank" rel="noopener">PubMed search</a></li>`,
    ].filter(Boolean).join('');
    S.push(['external', 'External links', `<ul>${ext}</ul>`]);

    const toc = S.map(([id, h, , subs]) => `<li><a href="${here}" data-jump="${id}">${esc(h)}</a>${subs && subs.length ? `<ol class="toc-sub">${subs.map((sub, j) => `<li><a href="${here}" data-jump="${id}-${j}">${esc(sub.h)}</a></li>`).join('')}</ol>` : ''}</li>`).join('');
    const leadParas = R.lead.map((p) => `<p>${cite(p)}</p>`).join('');

    return `<div class="page article">
      <aside class="side"><div class="toc"><div class="th">Contents</div><ol>${toc}</ol></div></aside>
      <article>
        ${crumbs([['Wiki', '#/'], ['The Index', kind === 'gear' ? '#/index?kind=gear' : '#/index'], [meta.name, catHref(kind, item.category)], [item.name]])}
        <header class="art-head">
          <span class="kicker">★ ${kind === 'compound' ? 'Compound file' : 'Gear file'}</span>
          <h1 class="h-page">${esc(item.name)}</h1>
          <p class="from">From LOOKSMAX Wiki, the evidence-first looksmaxxing encyclopedia</p>
          <div class="viewtoggle" role="tablist" aria-label="Article length">
            <a role="tab" href="#/${kind}/${e.slug}" aria-selected="${VIEW !== 'deep'}" class="${VIEW === 'deep' ? '' : 'on'}">Quick take</a>
            <a role="tab" href="#/${kind}/${e.slug}/deep" aria-selected="${VIEW === 'deep'}" class="${VIEW === 'deep' ? 'on' : ''}">In-depth${hasDeep || loading ? '' : ' <small>soon</small>'}</a>
          </div>
          ${VIEW === 'deep' && !hasDeep && !loading ? '<p class="callout" style="margin-top:14px">The full in-depth article for this entry is still being written — here is the quick take for now.</p>' : ''}
        </header>
        <div class="prose wp">
          ${infobox}
          <p class="lead-sum"><b>${esc(item.name)}</b>${item.aka ? ` (also <i>${esc(item.aka)}</i>)` : ''} — ${esc(item.summary)}</p>
          ${leadParas}
          ${S.map(([id, h, body]) => `<h2 id="${id}">${esc(h)}</h2>${body}`).join('')}
        </div>
        <div class="prevnext">
          ${prev ? `<a href="${entryHref(prev)}"><small>← Previous in ${esc(meta.name)}</small><b>${esc(prev.item.name)}</b></a>` : '<span></span>'}
          ${next ? `<a class="nx" href="${entryHref(next)}"><small>Next →</small><b>${esc(next.item.name)}</b></a>` : '<span></span>'}
        </div>
        <div class="catbox"><span>Categories:</span><a class="chip" href="${catHref(kind, item.category)}">${esc(meta.name)}</a><a class="chip" href="#/index?${kind === 'gear' ? 'kind=gear&' : ''}ev=${item.evidence}">${esc(D.evidenceMeta[item.evidence].label)} evidence</a>${kind === 'compound' ? `<a class="chip" href="#/index">Compounds</a>` : `<a class="chip" href="#/index?kind=gear">Gear</a>`}</div>
        ${disclaimer}
      </article>
    </div>`;
  }

  function pageCategory(kind, id) {
    const meta = catMeta(kind)[id];
    if (!meta) return pageNotFound();
    const list = ENTRIES.filter((e) => e.kind === kind && e.item.category === id);
    const groups = EV_ORDER.map((ev) => [ev, list.filter((e) => e.item.evidence === ev)]).filter(([, l]) => l.length);
    const others = Object.entries(catMeta(kind)).filter(([k]) => k !== id);
    return `<div class="page">
      ${crumbs([['Wiki', '#/'], ['The Index', kind === 'gear' ? '#/index?kind=gear' : '#/index'], [meta.name]])}
      <span class="kicker">★ ${kind === 'compound' ? 'Compound' : 'Gear'} category · ${list.length} entries</span>
      <h1 class="h-page" style="margin-bottom:16px">${esc(meta.name)}</h1>
      <p class="blurb-bar" style="margin-bottom:40px">${esc(meta.blurb)}</p>
      <div class="stack">
        ${groups.map(([ev, l]) => `<section><h2 class="section-h">${evTag(ev)} ${esc(D.evidenceMeta[ev].label)} evidence <small>${l.length}</small></h2><div class="grid">${l.map(entryCard).join('')}</div></section>`).join('')}
        <section><h2 class="section-h">Other ${kind === 'compound' ? 'compound' : 'gear'} categories</h2><div class="f-row" style="padding:0">${others.map(([k, m]) => `<a class="chip" href="${catHref(kind, k)}">${esc(m.name)}</a>`).join('')}</div></section>
      </div>
      ${disclaimer}
    </div>`;
  }

  function pageAZ() {
    const all = [
      ...ENTRIES.map((e) => ({ name: e.item.name, href: entryHref(e), k: e.kind })),
      ...GUIDES.map((g) => ({ name: g.title, href: `#/guide/${g.slug}`, k: 'guide' })),
    ].sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
    const groups = new Map();
    all.forEach((x) => {
      const ch = /[a-z]/i.test(x.name[0]) ? x.name[0].toUpperCase() : '#';
      if (!groups.has(ch)) groups.set(ch, []);
      groups.get(ch).push(x);
    });
    const keys = [...groups.keys()].sort((a, b) => (a === '#' ? -1 : b === '#' ? 1 : a.localeCompare(b)));
    return `<div class="page">
      ${crumbs([['Wiki', '#/'], ['A–Z']])}
      <h1 class="h-page" style="margin-bottom:16px">All <span class="pop">articles</span></h1>
      <p class="lede" style="margin-bottom:24px">${all.length} articles, alphabetically.</p>
      <div class="az-jump">${keys.map((k) => `<a href="#/az" data-jump="az-${k === '#' ? 'num' : k}">${k}</a>`).join('')}</div>
      ${keys.map((k) => `<section class="az-group" id="az-${k === '#' ? 'num' : k}"><h3>${k}</h3><div class="az-list">${groups.get(k).map((x) => `<a href="${x.href}"><span>${esc(x.name)}</span><span class="k">${x.k}</span></a>`).join('')}</div></section>`).join('')}
    </div>`;
  }

  function pageSearch(params) {
    const raw = (params.get('q') || '').trim();
    const q = raw.toLowerCase();
    const score = (name, aka, rest) => {
      const n = name.toLowerCase();
      if (n === q) return 100;
      if (n.startsWith(q)) return 80;
      if (n.includes(q)) return 60;
      if ((aka || '').toLowerCase().includes(q)) return 50;
      if (rest.toLowerCase().includes(q)) return 20;
      return 0;
    };
    const guides = q ? GUIDES.map((g) => ({ g, s: score(g.title, '', g.summary + ' ' + g.sections.map((x) => x.h + ' ' + x.body).join(' ')) })).filter((x) => x.s).sort((a, b) => b.s - a.s) : [];
    const entries = q ? ENTRIES.map((e) => ({ e, s: score(e.item.name, e.item.aka, e.item.summary + ' ' + (e.item.note || '')) })).filter((x) => x.s).sort((a, b) => b.s - a.s || a.e.item.name.localeCompare(b.e.item.name)) : [];
    const total = guides.length + entries.length;
    return `<div class="page">
      ${crumbs([['Wiki', '#/'], ['Search']])}
      <h1 class="h-page" style="margin-bottom:8px">Search</h1>
      <form class="big-search" data-search role="search" style="margin-bottom:32px">${searchIcon}<input name="q" value="${esc(raw)}" placeholder="Search the wiki…" aria-label="Search the wiki" autocomplete="off"><button class="btn popb" type="submit">Search</button></form>
      ${q ? `<p class="count" style="margin-bottom:24px">${total} <small>results for “${esc(raw)}”</small></p>` : ''}
      <div class="stack">
        ${guides.length ? `<section><h2 class="section-h">Guides <small>${guides.length}</small></h2><div class="guide-grid">${guides.map((x) => guideCard(x.g)).join('')}</div></section>` : ''}
        ${entries.length ? `<section><h2 class="section-h">Index entries <small>${entries.length}</small></h2><div class="grid">${entries.map((x) => entryCard(x.e)).join('')}</div></section>` : ''}
        ${q && !total ? `<p class="empty">Nothing matches “${esc(raw)}”. Try the <a class="wl" href="#/az">A–Z</a>.</p>` : ''}
      </div>
    </div>`;
  }

  function pageNotFound() {
    return `<div class="page" style="padding:40px 0">
      <span class="kicker">404</span>
      <h1 class="h-page" style="margin-bottom:16px">No <span class="pop">article</span> here.</h1>
      <p class="lede" style="margin-bottom:24px">That page doesn't exist yet.</p>
      <a class="btn popb lg" href="#/">Back to the wiki</a>
    </div>`;
  }

  // ───────── footer ─────────
  document.getElementById('foot').innerHTML = `
    <div><h5>Wiki</h5><a href="#/">Home</a><a href="#/index">The Index</a><a href="#/guides">Guides</a><a href="#/az">A–Z</a><a href="#/random">Random article</a></div>
    <div><h5>Guides</h5>${GUIDES.slice(0, 5).map((g) => `<a href="#/guide/${g.slug}">${esc(g.title)}</a>`).join('')}</div>
    <div><h5>Compounds</h5>${Object.entries(D.categoryMeta).slice(0, 5).map(([k, m]) => `<a href="${catHref('compound', k)}">${esc(m.name)}</a>`).join('')}</div>
    <div><h5>Gear</h5>${Object.entries(D.gearCategoryMeta).slice(0, 5).map(([k, m]) => `<a href="${catHref('gear', k)}">${esc(m.name)}</a>`).join('')}</div>`;
  document.getElementById('yr').textContent = new Date().getFullYear();

  // ───────── router ─────────
  function route() {
    const h = location.hash.replace(/^#\/?/, '');
    const [path, qs] = h.split('?');
    const params = new URLSearchParams(qs || '');
    const seg = path.split('/').filter(Boolean).map(decodeURIComponent);
    let html, title = 'LOOKSMAX Wiki', nav = '';

    if (seg[0] === 'random') {
      const all = [...ENTRIES.map(entryHref), ...GUIDES.map((g) => `#/guide/${g.slug}`)];
      location.replace(all[Math.floor(Math.random() * all.length)]);
      return;
    }
    switch (seg[0]) {
      case undefined: html = pageHome(); break;
      case 'index': html = pageIndex(params); title = 'The Index'; nav = 'index'; break;
      case 'guides': html = pageGuides(); title = 'Guides'; nav = 'guides'; break;
      case 'guide': { const g = guideBySlug.get(seg[1]); html = pageGuide(seg[1]); title = g ? g.title : 'Not found'; nav = 'guides'; break; }
      case 'compound':
      case 'gear': {
        const e = bySlug[seg[0]].get(seg[1]); html = pageEntry(seg[0], seg[1], seg[2]); title = e ? e.item.name + (seg[2] === 'deep' ? ' (in-depth)' : '') : 'Not found'; nav = 'index';
        if (e && !DETAIL.has(e.slug)) {
          const want = location.hash;
          loadDetail(e.slug).then(() => { if (location.hash === want) { keepScroll = true; route(); } });
        }
        break;
      }
      case 'category': { const m = catMeta(seg[1] === 'gear' ? 'gear' : 'compound')[seg[2]]; html = pageCategory(seg[1] === 'gear' ? 'gear' : 'compound', seg[2]); title = m ? m.name : 'Not found'; nav = 'index'; break; }
      case 'az': html = pageAZ(); title = 'A–Z'; nav = 'az'; break;
      case 'search': html = pageSearch(params); title = 'Search'; break;
      default: html = pageNotFound(); title = 'Not found';
    }
    app.innerHTML = html;
    document.title = title === 'LOOKSMAX Wiki' ? 'LOOKSMAX Wiki — The evidence-first looksmaxxing encyclopedia' : `${title} — LOOKSMAX Wiki`;
    document.querySelectorAll('[data-nav]').forEach((a) => (a.dataset.nav === nav ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
    closeMenu();
    if (!keepScroll) window.scrollTo(0, 0);
    keepScroll = false;

    app.querySelectorAll('img[data-structure]').forEach((img) =>
      img.addEventListener('error', () => {
        img.parentElement.innerHTML = '<div class="ph"><b>★</b>No 2D structure<br>(biologic, blend, or too big to draw)</div>';
        const cap = app.querySelector('.infobox .cap');
        if (cap) cap.remove();
      })
    );
    app.querySelectorAll('img[data-photo]').forEach((img) =>
      img.addEventListener('error', () => {
        img.parentElement.innerHTML = '<div class="ph"><b>★</b>Product shot coming soon</div>';
        const cap = app.querySelector('.infobox .cap');
        if (cap) cap.remove();
      })
    );
  }
  let keepScroll = false;

  // Global search forms
  document.addEventListener('submit', (ev) => {
    const f = ev.target;
    if (f.matches('[data-search]')) {
      ev.preventDefault();
      const q = f.q.value.trim();
      if (q) location.hash = '#/search?q=' + encodeURIComponent(q);
    }
    if (f.matches('[data-index-search]')) ev.preventDefault();
  });
  // Live filter on the Index search input (keeps focus)
  let t;
  document.addEventListener('input', (ev) => {
    const f = ev.target.form;
    if (!f || !f.matches('[data-index-search]')) return;
    clearTimeout(t);
    t = setTimeout(() => {
      const p = new URLSearchParams(location.hash.split('?')[1] || '');
      const v = ev.target.value;
      v ? p.set('q', v) : p.delete('q');
      const s = p.toString();
      const pos = ev.target.selectionStart;
      keepScroll = true;
      history.replaceState(null, '', '#/index' + (s ? '?' + s : ''));
      route();
      const inp = app.querySelector('[data-index-search] input');
      if (inp) { inp.focus(); inp.setSelectionRange(pos, pos); }
    }, 120);
  });
  // In-page jumps (TOC, A–Z) without breaking the hash router
  document.addEventListener('click', (ev) => {
    const a = ev.target.closest('[data-jump]');
    if (!a) return;
    ev.preventDefault();
    const el = document.getElementById(a.dataset.jump);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  // Mobile menu
  const menuBtn = document.querySelector('[data-menu]');
  const mnav = document.getElementById('mnav');
  function closeMenu() { mnav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
  menuBtn.addEventListener('click', () => {
    const open = mnav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  // "/" focuses search
  document.addEventListener('keydown', (ev) => {
    if (ev.key === '/' && !/input|textarea/i.test(document.activeElement.tagName)) {
      const inp = document.querySelector('.hsearch input');
      if (inp && inp.offsetParent) { ev.preventDefault(); inp.focus(); }
    }
  });

  window.addEventListener('hashchange', route);
  route();
})();
