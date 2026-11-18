## Observation: description's cluster magnet skips symbol-less PACKAGE groups
- **Context**: lpl T2a, a link to a legacy partition (a PACKAGE group with no USymbol) needs the folder's magnetic border (`Cluster.java:726-758`).
- **Finding**: `Cluster#getMagneticBorder` returns `MagneticBorderNone` only for `getUSymbol() == null && getGroupType() != PACKAGE` (`:728-729`); a symbol-less PACKAGE takes its package style's symbol (`ClusterDecoration#guess`). Our `src/core/svek/Cluster.ts` returned None for every symbol-less group. lpl added the opt-in `ClusterSymbolInfo.packageGroup`; only legacy activity sets it. Description's `renderer-draw-sequence.ts:295` (`buildCluster(...).getMagneticBorder()`) does not.
- **Impact**: a description link to a symbol-less PACKAGE group (if one reaches that path) may miss the 20px tab pull the jar applies. Unmeasured; author a probe before changing description.
- **Confidence**: Medium (code shape read, no description fixture measured)

## Observation: a group self-link is shifted by the jar's moveDelta twice
- **Context**: lpl T2a, `partition-link-self` (canvas 10px short, loop 17.68px left).
- **Finding**: `SvekEdge.java:863-869` translates a group auto-link by `cl.width - (start.x - cl.minX)`; `Cluster#moveDelta` moves the box but `SvekEdge#moveDelta` only accumulates `dx` (`:1241-1244`), so the final draw adds `dx` again, and the measuring pass (`dx = 0`) places it differently. State (`shiftGroupAutoLinks`) and description (`autoLinkOfAGroupShift`) already port it; legacy now does in `renderer-svek-result.ts#autoLinkOfAGroupDx`.
- **Impact**: three engines carry the same quirk in three places; a shared core helper would be the next refactor.
- **Confidence**: High
