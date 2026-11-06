# T3c — A `state` leaf in the class engine draws `EntityImageState`

**Row:** `togixe-65-bepo490` (71 diffs, nearly all the `+1` and `+2` offsets of a taller row). `allow_mixing` plus `state state`. Jar `g[24]`: rect 50.275 × 50 at `rx` 12.5, an `hline` at 24, centred text, no circle. Ours: a class box with a green circle, 62.275 × 48.

**Read:** `CommandCreateElementFull2.java:84,239-241`, `GeneralImageBuilder.java:130-143`, `EntityImageState.java` constructor, `calculateDimensionSlow`, `drawU`, and `isHideEmptyDescriptionForState` at its caller, since the jar takes `EntityImageState` rather than the empty-description image here. On our side `class-declaration-parser.ts:155`, `class-classifier-kind.ts:120-121`, `class-layout-helpers.ts:353`, `leaf-sizing-entity.ts`, `src/core/svek/IEntityImage.ts`, `EntityImageStateCommon.ts`, and the state engine's `state-sizing.ts`. Check `docs/catalog.md`.

**Do:** per D7. Route `kind: 'state'` to the jar's image, with shape `rounded` as `sh0029` in `svek-1.dot` shows. Its body lines, stereotype, `<<sdlreceive>>` (`EntityImageState2`) and `hide empty description` branches are in scope if the class parser can reach them: oracle each. Split past 15 minutes.

**Red:** `togixe-65`'s `g[24]`; `state` with `A : text` fields; with a stereotype; with `<<sdlreceive>>`; `state A {` composite in `allow_mixing`, and check `class-descriptive-leaf-command.ts:50-55` on that form. A form that needs its own engine ends by D8 with a queue issue.

**Measure, extra bucket:** `class`, `state`.

## Acceptance
- Given `togixe-65`, when compared, then conformant.
- Given each `state` form, when compared with its oracle, then 0 diffs, or the journal names its queue issue.
- Given `class` and `state`, then 0 rows lost.

Observability N/A. Rollback Reversible.
