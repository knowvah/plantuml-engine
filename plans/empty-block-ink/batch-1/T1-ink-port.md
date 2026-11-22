# T1: the faithful LimitFinder ink for an empty block

**Read:** `src/diagrams/json/document-dimensions.ts` (all 100 lines), `src/diagrams/json/layout.ts:44-56` and `:423`,
`~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/drawing/LimitFinder.java:155-190`,
`jsondiagram/TextBlockJson.java:260-320`, `jsondiagram/JsonDiagram.java:125-140`, `klimt/shape/TextBlockMarged.java:75-90`,
`tests/oracle/svg-conformance/json-family-positional.ts:330-410`.

**Writes:** `src/diagrams/json/document-dimensions.ts`, `tests/unit/json/document-dimensions.test.ts` (create),
`oracle/goldens/json-family-positional.json`.

## Steps

1. Confirm D1's two preconditions from the Java and our parser, and quote them in the journal: an empty container
   gives `TextBlockJson` no `lines` and our `JsonNodeGeo` no `rows`; the json node `URectangle` has no shadow.
2. **Red.** Create `tests/unit/json/document-dimensions.test.ts`:
   - a lone rowless node at `x 5, y 5, 15 × 17` gives `width 15`, `height 17` (ink `4 … 19`, `4 … 21`);
   - a lone node with one row at the same box gives `16 × 18` (unchanged behaviour);
   - a rowless node that is not the extreme on an axis does not change that axis;
   - rendering `tests/fixtures/json/nested-arrays.puml` gives the oracle's `height="144px"` (read the attribute from
     `tests/fixtures/json/nested-arrays.svg`; do not hard-code it twice).
   Run it and see the rowless and fixture cases fail.
3. **Green.** Add the branch and its named constant (D1). Keep `INK_MIN_CORNER`'s comment accurate.
4. **Measure.** `residue.mts --all > /tmp/ebi-t1.txt`. Exactly the 11 README rows move, to the "With K" column. Any
   other moved row is stop 1 unless you can state its mechanism with `file:line`.
5. **Pin (D2).** Edit the 9 corpus entries and add the 2 `authored:` entries at the measured values. Run the
   task-contract's vitest list; read the count.
6. Run `npm test -- --maxWorkers=4` once. A unit or snapshot test asserting the old size for a rowless node is updated
   with a Java citation (README, "not stops").
7. Commit: `fix(json): end an empty block's ink at x+w-1 as LimitFinder does`, body naming the ruling and the 11
   moves, footer `Refs: #187`.

## Acceptance

- Given a rowless node that is the rightmost ink, when `documentDimensions` runs, then width is `maxX - minX` with
  `maxX = x + width - 1`.
- Given a node with rows, when `documentDimensions` runs, then its contribution is unchanged (`x + width`).
- Given `tests/fixtures/json/nested-arrays.puml`, when rendered, then the root `height` equals the jar oracle's.
- Given the fix, when `residue.mts --all` runs, then only the 11 README rows move, each to its "With K" value.
- Given the updated pin, when `json-family-positional.test.ts` runs, then it passes and includes the two new
  `authored:` keys.

Observability is N/A: no new operation. Rollback is Reversible: revert the commit (pin and code together).
