# T0a — branch and tooling

Agent: orchestrator (no worktree). Commit: `chore(dbp): mission brief and tooling (T0a)`.

## Steps
1. `git status` clean apart from this brief. `git checkout main && git pull --ff-only`
   → `fe794c0a9`; `git checkout -b feat/document-background-paint`.
2. Copy from `plans/json-family-followons/` with `jff` → `dbp` and the plan path
   changed (`grep -rn 'json-family-followons\|jff' $M $T` prints nothing afterwards
   except "copied from jff" provenance):
   `measurements/{gates,chain,mkwt,merge-one,close-measure}.sh`,
   `tools/{verdict-diff.mjs,extended-baseline.mts,extended-baseline.test.mts}`,
   `measurements/vitest.config.mts`.
   - `mkwt.sh` branches `dbp/<Tn>` off `feat/document-background-paint` into `.claude/worktrees/dbp-<Tn>`.
   - `merge-one.sh`'s ratchet list becomes: `document-background.ratchet.test.ts` (once T0b lands; skip if absent),
     the golden ratchets of json, yaml, hcl, class, object, state, description, sequence, activity,
     mindmap, salt, wbs, gantt, files, plus `extensions.ratchet.test.ts`, `tests/architecture`, `tests/unit/oracle`.
   - `close-measure.sh`: drop the json residue line; add `npx tsx $T/diff-row.mts --all --json $M/$n-dbg.json` (guarded on the file existing).
3. `cp plans/document-background-paint/settings.autonomous.json .claude/settings.autonomous.json`.
4. `npx vitest run --config $M/vitest.config.mts` green (the copied tool test).
5. Commit the brief and tooling with explicit paths (T0b's worktree needs them on the branch).
6. `bash $M/gates.sh b0`; `cp dist/plantuml-ts.d.ts $M/b0-plantuml-ts.d.ts.txt`;
   `npx tsx $T/extended-baseline.mts --write $M/extended-baseline.json`;
   chain `b0-eng` (all 28 engines, load < 8; journal a raised `LOAD_MAX` if other sessions hold the machine).
   These land in the batch-0 close commit.

## Acceptance
- Given main `fe794c0a9`, when T0a finishes, then `git merge-base main HEAD` is `fe794c0a9` and the tree is clean.
- Given `$M/b0-eng/`, then it holds a `parity-<engine>.json` per `test-results/dot-cache/` directory with 0 timeouts.
- Given `extended-baseline.mts --check` on an unchanged tree, then 0 MOVED.

Observability: N/A. Rollback: Reversible (delete the branch).
