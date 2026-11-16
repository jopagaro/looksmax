#!/bin/zsh
# Detached scrape chain for a new discovery wave: forum/study sources, then extra sources, then photos, then dossiers.
cd "$(dirname "$0")/.."
log=research/wave-chain.log
echo "== $(date) start" >> $log
node scripts/scrape.mjs --sources grok,pubmed,looksmax,tnation,hn,lemmy --conc 4 >> $log 2>&1
node scripts/scrape-extra.mjs >> $log 2>&1
node scripts/build-dossiers.mjs >> $log 2>&1
echo "== $(date) dossiers ready" >> $log
node scripts/scrape-images.mjs >> $log 2>&1
echo "== $(date) done" >> $log
