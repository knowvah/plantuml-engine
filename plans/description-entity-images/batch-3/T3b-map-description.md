# T3b: `map` in description

## Context

`liripi` declares `map "Mappings" as maps #acffa0 { … }` inside `component "Mapper engine" { }` inside a coloured
`Package { }` that also holds a `portin` and a `portout`. Only the `map` command is missing; confirm that by replacing
the map with `rectangle X` and rendering (journal the result).

## Steps
1. `leafType: 'map'` and `mapRows` on `DescriptiveNode` (D2).
2. A `command-map.ts` adapter over `BodierMap`, registered first of the three (`DescriptionDiagramFactory.java:129`).
   Port `CommandCreateMap`'s regex and its `#color` capture exactly; colour resolution goes through
   `core/klimt/color/HColorSet.ts` as other description colours do.
3. If `CommandCreateMap` creates links for `*->` rows, port that too, as description links.
4. Layout and render as T2b: size from `EntityImageMap.calculateDimension`, draw through `drawU`, the jar's DOT shape.

## Write-set
As T2b, plus `src/diagrams/description/command-map.ts`.

## Acceptance
- Given `liripi-72-kefa167`, when measured, then it reaches zero diffs with `dotEqual: true`, or its residual is
  separable and filed (D6).
- Given `dei-map-top` and `dei-map-link`, when measured, then each reaches zero, or the residual is journaled.
- Given every pinned description golden, when the ratchet runs, then the pass count is unchanged.

Observability is N/A. Rollback is Reversible.
