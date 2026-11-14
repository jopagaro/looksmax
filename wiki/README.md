# LOOKSMAX Wiki

A standalone, evidence-first looksmaxxing wiki in the same neo-brutalist style as the LOOKSMAX app.
Plain HTML/CSS/JS — no build step, no dependencies. Every Index entry gets a Wikipedia-style article.

## Run it

    python3 -m http.server 4173 --directory wiki     # then open http://localhost:4173

## Files

| Path | What it is |
| --- | --- |
| `index.html` | Shell: header, footer, script tags |
| `assets/styles.css` | Design system (cream / ink / pop orange, Archivo Black, hard borders + offset shadows) |
| `assets/app.js` | Hash router + all pages (home, Index, entry articles, categories, guides, A–Z, search) |
| `assets/data.js` | **Generated** — The Index data pulled from `looksmax/lib` |
| `assets/research.js` | **Generated** — per-entry descriptions, studies, forum threads, Grokipedia links, photos |
| `assets/buy-links.js` | **Edit me** — paste a URL next to any entry to give it a Buy Now button |
| `assets/guides.js` | Hand-written guide articles (supports `[[Entry Name]]` wiki links) |
| `research/batches/*.json` | Research work split into 9 batches |
| `research/NN-*.json` | Research output per batch |

## Updating

    node wiki/scripts/sync-data.mjs            # re-pull entries after editing looksmax/lib/compounds.ts or gear.ts
    node wiki/scripts/check-links.mjs --prune  # drop dead research links
    node wiki/scripts/build-research.mjs       # rebuild assets/research.js from research/*.json

## Buy now rules

- Link set in `buy-links.js` → **Buy now** button (Rx entries show it as an online-visit button).
- No link → automatic Amazon search for OTC compounds and gear (uses `AMAZON_TAG` from `looksmax/lib/affiliates.ts`).
- Research chemicals never get a buy link, same as the app.
