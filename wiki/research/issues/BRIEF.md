# Issue-mapping brief — LOOKSMAX Wiki

The wiki is becoming a complete looksmaxxing encyclopedia organised by ISSUE: for every appearance problem, a hub page lists
EVERY approach people use — mainstream medicine, OTC products, devices, forum metas, influencer protocols, diet fads,
fringe/pseudoscience and dangerous stuff. Each approach becomes (or links to) its own article. Your job: for each issue
assigned to you, map ALL the approaches. Be exhaustive and niche. More is better.

Files:
- Issue definitions: /Users/johnpaulroche/lookmax/wiki/research/issues/TAXONOMY.json (id, name, goal)
- Names already in (or queued for) the wiki: /Users/johnpaulroche/lookmax/wiki/research/issues/ALL_NAMES.txt —
  when an approach is one of these, use that EXACT name and set "existing": true.
- Category ids: /Users/johnpaulroche/lookmax/wiki/research/new/EXISTING.txt (bottom: compound, gear and meta category ids)

## What counts as an approach (go wide — example for "tan")
Self-tanner (DHA), tanning drops, spray tans, bronzer/makeup, Melanotan I/II, bremelanotide, afamelanotide, "carrot maxxing"
(eating carrots/carotenoids for a golden tone), beta-carotene/lycopene/astaxanthin supplements, canthaxanthin "tan pills",
melatonin claims, tanning oil in the sun, baby oil tanning, tanning beds, tanning accelerators, sunbathing protocols,
"tan lines" metas, red light myths, tyrosine supplements, psoralen, nasal tanning sprays, sunbed + MT2 stacks, etc.
Every issue should have **25–60 approaches** where they exist: drugs, peptides, supplements, topicals, devices, procedures,
habits, diet metas, influencer protocols (e.g. what Clavicular, Kareem Shami, Mike Mew and other looksmaxxers promote),
TikTok trends, forum slang metas ("…maxxing"), and the clearly-BS-but-people-do-it stuff. Include dangerous approaches
(they'll be documented with warnings — that's useful), but NOT self-harm or suicide slang.

## Rules
- Use WebFetch to verify/expand (Wikipedia, dermatology/medical review pages, news features on looksmaxxing, Know Your Meme,
  product pages). WebSearch has a small shared budget — at most ~10 searches total. reddit.com and looksmax.org can't be fetched.
- You may include well-known approaches from your own knowledge, but don't invent practices. Set "seenAt" to a URL where you
  saw it if you have one, else null. A later research pass verifies everything from sources and drops anything that isn't real.
- Don't rate or describe at length — one-line "why" only.
- An approach can serve several issues — list it under each relevant issue (same exact name).

## Output — write one JSON file (path given in your task), validated with node:
```json
[
  {
    "issue": "tan",
    "summary": "1–2 sentences in your own words: the issue and the landscape of fixes.",
    "approaches": [
      { "name": "Carrot maxxing", "kind": "meta", "category": "lifestyle", "existing": false, "aka": "carotenoid tanning",
        "terms": ["carrot tan", "carotenemia"], "tier": "forum", "why": "Eating lots of carrots to tint skin golden via carotenoids", "seenAt": null }
    ]
  }
]
```
- kind: compound | gear | meta. category: a valid id for that kind (compound/gear ids from EXISTING.txt; meta ids:
  hardmaxx, bonehacks, height, protocols, lifestyle, fringe, frameworks, stylemetas).
- tier: "evidence" (solid evidence), "mainstream" (common, mixed evidence), "forum" (forum/influencer meta), "fringe" (pseudoscience), "dangerous".
- terms: 1–3 lowercase search terms, most specific first.

When done, reply with: approaches per issue, how many are new (existing:false), and the 10 most niche/interesting finds.
