# T4a — Turn the engine on

**Read:** `src/diagrams/nwdiag/index.ts` (the shape to mirror), `src/registered-plugins.ts:77-100`,
`src/core/block-extractor.ts` (`DiagramType`, the start-tag map near line 157, `PORT_TO_UPSTREAM` near line 408),
`src/core/document-back-color.ts:28-56`, `src/core/assemble-svg.ts:76, 300-330`, `src/core/EmbeddedDiagram.ts:285-300`;
`DiagramType.java:129-130, 280-281`; `PSystemBuilder.java:196`; `tests/oracle/svg-conformance/emitter.golden.test.ts:120-160`;
nwp's journal row 22 (`plans/nwdiag-engine-port/decision-journal.md`); D2, D8, D13.

**Do:**

1. `src/diagrams/ebnf/index.ts`: `ebnfPlugin`, `nwdiag/index.ts` with `EBNF`, `ebnf` and `parseEbnf` substituted
   (`calculateBackColor`, `muteColorMapper`, `calculateMargin`, the chrome and no-chrome export paths, `!option`
   collection — `useDescriptiveNames` and `language` must reach `ETileBox`, the emoji store).
2. `src/registered-plugins.ts`: `registry.register(ebnfPlugin); // java:196` after `hclPlugin`, and widen the
   function's `@see` range if it stops short.
3. `src/core/block-extractor.ts`: `'ebnf'` in `DiagramType`, `ebnf: 'ebnf'` in the start-tag map,
   `ebnf: UpstreamDiagramType.EBNF` in `PORT_TO_UPSTREAM`; update any "this port registers N engines" comment.
4. `src/core/document-back-color.ts`: `ebnf: 'ebnf', // java:280-281`, and the comment names only `REGEX` as missing.
5. `src/core/assemble-svg.ts`: `EBNF` on the titled path beside `NWDIAG`, with a `DIAGRAM_TYPE_EBNF` constant.
6. Fix the unit tests that enumerate engines, types or plugins (`git grep -n "nwdiag" tests/unit` finds them).
7. Measure: survey `ebnf` into `/tmp/eep-T4a/`, then `verdict-diff`, `survey-moves`, `ebnf-rows.mjs`, and
   `row-diffs.mts` over all 44. Survey `class` too (`vamero-64-fore412` embeds `{{ebnf}}`). Journal the histogram of
   first diffs; each mechanism goes to T4b or T4c.
8. `ladifa-97-keme950` (D8): confirm with `row-diffs.mts` that we now refuse line 5 with `Syntax Error?` and the
   survey prints it conformant. When `emitter.golden.test.ts` goes red on it, move its entry to `retired` exactly as
   nwp did for its four (`retiredAt`, `retiredBy: "ebnf-engine-port T4a, unsigned: the maintainer signs at review
   (#125)"`), and nothing else in the file. Then open the `needs-ruling` issue: title "ebnf: confirm retiring the
   accepted divergence on ladifa-97-keme950 (jar errors, we error)", body naming the jar's message and line, ours, the
   gate that forced the move, how to undo it, and a link to #165; labels `parity`, `needs-ruling`. If `gh issue
   create` is denied, leave the body in `.agent-notes/eep-T4a.md` and journal it.

**Tests:** `renderSync` on `cov-multiline-rule` gives `data-diagram-type="EBNF"` and the oracle's 184 × 118; on
`cov-chrome-all`, 146 × 241; `{{ebnf … }}` in a sequence note (`cov-embedded`) draws the EBNF inside the note (339 ×
235); `upstreamTypeOf('ebnf')` is `EBNF`.

## Acceptance
- Given the `ebnf` and `class` surveys, then no row in any engine leaves conformant (`verdict-diff` exit 0), and
  `ladifa` is conformant as an error pair.
- Given `emitter.golden.test.ts`, then it passes, with exactly one entry moved to `retired` and none added or edited.
- Given `npm test`, then it passes; routing and refusal gates may need T5's re-pin: if they fail only on the 44 rows
  moving from `known-misroute`/`none`, do T5's re-pin step here and journal it.

Observability N/A. Rollback Reversible.
