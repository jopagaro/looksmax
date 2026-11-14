// Quality gate for research/deep/*.json. Flags articles that break the writing rules so they can be
// rewritten before publishing. Run: node wiki/scripts/qa-articles.mjs [--json]
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from './entries.mjs';

const dir = join(root, 'research', 'deep');
const EV = ['strong', 'moderate', 'limited', 'unproven'];
// Opinion / verdict words the neutral-point-of-view rules forbid in the wiki's own voice.
const OPINION = /\b(bs|bullshit|scam|scammy|debunk\w*|bunk|nonsense|snake ?oil|quack\w*|useless|waste of (money|time)|real gains|ignore it|don't bother|skip it|the truth is)\b/i;
// Dosing / sourcing instructions (allowed only as reported trial facts, which rarely say "you").
const DOSING = /\b(you should (take|inject|dose|run)|inject \d|\d+\s?(mg|mcg|iu)\s+(per|a|every)\s+(day|week)\s+(is|works|for you)|you can buy it (at|from)|order (it|them) from)\b/i;

const issues = [];
let ok = 0, skips = 0;
for (const f of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  let d;
  try { d = JSON.parse(readFileSync(join(dir, f), 'utf8')); } catch (e) { issues.push({ f, why: 'invalid JSON' }); continue; }
  if (d.skip) { skips++; continue; }
  const why = [];
  const sections = d.sections || [];
  const text = JSON.stringify([d.lead, sections, d.lore, d.timeline, d.card, d.quick]);
  if (!sections.some((s) => /clinical stud/i.test(s.h || ''))) why.push('no Clinical studies section');
  if (!(d.lead || []).length) why.push('no lead');
  const refIds = new Set((d.refs || []).map((r) => Number(r.id)));
  const cited = [...text.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1]));
  const dangling = [...new Set(cited.filter((n) => !refIds.has(n)))];
  if (dangling.length) why.push(`citations without refs: ${dangling.slice(0, 5).join(',')}`);
  if (!(d.refs || []).length) why.push('no refs');
  const op = text.match(OPINION); if (op) why.push(`opinion wording: "${op[0]}"`);
  const ds = text.match(DOSING); if (ds) why.push(`dosing/sourcing: "${ds[0]}"`);
  if (/\bdossier\b/i.test(JSON.stringify([d.lead, sections, d.lore]))) why.push('mentions "dossier"');
  if (d.card) {
    if (!EV.includes(d.card.evidence)) why.push('card: bad evidence value');
    if (!d.card.summary) why.push('card: no summary');
  }
  if (why.length) issues.push({ f, why: why.join('; ') });
  else ok++;
}
console.log(`${ok} pass, ${issues.length} flagged, ${skips} skip objects`);
issues.slice(0, 40).forEach((i) => console.log(` - ${i.f}: ${i.why}`));
if (process.argv.includes('--json')) writeFileSync(join(root, 'research', 'qa-flagged.json'), JSON.stringify(issues, null, 1));
