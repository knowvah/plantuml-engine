# T3f — state notes inside a composite

Agent: typescript-pro (opus, effort high), worktree `dss-T3f`, branched after T3e merges. Include [../task-contract.md](../task-contract.md).
Commit: `fix(diagrams): draw notes scoped to a composite state (T3f)`.

## Context
Added by the orchestrator under D8 at T3c's hand-back. T3c drew freestanding notes on composites (D7); a note with `scopeId !== ''` is still laid out and never drawn. Measured by T3c against the jar: in an autonom composite 32 diffs, in a cluster composite 47, in a concurrent composite 33, freestanding 0. Corpus sources holding the form: `state/joleju-94-maru748`, `state/tumaba-64-tosu281` (a rough grep: confirm). A note the jar draws and we omit is a defect, and its colours cannot be read until it is drawn. T3c's estimate, unverified: it needs a note spec per pass, or per-pass `posMap`/`edgePosMap`.

## Task
Read how the jar places a note inside a composite (`GeneralImageBuilder`, `svek/SvekResult`, `EntityImageNote`; quote what you find) and how `state-composite-pass.ts` handles a scope. Draw the note where the jar does, through `note`'s resolved colours. Authored rows `state__probe-note-in-{autonom,cluster,concurrent}`, with `<style>` variants; pins are the orchestrator's.

If the geometry turns out to be a mission of its own (the jar's layout differs from a pass's in a way one task cannot carry), stop, give the diagnosis artifact with the measured residual per row, and leave the rows at their count. That outcome is acceptable; a fitted coordinate is not.

## Rows
`state__probe-note-in-*`, new.

## Write-set
`src/diagrams/state/*`, `tests/unit/state/*`, `tests/fixtures/diagram-style-scope/state__probe-note-in-*`.

## Acceptance
- Given the new rows, then 0 diffs, or each residue named with its mechanism.
- Given every state corpus row, then conformant held; a mover with no `<style>`/`skin` moves only toward the jar and is listed with before -> after.

Observability: N/A. Rollback: Reversible.
