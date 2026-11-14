# Batch 2: groups, colours, svg root

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T2a](T2a-group-colours.md) | Per-group `line:` / `text:` colours on a cluster | typescript-pro | class cluster modules, tests | T1 | [x] |
| [T2b](T2b-empty-usymbol-groups.md) | Empty USymbol groups mute to `EMPTY_PACKAGE` leaves | typescript-pro | class container / namespace modules, tests | T2a | [x] |
| [T2c](T2c-empty-coloured.md) | Empty USymbol groups with per-group colours | typescript-pro | as T2a/T2b | T2a, T2b | [x] |
| [T2d](T2d-note-img-url.md) | `(Cannot decode)` image inside a note's URL label | typescript-pro | creole atoms, class note modules, tests | T2b | [x] |
| [T2e](T2e-svg-dimension-style.md) | `skinparam svgDimensionStyle false` on class | typescript-pro | class renderer, tests | T1 | [x] |

All five write into `src/diagrams/class/`, so they run one at a time, in this order (D6). Batch 2 closes with the
README gates, the every-engine survey and `verdict-diff` (task contract, "Batch close").
