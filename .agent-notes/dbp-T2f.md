# dbp-T2f: chrome paints an inherited document gradient

## Observation: mainframe's `null` back conflates unset with transparent
- **Context**: Probing `mainframe { BackgroundColor transparent }` against the jar on solid and gradient canvases.
- **Finding**: `resolveChromeColor('transparent')` is `null`, and `bigFrameStyleOf` reads `null` as the document colour. The jar draws `fill="none"` (`ValueImpl.java:97-98`). T2f fixes the gradient canvas only; on a solid canvas ours still paints the document colour (`document { BackgroundColor pink; mainframe { BackgroundColor transparent } }`: ours `#FFC0CB`, jar `none`).
- **Impact**: One open solid-canvas defect, left byte-identical by T2f's acceptance.
- **Confidence**: High (jar render through `scripts/oracle-render.sh`).

## Observation: `mainframeTitleColor` has no upstream basis at LineThickness 0
- **Context**: `mainframe foo\n----\nbar` with `mainframe { LineThickness 0 }`.
- **Finding**: `BigFrame#drawU` draws the title under `symbolContext.apply(ug)` (`BigFrame.java:96`, `Fashion.java:73-77`): the fore is `LineColor`, never the back. Ours returns the back on a solid. The jar's rule also runs wider than ours (`x1` 8 vs 3, `x2` 28.212 vs 33.212), and a mainframe table's lines carry no stroke at thickness 0 where ours strokes `#000`.
- **Impact**: Solid-canvas residuals, unrelated to the gradient, on a `LineThickness 0` mainframe with lines in its title.
- **Confidence**: High for the jar output; the rule-width mechanism is not diagnosed.

## Observation: the `<style> root { BackgroundColor }` cascade stops short of entities
- **Context**: Probe `root { BackgroundColor red/blue }` on a class diagram.
- **Finding**: Chrome now matches the jar; entity `rect`/`ellipse` fills do not (`rect` ours `#F1F1F1`, jar `none`; `ellipse` ours `#ADD1B2`, jar `url(#…)`, 3 diffs).
- **Impact**: A separate defect in the entity style cascade, outside the annotations module.
- **Confidence**: High for the diffs; the mechanism is not diagnosed.

## Observation: a JSON refusal page drops the document gradient
- **Context**: `@startjson` with `mainframe M` and a gradient `<style>`.
- **Finding**: The jar draws "Your data does not sound like JSON data" on the gradient (`defs` 1, `url` rect); ours draws the same page with `background:#FFFFFF` and no def.
- **Impact**: Error-page background only; both sides error, so it counts as conformant under the error-page ruling.
- **Confidence**: High for the diffs; the mechanism is not diagnosed.
