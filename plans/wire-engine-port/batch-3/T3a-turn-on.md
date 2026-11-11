# T3a — Turn the engine on

**Read:** `src/diagrams/regex/index.ts` (the shape to mirror), `src/registered-plugins.ts`, `src/core/block-extractor.ts`
(`DiagramType` near 42, `START_SUFFIX_MAP` near 159, `PORT_TO_UPSTREAM` near 412), `src/core/assemble-svg.ts:76-79,
326-329`, `src/core/document-back-color.ts:58-59, 87-88`, `src/core/TitledDiagram.ts`; `DiagramType.java:204-205`,
`PSystemBuilder.java:189`; rep's journal row for its T3a; D2, D12, D13.

**Do:**

1. `src/diagrams/wire/index.ts`: `wirePlugin`, regex's `index.ts` with `WIRE` and `parseWire` substituted. The style name
   is `activityDiagram` by `getStyleName`'s last line (`styleNameOf` already answers that); no `STYLE_NAMES` row (D2).
2. `src/registered-plugins.ts`: `registry.register(wirePlugin); // java:189` in upstream order. `wirePlugin` must sit on
   its own line: `scripts/parity-dashboard.ts` reads the lines as text.
3. `src/core/block-extractor.ts`: `'wire'` in the union, `wire: 'wire'` in `START_SUFFIX_MAP`, `wire:
   UpstreamDiagramType.WIRE` in `PORT_TO_UPSTREAM`.
4. `src/core/assemble-svg.ts`: `DIAGRAM_TYPE_WIRE` beside `DIAGRAM_TYPE_REGEX`, on the titled path.
5. Fix the unit tests that enumerate engines, types or plugins (`git grep -n "regex" tests/unit` finds them;
   `tests/unit/utility-registration.test.ts` is one).
6. Measure alone: survey `wire` into `/tmp/wrp-T3a/`, then `verdict-diff`, `survey-moves.mjs`, `wire-rows.mjs` and
   `row-diffs.mts` over all 18. Journal the histogram of first diffs; each mechanism goes to T3c. Then the full survey
   (batch-close order) to see every engine.

**Tests:** `renderSync` on `dogoso-52-labe953` gives `data-diagram-type="WIRE"` and 331 × 851; `cov-chrome-all`, 71 × 204;
`cov-title-only`, 121 × 156 (no throw: unlike regex, the root draws without children); `cov-link-reversed-h`, 366 × 151 (D4);
`cov-embedded` draws the wire diagram inside the note (206 × 248); `cov-dark`'s background `#1B1B1B`; `cov-empty` the
Welcome page; `cov-indent-too-deep` an error page, not a throw out of `renderSync`; `upstreamTypeOf('wire')` is `WIRE`.

## Acceptance
- Given the surveys, then no row in any engine leaves conformant (`verdict-diff` exit 0).
- Given `wire-rows.mjs`, then the 18 rows are surveyed and the journal holds their histogram.
- Given `npm test`, then it passes; the routing and refusal gates may need T4's re-pin: if they fail only on the wire
  rows moving from `known-misroute`/`none`, do T4's re-pin step here and journal it.

Observability N/A. Rollback Reversible.
