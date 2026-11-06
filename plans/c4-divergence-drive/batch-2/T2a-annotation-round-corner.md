# T2a — Annotation boxes read `RoundCorner` from the merged style

**Row:** `vakasu-51`, `svg/g[1]/g[3]/rect[1]/@rx`,`@ry`, ours 7.813, jar 4.167 (`8 / 2 × 100/96`).

**Read:** `FromSkinparamToStyle.java:164,169,175`, `EntityImageLegend.java:49-51`, `DiagramChromeFactory.java:263`; `src/core/annotations/style.ts:140-150,264-285`, `annotation-skinparam.ts:60-100`, `annotation-defaults.ts:75-154`, `blocks.ts:93-130`. Oracles already rendered on 2026-11-04: `skinparam roundcorner 8` alone gives the legend `rx=4` and the class box `rx=4`; with no skinparam the legend gives `rx=7.5`.

**Do:** per D4. Every element whose default is a hard-coded `roundCorner` in `annotation-defaults.ts`: title, legend, header, footer, caption and mainframe answer per its own merged signature. `style.ts` already builds a `skin` and reads `root.root.document.legend` at `:281`; start there. Check that a theme's `skinparam` reaches it, not only the document's.

**Red, authored grid under `tests/fixtures/c4dd-T2a/`, each with its oracle:** `roundcorner N` × title, legend, caption; `roundcorner 8` plus `legendBorderRoundCorner 3` in both orders; `<style>legend { RoundCorner 3 }</style>` with `roundcorner 8`; `!theme united`. Render each and read before asserting: the grid may refute this file.

**Measure:** the full survey at batch close covers every engine that draws chrome.

## Acceptance
- Given each grid row, when compared with its oracle, then 0 diffs on the box.
- Given `vakasu-51`, then `rect[1]/@rx` and `@ry` are gone.
- Given a diagram with no `roundcorner`, then the legend still gives `rx=7.5`.

Observability N/A. Rollback Reversible.
