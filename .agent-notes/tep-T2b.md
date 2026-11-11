## Observation: TimeMessage ignores dotted and bold
- **Context**: porting `TimeMessage` and `TimeArrow` against probe cov-message-dotted.
- **Finding**: `TimeMessage#getUStroke` (TimeMessage.java:70-76) answers the `arrow` style stroke only, and `TimeArrow#drawU`
  (TimeArrow.java:117-124) reads `type.getUStroke()` on the message, so the `LinkType` that `goDotted`/`goBold`/`goThickness`
  rewrite is never read. `-[dotted]>` draws a plain 1.5 line (oracle: no `stroke-dasharray`); only the colour of
  `-[#blue,bold]>` reaches the drawing, through `setSpecificColor`.
- **Impact**: T3's `CommandTimeMessage` must still call `applyStyle` (the colour needs it); never add a dash.
- **Confidence**: High (unit tests assert the oracle fragments)

## Observation: WithLinkType.getColorOrWhite answers a ResolvedColor, and drops what parseColor handles
- **Context**: `message.applyStyle('#red')` for `-[#red]>`.
- **Finding**: the port's `WithLinkType.ts` adaptation calls `parseSimpleColor`, which answers a bare `{r,g,b,a}` record, where
  Java's `HColorSet.getColorOrWhite` answers an `HColor` (and honours `transparent`, gradients such as `red-blue`, and
  `#?` schemes). The record is wrapped with `HColors.simple` in `timing-klimt.ts#specificColorOf`, as
  `gantt/GanttConstraint.ts` does. A gradient or `transparent` arrow colour in a timing message draws white here.
- **Impact**: T3/T4b should probe `-[#red-blue]>` and `-[#transparent]>` against the jar before calling messages done;
  the fix belongs in `WithLinkType.ts` and needs the class-diagram ratchets.
- **Confidence**: Medium (read from source; the probe is not run)

## Observation: Highlight's caption font is the legacy FontParam.TIMING, not the style
- **Context**: `Highlight#getCaption(ISkinParam)` (Highlight.java:114-117).
- **Finding**: it builds `FontConfiguration.create(skinParam, FontParam.TIMING, null)`: 12 px, black `#000`, no bold,
  from `timingFontSize`/`timingFontName`/`timingFontStyle`/`timingFontColor` and the `default*` skinparams, ignoring
  `<style> timingDiagram { highlight { FontSize } }`. Oracle cov-highlight: `font-size="12" fill="#000"`, no weight.
  A highlight with no caption is `Display.getWithNewlines(pragma, null)` (the NULL display), which draws nothing; an
  empty string would draw a one-space `<text>`.
- **Impact**: `TimingSkinParam` gained `getFont`, `getFontHtmlColor`, `getHyperlinkColor`, `useUnderlineForHyperlink`;
  `timing-font-param.ts` has the SkinParam logic for TIMING so T3a's `timing-skin-param.ts` calls it. `FontParam` in
  `src/core/abel/ISkinParam.ts` gained `TIMING`.
- **Confidence**: High
