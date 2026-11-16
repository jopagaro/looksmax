# Discovery wave 5 (niche) — find what the LOOKSMAX Wiki is still missing

The wiki documents everything people use or do to change their appearance (compounds, gear, metas). It already has
~4,280 entries (including queued): see /Users/johnpaulroche/lookmax/wiki/research/issues/ALL_NAMES.txt (check every candidate against it —
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

## Wave 4 focus: metas only
Every candidate must be kind "meta" with one of these categories: hardmaxx (surgery, injectables, implants), bonehacks (DIY
skeleton/structure changes), height (height hacks), protocols (forum drug/hormone/peptide stacks and cycles — document that
they exist, never doses), lifestyle (diet, fasting, sleep, training, skincare and daily-habit protocols), fringe (fringe and
pseudoscience practices), frameworks (theories, ratios, pills, rating systems, community concepts), stylemetas (style,
grooming, photo and presentation metas). A meta is something people DO, FOLLOW or BELIEVE to change how they look or are
perceived. Named practices, protocols, theories and trends beat generic categories. Exclude: insults, ethnic or racial
"-cel"/"-pill" labels, sexual-performance terms, self-harm, and pure identity labels with no practice or theory behind them.

## Wave 5 focus: NICHE
The editor wants the obscure, odd and surprising — things like ear candling, hologram bracelets, vintage nose-shaping
clips, bloodletting for leanness. Hunt for niche practices, devices, remedies, rituals, products and beliefs connected to
appearance, grooming, body shape, skin, hair, health-for-looks or attractiveness, that a mainstream beauty site would never
cover. Kind may be "meta" (practices/beliefs), "gear" (devices/tools/products) or "compound" (substances), with valid
categories. Prefer things with at least a little real documentation (Wikipedia, museum/history pages, news features,
Quackwatch, archived ads, patents, forum culture coverage). Do NOT prune for scope: women's practices, historical oddities,
folk remedies and fringe beliefs all count. Only exclude slurs, sexual-performance terms and self-harm.
