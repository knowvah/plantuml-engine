# T1c — The arrowhead stays on the target under `left to right direction`

**Rows:** `sivapa-41-sebu112` (16 diffs), `satuco-50-vusa163` (23 diffs). Ours draws the head at `40,44`, the source end; the jar at `72.5,113`, the target end. `svg/@width` follows on `sivapa` (101 against 106), since the trim moves.

**Evidence, jar probes on 2026-11-05, both maps with one row:** `left to right direction` + `AAAA::ffff1 -> CCCC::ssss` or `=>` fails. No direction + `->` or `=>`, `left to right direction` + `-->`, and `left to right direction` + class leaves `A => B` all give 0 diffs. So the trigger is LR, a single dash (`minlen=0`, flat), and ports.

**Lead, unconfirmed:** `class-edge-geo.ts` ends `normalizeEdgePoints` with `matchesFromTo = dotSwap === reversed`, while the comment above says "iff exactly one of {dotSwap, reversed} holds". Trace it: log `rawPts`, `dotSwap`, `reversed` on `sivapa` first. Dot may return this flat edge target-to-source, which would be the only corpus route to `reversed === true` with `dotSwap === false`. `SvekEdge.java:636-655` reverses the path and leaves the decors where they are.

**Read:** `SvekEdge.java:636-655`, `class-edge-geo.ts:105-136`, `class-dot-edge-order.ts`.

**Red:** the two rows' polygon and path values; a TB port edge and a reversed `<-` edge, each with an oracle, must stay green.

**Measure, extra bucket:** this seam serves every class edge. Survey `class` too, and `object-moves.mjs` on that pair.

## Acceptance
- Given both rows, when compared, then conformant.
- Given `-left->` and `<-` port edges under LR, when compared with oracles, then 0 diffs.
- Given `class`, then 0 rows lost.

Observability N/A. Rollback Reversible.
