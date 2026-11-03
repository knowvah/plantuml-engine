#!/usr/bin/env bash
# dss: byte hash of every corpus render on the base and on HEAD, for stop 5. Usage: b1-hash.sh
set -u
cd "$(git rev-parse --show-toplevel)"
R=$PWD; M=plans/diagram-style-scope/measurements; T=plans/diagram-style-scope/tools
W=$R/.claude/worktrees/dss-base
[ -d "$W" ] || bash $M/mkwt.sh base 4f653cac9 >/dev/null
[ -e "$W/test-results/dot-cache" ] || { mkdir -p "$W/test-results"; ln -s "$R/test-results/dot-cache" "$W/test-results/dot-cache"; }
[ -f $M/base-hashes.json ] || ( cd "$W" && npx tsx plans/sequence-divergence-drive-3/tools/svg-hashes.mts --all "$R/$M/base-hashes.json" ) 2>&1 | tail -2
npx tsx $T/svg-hashes.mts --all $M/b1-hashes.json $M/base-hashes.json > $M/b1-hash-diff.txt 2>&1; echo "hash diff exit $?"
tail -3 $M/b1-hash-diff.txt; wc -l $M/b1-hash-diff.txt
echo HASH_DONE
