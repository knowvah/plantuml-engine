## Observation: a merged stereotype style that changes nothing stays on the flat readers
- **Context**: building `core/activity-box-style.ts` (`FtileBox.create`, `FtileBox.java:138-146`).
- **Finding**: `resolveActivityBoxStyle` returns `undefined` when `withTOBECHANGED(stereotype)` and the plain signature hold the same value for every PName `FtileBox` reads. `<<save>>` with no `.save` class therefore keeps today's flat output, byte for byte. A box with a style class reads ALL its values off the merged style, as upstream does.
- **Impact**: the activity ratchets moved only on rows whose class sets something; the per-label flat helpers (`stereotypeBack/Line/Font`) remain the fallback where no style resolves.
- **Confidence**: High

## Observation: the style builder is the whole document's, not positional
- **Context**: `build-theme.ts` hangs `graph.activity.boxStyleOf` (lazy `currentStyleBuilderOf`).
- **Finding**: like `activity-circle-style.ts`, it replays every skinparam and `<style>` block, so a `<style>` after a box also reaches it (upstream: only blocks before it, `FtileBox.create`'s `skinParam.getCurrentStyleBuilder()` at dispatch time).
- **Impact**: a later-declared class would wrongly apply; no corpus row does it.
- **Confidence**: Medium (not probed against the jar)

## Observation: Shadowing widens the canvas by 2*delta on the far corner of a URectangle
- **Context**: `action-shadowing` oracle: width 213 -> 225 at `Shadowing 6`.
- **Finding**: `LimitFinder.java:184-188` adds `getDeltaShadow() * 2` to both axes for a rectangle (and `:211-214` an ellipse), not for a polygon or path; `canvas-origin-fudge.ts#withBoxShadow` mirrors it for PLAIN, procedure, task, object. The shadow `<filter>` itself is one fixed def (`SvgGraphics.java:1070-1090`).
- **Impact**: any new shadowed activity shape needs this ink term.
- **Confidence**: High (oracles)

## Observation: the deterministic measurer ignores FontName and FontStyle widths
- **Context**: `action-fontname`, `action-fontstyle`, `action-linethickness` oracles all 213 wide.
- **Finding**: widths do not move with `FontName Courier` or `FontStyle bold` under `PLANTUML_DETERMINISTIC_TEXT`; only `font-family`/`font-weight` attributes change. Those fixtures pin the attributes, not the width.
- **Impact**: a width regression from a font face is invisible to these oracles.
- **Confidence**: Medium

## Observation: residuals outside the stereotyped-box seam
- **Context**: activity rows `vupecu-35-tisa672` (110 -> 28) and `finadu-74-duvi890` (82 -> 50).
- **Finding**: vupecu: `if (..) then <<foo>>` diamond fill pink; the jar reads `FtileFactoryDelegatorIf.java:79` (`getDefaultStyleDefinitionDiamond().withTOBECHANGED(stereotype)`), we read nothing. finadu: `!theme cerulean` sizes a PLAIN `:test;` (rx 4.167, h 25, font 12.5, Verdana): plain boxes read the flat tiers, not the merged style; a bare `!theme cerulean` + `:test;` diverges the same way (oracle probe).
- **Impact**: two follow-ons: diamond stereotype style; merged style for every activity box, not only stereotyped ones.
- **Confidence**: High (vupecu, jar line quoted), Medium (finadu: mechanism by probe, not traced to a PName)
