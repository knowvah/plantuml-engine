/**
 * `Cluster#drawU` for a group with a `USymbol` (`Cluster.java:353-374`): `drawUState` is skipped and
 * `new ClusterDecoration(packageStyle, usymbol, title, stereo, rectangleArea, stroke).drawU(ug, backColor,
 * borderColor, shadowing, rounded, titleAlignment, stereoAlignment, diagonalCorner)` draws the symbol -- here
 * `USymbols.FRAME` for `frame X { }` (`CommandCreatePackage2`, `State.container`). The cluster style of a state
 * diagram is always `root.element.stateDiagram.state.group` whatever the symbol (`Cluster.java:286-289`):
 * RoundCorner 25 (`plantuml.skin:278`), LineThickness 0.5 (`:287-288`), the `group { BackGroundColor transparent }`
 * back colour (`:102-103`). The title's style is `root.element.stateDiagram.frame.composite.title`
 * (`ClusterHeader.java:155-160`): `element { composite,package { title { FontStyle bold; HorizontalAlignment
 * center } } }` (`plantuml.skin:91-97`). stdd T6c, tucotu-42.
 */

import type { Theme } from '../../core/theme.js';
import type { StringMeasurer } from '../../core/measurer.js';
import type { StateNodeGeo } from './state-geo-types.js';
import type { FontConfiguration } from '../../core/klimt/shape/UText.js';
import { FontStyle } from '../../core/klimt/shape/UText.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import { UStroke } from '../../core/klimt/UStroke.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import { TextBlockUtils } from '../../core/klimt/shape/TextBlockUtils.js';
import { buildTextBlock } from '../../core/svek/image/EntityImageDescriptionSupport.js';
import { ClusterDecoration } from '../../core/svek/ClusterDecoration.js';
import { FRAME } from '../../core/decoration/symbol/USymbols.js';
import { renderDrawableToFragment } from '../../core/klimt/document-shell.js';
import {
  STATE_BORDER_STROKE_WIDTH,
  stateFontFamily,
  resolveStateBorder,
  resolveStateBoxRadius,
  resolveStateFontColor,
} from './state-render-colors.js';
import { STATE_NAME_BUCKET } from './state-bucket-colors.js';

/** `group { BackGroundColor transparent }`: the frame's rectangle takes no fill (`fill="none"`). */
const TRANSPARENT_BACK = 'transparent';
/** `stateDiagram { state { RoundCorner 25 } }` (`plantuml.skin:278`), as the corner radius `renderer-box.ts` draws. */
const STATE_BOX_RX = 12.5;

export function renderFrameCluster(node: StateNodeGeo, theme: Theme, measurer: StringMeasurer): string {
  const fontColor = resolveStateFontColor(node, theme, '#000000', STATE_NAME_BUCKET);
  const font: FontConfiguration = {
    family: stateFontFamily(theme),
    size: theme.fontSize,
    color: fontColor,
    styles: new Set([FontStyle.BOLD]),
  };
  const title = buildTextBlock(node.display, font, HorizontalAlignment.CENTER);
  const decoration = new ClusterDecoration(
    null,
    FRAME,
    title,
    TextBlockUtils.empty(0, 0),
    { position: new UTranslate(node.x, node.y), width: node.width, height: node.height },
    UStroke.withThickness(STATE_BORDER_STROKE_WIDTH),
  );
  const border = resolveStateBorder(node, theme);
  const roundCorner = 2 * resolveStateBoxRadius(theme, STATE_BOX_RX);
  const fragment = renderDrawableToFragment(
    {
      drawU(ug) {
        decoration.drawU(
          ug,
          TRANSPARENT_BACK,
          border,
          0,
          roundCorner,
          HorizontalAlignment.CENTER,
          HorizontalAlignment.CENTER,
          0,
        );
      },
    },
    { width: node.x + node.width, height: node.y + node.height, measurer, uid: node.id },
  );
  return fragment.body;
}
