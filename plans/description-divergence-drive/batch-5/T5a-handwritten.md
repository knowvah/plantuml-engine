# T5a — `skinparam handwritten`

Commit: `fix(description): draw handwritten diagrams through the hand graphic`.

## Context
The jar wraps the graphic in `UGraphicHandwritten` with `new Random(424242L)` (`klimt/drawing/hand/UGraphicHandwritten.java:54`), so its jitter is deterministic. The port has `core/klimt/drawing/hand/`, and `core/UgDiagram.ts:141` wraps it. `vakixe-15` shows `ellipse` against `polygon`, so description does not reach that wrap: it emits its own document (`description/index.ts`, "klimt emits a complete document itself"). `java.util.Random` must be ported exactly: read what `hand/` uses before assuming. A canvas 153 against 287 wide on `vakixe-15` says `newpage` also matters, and `cumofi-94`'s note says a deprecation-warning block is drawn: read `TitledDiagram#isHandwritten`, `SkinParam.java:583`, and the warning.

## Rows
`cumofi-94`, `doculo-43`, `gesapu-18`, `vakixe-15`, `betifi-05`.

## Acceptance
- Given `betifi-05`, when rendered, then every jittered coordinate matches, with zero diffs.
- Given `cumofi-94`, then the warning block matches.

Observability: N/A — no new observable operations. Rollback: Reversible.
