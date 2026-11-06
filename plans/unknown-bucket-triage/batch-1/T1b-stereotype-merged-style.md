# T1b — A stereotyped box reads one merged `Style`

**Rows:** `gucipa-88`, `ticini-08`, `xebuce-87`, `xevumo-18`. A `<style> .color { … }` (or `.save`) class on
`:label; <<color>>` and `backward:label; <<color>>`. We take the class's colours, but not `LineThickness 2`
(stroke 0.5), `FontSize 11` (12) or `FontName Arial Narrow` (none), so widths and positions follow. Planning probe
`measurements/probes/b1.puml` (`:Generate diagrams1; <<color>>` with no `repeat`) shows the same diffs against its oracle, so the action
box is the origin, not the loop. `save` is also a `BoxStyle` name, so `ticini-08` draws a polygon.

**Read:** `FtileBox.java:120-185` (`create`, the constructor: style, `getStroke`, `getFontConfiguration`,
padding, `RoundCorner`, shadowing, wrap width), `FtileBox.java` `calculateDimension` and `drawU`, `BoxStyle.java`,
`CommandBackward3.java:130-140`, `CommandActivity3.java` (the stereotype it passes), `StyleSignatureBasic
#withTOBECHANGED`. Ours: `activity-scoped-colors.ts:78-105`, `activity-renderer-shapes.ts:150-230`,
`activity-creole-sheet.ts:300-330`, `tiles/gtile-action.ts`, `dispatch-stereogroup.ts`, and the style builder the
renderer already has (`currentStyleBuilderOf`, see `docs/catalog.md`).

**Do:** per D3. One merged style per stereotyped box, built where the box is sized, read by sizer and renderer.
Everything `FtileBox` reads comes from it. Keep the multi-label order `Stereogroup` gives (`xebuce-87` has
`<<save>> <<color>>`). The note (`FtileWithNoteOpale.java:137`) and partition (`CommandPartition3.java:160`) reads
share the helpers: move them to the merged style only if their Java reads the whole style the same way, and journal
which you moved.

**Red:** the four rows' jar values. Authored, with oracles: a style class with each property `FtileBox` reads
(`LineThickness`, `FontSize`, `FontName`, `FontStyle`, `Padding`, `RoundCorner`, `Shadowing`, `MaximumWidth`) on
an action, a backward box and a `BoxStyle` box, and two classes in one group.

**Measure:** `unknown`, `activity`.

## Acceptance
- Given the four rows, when re-read, then 0 diffs, or each residual journaled with its mechanism and owner.
- Given each authored fixture, when compared with its oracle, then 0 diffs.
- Given `unknown` and `activity` surveys, then 0 conformant lost against T0.

Observability N/A. Rollback Reversible.
