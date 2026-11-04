# T4a — `scale` and `dpi`

Commit: `feat(state): honour scale and dpi at export`.

## Context
11 rows, widths like 169 against 676. `state-commands.ts:136` matches `scale` to ignore it, and `statePlugin` passes no `scaleSpec`. D5: parse with `core/scale-command.ts`, carry `scale` on the AST and
geometry, return `scaleSpec` and `dpi` on the fragment, use `withDeferredFormat` when `isExportScaled` (`description/index.ts:138-168`; `TextBlockExporter.java:205-209`; `ScaleProtected.java:42-51`).
The plugin's `render` has no chrome branch of its own, so read how `src/index.ts:191-193` and `core/assemble-svg.ts` reach `TextBlockExporter.ts`. `RenderFragment.drawBodyAt` and `scaledCanvas` exist for this.
`renderFixtureState` must follow, or the ratchet and survey part ways. Other state rows with chrome and scale: `foluke-95`.

Stroke widths and font sizes scale too (`SvgGraphics.java:468-475`), so expect these rows to expose T3b's and T1c's families at the larger numbers.

## Acceptance
- Given `saxedi-32-xubo205` (`dpi 300`), `jibizo-72`, `xijice-10`, `corumi-91`, when rendered, then `svg/@width` and `@height` equal the jar's.
- Given `scale 1.3` and `scale 1800 width` rows, then the factor equals the jar's to its 3-decimal format.
- Given a row with no scale, then bytes are unchanged, by `state-moves.mjs`.

Observability: N/A — no new observable operations. Rollback: Reversible.
