# T2d — Object field rows step by the icon block

**Rows:** `nulixu-97-nofi684` (`classAttributeIconSize 20`), `vocute-12-suxa445` (16), `sibika-09-sipu286` (14). 13 diffs each, all `y`. The box heights already match.

**Mechanism, read:** `PlacementStrategyVisibility.java` `getPositions`: icon at `2 + y + (maxHeight12 - height1) / 2`, text at `y + (maxHeight12 - height2) / 2`, then `y += maxHeight12`. Three rows fit: pitch 15, 17, 21 for sizes 14, 16, 20, and text offset 0.5, 1.5, 3.5 for 14 px text. `classAttributeFontSize` is not this: `FromSkinparamToStyle.java:190` sends it to `SName.class_`, so the object's text stays 14 px.

**Read also:** `MethodsOrFieldsArea.java` `getLayout`, `calculateDimensionOnlyMembers`, `getUBlock`; `VisibilityModifier#getUBlock` for the `size + 1` block height. Check that against an oracle, since planning derived it from pitch. Then `class-object-fields.ts:171-225`, whose baseline is `i * fontSize + offset`, and `class-member-rows.ts:303-355`, the class path. A class row with `classAttributeIconSize 20` may be fine or may hold the same defect: run one against an oracle and report which.

**Do:** carry each row's top through the max of the two heights, in both the text and the icon. `y` must equal the existing formula at the default size 10, where `11 < 14`, or `nukera-08` moves.

**Red:** the three rows' `text/@y` and `polygon/@points`; mixed rows, with and without a visibility char, against an oracle.

## Acceptance
- Given the three rows, when compared, then conformant.
- Given `nukera-08-dige359`, then still conformant.
- Given a class with `classAttributeIconSize 20`, when compared with its oracle, then 0 diffs, or a queue issue names it.

Observability N/A. Rollback Reversible.
