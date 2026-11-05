# T2b — stroke

Commit: `fix(description): read entity and cluster strokes from the style`.

## Context
`styleTitle.getStroke(colors)` (`EntityImageDescription.java:171`), `Cluster#getStrokeInternal` (`Cluster.java:402-407`), `EntityImageEmptyPackage.java:108`. Our readers: `overrideStroke` in `renderer-entity.ts` takes only the inline override and `resolveElementLineThickness`, with no labels and no line style. `core/style-line-style.ts` exists: read it before writing one.

Cluster border colour belongs here too: `skinparam packageBorderColor` draws black on us and red in the jar (`pafefo-52`, `sacuso-94`, `nuxebu-15`, `xagino-11`), `#000` being the default package path. `nuxebu-15` also shows the jar omitting the `stroke` attribute where the group has a `#FF0000` inline colour: read `Cluster.java:361-372` for why.

`BorderThickness 0` on `<<srv>>` draws no stroke in the jar (`bujigu-81`, `joliva-50`); `xefuma-94` reads `LineThickness` per symbol (`<style> file { ... }`), and is named on #120 (D6).

## Rows
`jubaba-44`, `golamo-46`, `luzeti-08`, `bocija-94`, `ninipe-96`, `nuzada-73`, `suzuge-76`, `lotofa-28`, `sevage-80`, `difufa-66`, `refabu-21`, `pafefo-52`, `sacuso-94`, `nuxebu-15`, `xagino-11`, `bujigu-81`, `joliva-50`, `xefuma-94`.

## Acceptance
- Given `nuzada-73`, when rendered, then the package path and line carry `stroke-dasharray="7,7"`.
- Given `pafefo-52`, then the package path stroke is `#F00`.
- Given `bujigu-81`, then the `<<srv>>` rect has no `stroke` attribute, as the jar draws it.

Observability: N/A — no new observable operations. Rollback: Reversible.
