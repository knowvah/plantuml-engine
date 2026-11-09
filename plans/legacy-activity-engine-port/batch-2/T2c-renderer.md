# T2c — renderer and chrome

**Java:** `svek/SvekResult.java` (draw order), `svek/SvekEdge.java#drawU` (path, arrowheads, labels, `<g class="link">`
attributes, the `<!--link A to B-->` comment), `svek/Cluster.java` (partition drawing), `svek/image/EntityImageNote`,
`net/atmp/CucaDiagram.java` export and `TextBlockExporter` for chrome; `klimt/font/FontParam.java:158-160` (arrow
font 11 on `ACTIVITY`).

**Writes:** `src/diagrams/activity-legacy/renderer*.ts`, `index.ts` (layout and render wired), `src/core/assemble-svg.ts`
(D4), `plans/legacy-activity-engine-port/measurements/row-diffs.mts` (D9 in the README's measurement list),
`tests/unit/activity-legacy/renderer.test.ts`.
**Reads:** `src/diagrams/description/renderer*.ts` and `src/diagrams/state/renderer*.ts` for how svek results are
drawn here; `plans/board-engine-port/measurements/row-diffs.mts`.

## Acceptance
- Given `bokuba-91-poda774` through `activityLegacyPlugin` directly (not yet registered), then `compareSvg` against
  its oracle reports 0 diffs, or every remaining diff is journalled with its owner.
- Given `lap-chrome`, then title, header, footer, legend and caption sit where the oracle has them, and the root
  still says `data-diagram-type="ACTIVITY"` (D4).
- Given `row-diffs.mts`, then it renders every row `legacy-rows.mjs --json` lists through the plugin and prints each
  row's diff count.

Observability: N/A — no new observable operations. Rollback: Reversible.
