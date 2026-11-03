# T0a — branch and tooling

Agent: orchestrator (no worktree). Commit: `chore(dss): mission brief and tooling (T0a)`.

## Steps
1. `git status` clean apart from this brief and `.agent-notes/document-bg-selector-scope.md`.
   `git checkout main && git pull --ff-only` → `4f653cac9`; `git checkout -b feat/diagram-style-scope`.
2. Copy from `plans/document-background-paint/` with `dbp` → `dss` and the plan path changed (`grep -rn
   'document-background-paint\|dbp' $M $T` prints nothing afterwards except "copied from dbp" provenance):
   `measurements/{gates,chain,mkwt,merge-one,close-measure}.sh`, `measurements/vitest.config.mts`,
   `measurements/repin-dbg.mjs` as `repin-rows.mjs` (pin path `oracle/goldens/diagram-style-scope.json`),
   `tools/{verdict-diff.mjs,extended-baseline.mts,extended-baseline.test.mts}`.
   - `mkwt.sh` branches `dss/<Tn>` off `feat/diagram-style-scope` into `.claude/worktrees/dss-<Tn>`.
   - `merge-one.sh`'s ratchet list: `diagram-style-scope.ratchet.test.ts` (guarded until T0b lands),
     `document-background.ratchet.test.ts`, the golden ratchets of json, yaml, hcl, class, object, state,
     description, sequence, activity, mindmap, salt, wbs, gantt, files, plus `extensions.ratchet.test.ts`,
     `tests/architecture`, `tests/unit/oracle`.
   - `close-measure.sh`: rows via `npx tsx $T/diff-row.mts --all --json $M/$n-rows.json` (guarded on the file existing).
3. `cp plans/diagram-style-scope/settings.autonomous.json .claude/settings.autonomous.json`.
4. `npx vitest run --config $M/vitest.config.mts` green (the copied tool test).
5. Commit the brief, tooling and the agent note with explicit paths (T0b's worktree needs them on the branch).
6. `bash $M/gates.sh b0`; `cp dist/plantuml-ts.d.ts $M/b0-plantuml-ts.d.ts.txt`;
   `npx tsx $T/extended-baseline.mts --write $M/extended-baseline.json`; chain `b0-eng` (all 28 engines, load < 8;
   journal a raised `LOAD_MAX` if other sessions hold the machine). These land in the batch-0 close commit.

## Acceptance
- Given main `4f653cac9`, when T0a finishes, then `git merge-base main HEAD` is `4f653cac9` and the tree is clean.
- Given `$M/b0-eng/`, then it holds a `parity-<engine>.json` per `test-results/dot-cache/` directory with 0 timeouts.
- Given `extended-baseline.mts --check` on an unchanged tree, then 0 MOVED.

Observability: N/A. Rollback: Reversible (delete the branch).
