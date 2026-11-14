# Looksmax angle — make clear why each entry is on a looksmaxxing wiki

Every LOOKSMAX Wiki article must make it obvious **how this thing connects to looking better**. Readers land on
"Boswellia serrata" and see a joint-supplement article with no idea why a looksmaxxer cares. The answer
(for example: joint comfort and recovery → train harder and more often → more muscle, better physique) must be stated
plainly at the top.

You get a batch file of entries (name, kind, category, topics, summary, first lead paragraph, a few claims).
For EACH entry write one `angle` object:

```json
{
  "goal": "Physique",
  "chain": ["Joint comfort & recovery", "More training volume", "More muscle, leaner look"],
  "effect": "indirect",
  "text": "In looksmaxxing circles boswellia is taken to ease joint pain and speed recovery, so users can train harder and more often in pursuit of a more muscular physique. Trials have looked at osteoarthritis pain rather than training outcomes."
}
```

- **goal** (1–3 words): the appearance outcome people are after. Use one of these when it fits, otherwise a similarly short label:
  Physique, Fat loss, Muscle, Skin, Acne, Anti-aging, Tan & skin tone, Hair (scalp), Hair (facial/body), Jawline & face shape,
  Facial fat & puffiness, Eyes & eye area, Nose, Teeth & smile, Height, Posture, Voice, Body hair removal, Grooming,
  Style & presentation, Photos & framing, Confidence & presence, Hormones (T / E2), Sleep & recovery, Body odor & breath, Lips, Nails.
- **chain** (2–4 short steps, each ≤ 6 words): the cause-and-effect path from what the thing does to how someone looks.
  Make the last step a visible appearance outcome. For indirect items (sleep, recovery, hormones, nootropics, mindset, joint
  supplements, gut health, stimulants) spell out the intermediate steps; that's the whole point.
- **text** (2–3 sentences, ≤ 70 words): who uses it in looksmaxxing / appearance circles and for what, written as
  documentation ("users take it to…", "it is promoted as…", "forum posters claim…"). In one clause, say where the evidence for
  *that specific appearance use* stands (studied / studied only for something else / untested / based on anecdote). No verdicts.

- **effect**: one of
  - `"direct"` — the appearance change is immediate and plainly visible or measurable, so it needs no trial to show it happens:
    height insoles/lifts add height while worn; makeup, concealer, self-tanner, hair dye, clothes, tailoring, haircuts,
    hair systems, teeth whitening strips, photo angles/lighting, posture while standing, grooming, cosmetic procedures whose
    result is the visible change itself (fillers, veneers, hair transplant).
  - `"indirect"` — works on looks through an intermediate step (recovery, sleep, hormones, fat loss, training, skin biology).
  - `"claimed"` — the appearance effect is a belief/theory that hasn't been shown (e.g. bone remodelling claims, gold injections).

Tone — this wiki exists to help people improve how they look ("ascend"). Lead with the benefit people are after and
state it concretely ("adds roughly 2–7 cm of height while worn", "evens out skin tone for the day"). For `direct` items,
say plainly that the effect is visible/measurable. Don't pile on caveats or warnings here — risks are covered in the
article body. No doom, no "only", "merely", "no meaningful evidence", "just".

Rules:
- Neutral point of view. Never "works", "doesn't work", "scam", "bs", "useless", "worth it", "should". Report what people
  believe and what is or isn't studied. "Unproven" / "untested" are fine as factual descriptions.
- If a compound's appearance link is a side effect or off-label (e.g. a drug that causes hair growth), say so.
- If the entry has only a weak or speculative appearance link, still describe the link that people draw. Don't invent
  one people don't draw: if you can't tell, use goal "General health" and describe what it is used for.
- No dosing, no sourcing, no "you".
- Plain, concrete English. No hype, no doom.

Output: write a JSON object `{ "<slug>": { goal, chain, text }, ... }` covering every entry in your batch to the output path
you're given, then validate it with `node -e "JSON.parse(require('fs').readFileSync('<path>'))"`. Reply with just the count.
