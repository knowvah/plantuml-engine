# T1b — `WBlock`, `WPrint`, `Spot`

**Read:** `wire/WBlock.java`, `wire/WPrint.java`, `wire/Spot.java` (whole files); D4, D5, D9, D11;
`src/diagrams/regex/PSystemRegex.ts` for how a klimt `TextBlock` and `UGraphic` are used here.

**Write-set:** `src/diagrams/wire/{WBlock,WPrint,Spot}.ts`, `tests/unit/wire/{WBlock,WPrint,Spot}.test.ts`, a shared
`tests/unit/wire/helpers.ts` (a recording `UGraphic` or the repo's existing one; check `tests/helpers/` first).

**Do:** port every method with its Java name. `cursor`, `addedToCursor`, `futureOutHorizontal` and `futureOutVertical`
mutate in place, as in the Java. `getLastChild(): WBlock | undefined`, and each recursing method uses a non-null
assertion with a comment quoting the Java NPE (D4, D5): `newColumn`, `wgoto`, `wmove`, `print` and `addBlock` must
throw at a level with no child, not return. `parseWidth`/`parseHeight` keep all three branches. `addBlock`'s
duplicate check comes before the level test, so it runs at every level the call passes through. The `name.contains(".")`
throw stays, commented as unreachable from `CommandComponent`. `getAbsolutePosition` returns `position` when
`parent == null`, ignoring both arguments.

`print` takes the `StringBounder` as a parameter (`WBlock.java`, method `print`); which bounder is T2a's concern (D3).
`drawMe` uses `UFontFactory.sansSerif(12)` and `name.replace('_', ' ')` for every occurrence (D9), and draws the label
even for the root (D4). `drawBox` order: rectangle (if `name.length() > 0`), children, prints.

**Tests (jar values):**
- `getMaxDimension`: leaf `[0x50]` → 100×50, `[50x0]` → 50×100, `[0x0]` → 100×100 (`cov-zero-dim`, 141 × 341); forced
  `[30x30]` with a 100×100 child stays 30×30 (`cov-forced-with-children`, 131 × 151).
- Cursor: two `addBlock` at level 0 place the second at the first's `y + height + 20`, as `dogoso-52-labe953`'s
  `DDR3L`/`SLC_NAND` rectangles at `y=30` and `y=100` show (margin 10 on both).
- `newColumn` at level 0 places the next block at natural width `+ 10` (`cov-newcolumn-long`, 141 × 91);
  `newcolumn-empty` puts the first block at `10,20` (81 × 91).
- `getBlock('p.q.r')` walks the dots; `getBlock('a.z')` is `undefined`.
- `getNextOutHorizontal(null, null, NORMAL)` starts at `100%,5`, then steps `+15`; BUS steps `+25`; an explicit `(x,y)`
  resets the stack (`cov-link-stacking`).
- `parseWidth('100%-5')`, `('50%+20')`, `('0%+10')`, `('-5%')`, `('-5')` on a 100-wide block: `95`, `70`, `10`, `-5`, `-5`.
- `addBlock(1, …)` with no child throws; a duplicate returns `Component exists already`; `addBlock` at level 1 with the
  name of a root child returns the same error.
- `Spot` defaults to red and draws the 5×5 ellipse at `getAbsolutePosition(x, y)` `+ (-2,-2)`.

## Acceptance
- Given the `cov-zero-dim` sizes, when `getMaxDimension` runs, then the leaf rules above hold.
- Given a level with no child, when each recursing method runs, then it throws (D5) and never returns a result.
- Given `cov-link-stacking`'s sequence, when the `getNextOut*` methods run, then each start matches the oracle's path.

Observability N/A. Rollback Reversible.
