# T4b — A skinparam after `<style>` wins by storage order

**State at planning:** `<style> class { FontSize 18 }` followed by `skinparam classFontSize 16` after the body is
drawn at 16 by the jar and at 18 by us (`class__casc-fontsize-after` 24). `skinparam roundCorner 8` after
`<style> class { RoundCorner 20 }` rounds the note corner at 4 in the jar and 0 in ours (`class__casc-roundcorner-after`
14). Component `fontsize-after` and `thickness-after` are 57 each, a 0.28 px x shift through the layout. Activity
`fontsize-after` is 64, `thickness-after` 24, `shadow-after` 2 (the jar draws a shadow filter we omit). The dss
`component__probe-skinparam-after-style` is 34 (`skinparam componentBackgroundColor` after `<style>` loses
`note { FontSize }`). State `-after` rows sit 0-10 above their control.

**Read:** `SkinParam.java:227-234` (`setParam`: `applyPendingStyleMigration`, then `FromSkinparamToStyle#convertNow`
into the current builder, then `muteStyle`), `SkinParam.java:254-260` (`applyPendingStyleMigration`),
`CommandStyleMultilinesCSS.java:84-91`, `FromSkinparamToStyle.java` (each key it converts, `roundCorner`,
`shadowing`, `<element>FontSize`, `<element>BorderThickness`, and the ones it skips), and `StyleStorage.java:102-116`
(storage order decides). Ours: `src/core/style/FromSkinparamToStyle.ts`, `skinparam-accumulator.ts` (how it records
`declarationOrder`), `mindmap-style-builder.ts#declarationsOf` (dss D1a: only the keys in
`declarationOrder.skinparam` convert).

**Do:** per D7. Red with `class__casc-fontsize-after`'s 16. Find where our builder puts a late skinparam before the
`<style>` block, or drops it, and make storage order follow source order as `setParam` does. Then walk each engine's
`-after` rows. A key `FromSkinparamToStyle` does not convert must not convert in ours either: quote the table.

**Measure:** `rows.mts` prefixes `*__casc-*-after`, `*__casc-control-plain`, `component__probe-skinparam-after-style`;
surveys of every bucket. This seam is shared, so `verdict-diff` is mandatory before the commit.

## Acceptance
- Given the `-after` rows of activity, class and component, then each is at 0 or journaled with its mechanism.
- Given `component__probe-skinparam-after-style`, then it is conformant.
- Given state's `-after` rows, then each is at its control's count, with the rest left to T4d.
- Given `verdict-diff` against `<base>`, then 0 lost.

Observability N/A. Rollback Reversible.
