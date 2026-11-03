#!/usr/bin/env bash
# dss (copied from dbp): one close's measurements in order: gates, d.ts, extended check, rows, chain, verdict diff.
# Usage: close-measure.sh <bN> <prev-eng-dir-name>
set -u
cd "$(git rev-parse --show-toplevel)"
M=plans/diagram-style-scope/measurements T=plans/diagram-style-scope/tools; n=${1:?bN}; prev=${2:?prev}
bash $M/gates.sh $n >/dev/null 2>&1; tail -3 $M/$n-npm-test.log; tail -1 $M/$n-typecheck.log $M/$n-lint.log $M/$n-build.log
cmp dist/plantuml-ts.d.ts $M/b0-plantuml-ts.d.ts.txt && echo DTS_SAME
npx tsx $T/extended-baseline.mts --check $M/extended-baseline.json 2>&1 | tail -3
[ -f $T/diff-row.mts ] && npx tsx $T/diff-row.mts --all --json $M/$n-rows.json 2>&1 | tail -1
npx tsx $T/svg-hashes.mts --all $M/$n-hashes.json $M/${prev%-eng}-hashes.json 2>&1 | grep -E '^MOVED|fixtures,' | tail -60 > $M/$n-hash-diff.txt; tail -1 $M/$n-hash-diff.txt
LOAD_MAX=${LOAD_MAX:-8} SVG_PARITY_TIMEOUT_MS=900000 SVG_PARITY_CONCURRENCY=3 bash $M/chain.sh $n-eng > $M/$n-chain.log 2>&1
node $T/verdict-diff.mjs $M/$prev $M/$n-eng 2>&1 | tail -4
echo CLOSE_MEASURE_DONE
