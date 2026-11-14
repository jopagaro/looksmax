# Quick take rewrite — "how this helps you look better"

LOOKSMAX Wiki exists to help people improve how they look and ascend: be more attractive, taller-looking, leaner,
clearer-skinned, better-framed. The Quick take is what most readers see first. Right now many read like a skeptic's
review ("relevance to appearance is indirect", "no meaningful evidence", "only", "merely"). Rewrite them so the reader
immediately gets **what it does for their looks and how people use it**, with the risks stated plainly and factually.

The wiki does NOT rate things. No evidence levels, grades, verdicts, "unproven", "worth it", "doesn't work", "scam".
Describing research is fine as plain fact ("a 2019 trial of 60 men found…", "studied for osteoarthritis pain, not
training"), never as a judgement.

Input: a batch file of entries — name, kind, category, angle (goal + cause chain + text), the current summary,
current quick take, the in-depth lead, and a note. Use only facts present in the input; don't invent numbers.

For EACH entry write:
```json
{
  "summary": "One sentence (≤ 30 words) for the Index card: what it is + what it does for your looks.",
  "quick": {
    "overview": "Paragraph 1: what it is and the appearance payoff people are after, concretely.\n\nParagraph 2: how it gets there (the chain), and what research or real-world results exist, stated as facts.",
    "how": "1 paragraph: how people use it in practice (general terms — form, routine, what it's combined with, how long until results). NO doses, NO injection instructions, NO sourcing for Rx/research compounds.",
    "risks": "1 paragraph: side effects, harms, legal status, who should avoid it — factual, no doom, no lecturing."
  },
  "angle": {
    "effect": "direct | indirect | claimed",
    "text": "2–3 sentences for the Looksmax-angle box at the top of the article: the payoff people want and how it gets there, concretely. Rewrite the input angle text in this help-first tone (drop 'rests largely on anecdote', 'untested', 'unproven' hedges — at most one short factual clause about research, e.g. 'trials have studied it for osteoarthritis pain')."
  }
}
```

Style:
- Lead with the benefit. "Lifts add 2–7 cm of height while worn" not "Lifts may give a modest, temporary appearance of height".
- For indirect things, make the chain explicit: recovery → more training → more muscle; sleep → less puffiness, better skin.
- Plain, confident, concrete. Second person is fine in moderation ("helps you…"), no slang overload, no hype.
- Neutral on contested claims: "users report…", "proponents say…", "a 2021 review found…".
- No dosing/cycling/injection how-to or vendor names for Rx/research compounds. No "you should".
- Never mention "the input", "the brief", "dossier", or the writing process.

`effect`: "direct" = visible/measurable on the spot (lifts, makeup, clothes, haircuts, photo framing, cosmetic procedures whose result is the change itself); "indirect" = works through a step (recovery, sleep, hormones, fat loss, skin biology); "claimed" = an appearance effect people believe in that hasn't been shown.

Output: a JSON object `{ "<slug>": { summary, quick: { overview, how, risks }, angle: { effect, text } }, ... }` covering every entry in your
batch, written to the output path you're given; validate with node. Reply with just the count.
