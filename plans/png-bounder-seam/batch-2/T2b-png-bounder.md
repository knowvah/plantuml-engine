# T2b — the port's PNG bounder, and wire `print`

**Read first:**
- `FileFormat.java:173-274` in `/tmp/plantuml-seam5`, including the new seam-5 arm.
- `StringBounderAwt.java`.
- `wire/WireDiagram.java:131-134` and `wire/WBlock.java` (`print`).
- `src/core/measurer-deterministic.ts` (module doc).
- `src/diagrams/wire/WireDiagram.ts:40-75, 165-175` and `src/diagrams/wire/WireDiagramFactory.ts:200-225`.
- The wire render entry in `src/diagrams/wire/index.ts`.
- `plans/wire-engine-port/decisions.md` D3.

## Steps

1. **Red.** Write `tests/unit/core/png-string-bounder.test.ts`:
   - Under a `DeterministicMeasurer`, `pngDefaultStringBounder(...)` measures `'a b'` at 14 pt exactly as seam 5 does:
     the width of `'a!b'` from the table, `Math.fround`ed, and height 14.
   - Text carrying `BOLD_START`/`BOLD_END` is measured piecewise, if the port has those markers. Find them in
     `docs/catalog.md` or with Serena; Java is `StringUtils.BOLD_START`. If the port has no producer of them, write a
     comment that cites the Java and says why the branch is unreachable, rather than inventing the markers.
   - Under any other measurer it is the AWT bounder (`jarMeasurer`, bold read from the font as `isBoldFont` does today).
2. **Green.** Create `src/core/png-string-bounder.ts` (D3), with `@see FileFormat.java:177-274` and
   `@see StringBounderAwt.java`.
   - Move `isBoldFont`, `awtMeasurer` and `AWT_BOUNDER` out of `WireDiagram.ts`, keeping their comments, and preserve
     upstream names.
   - The export is `pngDefaultStringBounder(measurer: StringMeasurer): StringBounder`.
3. **Red.** Pick a wire fixture with `print` whose oracle T2a re-captured. Its test, or the `svg-wire` ratchet or the
   fixture runner, already fails. Add a unit assertion on the post-`print` `y` taken from the new oracle.
4. **Green (D4).**
   - Thread the PNG bounder from the wire render entry's measurer into `parseWire` and on to `WireDiagram`, whose `print`
     keeps `WireDiagram.java:133`'s position and uses it.
   - Production callers that pass no deterministic measurer get the AWT arm, so production output is unchanged. Add a
     test that renders a `print` fixture with the default measurer and asserts it is byte-identical to before.
5. Update `plans/wire-engine-port/decisions.md` D3 with one dated line pointing at this mission. Update the comment at
   `WireDiagram.ts` that cites wrp D3.
6. Measure, alone: `npm run svg:survey -- wire --out /tmp/pbs-T2b/parity-wire.json`, then
   `verdict-diff.mjs <base> /tmp/pbs-T2b`. All wire rows stay conformant, and the 112 authored fixtures that were at 0
   stay at 0.
7. Run `npm run catalog` for the new module, then commit `fix(wire): measure print with the PNG bounder's mode`
   (`Refs: #170`).

## Acceptance

- Given a `DeterministicMeasurer` render of a wire `print` fixture, then the post-`print` `y` equals the seam-5 oracle's.
- Given the default (production) measurer, then wire output is byte-identical to the base sha's.
- Given the wire survey, then 18/18 rows are conformant and every authored wire fixture that was at 0 is still at 0.
- Given `pngDefaultStringBounder(new DeterministicMeasurer())`, then `'a b'` at 14 pt has the seam-5 width and height
  14.

Observability: N/A, no new observable operations. Rollback: Reversible (revert the commit).
