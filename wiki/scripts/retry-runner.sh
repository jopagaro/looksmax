#!/bin/zsh
# Detached retry runner: survives Claude session restarts (launched with nohup). Retries only what failed,
# one request at a time with longer pauses, and logs to research/retry-runner.log.
cd "$(dirname "$0")/.."
log=research/retry-runner.log
reset() { # reset sources whose status is a failure so the scraper retries them
  node -e "const fs=require('fs');const src=process.argv.slice(1);let n=0;for(const f of fs.readdirSync('research/raw')){const p='research/raw/'+f;const r=JSON.parse(fs.readFileSync(p));let ch=0;for(const k of src){if(String((r.status||{})[k]||'').startsWith('fail')){delete r.status[k];ch=1}}if(ch){fs.writeFileSync(p,JSON.stringify(r,null,1));n++}}console.log('reset',src.join(','),n)" "$@"
}
echo "== $(date) start" >> $log
# 1. Extra sources (OpenAlex, Europe PMC, trials, FDA) for entries that never had them — resumable.
node scripts/scrape-extra.mjs >> $log 2>&1
# 2. Forums that hit rate limits: T Nation + Lemmy, gently, up to 3 rounds.
for round in 1 2 3; do
  reset tnation lemmy >> $log 2>&1
  node scripts/scrape.mjs --sources tnation,lemmy --conc 1 --gentle >> $log 2>&1
done
# 3. News: wait for the running GDELT pass, then retry its failures (GDELT allows ~1 request / 5 s).
while pgrep -f "scrape.mjs --sources news" >/dev/null; do sleep 300; done
for round in 1 2; do
  reset news >> $log 2>&1
  node scripts/scrape.mjs --sources news --conc 1 >> $log 2>&1
done
# 4. Wikipedia gap-fill (only entries with no wiki status or a failed one), after the session-run passes are gone.
while pgrep -f "scrape.mjs --sources wiki" >/dev/null; do sleep 300; done
reset wiki >> $log 2>&1
node scripts/scrape.mjs --sources wiki --slow-wiki --conc 1 >> $log 2>&1
echo "== $(date) done" >> $log
