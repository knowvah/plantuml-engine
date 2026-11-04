# T6a — concurrent regions

Commit: `fix(state): cluster composites with regions`.

## Context
dss 14: a cluster composite with `--` regions draws a dashed-rect leaf. `jijuze-43` (`state XA6 { XA6 --> XA1 | -- | state XA13 }`): ours has an extra `<rect … stroke-dasharray="6,3">` `entity` at `ent0006`, jar has none, with `XA13` at `x=37.85`. Also
`darime-88`, `lumamo-63`, `jetuse-93`: inner `rect` `#FFF` height 74 against `#F1F1F1` 50. `ConcurrentStates.java#drawU`, `StateDiagram#concurrentState`, `state-composite-concurrent.ts:291-300`. When is a region a cluster, when autonom? `Separator.java` (*lead*). `fejuja-91` uses `||`.

## Acceptance
- Given `jijuze-43-ceva131` and `darime-88-moda428`, when rendered, then each is conformant, with no dashed-rect leaf.

Observability: N/A — no new observable operations. Rollback: Reversible.
