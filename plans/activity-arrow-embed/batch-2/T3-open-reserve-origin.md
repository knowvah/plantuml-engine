# T3 — the open embed: reserve, canvas origin and width read one measure

**Writes (expected; T1 overrides):** `src/diagrams/activity/layout/tile-layout-inlabel.ts`,
`src/diagrams/activity/layout/canvas-origin-text-ink.ts`, `src/diagrams/activity/activity-draw-extent.ts`,
`tests/diagrams/activity/aae-arrow-embed-open.test.ts` (create),
`tests/oracle/svg-conformance/edge-label-embed.authored.test.ts` (move `act3-open` to ZERO).
**Reads:** `.agent-notes/aae-T1.md`, T2's commit, `tests/fixtures/edge-label-embed/act3-open.{puml,svg}`,
`tests/diagrams/activity/layout/canvas-origin.test.ts`, `canvas-bounds.test.ts`.

## Context

In `act3-open` (`-> {{;`, the 532x227 Welcome page) every node of ours sits 31.5 lower and the canvas is 586x342
against the jar's 585x339. T1 names the consumer(s) and the jar's arithmetic there. D3: every consumer reads T2's
measure, or the drawn extent where the Java says so.

## Task

1. **Red.** In `aae-arrow-embed-open.test.ts`, assert from `act3-open.svg`: the start `ellipse` `cy="25"`, the `:a`
   `rect` `y="55"`, the arrow `y1="87" y2="107"`, the `<image>` `532x227` at `(33.338, 92)`, and the canvas `585x339`.
   If T1 found the 1-px width in scope, assert the canvas width of `act3` and `act3-mixed` (114) here too.
2. **Green.** Make each consumer T1 named read the T2 measure (or the T2-exported drawn-extent function), with the Java
   quote in its JSDoc. No consumer re-derives the block size.
3. **Measure.** `act3-open` reaches 0; no row rises. Run the activity gates and survey; `canvas-bounds.test.ts` must stay
   green (containment: every drawn element inside the canvas).
4. **Pin.** Move `act3-open` to ZERO (`'act3-open': 1`) with a dated comment. If the 1-px width was in scope and is now
   fixed, add `act3-mixed` (from `measurements/probes/`) to the fixtures and ZERO list.

## Acceptance
- Given `act3-open.puml`, when rendered, then every node matches the jar's y, the image is at (33.338, 92), the canvas is
  585x339, and the authored gate holds it at 0 diffs with 1 `<image>`.
- Given the activity golden ratchet and canvas-bounds test, when run, then both pass with the same counts as after T2.
- Given `grep -rn "edgeLabelBlockSize\|edgeLabelBlock(" src/diagrams/activity`, when read, then every block-size consumer
  goes through the one measure (D3).

Observability N/A. Rollback Reversible. Commit e.g. `fix(activity): reserve and bound a {{ arrow label as the jar does`
with `Refs: #188`.
