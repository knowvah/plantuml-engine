## Observation: manageEntryExitPoint is not idempotent and runs per draw
- **Context**: `perapa-23`, `banatu-09`, port clusters off by a fraction, T5d.
- **Finding**: `Cluster#drawU` calls it each draw (`Cluster.java:344-345`) and `SvekEdge.java:663` calls it from the solve. The rectangle of a port cluster depends on the call count: walk rectangle after `E + 1`, final after `E + 2`, `E` the lines whose projection cluster it is. `geo.portFinalBbox` handles `E = 0`.
- **Impact**: a port cluster that is also an edge end with a title near its width may differ by a fraction. No row in the corpus shows it.
- **Confidence**: High for E = 0, measured; Medium for the E > 0 reading.
