# T1c — `FloatingNote`

**Read:** `activitydiagram3/ftile/vcompact/FloatingNote.java` (whole), `svek/image/Opale.java` constructor and
`calculateDimension`; `src/core/svek/image/Opale.ts`, `src/core/klimt/creole/SheetBlock1.ts`, `SheetBlock2.ts`; how an
existing caller builds a `Sheet` with `CreoleMode.FULL` (`grep -rn "CreoleMode.FULL\|'FULL'" src/core`);
`tests/architecture/layering.test.ts:150-175` (the `FtileBoxOld` entries); D3.

**Do:**

1. `FloatingNote.ts` at its upstream path: the private constructor (style `root, element, <sname>, note`;
   `wrapWidth`, `FontConfiguration.create(skinParam, style)`, `BackGroundColor`, `LineColor`, `getStroke`,
   `getShadowing`; the sheet from `skinParam.sheet(fc, getDefaultTextAlignment(LEFT), FULL)`;
   `SheetBlock2(SheetBlock1(sheet, wrapWidth, getPadding()), this, stroke)`; `Opale(shadowing, borderColor, bg,
   sheetBlock2, withLink, stroke)`), `create`, `createOpale`, `setOpale`, `drawU`, `calculateDimension`,
   `getStartingX`, `getEndingX`.
2. The layering allowlist entry `src/diagrams/ebnf/` → `src/diagrams/activity/ftile/`, with a `why` quoting the import
   in `EbnfExpression.java` and `PSystemEbnf.java` and naming this mission's D3.
3. Do not rewire the activity engine's own notes onto it (D3).

**Tests:** `FloatingNote.create(Display.create("a single-line comment"), skinParam, 'ebnf')` measured with the
deterministic measurer gives the note `path` width and height of `cov-comment-standalone`'s oracle
(`/tmp/eep-plan/oracle/cov-comment-standalone.svg`, the first note), and draws the same `path` `d` and fill through
`UGraphicSvg`. A two-line `Display` is taller by one line height. Values come from the oracle, never fitted.

## Acceptance
- Given the note above, then its dimension equals the oracle's note box to the decimal the SVG prints.
- Given `tests/architecture/layering.test.ts`, then it passes with the new entry, and an import from `src/diagrams/ebnf/`
  into any other engine still fails it.
- Given `npm test`, then it passes with the new file at 90/90/90.

Observability N/A. Rollback Reversible.
