## Observation: PanelsRobust ignores the initial state's colours and notes
- **Context**: porting `PanelsRobust#setInitialState(String, Colors)` (PanelsRobust.java:338-342) and its constructor (java:72-76).
- **Finding**: `initialColors` is never read, and the constructor passes `notes = null` to `Panels`, so a robust player draws no
  notes at all. Colours reach the drawing only through a two-state change's `getBackColor` (the hatched block); probe
  `cov-state-colors` (`R is X #lightblue`) draws the plain unfilled step.
- **Impact**: do not "fix" either. Oracle `cov-notes` (`note bottom of WB` on a robust player) contains no note text at all, so
  the jar draws none; T3a/T4 must not draw it either.
- **Confidence**: High (oracle `cov-state-colors`, `cov-notes`)

## Observation: tests/fixtures/timing/cov-robust-edges.puml authored by T2d
- **Context**: no planning probe reaches `is N pixels height`, an initial state beside a wider panel, a hidden change and a
  comment on a robust player together.
- **Finding**: authored with `scripts/oracle-render.sh /tmp/tep-oracle`; the jar draws TIMING; its right/left panel
  elements are `ROBUST_EDGES_*` in `tests/unit/timing/helpers/oracle.ts`.
- **Impact**: T4b should keep it (it already exists) rather than author a duplicate.
- **Confidence**: High
