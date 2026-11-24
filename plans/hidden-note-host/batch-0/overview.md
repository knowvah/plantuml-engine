# Batch 0: brief, baseline, side findings

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start, re-measure, file I1 to I7, snapshot the d.ts | orchestrator | this brief, GitHub issues | none | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/hidden-note-host/ may appear
git branch --show-current   # must print feature/parity-queue
git config --worktree --get commit.gpgsign   # must print false; if not, set it
git add plans/hidden-note-host
git commit -m "docs(hnh): add the hidden-note-host brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
npx tsx plans/hidden-note-host/measurements/measure.mts plans/hidden-note-host/measurements/probes /tmp/hnh-t0.json
```

The measurer must print the summary line in `measurements/plan-baseline.txt`, and each row must match it. If it
differs, journal the live numbers and the rows that moved, and carry on with them.

**File I1 to I7** (`decisions.md` "Side findings"), one issue each:

1. Write each control in the table to `/tmp/hnh-ctl/<id>.puml`, run
   `scripts/oracle-render.sh /tmp/hnh-ctl /tmp/hnh-ctl/<id>.puml`, delete the `svek-N.dot`, and measure it with
   `npx tsx plans/hidden-note-host/measurements/measure.mts /tmp/hnh-ctl`. The control must reproduce the finding.
   If one does not, journal it and do not file that one.
2. Before filing, open the Java the row cites and confirm the quote. For I5 and I7, whose mechanism is not yet read,
   say so in the body: "measured; mechanism not yet traced".
3. `gh issue create --label parity --label queue:ready --title "<title>" --body-file <file>`. Shape the body like
   #204's: "From #204 (`hidden-note-host`, planning probe)", a "Measured <date> on `<sha>`" section with the control
   source and both outputs, a "Mechanism" section with upstream `file:line` and our origin, and the probe rows it
   holds.
4. Journal the seven issue numbers. From here on, every `I<n>` in a gate reason is written as its `#<number>`.

The every-engine baseline is the committed `tests/oracle/svg-conformance/parity-*.json` at `<base>`.
`verdict-diff.mjs` reads it from the ref, so T0 needs no survey. Snapshot the d.ts for T3: run `npm run build`, then
copy `dist/*.d.ts` to `/tmp/hnh-base-dts/`.

Batch 0 closes with the README gates. `typecheck`, `build` and `format:check` were not run at planning (test and lint
were), so this is their first run on the base.

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit and
  journal row 1 holds the start time.
- Given the base tree, when the measurer runs, then it reports `plan-baseline.txt`'s numbers, or the journal says why
  not.
- Given the seven controls, then each filed issue carries its control, both outputs and a `file:line`, and the
  journal lists the numbers.

Observability is N/A: there are no new observable operations. Rollback is Reversible (close the issues).
