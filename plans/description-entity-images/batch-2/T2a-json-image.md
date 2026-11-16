# T2a: `EntityImageJson` in core

## Context

`src/core/svek/image/EntityImageJson.ts` holds only the margin constants (32 lines) today. Upstream's image builds a
title block, an optional stereotype, and `TextBlockCucaJSon` for the body, then draws a rounded box with cell dividers
(`svek/image/EntityImageJson.java`, `cucadiagram/TextBlockCucaJSon.java`). Its style signature carries the diagram's
own `SName` (read `getStyleSignature` and how the description diagram supplies the root), so this port takes the style
inputs as parameters rather than reading a state or class theme.

## Read-set
- `svek/image/EntityImageJson.java` (whole file), `cucadiagram/TextBlockCucaJSon.java`, `cucadiagram/BodierJSon.java`.
- `src/core/svek/image/EntityImageJson.ts`, `src/core/command/JsonNode.ts`, `src/core/svek/image/AbstractEntityImage.ts`,
  `src/core/svek/image/EntityImageDescription.ts` (the shape of a core image: `calculateDimension`, `drawU`).

## Write-set
- `src/core/svek/image/EntityImageJson.ts` (extend; keep the five exported constants and their values),
  `src/core/svek/image/TextBlockCucaJSon.ts` (create), unit tests under `tests/unit/core/svek/image/`.

## Interface contract (consumed by T2b)

```ts
// EntityImageJson.ts
export class EntityImageJson /* extends AbstractEntityImage, as upstream */ {
  constructor(params: { display: string; stereotype?: readonly string[]; json: JsonNode; style: /* resolved
    StyleSignature reads: fonts, LineColor, BackGroundColor, RoundCorner, LineThickness, Shadowing */ });
  calculateDimension(stringBounder: StringBounder): XDimension2D;
  drawU(ug: UGraphic): void;
}
```

Names and fields follow the Java; the comment marks what the executor fills in from it. `state` and `class` do not
import this class (D1).

## Acceptance
- Given `dei-json-top`'s json, when `calculateDimension` runs with `DeterministicMeasurer`, then width and height equal
  the oracle's json `<rect>` (or path) width and height.
- Given the same, when `drawU` renders to SVG, then the cell texts' `x`/`y` and divider `<line>`s equal the oracle's,
  relative to the box corner.
- Given a json with an empty object, when sized, then the result follows the Java's empty-body branch (cite its line).

Observability is N/A. Rollback is Reversible.
