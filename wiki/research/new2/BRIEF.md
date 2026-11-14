# Discovery wave 2 — find what the LOOKSMAX Wiki is still missing

The wiki documents everything people use or do to change their appearance (compounds, gear, metas). It already has
~1,730 entries: see /Users/johnpaulroche/lookmax/wiki/research/issues/ALL_NAMES.txt (check every candidate against it —
including aliases in parentheses — and drop anything already there). Valid category ids are at the bottom of
/Users/johnpaulroche/lookmax/wiki/research/new/EXISTING.txt (compound / gear / meta ids).

Goal: 150–250 NEW, specific, real candidates in your assigned area. Prefer named, specific things (a specific peptide,
a specific active ingredient, a specific branded device or protocol) over vague categories. Niche is good — forum
favourites, regional products, obscure research compounds, discontinued drugs that are still discussed.

How: use WebFetch on list-style and reference pages (Wikipedia lists and categories, INCI ingredient references,
peptide catalogues' educational pages, dermatology/endocrinology review articles, FDA/EMA pages, product-category pages).
WebSearch has a small shared budget — use at most ~10. reddit.com and looksmax.org can't be fetched.
Every candidate must be something you saw named in a source you loaded. Don't rate or describe beyond one line.
Exclude: self-harm/suicide slang, anything sexual that isn't about appearance, people (no biographies).

Output: write a JSON array to the path in your task, validated with node:
[{"name": "...", "kind": "compound|gear|meta", "category": "<valid id>", "aka": "alt names or null",
  "terms": ["1-3 lowercase search terms, most specific first"], "why": "one neutral line: what it is / what people use it for",
  "seenAt": "URL where you saw it"}]
Reply with: count, breakdown by category, 10 most interesting finds.
