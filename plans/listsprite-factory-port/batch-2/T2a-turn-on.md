# T2a: turn it on

**Writes:**
- `src/core/klimt/sprite/listsprite-export.ts`, `src/core/klimt/sprite/ListSpriteDiagramFactory.ts` (`listSpritePlugin`);
- `src/registered-plugins.ts`, `src/core/block-extractor.ts` (`'sprites'` in `DiagramType`, `START_SUFFIX_MAP`,
  `PORT_TO_UPSTREAM`), `src/core/diagram-type-set.ts` (the "no engine" doc comment, if it names `SPRITES`);
- `tests/unit/utility-registration.test.ts` (`JAVA_LINE` gains `[listSpritePlugin, 170]`, plus an engine sample if the
  file keeps one per plugin, as ceep's row 17 found);
- `tests/unit/core/klimt/sprite/listsprite-export.test.ts`.

**Read:**
- `core/TextBlockExporter.java:153-209,510-516`, `TitledDiagram.java:107-118,273-289`, `core/DiagramType.java:193-200,234-296`;
- `src/diagrams/regex/index.ts` (chrome around `BODY_ANCHOR`, `exportMargin`, scale) and `src/diagrams/help/help-export.ts`
  (`HELP` type, `activityDiagram` style name, `calculateBackColor`);
- `src/registered-plugins.ts:95-125`, `src/core/block-extractor.ts:140-180,400-460`;
- `decisions.md` D2, D6, D8.

**Do:**
1. `listsprite-export.ts`: regex's export with the `HELP` root type and the `activityDiagram` style name. Chrome,
   margin (`same(10)` default), `scale`, background, handwritten and the colour mapper as regex wires them.
2. `listSpritePlugin` (`type: 'sprites'`), registered at java:170 between `definitionPlugin` and `mathPlugin`, with
   the `// java:170` comment.
3. `@startsprites` → `'sprites'` in `START_SUFFIX_MAP`, `sprites → SPRITES` in `PORT_TO_UPSTREAM`.
4. Check what `assemble-svg.ts` or the dispatcher needs for a new routing key (ceep T2d added a `CHEN_EER` case); add
   it if the root type `HELP` is not already handled.
5. Run the routing and refusal gates and the utility suite. `xucoma-93-jeko861` (single-line `listsprite`) must still
   render through `listArchimateSpritesPlugin`.

## Acceptance
- Given `renderSync` of `cov-sprites-uml-mono`, then the root carries `data-diagram-type="HELP"` and the page is 78×45.
- Given `renderSync` of `@startsprites` with one sprite, then it draws (no "unknown diagram type").
- Given `oracle/goldens/svg-utility/xucoma-93-jeko861`, then its ratchet still passes.
- Given `npx jiti plans/listsprite-factory-port/measurements/corpus-rows.mts`, then neither row prints `errored: true`.

Observability is N/A: there are no new observable operations. Rollback is Reversible: revert the commit.
