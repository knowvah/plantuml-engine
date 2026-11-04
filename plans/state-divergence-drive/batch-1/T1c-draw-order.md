# T1c — clusters, then nodes, then lines

Commit: `fix(state): draw each svek level as SvekResult does`.

## Context
`SvekResult#drawU` (`svek/SvekResult.java:70-100`): every cluster in `Bibliotekon#allCluster`, then every node in `allNodes`, then every line in
`allLines`. Ours recurses (`renderer.ts:257-282`): a cluster, its children, its transitions, then the next cluster. So `vogotu-43` draws `A`,
`AInternal`, `B`; the jar draws `A`, `B`, `AInternal`, because the empty `AInternal` is a leaf in `allNodes`. That is the `@class` first diff on 35
rows. Link order differs too (`dogeji-46`, `polodo-05`, 37 `lnkN` swaps): `Bibliotekon.java:88-104,117` fixes both orders, so read it and
`GraphvizImageBuilder.java:226,408-433` (`printGroups`, `printGroup`) for where clusters and nodes are added.

D2: build the three lists in one function citing `SvekResult.java:72-100`. An autonom composite (`InnerStateAutonom.java:143`) stays nested, drawing
its own inner `SvekResult`. `ConcurrentStates.java#drawU` keeps its flat sequence. A cluster's `<a>` wrap moves with its own group.

## Read
`renderer.ts:195-303`; `renderer-group.ts`; `state-composite-pass.ts`; `svek/Bibliotekon.java:52-120`, `svek/GraphvizImageBuilder.java:226,408-433`.

## Acceptance
- Given `vogotu-43-puli923`, when rendered, then `g[2]` is `cluster` and the first diff is past the node list.
- Given every currently conformant row, then none leaves conformant (`state-moves.mjs` exit 0).
- Given `dogeji-46`, then its links appear in the jar's order, with `lnkN` equal.

Observability: N/A — no new observable operations. Rollback: Reversible.
