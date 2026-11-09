# T4c — `MaximumWidth` on boxes and notes; swimlane `<style>`

**State at planning:** 6 corpus rows, Σ 564.

| Row | Diffs | Source | First diff (ours / jar) |
|---|---|---|---|
| `ponija-89-kebo602`, `tosepo-66-love279` | 1 each | `activity { MaximumWidth 100 }`, `note { MaximumWidth 200 }`, a long box and a creole note | one `text` x 138.575 / 150.575 (12 px) |
| `raneku-06-labe982` | 10 | `element { MaximumWidth 100 }` on a long box | width 354 / 148: ours does not wrap at all |
| `vemeno-50-zevi632` | 133 | `note { MaximumWidth 100 }` in swimlanes | width 544 / 553 |
| `rutaji-30-suda150`, `lulavi-01-fose679` | 208, 211 | `skin debug`, `swimlane { BackgroundColor #5FF; LineColor yellow; LineThickness 5 }` | height 363 / 364, width 357 / 360 |

`rutaji-30` and `lulavi-01` carry `diff-baseline` pins (smc lowered them to 208 and 211); smc T4c spot-checked font
19 and rx 7.5 against the jar. `raneku-06`'s `element` selector reaching the activity box is the question there.

**Read (leads):** where `MaximumWidth` is read for an activity box and note (grep `MaximumWidth`/`PName.MaximumWidth`
under `src/main/java/net/`, `Style#wrapWidth`, `FtileBox`, `FtileWithNoteOpale`), the swimlane style reads in
`activitydiagram3/gtile/` or `swimlane/` (`Swimlanes`, `SwimlanesA/B/C`), and `skin debug`'s `plantuml.skin`
counterpart. Ours: the activity text-wrap and the swimlane renderer.

**Do:** red with `raneku-06` (no wrap at all), then the 12 px note shift of `ponija-89`.

**Measure:** the 6 rows; activity survey; `repin-activity-baselines.ts` for the two pinned rows.

## Acceptance
- Given `ponija-89`, `tosepo-66`, `raneku-06`, then each is conformant and pinned.
- Given `vemeno-50`, `rutaji-30`, `lulavi-01`, then each is conformant and pinned, or lower than its pin and
  journaled with its remaining mechanism and owner.
- Given the activity survey, then 0 lost.

Observability N/A. Rollback Reversible.
