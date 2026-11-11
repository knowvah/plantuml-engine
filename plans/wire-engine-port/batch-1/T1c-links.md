# T1c — `WLinkHorizontal`, `WLinkVertical`

**Read:** `wire/WLinkHorizontal.java`, `wire/WLinkVertical.java` (whole files); D4, D11;
`mugaxe-80-biva973/in.svg` (all eight horizontal forms) and
`/tmp/wrp-plan/oracle/cov-vlinks-all.svg`, `cov-link-reversed-h.svg`, `cov-link-reversed-v.svg`.

**Write-set:** `src/diagrams/wire/{WLinkHorizontal,WLinkVertical}.ts`, `tests/unit/wire/{WLinkHorizontal,WLinkVertical}.test.ts`.

**Do:** one args object per constructor (D11), holding the seven Java arguments under their Java names. `drawBusArrow`
keeps its name and dispatches on `direction`; each branch is a named helper or a table of `[dx-expr, dy-expr]` with its
Java line. Keep the path point order exactly: the SVG `d` is the assertion. The start for every bus path and for the
reverse arrowhead is `start.compose(UTranslate.dx(1))` (vertical: `dy(1)`), and the normal head uses `dx`.
`WLinkHorizontal#drawMe` measures the label before drawing; `WLinkVertical#drawMe` never calls `getTextBlock()` (D4).
Colours: `ug.apply(color)`, then `color.bg()` on NORMAL and `getWhite().bg()` on BUS, with `getWhite()` from
`HColors.WHITE.withDark(HColors.BLACK)`. The white under-rectangle on a horizontal NORMAL label uses `getWhite()` for
both stroke and fill.

**Tests (jar values, start `(121, 35)` for `mugaxe`):**
- NORMAL/NORMAL: `M238,35 L233,30 L233,40 L238,35` filled `#000`, then `line 121,35 → 239,35`.
- BUS/NORMAL: `M121,95 L224,95 L224,90 L239,100 L224,110 L224,105 L121,105 L121,95`, fill `#FFF`.
- BUS/BOTH with `#red`: stroke `#F00`, fill `#FFF`.
- Label offsets: NORMAL `+4` from the start, REVERSE `len - w - 4`, otherwise centred; NORMAL `y - h/2`, BUS
  `y + (20 - h)/2 - 5`.
- Vertical: the four BUS paths and two arrowheads from `cov-vlinks-all`, and no `<text>` for a label.
- Reversed: `cov-link-reversed-h`'s `M341,50 L4,50 L4,45 L19,55 L4,65 L4,60 L341,60 L341,50` (the negative `dx`).

## Acceptance
- Given each direction and type, when `drawMe` runs on a recording `UGraphic`, then the emitted shapes match the oracle
  fragments point for point, in order.
- Given a vertical link with a label, when it draws, then no text is emitted.
- Given dark mode, when `getWhite()` resolves, then the BUS fill and label rectangle use the dark side (`cov-dark`: `#000`).

Observability N/A. Rollback Reversible.
