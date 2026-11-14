// Guard for the thin-article rewrite: compares research/deep/<slug>.json with research/rewrite/backup/<slug>.json
// and restores the backup when the rewrite is broken or worse (invalid JSON, lost refs, no Clinical studies,
// no lead, changed card/quick). Run: node wiki/scripts/check-rewrite.mjs [--restore]
import { readFileSync, readdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from './entries.mjs';

const bdir = join(root, 'research', 'rewrite', 'backup');
const ddir = join(root, 'research', 'deep');
const restore = process.argv.includes('--restore');
const out = { improved: 0, same: 0, restored: [], refsBefore: 0, refsAfter: 0 };
for (const f of readdirSync(bdir).filter((f) => f.endsWith('.json'))) {
  const old = JSON.parse(readFileSync(join(bdir, f), 'utf8'));
  const raw = readFileSync(join(ddir, f), 'utf8');
  if (raw === readFileSync(join(bdir, f), 'utf8')) { out.same++; out.refsBefore += (old.refs || []).length; out.refsAfter += (old.refs || []).length; continue; }
  let d, why = [];
  try { d = JSON.parse(raw); } catch { why.push('invalid JSON'); }
  if (d) {
    if (!(d.lead || []).length) why.push('no lead');
    if (!(d.sections || []).some((s) => /clinical stud/i.test(s.h || ''))) why.push('no Clinical studies');
    if ((d.refs || []).length < (old.refs || []).length) why.push(`refs ${(old.refs || []).length}→${(d.refs || []).length}`);
    for (const k of ['name', 'card', 'quick']) if (old[k] !== undefined && JSON.stringify(old[k]) !== JSON.stringify(d[k])) {
      // card/quick drift: put the originals back rather than discarding the whole rewrite
      d[k] = old[k]; if (restore) writeFileSync(join(ddir, f), JSON.stringify(d, null, 1));
    }
  }
  if (why.length) {
    out.restored.push(`${f}: ${why.join(', ')}`);
    if (restore) copyFileSync(join(bdir, f), join(ddir, f));
    out.refsBefore += (old.refs || []).length; out.refsAfter += (old.refs || []).length;
  } else { out.improved++; out.refsBefore += (old.refs || []).length; out.refsAfter += (d.refs || []).length; }
}
console.log(`${out.improved} rewritten OK, ${out.same} unchanged, ${out.restored.length} ${restore ? 'restored' : 'would restore'}; refs ${out.refsBefore} → ${out.refsAfter}`);
out.restored.slice(0, 30).forEach((r) => console.log(' - ' + r));
