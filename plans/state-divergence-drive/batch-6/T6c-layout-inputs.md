# T6c — `dotEqual` and `layoutEqual` false

Commit: `fix(state): layout inputs the jar's DOT disagrees with`.

## Context
D10: these paths shell out to graphviz, so geometry is a target. As planned:

- `dotEqual` false (7): `cafafo-65`, `fejuja-91`, `jibizo-72`, `tucotu-42`, `vogimu-84`, `xetase-70`, `xijice-10`.
- `layoutEqual` false (21, per `npm run svg:survey` fields): find them with `layoutEqual === false` in the survey file; `viroxo-69`, `fotuje-06`, `bunade-42`, `mosigo-88`, `nimise-04`, `rijoki-89`, `polodo-05`, `nimana-36`, `maruju-55` among them.

`tucotu-42`: `frame state_machine {` in a state diagram (`CommandCreatePackageState`, `USymbol`, `Cluster.java:353` skips `drawUState` when `getUSymbol() != null`). `viroxo-69` is DOT member order in a cluster (`DIVERGENCES.md:797`). `cafafo-65`: four directions from `[*]`. `jejani-73`,
`dikipu-79`: self-loops and links on a composite with sub-pixel `@d`.

Compare `svek-N.dot` (`scripts/dot-sync-probe.ts`, `dot-sync-drilldown.ts`, `tests/oracle/svek-dot.ts`). Run real `dot -Tdot` before blaming dot-engine. A verified dot-engine finding: `docs/graphviz-issues/` and `TRACKER.md`.

## Acceptance
- Given the row list, when T6c closes, then each row's DOT equals the jar's or a journal line states why, with `file:line`.
- Given a dot-engine finding, then it is filed, and no write went outside this repository.

Split per mechanism as they emerge. Observability: N/A — no new observable operations. Rollback: Reversible.
