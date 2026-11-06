# T3b — The ELK path reads `arrowthickness`

**Row:** `vakasu-51`, `svg/g[1]/line[1..5]/@stroke-width` and `polygon[1]/@stroke-width`, ours 1.042, jar 3.125 (`3 × 100/96`). Link: `A -[#orange,dashed]-> B`.

**Read:** `MyElkEdge.java:169-180`, `LinkType.java:245-256` (`getStroke3`), `SkinParam.java` `getThickness` and `getThicknessSlow` (`getValue("arrowthickness")`), theme `arrow { Thickness 3 }` (`puml-theme-united.puml:281-282`); `src/core/elk/MyElkEdge.ts:236-250`, `src/core/elk/ElkDiagramAdapter.ts:196-197`, `src/diagrams/description/description-elk-adapter.ts:388-390`, `src/diagrams/class/class-elk-adapter.ts`, and the dot path's read in `src/core/svek/svek-edge-stroke.ts`, which already draws 3.125 on `rosoga-84`.

**Mechanism:** `getArrowThickness()` is `return null`, so `getStroke3(null)` keeps the link's own 1. Return the skinparam's stroke as the dot path does, through one shared reader, in **both** adapters if the class one is the same stub.

**Red:** authored ELK rows with oracles: `skinparam arrowthickness 3` × dashed, dotted, plain, `-[thickness=5]->`, in description and class.

**Measure:** `c4`, `class`, `unknown`.

## Acceptance
- Given `vakasu-51`, when surveyed, then `verdict` is `conformant`, or the journal names what remains.
- Given each authored row, when compared with its oracle, then 0 diffs.
- Given `class` and `unknown` surveys, then 0 conformant lost.

Observability N/A. Rollback Reversible.
