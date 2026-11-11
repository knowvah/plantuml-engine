# T3a — Turn the engine on

**Read:** `src/diagrams/ebnf/index.ts` (the shape to mirror), `src/registered-plugins.ts` (the `ebnfPlugin` line, `//
java:196`), `src/core/block-extractor.ts` (`DiagramType` near line 42, the start-tag map near 159, `PORT_TO_UPSTREAM`
near 411), `src/core/document-back-color.ts:28-50`, `src/core/assemble-svg.ts` (the `EBNF` titled path),
`src/core/EmbeddedDiagram.ts:285-300`; `DiagramType.java:186-187, 283-284`; `PSystemBuilder.java:197`;
`tests/oracle/svg-conformance/emitter.golden.test.ts`; eep's journal row for its T4a (`plans/ebnf-engine-port/
decision-journal.md`); D2, D5, D8, D12.

**Do:**

1. `src/diagrams/regex/index.ts`: `regexPlugin`, `ebnf/index.ts` with `REGEX`, `regex` and the regex factory
   substituted (`calculateBackColor`, `muteColorMapper`, `calculateMargin`, the chrome and no-chrome export paths,
   `!option` collection so `useDescriptiveNames` and `language` reach `ETileBox`, the emoji store).
2. `src/registered-plugins.ts`: `registry.register(regexPlugin); // java:197` after `ebnfPlugin`.
3. `src/core/block-extractor.ts`: `'regex'` in `DiagramType`, `regex: 'regex'` in the start-tag map,
   `regex: UpstreamDiagramType.REGEX` in `PORT_TO_UPSTREAM`; update any engine-count comment.
4. `src/core/document-back-color.ts`: `regex: 'regex', // java:283-284`, and drop the comment saying `REGEX` has no
   member.
5. `src/core/assemble-svg.ts`: `REGEX` on the titled path beside `EBNF`, with a `DIAGRAM_TYPE_REGEX` constant.
6. Fix the unit tests that enumerate engines, types or plugins (`git grep -n "ebnf" tests/unit` finds them).
7. Measure: survey `regex` into `/tmp/rep-T3a/`, then `verdict-diff`, `survey-moves`, `regex-rows.mjs`, and
   `row-diffs.mts` over all 46. Journal the histogram of first diffs; each mechanism goes to T3c.
8. D8: confirm with `row-diffs.mts` that bakuza and tajefa are error pairs and the survey prints them conformant. When
   `emitter.golden.test.ts` goes red on them, move both entries to `retired` exactly as eep did for `ladifa`
   (`retiredAt`, `retiredBy: "regex-engine-port T3a, unsigned: the maintainer signs at review (#126)"`), and nothing
   else in the file. Then open one issue: title "regex: confirm retiring the accepted divergences on
   bakuza-41-bulo451 and tajefa-31-pefi801 (jar errors, we error)", body per D8, labels `parity`, `needs-ruling`. If
   `gh issue create` is denied, leave the body in `.agent-notes/rep-T3a.md` and journal it.

**Tests:** `renderSync` on `leluxe-05-lava324` gives `data-diagram-type="REGEX"` and the cached SVG's size; on
`cov-chrome-all`, 212 × 246; on `cov-multi-line`, 96 × 89; `{{regex … }}` in a sequence note (`cov-embedded`) draws
the railroad inside the note (361 × 233); `upstreamTypeOf('regex')` is `REGEX`; `cov-title-only` renders an error page,
not a throw out of `renderSync`.

## Acceptance
- Given the `regex` survey and the full survey, then no row in any engine leaves conformant (`verdict-diff` exit 0),
  and bakuza and tajefa are conformant as error pairs.
- Given `emitter.golden.test.ts`, then it passes, with exactly two entries moved to `retired` and none added or edited.
- Given `npm test`, then it passes; routing and refusal gates may need T4's re-pin: if they fail only on the 46 rows
  moving from `known-misroute`/`none`, do T4's re-pin step here and journal it.

Observability N/A. Rollback Reversible.
