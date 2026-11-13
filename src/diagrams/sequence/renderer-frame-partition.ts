/**
 * A `partition` frame, drawn through the page's `UGraphic`: `PartitionTile`'s
 * `getComponent` (`teoz/PartitionTile.java:93-148`) and `drawCompBackground`
 * (`:236-247`). Upstream's component is an anonymous `Component`, not an
 * `AbstractComponent`, so its `drawU` runs in BOTH passes
 * (`GroupingTile#drawU:262-274` calls it whatever `isBackground()` says):
 * the title and the outline are drawn once in the background pass, after the
 * background fill, and again in the foreground pass. Jar-verified on
 * `teoz-ng-001-11` (title and rect emitted twice).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/sequencediagram/teoz/PartitionTile.java
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/sequencediagram/teoz/GroupingTile.java:262-282
 */
import type { FrameGeo } from './ast.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { Back } from '../../core/klimt/Back.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import { URectangle } from '../../core/klimt/shape/URectangle.js';
import { FontStyle } from '../../core/klimt/shape/UText.js';
import { drawnRuns, framePaintsOf, outline, svgFixColor } from './renderer-frame-header.js';
import type { PageTheme } from './renderer-ug.js';
import { drawCreoleRuns } from './sequence-text.js';

/** The span `[border1, border1 + getWidth()]` `layout.ts#backfillPartitionSpan` set. */
function spanOf(frame: FrameGeo): { readonly x: number; readonly width: number } {
  if (frame.partitionSpan === undefined) throw new Error('partition geo has no span: layout backfills it');
  return frame.partitionSpan;
}

/**
 * `PartitionTile#getComponent().drawU` (`:128-147`): the title (`:150-151`),
 * then the frame rect under the FRAME style's stroke and line colour
 * (`getUsedStyles()[0]`, `:136-146`), rounded by its `RoundCorner`
 * (`:143-145`) over `Area(getWidth(), getTotalHeight)` (`:151-153`), with no
 * fill.
 */
function drawPartitionComponent(ug: UGraphic, frame: FrameGeo, theme: PageTheme): void {
  const { paint, headerPaint } = framePaintsOf(frame);
  const { font } = headerPaint;
  drawCreoleRuns(ug, drawnRuns(frame.tabRuns, font), theme, font.size, font.styles.has(FontStyle.BOLD));
  const { x, width } = spanOf(frame);
  const rect = URectangle.build(width, frame.height).rounded(paint.roundCorner);
  outline(ug.apply(new UTranslate(x, frame.y)), paint).draw(rect);
}

/**
 * `PartitionTile#drawCompBackground` (`:236-247`) -- `GroupingTile#drawBackground`
 * hands it `dy(getFrameY())` (`:315`): the body style's `BackGroundColor`
 * (`:309`) over the same rounded span, `ug.apply(back.bg())` with no line
 * colour (`stroke:none`) -- then the component, as above.
 */
export function drawPartitionBackground(ug: UGraphic, frame: FrameGeo, theme: PageTheme): void {
  const { paint } = framePaintsOf(frame);
  const { x, width } = spanOf(frame);
  const rect = URectangle.build(width, frame.height).rounded(paint.roundCorner);
  ug.apply(new UTranslate(x, frame.y))
    .apply(new Back(svgFixColor(paint.fill)))
    .draw(rect);
  drawPartitionComponent(ug, frame, theme);
}

/** The foreground pass: the component alone (`GroupingTile#drawU:274`). */
export function drawPartitionForeground(ug: UGraphic, frame: FrameGeo, theme: PageTheme): void {
  drawPartitionComponent(ug, frame, theme);
}
