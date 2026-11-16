# Batch 0: brief, baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start, re-measure, snapshot the d.ts | orchestrator | this brief | none | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/description-entity-images/ may appear
git branch --show-current   # must print feature/parity-queue
git config --worktree --get commit.gpgsign   # must print false; if not, set it
git add plans/description-entity-images
git commit -m "docs(dei): add the description-entity-images brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
for s in gacoxo-93-guti295 liripi-72-kefa167 rukitu-26-seme622; do
  npx jiti scripts/svg-parity-survey.ts --render-one test-results/dot-cache/unknown/$s | grep -c 'Syntax Error'
done
```

Each of the three renders must print `1` (a Syntax Error page), matching the README's starting state. If one differs,
journal the live output and carry on from it.

The every-engine baseline is the committed `tests/oracle/svg-conformance/parity-*.json` at `<base>`.
`verdict-diff.mjs` reads it from the ref, so T0 needs no survey. Snapshot the d.ts for T5: run `npm run build`, then
copy `dist/*.d.ts` to `/tmp/dei-base-dts/`.

Batch 0 closes with the README gates. `build`, `typecheck` and `format:check` were not run at planning, so this is
their first run on the base.

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit and
  journal row 1 holds the start time.
- Given the base tree, when the three rows render, then each is a Syntax Error page, or the journal says why not.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
