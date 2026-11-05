# T2b — `objectAttribute*` skinparams reach the object's style

**Row:** `lunike-70-xipi897` (205 diffs: `font-size` 12.5 against 11.458, that is 12 and 11 at the theme's 100/96 scale; the box and canvas sizes follow).

**Read:** `FromSkinparamToStyle.java:198-202` (`addConFont("object", SName.object)`, `addConFont("objectAttribute", SName.object)`) and `addConFont` itself, `puml-theme-aws-orange.puml:450-457`. On our side, `grep -n "AttributeFontSize" src/core/*.ts`: nothing on planning's first grep matched `objectAttribute`, so find which handler takes it today, or whether it is dropped. Start at `skinparam-key-handlers-table-*.ts` and `skinparam-element-buckets.ts`.

**Do:** per D4. Mirror the `addConFont` table: size, name, style and color, as the Java's helper converts them. Last wins between `objectFontSize` and `objectAttributeFontSize` in source order: oracle it both ways.

**Red:** both orders; each of the four properties; `aws-orange` itself.

**After:** re-read `lunike-70`. Its map, gradient and link rows may hold residuals: this row has the most diffs of the 16, and only the first are explained.

## Acceptance
- Given `lunike-70`, when compared, then conformant, or the journal names the remaining mechanism and its owner.
- Given both source orders, when compared with oracles, then 0 diffs.

Observability N/A. Rollback Reversible.
