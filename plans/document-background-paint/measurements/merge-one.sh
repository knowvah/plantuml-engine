#!/usr/bin/env bash
# dbp close step 1 per task (copied from jff): --no-ff merge of dbp/<Tn> into
# the mission branch (only when `git diff HEAD` is empty), then typecheck, the
# document-background ratchet (once T0b lands), the golden ratchets of the 14
# in-scope engines, the extensions ratchet (extended mode), tests/architecture,
# tests/unit/oracle, and any test files named on the command line.
# Usage: merge-one.sh <Tn> "<merge subject>" [<test file or dir> ...]
# Never chain `git branch -D` on the same line (sdd3 row 104).
set -u
cd "$(git rev-parse --show-toplevel)"
t=${1:?Tn}; msg=${2:?subject}; shift 2
[ -z "$(git diff HEAD --stat)" ] || { echo "DIRTY tree, refusing"; exit 2; }
git merge --no-ff -q "dbp/$t" -m "Merge dbp/$t: $msg" || { echo "MERGE FAILED"; exit 3; }
git log --oneline -1
npx tsc --noEmit -p tsconfig.json 2>&1 | tail -3
C=tests/oracle/svg-conformance
ratchets=""
[ -f "$C/document-background.ratchet.test.ts" ] && ratchets="$C/document-background.ratchet.test.ts"
for e in json yaml hcl class object state description sequence activity mindmap salt wbs gantt files; do
  ratchets="$ratchets $C/$e.golden.ratchet.test.ts"
done
ratchets="$ratchets $C/extensions.ratchet.test.ts tests/architecture tests/unit/oracle"
npx vitest run $ratchets "$@" --maxWorkers=2 --coverage.enabled=false 2>&1 \
  | grep -E 'Test Files|Tests |FAIL|✗|×|No test files' | head -20
