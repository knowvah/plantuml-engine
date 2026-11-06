# T3e — link labels

Commit: `fix(description): measure and draw link labels as the jar does`.

## Context
- **Magic arrows:** `funeme-74` (`A - B : < a`), `berelu-46` (`A -up-> B : > up arrow`). The jar strips the `<`/`>` and draws a glyph. Only class has it (`class/class-magic-arrow.ts`), which sits in the `-->`-shaped `SvekEdge.java:299` path: move it to core rather than copy it.
- **`maxMessageSize`:** `kafexo-72` draws one 261 px line where the jar wraps to `childCount` 19. `link-edge-attrs.ts` and `description-elk-label.ts` both name it, so read which arm ignores it, `SvekEdge.java:299,441`. This is `.agent-notes/description-edge-label-oversizing.md`'s problem: read that note, and #144's point that edge labels measure through the flat creole seam. If this needs #144's `Display#create0` rewrite, do not do it: name the rows on #144 (D7).
- **Atoms:** `ruciga-77`, `bivira-53`, `sprite-SVG-fill-management-3`, `tatori-66` (`bs1 --> a : sprite: <$bs1>`): a sprite in a label.
- **Post-colon `<<st>>` text** (`planning/next-missions.md`): `furepo-90` (`"=Format NOT working"`), `kemidi-98`.
- `jecici-56`, `vugaso-74`, `pumoko-38`: `TRACKER` #11 label-box inputs, from codd.

## Rows
`funeme-74`, `berelu-46`, `kafexo-72`, `ruciga-77`, `bivira-53`, `sprite-SVG-fill-management-3`, `tatori-66`, `furepo-90`, `kemidi-98`.

## Acceptance
- Given `funeme-74`, when rendered, then the labels read `a` and `c`, each with the jar's glyph, and the row has zero diffs.
- Given `kafexo-72`, then either it matches the jar's wrapped lines, or it is named on #144 with the measurement.

Observability: N/A — no new observable operations. Rollback: Reversible.
