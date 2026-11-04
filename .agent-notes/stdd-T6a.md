## Observation: a prior mission's scoping can be a dot-engine artifact in disguise
- **Context**: stdd T6a, jetuse-93's `Running` 5 px narrower than the jar after every element matched.
- **Finding**: `computeSvekResultGeometry` folded arrowhead ink only for self-loops (state-declared-size-fix T9, 2026-08-18) because folding every arrowhead grew fovafu-44 and kejabo-83 at the time; T9's own journal names dot-engine endpoint geometry (graphviz issue 15) as the cause. The jar folds every extremity (`SvekEdge.java:1108-1142`, `LimitFinder.java:169-177`, `HACK_X_FOR_POLYGON = 10`). With issue 15 fixed, the unconditional fold is byte-exact on fovafu, kejabo, pebepi, taxile, tigibi and closes jetuse.
- **Impact**: a scoping comment that cites a dot-engine delta is a flag to re-measure, not a rule to keep; three oracle probes (`/tmp/stdd-t6a-probe`, outer start on/off, inner start on/off, no `--`) isolated the element before any Java was blamed.
- **Confidence**: High

## Observation: a region re-entering a cluster pass is three mechanisms, not one
- **Context**: jijuze-43 (`state XA6 { XA6 --> XA1 -- state XA13 }`), the only cluster-owned region in the corpus.
- **Finding**: (1) the region's image is the raw `SvekResult` (`GroupMakerState.java:116-117`) — no group, no box; (2) the leaf is sized `minMax + (15,15)` with content at `(6 - minX, 6 - minY)` (`SvekResult.java:130-135`), the same `regionInkGeometry` the stacked case uses; (3) `Entity#leafs()` orders the region among its siblings by creation tick (`Entity.java:649-657`), and links run on pass TWO (`CommandLinkStateCommon.java:70-72`) so a link-made endpoint sorts after a pass-ONE `--`.
- **Impact**: the `--` handler must keep the `cpt1` tick it burns (`State.concurrentRegionCreationIndexes`); any future consumer ordering cluster members must sort leafs and regions together.
- **Confidence**: High
