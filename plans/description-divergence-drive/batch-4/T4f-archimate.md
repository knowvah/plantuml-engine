# T4f — archimate

Commit: `fix(description): draw archimate elements as the jar does`.

## Context
`archimate #LightGreen "Social Media\n Competency" as SMC <<strategy-resource>>` with `!include <archimate/Archimate>`: `nuvapa-57` is 122x88 against 160x84. `assets/stdlib/archimate/ArchimateSprites.puml:343` defines `$strategy-resource-svg`, and `Archimate.puml:90` shows the procedure form. So `<<strategy-resource>>` may resolve a sprite through a style or `!include` we skip: read `CommandArchimate.java` and the stdlib, then `command-archimate.ts`.

Family: `nuvapa-57`, `ludipa-77`, `pixelu-98`, `fotuko-85` (authored sprite, same shape), `pumoko-38` (`Business_Object`, 901 diffs and `dotEqual` false), `fupumu-08` (571, with `DiagonalCorner`, T2a), `ceboti-36` (T1c).

## Rows
`nuvapa-57`, `ludipa-77`, `pixelu-98`, `fotuko-85`, `pumoko-38`, `fupumu-08`.

## Acceptance
- Given `nuvapa-57`, when rendered, then the canvas is 160 x 84, and the row has zero diffs or a named remainder.
- Given `pumoko-38`, then `dotEqual` is true, or the leaf that differs is named with its Java.

Observability: N/A — no new observable operations. Rollback: Reversible.
