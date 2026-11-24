# T3b: residuals

**Goal:** no `elk-*` or issue row is left open without a mechanism. Enter diagnosis mode per row
(`~/.claude/rules/diagnosis.md`): the success condition is the stated mechanism, not a lower count.

## Per open row
1. Take the first diff from `/tmp/lae-t3a.json`. Find the element in both svgs and the Java that draws it.
2. Instrument (temporary, gated tracing of the adapter's answers and the ELK node sizes) before hypothesising.
3. Classify:
   - **Ours, in this mission's code** (the adapter, the wiring): fix it with a red test first, re-measure.
   - **Separable** (the same diff shows without the pragma, or it lives in a shared module another engine pins, e.g.
     `MyElkEdge`, `EntityImageNoteLink`, a `core/svek` image): file a `queue:ready` issue with the measurement and
     `file:line`, `Blocked by` nothing, and make it the row's reason. Do not fix shared code here unless the fix is
     the mechanism's origin and every engine's survey stays at 0 lost.
   - **Maintainer-bound** (backend arithmetic where elkjs and the jar's ELK disagree, proven by a controlled
     experiment, or a would-be divergence): file a `needs-ruling` issue with the evidence and make it the reason.
4. Re-pin (task contract step 6).

Leads from planning, not conclusions: the note rows depend on `getLabel` merging `link.getNote()`
(`CucaDiagramFileMakerElk.java:231-247`) and on a note being an ordinary leaf; `elk-lap-ltr` should need nothing
beyond the root's fixed `Direction.DOWN` (`:482`).

## Write-set
As each mechanism needs, inside this repository; journal every file outside the plan.

## Acceptance
- Given the final tree, when the measurer runs on `tests/fixtures/activity-legacy`, then every row is at 0 or its
  `authored-baseline.json` reason names a mechanism with `file:line` or a filed issue number.
- Given every filed issue, then the journal names it and the issue body holds the measurement.

Observability is N/A. Rollback is Reversible.
