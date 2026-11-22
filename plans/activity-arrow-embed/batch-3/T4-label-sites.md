# T4 — the other activity-3 label sites

**Writes:** `tests/fixtures/edge-label-embed/act3-*.{puml,svg}` (create), `edge-label-embed.authored.test.ts` (rows),
`src/diagrams/activity/**` only where a probe shows the T2/T3 mechanism not yet reaching a site, matching tests under
`tests/diagrams/activity/`.
**Reads:** `grep -rn "withLabel(" ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3` (18 files,
56 calls at planning), `.agent-notes/aae-T1.md`.

## Context

The same `getTextBlock` block reaches if, repeat, while, switch, fork and swimlane connections, each placed through a
different `Snake.getTextBlockPosition` branch (`Snake.java:251-268`: `BOTTOM`, `CENTER`, `zigzag` CENTER/RIGHT, `RD`,
`LD`). D1 puts them in scope.

## Task

1. **Enumerate.** List each upstream `withLabel` caller and the activity syntax that reaches it (journal table:
   file:line, syntax, `Snake` branch). Group callers that share a branch and a builder; one probe per group.
2. **Author probes**, each `act3-<site>.puml` with an embed label (`{{\nclass X\n}}`; add a `{{` open variant where the
   reserve matters). At least: `act3-mixed` (from `measurements/probes/`), an arrow label after `endif`, a label on an
   `if` branch arrow, `repeat … backward` / `repeat while` arrow labels, a `while` loop-back label, a `switch` case
   arrow, a `fork`/`split` arrow, a swimlane-crossing arrow (`RD`/`LD`), and `skinparam arrowHorizontalAlignment
   center` / `right` on a zigzag. Render oracles with `scripts/oracle-render.sh`.
3. **Measure** with `measure-probes.mts` (they match `act3*`). For each non-zero row, read the Java for its branch and
   decide: the T2/T3 mechanism not reaching it → fix it here (red test first); a different mechanism → separable (D1).
4. **Pin.** Each row goes into ZERO with its `<image>` count, or OPEN with its count and a `reason` naming the issue you
   filed (`gh issue create --label queue:ready,parity`, measurement and `file:line` in the body).

## Acceptance
- Given the journal table, when compared with the grep, then every upstream `withLabel` caller in `activitydiagram3` is
  covered by a probe or named as unreachable with the Java quote that proves it.
- Given every new probe, when the authored gate runs, then it is a ZERO row or an OPEN row whose `reason` names a filed
  issue.
- Given the activity golden and diff-baseline ratchets, when run after any `src/` change here, then both pass.

Observability N/A. Rollback Reversible. Commit e.g. `test(activity): pin {{ arrow labels at every snake label site`
(or `fix(activity): …` if `src/` changed) with `Refs: #188`.
