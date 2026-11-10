# T3a — Turn the engine on

**Read:** `src/diagrams/packetdiag/index.ts` (the shape to mirror), `src/registered-plugins.ts:76-100`,
`src/core/block-extractor.ts` (`DiagramType`, the start-tag map near line 155, `PORT_TO_UPSTREAM` near line 405),
`src/core/document-back-color.ts:28-56`, `src/core/assemble-svg.ts:279-330`, `src/core/EmbeddedDiagram.ts:287-300`;
`DiagramType.java:174-175, 277-278`; `PSystemBuilder.java:155`; D2, D11.

**Do:**

1. `src/diagrams/nwdiag/index.ts`: `nwdiagPlugin`, `packetdiag/index.ts` with `NWDIAG`, `nwdiagDiagram` and
   `parseNwdiag` substituted (`calculateBackColor`, `muteColorMapper`, `calculateMargin`, the chrome and no-chrome
   export paths, `!option` collection, the emoji store).
2. `src/registered-plugins.ts`: `registry.register(nwdiagPlugin); // java:155` between dot and mindmap.
3. `src/core/block-extractor.ts`: `'nwdiag'` in `DiagramType`, `nwdiag: 'nwdiag'` in the start-tag map,
   `nwdiag: UpstreamDiagramType.NWDIAG` in `PORT_TO_UPSTREAM`. Update the "this port registers N engines" comment.
4. `src/core/document-back-color.ts`: `nwdiag: 'nwdiagDiagram', // java:277-278`, and drop `NWDIAG` from the comment
   listing types with no member.
5. `src/core/assemble-svg.ts`: `NWDIAG` on the titled path beside `PACKET` and `BOARD`, with a `DIAGRAM_TYPE_NWDIAG`
   constant like theirs.
6. Fix the unit tests that enumerate engines, types or plugins (`git grep -n "packetdiag" tests/unit` finds them).
7. Measure: survey `unknown` into `/tmp/nwp-T3a/`, then `verdict-diff`, `survey-moves`, `nwdiag-rows.mjs`, and
   `row-diffs.mts` over all 68. Journal the histogram of first diffs; each mechanism goes to T3b or T3c.

**Tests:** `renderSync` on `cov-no-wrapper` gives `data-diagram-type="NWDIAG"` and the oracle's 210 × 117; on
`cov-chrome-all`, the oracle's 210 × 240; `{{nwdiag ... }}` in a sequence note (`cov-embedded`) draws the nwdiag
inside the note; `upstreamTypeOf('nwdiag')` is `NWDIAG`.

## Acceptance
- Given the `unknown` survey, then no row in any engine leaves conformant (`verdict-diff` exit 0), and the 4 jar-error
  rows are conformant (we error where the jar errors, D6).
- Given `cov-no-wrapper` and `cov-chrome-all`, then each is zero-diff, or the journal names the mechanism and its owner.
- Given `npm test`, then it passes; routing and refusal gates may need T4's re-pin: if they fail only on the 68 rows
  moving from `known-misroute`/`none`, do T4's re-pin step here and journal it.

Observability N/A. Rollback Reversible.
