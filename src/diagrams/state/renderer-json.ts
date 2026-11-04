/**
 * stdd T5a: a `json Name { ... }` leaf in a state diagram -- `EntityImageJson#drawU`
 * (`EntityImageJson.java:153-213`): the rounded box (`{root, element, objectDiagram, json}`:
 * `objectDiagram { element { RoundCorner 5 } }`, `plantuml.skin:204-210`), the name centred over the
 * title height (`ULayoutGroup`, `PlacementStrategyY1Y2`), then the grid `state-json-layout.ts` measured.
 * The rules take the stencil's default `UStroke` (width 1, `UGraphicStencil.create(ug, this, stroke)`),
 * the box the style's (`element { LineThickness 0.5 }`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageJson.java:153-213
 */
import type { Theme } from '../../core/theme.js';
import { line, rect, text } from '../../core/svg.js';
import { JSON_NAME_MARGIN } from '../../core/svek/image/EntityImageJson.js';
import type { StateNodeGeo } from './state-geo-types.js';
import type { JsonLeafLayout } from './state-json-layout.js';
import {
  resolveStateBorder,
  resolveStateFill,
  STATE_BORDER_STROKE_WIDTH,
  STATE_DEFAULT_BACKGROUND,
  stateFontFamily,
  textAscent,
} from './state-render-colors.js';

/** `objectDiagram { element { RoundCorner 5 } }` (`plantuml.skin:204-210`): `URectangle#rounded(5)`'s `rx`. */
const JSON_BOX_RX = 2.5;
/** `UGraphicStencil.create(ug, this, stroke)` draws the rules with the bare `UStroke` (`UStroke.java:75-77`). */
const JSON_RULE_WIDTH = 1;
/** `FontColor black` (`plantuml.skin:9`) for the json style. */
const JSON_TEXT_FILL = '#000000';

/** The `kind:'json'` leaf: box, centred name, then the measured grid. */
export function renderJsonLeaf(node: StateNodeGeo, theme: Theme, layout: JsonLeafLayout): string {
  const fontFamily = stateFontFamily(theme);
  const fontSize = theme.fontSize;
  const border = resolveStateBorder(node, theme);
  const box = rect(node.x, node.y, node.width, node.height, {
    fill: resolveStateFill(node, STATE_DEFAULT_BACKGROUND),
    stroke: border,
    strokeWidth: STATE_BORDER_STROKE_WIDTH,
    rx: JSON_BOX_RX,
    ry: JSON_BOX_RX,
  });
  const textAttrs = { fill: JSON_TEXT_FILL, fontFamily, fontSize, lengthAdjust: 'spacing' as const };
  const ascent = textAscent(fontSize);
  const name = text(node.x + (node.width - layout.nameWidth) / 2, node.y + JSON_NAME_MARGIN + ascent, node.display, {
    ...textAttrs,
    textLength: layout.nameWidth,
  });
  const rule = { stroke: border, strokeWidth: JSON_RULE_WIDTH };
  const rules = layout.rules
    .map((r) => line(node.x + r.x1, node.y + r.y1, node.x + r.x2, node.y + r.y2, rule))
    .join('');
  const texts = layout.texts
    .map((t) => text(node.x + t.x, node.y + t.top + ascent, t.text, { ...textAttrs, textLength: t.width }))
    .join('');
  return box + name + rules + texts;
}
