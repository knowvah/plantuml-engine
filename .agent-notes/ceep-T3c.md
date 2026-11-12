## Observation: no svek engine but Chen passes `!pragma ratio` / `!pragma aspect` to the DOT
- **Context**: ceep T3c1, `cov-pragma-ratio` (60 diffs, `svg/@height 471 vs 470`).
- **Finding**: `CucaDiagram#getDotStringSkek` appends `aspect=`/`ratio=` lines (`net/atmp/CucaDiagram.java:405-412`) that `DotStringFactory#createDotString` copies verbatim into every svek DOT. `CucaDiagramBase2.ts#getDotStringSkek` builds them, but only `cheneer-dot.ts#skekGraphAttrs` reads them; class, description, state, object and activity-legacy DOT builders never do. dot-engine honours `ratio` (the Chen fixture went to 0 once it was passed). `DotInputGraph.ratio` (additive) and `aspect: number | string` now exist in `graph-layout.types.ts`.
- **Impact**: any `!pragma ratio` row in those engines is a divergence nobody measured; each engine's DOT build should spread the same two attributes.
- **Confidence**: High (Chen measured; other engines read by grep only)

## Observation: the "Empty description" page listed one line and named the routing key
- **Context**: ceep T3c3, `cov-empty`.
- **Finding**: fixed in `src/core/error/error-diagrams.ts#emptySvg` for every typed block: the jar lists the start line and the next one (`PSystemCommandFactory.java:117-121`) and prints `humanReadableName` (`packetdiag` → `packet`, `chen` → `chen_eer`).
- **Impact**: error pages count as pairs in the survey, so no verdict moved; byte-level error-page tests now see the second line.
- **Confidence**: High
