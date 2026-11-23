# Batch 0: brief, baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start, snapshot the d.ts | orchestrator | this brief, `.agent-notes/vkt-plan.md` | — | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/version-key-tools/ and .agent-notes/vkt-plan.md
git branch --show-current   # must print feature/parity-queue
git config --worktree --get commit.gpgsign   # must print false; if not, set it
git add plans/version-key-tools .agent-notes/vkt-plan.md
git commit -m "docs(vkt): add the version-key-tools brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
```

The every-engine baseline is the committed `tests/oracle/svg-conformance/parity-*.json` at `<base>`. `verdict-diff.mjs`
reads it from the ref, so T0 needs no survey. Snapshot the d.ts for T3: run `npm run build`, then copy `dist/*.d.ts`
to `/tmp/vkt-base-dts/`.

Re-render the six planning probes (README "Starting state") one file per run into `/tmp/vkt-probes/` and journal any
line that differs from D5's "Jar" column. A difference means the pin moved since planning: amend D5 with the date and
continue (not a stop, unless it contradicts D1-D4).

Batch 0 closes with the README gates. `typecheck`, `build` and `format:check` were not run at planning, so this is
their first run on the base.

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit and
  journal row 1 holds the start time.
- Given the base tree, when `npm run build` runs, then `/tmp/vkt-base-dts/` holds every `dist/*.d.ts`.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
