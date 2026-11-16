# T3a: `BodierMap` and `EntityImageMap` in core

## Context

Class's map (`class-map-commands.ts`, `class-map-sizing.ts`) is bound to class's `Classifier` AST and stays (D1). This
task ports the upstream pieces description needs as pure core modules.

## Read-set
- `objectdiagram/command/CommandCreateMap.java` (whole), `cucadiagram/BodierMap.java`, `svek/image/EntityImageMap.java`,
  `cucadiagram/TextBlockMap.java` (or whichever class `EntityImageMap` builds its body from; follow the constructor).
- `src/diagrams/class/class-map-commands.ts` and `class-map-sizing.ts`, for what they learned (do not import them).

## Write-set
`src/core/command/BodierMap.ts`, `src/core/svek/image/EntityImageMap.ts` (plus the body text block if upstream has one),
unit tests under `tests/unit/core/`.

## Interface contract (consumed by T3b)

```ts
// BodierMap.ts: one row per body line, as BodierMap#addFieldOrMethod stores it
export interface MapRow { key: string; value: string; linkTarget?: string /* the `*->` branch */ }
export function parseMapBodyLine(line: string): MapRow | undefined;
// EntityImageMap.ts: same shape as T2a's EntityImageJson (calculateDimension, drawU), body = MapRow[]
```

## Acceptance
- Given `liripi`'s three `Rule N => …` rows, when parsed, then keys and values equal the oracle's two text columns
  (`Rule 1` / `r'1 =  2 * r'2`, two spaces kept).
- Given those rows, when `EntityImageMap` is sized with `DeterministicMeasurer`, then width 141.625 and height 72 (the
  `liripi` oracle's `<rect>`).
- Given `drawU`, then the separator `<line>`s and the key/value column split at x = 105.013 − 54.5 relative to the box
  (the oracle's), with stroke width 1 for dividers and 0.5 for the border.

Observability is N/A. Rollback is Reversible.
