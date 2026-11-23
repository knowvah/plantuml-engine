# T2 — port the arrow-label block measure

**Writes (expected; T1 overrides):** `src/diagrams/activity/layout/compress/edge-label-anchor.ts`,
`src/diagrams/activity/activity-creole-sheet.ts` and/or `activity-text-sheet.ts`,
`tests/diagrams/activity/aae-arrow-embed-block.test.ts` (create),
`tests/oracle/svg-conformance/edge-label-embed.authored.test.ts` (move `act3` to ZERO).
**Reads:** `.agent-notes/aae-T1.md`, the task-contract spine, `tests/fixtures/edge-label-embed/act3.{puml,svg}`.

## Context

T1 states why the jar's embed-only arrow-label block is 10 tall. Ours is 27.111, so the image is drawn at
`mid - 13.556` (y 83.444) instead of `mid - 5` (y 92).

## Task

1. **Red.** In `aae-arrow-embed-block.test.ts`, render `act3.puml` with `renderSync` + `DeterministicMeasurer` and assert
   the jar's `<image>` `width="61" height="68" x="33.338" y="92"`, the `:a`→`:b` arrow `y1="87" y2="107"`, and the
   canvas from `act3.svg`. Add a unit assertion on `edgeLabelBlockSize` for the label equal to the jar's `dim` that T1
   established, citing its `file:line`. Add one embed-free label (`hello\nworld\nthree`) whose size must stay
   unchanged (D3). Confirm the new assertions fail.
2. **Green.** Port T1's mechanism at its origin. No literal 10 (D2). `act3-mixed` must stay at its image placement.
3. **Measure** (contract step 5). `act3` must reach 0 diffs; `act3-open` and `act3-mixed` may not rise.
4. **Pin.** Move `act3` from OPEN to ZERO (`act3: 1`) with a dated `// 2026-… aae T2` comment.

## Acceptance
- Given `act3.puml`, when rendered, then the `<image>` is 61x68 at (33.338, 92) and the authored gate holds it at 0
  diffs with 1 `<image>`.
- Given the embed-free 3-line label, when measured, then `edgeLabelBlockSize` returns the same size as at `<base>`, and
  the activity golden and diff-baseline ratchets pass unchanged.
- Given the activity survey with `--out`, when compared with `<base>`, then no activity row loses its verdict.

Observability N/A. Rollback Reversible. Commit e.g. `fix(activity): measure a {{ arrow label as the jar's block` with
`Refs: #188`.
