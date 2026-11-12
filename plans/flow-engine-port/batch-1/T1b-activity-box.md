# T1b — `ActivityBox`

**Read:** D3, D8; `flowdiagram/ActivityBox.java`; `Display.create(String)` and its `create(fc, alignment, sprites)`
render. `src/core/klimt/creole/Display.ts:458` is the port's render entry. Read how bpm's or wire's ported code builds
a creole `TextBlock` from a `FontConfiguration`, and reuse that.

**Write-set:** `src/diagrams/flow/ActivityBox.ts`, `tests/unit/flow/ActivityBox.test.ts`.

**Do:**
1. `CORNER = 25`, `MARGIN = 10`, `UFontFactory.serif(14)` and `FontConfiguration.blackBlueTrue`, each with its
   `ActivityBox.java` line.
2. `tb` is built once in the constructor from `Display.create(label)`, one element and no newline split (D8:
   `cov-label-newline` keeps `\n` literal). Left-aligned, with an empty sprite container. Port `getTile`, `getId` and
   `getLabel`.
3. `calculateDimension` is `tb`'s dimension plus 2×`MARGIN` each way. `drawU` draws `URectangle.build(w, h).rounded(25)`
   with `MY_RED` stroke on `MY_YELLOW` fill at thickness 1.5, then `tb` at `(10, 10)`.
4. The `Tile` parameter is T1a's `Tile`. If T1a is not committed yet, do T1a first.

## Acceptance
- Given the label `START`, then the box is 66.025×34 and the text sits at `+10, +20.889` from the box (from
  `cov-single`: rect `x=66.987 y=18`, text `x=76.987 y=38.889`).
- Given `**bold** <color:blue>c</color> //it//`, then the text runs equal `cov-label-creole`'s five `text` elements
  relative to the box.
- Given `a%newline()b` after preprocessing, then two lines are drawn 14 apart (`cov-label-newline-fn`).

Observability N/A. Rollback Reversible.
