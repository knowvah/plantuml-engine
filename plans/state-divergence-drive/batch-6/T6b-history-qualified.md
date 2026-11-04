# T6b — history and qualified endpoints

Commit: `fix(state): history pseudostates and qualified endpoints`.

## Context, each a *lead*
- `butigu-57`, `diteme-18`: `Comp[H]`, cx swapped (90 against 33): which side of the cluster. `CommandLinkStateCommon#getEntityStart`, `getEntityEnd`, `StateDiagram#getHistorical`; DOT order.
- `vogimu-84`: `[*] --> ma::Foo1`, jar id `*start*-to-ma::Foo1`, width 112 against 226. Ours resolves `ma`. `Quark`, `Entity#getName` without `set separator none`.
- `dot`-separator rows that T1d left.
- dss 14's border-point cluster with an 8 px link (`state__hist-*`): find the rows in `oracle/goldens/diagram-style-scope.json`.

## Acceptance
- Given `butigu-57-tobi481` and `vogimu-84-bali512`, when rendered, then each is conformant, or a journal line names what remains.

Observability: N/A — no new observable operations. Rollback: Reversible.
