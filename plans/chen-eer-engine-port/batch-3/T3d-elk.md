# T3d: `!pragma layout elk`

**Java:** `net/atmp/CucaDiagram.java:478-479` (the ELK switch), `elk/CucaDiagramFileMakerElk.java`, `elk/MyElkDrawing.java`.

**Read in the port:** `src/core/elk/`, `src/diagrams/description/description-elk-adapter.ts` (`requiresElk`, the async
layout service), and issue #158's body (the same seam for legacy activity).

**Do:**
1. Add a `requiresElk` hook to `chenPlugin` that reads the pragma, as description's does. A diagram that asks for ELK
   must never fall back to dot-engine silently.
2. Write `cheneer-elk-adapter.ts`, mapping Chen leaves and links to `ElkDiagramAdapter`. Draw leaves through the T2a
   images and edges through `MyElkDrawing`.
3. Measure `cov-elk` and any authored ELK fixture. Under the 2026-10-11 ruling, elkjs geometry against Java ELK is the
   only library-forced delta: name each remaining diff with its mechanism.
4. If the work proves large and separable, measure that and follow D5: file a `queue:ready` issue, add "Blocked by" to
   #136, and journal the measurement.

## Acceptance
- Given `cov-elk`, then our render goes through ELK (no graph reaches `setLayoutInputObserver`), and every remaining
  diff is named.

Observability is N/A: there are no new observable operations. Rollback is Reversible: revert the commit.
