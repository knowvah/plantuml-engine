# T4a — Turn the engine on

**Read:** `src/diagrams/nwdiag/index.ts` (the shape to mirror), `src/registered-plugins.ts` (`registerFromSalt`, the
`dedicationPlugin // java:186` and `jsonPlugin // java:190` lines), `src/core/block-extractor.ts` (`START_SUFFIX_MAP`
near 139, the comment near 430 naming eight port-only tags, `PORT_TO_UPSTREAM`), `src/core/document-back-color.ts`,
`src/core/assemble-svg.ts` (the `NWDIAG`/`EBNF`/`REGEX` titled path near 325), `src/core/clock.ts`,
`tests/oracle/svg-conformance/{capture-clock.ts,capture-clock.test.ts,render-fixture-gantt.ts}`,
`scripts/record-capture-clock.ts`; `DiagramType.java:197-200, 274-275`; `PSystemBuilder.java:187, 283-284`; rep's
journal row for its T3a; D2, D4, D8, D9, D10, D14.

**Do:**

1. `src/diagrams/timing/index.ts`: `timingPlugin`, nwdiag's `index.ts` with `TIMING`, `timingDiagram` and the timing
   factory substituted (`calculateBackColor`, `muteColorMapper`, `calculateMargin`, the chrome and no-chrome export
   paths), and the render's `Clock` handed to `TimingDiagram` for `use date format` (D4).
2. `src/registered-plugins.ts`: `registry.register(timingPlugin); // java:187` after `dedicationPlugin`.
3. `src/core/block-extractor.ts`: remove `timing: 'timing'` from `START_SUFFIX_MAP` and amend the comment to seven
   port-only tags, naming D10; keep `'timing'` in `DiagramType` and `PORT_TO_UPSTREAM`.
4. `src/core/document-back-color.ts` and `src/core/assemble-svg.ts`: `TIMING` beside `NWDIAG`, with a
   `DIAGRAM_TYPE_TIMING` constant.
5. `capture-clock.ts#isClockDependentSource`: a `@startuml` source with a `use date format` line reads the zone (D4);
   record `timing/mekivo-95-xafe506` in `oracle/capture-clock.json` with `scripts/record-capture-clock.ts`, zone
   `America/Chicago` (the capture host's), `epochMillis` from the cached `in.svg`'s mtime. Give `row-diffs.mts` and
   `fixtures.mts` the capture clock (`render-fixture-gantt.ts` shows how), and create `render-fixture-timing.ts` now if
   it is the simplest route (T5 owns it otherwise).
6. Fix the unit tests that enumerate engines, types or plugins (`git grep -n "nwdiag" tests/unit` finds them).
7. Measure alone: survey `timing` and `unknown` into `/tmp/tep-T4a/`, then `verdict-diff`, `survey-moves` for both
   buckets, `timing-rows.mjs`, and `row-diffs.mts` over all 158. Journal the histogram of first diffs; each mechanism
   goes to T4c or T4d. Then the full survey (batch-close order) to see every engine.

**Tests:** `renderSync` on `cov-concise-basic` gives `data-diagram-type="TIMING"` and 251 × 106; on `cov-chrome-all`,
151 × 229; `cov-starttiming-tag` renders an error page, not a timing diagram (D10); `cov-embedded` draws the timing
diagram inside the note (276 × 223); `cov-date-format` with the `America/Chicago` clock labels `20-07-03`, and with
`DEFAULT_CLOCK` (UTC) `20-07-04`; `cov-date-julian` and `cov-unknown-player` render error pages, not throws out of
`renderSync`; `upstreamTypeOf('timing')` is `TIMING`.

## Acceptance
- Given the surveys, then no row in any engine leaves conformant (`verdict-diff` exit 0), and the six jar-error rows of
  D8 are still conformant.
- Given `capture-clock.test.ts`, then it passes with `mekivo-95-xafe506` recorded and no stale row.
- Given `npm test`, then it passes; routing and refusal gates may need T5's re-pin: if they fail only on the timing rows
  moving from `known-misroute`/`none`, do T5's re-pin step here and journal it.

Observability N/A. Rollback Reversible.
