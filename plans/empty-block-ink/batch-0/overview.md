# Batch 0: brief, baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start, re-measure, snapshot the d.ts | orchestrator | this brief | — | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/empty-block-ink/ and .agent-notes/ebi-planning.md may appear
git branch --show-current   # must print feature/parity-queue
git config --worktree --get commit.gpgsign   # must print false; if not, set it
git add plans/empty-block-ink .agent-notes/ebi-planning.md
git commit -m "docs(ebi): add the empty-block-ink brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
npx tsx plans/json-family-followons/tools/residue.mts --all > /tmp/ebi-t0.txt
```

The 11 rows in `/tmp/ebi-t0.txt` must read the README's HEAD column. If they do not, journal the new values and carry
on with the live numbers.

The every-engine baseline is the committed `tests/oracle/svg-conformance/parity-*.json` at `<base>`; `verdict-diff.mjs`
reads it from the ref, so T0 needs no survey. Run `npm run build` and copy `dist/*.d.ts` to `/tmp/ebi-base-dts/`.

Batch 0 closes with the README gates. Typecheck, build and `format:check` were not run at planning.

## Acceptance

- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit and
  journal row 1 holds the start time.
- Given the base tree, when `residue.mts --all` runs, then the 11 rows match the README (or the journal says why not).

Observability is N/A. Rollback is Reversible.
