#!/bin/zsh
# Catch-up: after wave-chain's forum scrape + dossiers, scrape entries merged later (restored wave-4 + wave-5 niche),
# then their extra sources and dossiers. Images are handled by wave-chain's own image pass (which starts later).
cd "$(dirname "$0")/.."
log=research/catchup-chain.log
until grep -q "dossiers ready" research/wave-chain.log; do sleep 60; done
echo "== $(date) start" >> $log
node scripts/scrape.mjs --sources grok,pubmed,looksmax,tnation,hn,lemmy --conc 4 >> $log 2>&1
node scripts/scrape-extra.mjs >> $log 2>&1
node scripts/build-dossiers.mjs >> $log 2>&1
echo "== $(date) catchup ready" >> $log
