# T2a — `WireDiagram`

**Read:** `wire/WireDiagram.java` (whole file), `FileFormat.java:173-192, 272`; D2, D3, D4, D9, D11;
`src/diagrams/regex/PSystemRegex.ts`, `src/core/TitledDiagram.ts`, `src/core/measurer-bounder.ts`,
`src/core/measurer-jar.ts:96`.

**Write-set:** `src/diagrams/wire/WireDiagram.ts`, `tests/unit/wire/WireDiagram.test.ts`.

**Do:** `class WireDiagram extends TitledDiagram`, `super(source, WIRE, undefined, preprocessing)`; `root = new
WBlock('', UTranslate.none(), 0, 0, undefined)`. `getTextBlock` returns a block whose dimension is
`root.getMaxDimension()` and whose `drawU` runs `drawMe`: `root.drawMe`, then spots, then `hlinks`, then `vlinks` (D4).

`computeIndentationLevel(indent)`: `indent.replaceAll('    ', '\t').length` (D9). `spot`, `vlink`, `hlink` return
`CommandExecutionResult.error('No such element ' + name)` for each unknown name, checking `name1` first. Each link
resolves `start` from `block1` before reading `block2`'s `getAbsolutePosition("0","0")`.

**`print` is D3:** build the bounder from `jarMeasurer` and pass it down, regardless of the render's measurer. A comment
quotes `WireDiagram.java:133`'s `FileFormat.PNG.getDefaultStringBounder()` and `FileFormat.java:185-186`.

`vlink` and `hlink` take one args object (D11). `getDescription` returns `Wire Diagram`.

**Tests:**
- `migaki-17-jori275`: after two root prints, the next block's `y` is `30 + 100 + 2 × 11.777344 + 20 = 173.555`, with a
  `DeterministicMeasurer` in the render (the D3 proof: the injected measurer must not change it).
- Draw order: root's tree, spots, `hlinks`, `vlinks`, on a recording `UGraphic`.
- Levels: `''` → 0, `'    '` → 1, `'\t'` → 1, `'  '` → 2, `'\t    '` → 2.
- `vlink`'s `destination` is the destination block's `dy`; `hlink`'s its `dx`.

## Acceptance
- Given a render with a `DeterministicMeasurer`, when two `print`s run, then the cursor advances by the AWT height
  (`11.777344` at 10 pt), not the table's `10` (D3).
- Given an unknown link end, when `hlink` or `vlink` runs, then the result is the `No such element <name>` error and no
  link is added.

Observability N/A. Rollback Reversible.
