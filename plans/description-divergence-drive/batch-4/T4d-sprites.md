# T4d — sprites in a stereotype or a body

Commit: `fix(description): draw every sprite form a stereotype and a body allow`.

## Context
`Stereotype#getSprite` (`stereo/Stereotype.java:108-117`): `tmp.asTextBlock(getHtmlColor(), null, decoration.spriteScale, null)`. So `<<$amazon*2>>` and `<<$amazon{scale=2}>>` carry a scale and a colour, and read `Stereotype.java`'s decoration parser for the forms. `xozonu-96` and `zumuvu-52` lose a child on `r3`. Our seam is `resolveStereotypeSprite` (`core/svek/image/EntityImageDescriptionDelegates.ts:388`).

`<svg>` sprites: `dunudu-55`, `mepuro-90`, `mofora-39` and three `sprite-SVG-*` rows are `childCount` 1 against 2 on the second, third and fifth groups, with no other diff seen yet. `sprite-SVG-*` are authored upstream to test fill and stroke, so read `SvgNanoParser.java:187-215` and `SpritePrimitiveCollector`. `rugora-14`, `biruxu-93`, `fuceci-90`, `resesi-61`, `xajome-41` hold a monochrome `[16x16/16]` `$businessProcess`, and `pagega-99` `jar:archimate/serving`: the same symptom in a different form. Expect one mechanism and read a diff under it.

## Rows
`xozonu-96`, `zumuvu-52`, `dunudu-55`, `mepuro-90`, `mofora-39`, `sprite-SVG-fill-management-5`, `sprite-SVG-stroke-management-1`, `sprite-SVG-stroke-management-2`, `rugora-14`, `biruxu-93`, `fuceci-90`, `resesi-61`, `xajome-41`, `pagega-99`.

## Acceptance
- Given `xozonu-96`, when rendered, then `r3` draws its sprite at scale 2, with zero diffs.
- Given `dunudu-55`, then every group holds the jar's children, and the re-read names anything under them.

Observability: N/A — no new observable operations. Rollback: Reversible.
