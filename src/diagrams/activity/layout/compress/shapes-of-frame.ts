/**
 * The `USymbolFrame#asBig` shapes a `group`/`partition` frame contributes to
 * compression, beyond its own ignored rect (`shapes-of.ts#shapeForNode`):
 * the title-tab underline and the title itself. Split out of `shapes-of.ts`
 * (mission add4, T2b) when that file reached its 500-line cap.
 *
 * @see net/sourceforge/plantuml/decoration/symbol/USymbolFrame.java:136-170
 */

import type { ActivityNodeGeo } from '../../activity-geometry.types.js';
import type { StringBounder } from '../../tiles/tile.js';
import type { Theme } from '../../../../core/theme.js';
import type { CompressShape } from './shapes-of.js';
import { activityFontSize } from '../../activity-style-defaults.js';
import { ASCENT_FRACTION } from '../../activity-renderer-shapes.js';
import { withCompositeStyle } from '../../activity-composite-theme.js';
import { compositeTitleDimension, compositeTitleWidth } from '../../activity-renderer-composite.js';
import { compositeSymbolTitleOrigin } from '../../activity-renderer-composite-symbols.js';
import { frameTitleBlock, frameTitleBounder } from '../../tiles/gtile-group.js';
import { measurerAdapterOf } from '../../tiles/gtile-action.js';
import { titleDrawnShapes } from './shapes-of-frame-title.js';

/** `USymbolFrame#asBig`'s "Temporary hack" threshold: `if (widthFull -
 *  widthTitle < 25)` (`USymbolFrame.java:153`). */
const SPECIAL_TEXT_MIN_SPARE = 25;
/** `ug.apply(new UTranslate(3, 1))` -- the title's inset inside the frame,
 *  both branches (`USymbolFrame.java:154,156`). */
const TITLE_INSET_X = 3;
const TITLE_INSET_Y = 1;
/** `new UEmpty(1, 1)` (`atmp/SpecialText.java:61`). */
const SPECIAL_TEXT_SLOT = 1;

/**
 * `USymbolFrame#drawFrame`'s title-tab underline (`:76-84`, a `UPath`,
 * `setIgnoreForCompressionOnX()` only -- never Y). `UPath#drawWhenCompressed`
 * is a NO-OP (`klimt/UPath.java:233-234`, unlike `URectangle`'s 2px-edges
 * reservation), so on X it must contribute NOTHING, not a shrunk box --
 * modelled as `'polygon'` with `polygonSkipMode: 'x'` (`slot-finder.ts`'s
 * own `shape.polygonSkipMode !== mode` skip, the one existing CompressShape
 * kind with that "contributes nothing on this axis" semantic). On Y
 * (never skipped) it occupies its full `[y, y+textHeight]` box, exactly
 * `SlotFinder#drawPath`'s own un-ignored branch. `textWidth`/`textHeight`
 * mirror `activity-renderer-composite.ts#renderComposite`'s own formula
 * (same `dimTitle.getWidth() == 0` branch, `USymbolFrame.java:76-84,99-104`).
 */
export function frameTabShape(node: ActivityNodeGeo, theme: Theme): CompressShape {
  const titleDim = compositeTitleDimension(theme, node.label ?? '');
  const titleWidth = titleDim.width;
  const textWidth = titleWidth === 0 ? node.width / 3 : titleWidth + 10;
  const textHeight = titleWidth === 0 ? 12 : titleDim.height + 3;
  return { kind: 'polygon', x: node.x, y: node.y, width: textWidth, height: textHeight, polygonSkipMode: 'x' };
}

/**
 * The frame title's own compression footprint (`USymbolFrame.java:150-156`):
 *
 * - `widthFull - widthTitle < 25`: `title.drawU(ug.apply(new UTranslate(3,
 *   1)))` -- a plain text draw, which `SlotFinder#drawText` registers at its
 *   ink extent (`klimt/compress/SlotFinder.java:127-135`).
 * - otherwise: `draw(new SpecialText(title))`. `SpecialText` is ignorable on
 *   both axes (`atmp/SpecialText.java:55-57`), so `SlotFinder#draw` calls its
 *   `drawWhenCompressed` (`SlotFinder.java:87-92`), which draws a 1x1
 *   `UEmpty` at the title's END, `dx(dimTitle.width)` (`SpecialText.java
 *   :59-62`) -- a single pixel that keeps compression from cutting the
 *   title span while leaving the text itself free to overlap.
 *
 * Empty only for an empty title on the plain-text branch.
 */
export function frameTitleShapes(node: ActivityNodeGeo, bounder: StringBounder, theme: Theme): CompressShape[] {
  const drawn = plainFrameTitle(node, bounder, theme);
  if (drawn === undefined) {
    const title = node.label ?? '';
    const titleWidth = compositeTitleWidth(theme, title);
    if (node.width - titleWidth < SPECIAL_TEXT_MIN_SPARE) return []; // an empty `Display` draws nothing
    return [
      {
        kind: 'empty',
        x: node.x + TITLE_INSET_X + titleWidth,
        y: node.y + TITLE_INSET_Y,
        width: SPECIAL_TEXT_SLOT,
        height: SPECIAL_TEXT_SLOT,
      },
    ];
  }
  if (!drawn.drewText) return [...drawn.shapes];
  const title = node.label ?? '';
  const titleWidth = compositeTitleWidth(theme, title);
  const fontSize = activityFontSize(theme, 'composite');
  const dim = bounder.getDimension(title, fontSize);
  return [
    ...drawn.shapes,
    {
      kind: 'text',
      x: node.x + TITLE_INSET_X,
      y: node.y + TITLE_INSET_Y + fontSize * ASCENT_FRACTION,
      width: titleWidth,
      height: dim.height,
    },
  ];
}

/**
 * What the `title.drawU(ug.apply(new UTranslate(3, 1)))` branch draws (`USymbolFrame.java:153-154`), or `undefined`
 * for the `SpecialText` branch and an empty title. A `<$sprite>` atom's SVG shapes, and the title-wide text slot only
 * when a text atom drew a `UText` (`SlotFinder.java:127-135`), are read off the block itself
 * (`shapes-of-frame-title.ts`).
 */
export function plainFrameTitle(
  node: ActivityNodeGeo,
  bounder: StringBounder,
  theme: Theme,
): ReturnType<typeof titleDrawnShapes> | undefined {
  const title = node.label ?? '';
  const titleWidth = compositeTitleWidth(theme, title);
  if (node.width - titleWidth >= SPECIAL_TEXT_MIN_SPARE || title === '' || titleWidth === 0) return undefined;
  return titleDrawnShapes(
    frameTitleBlock(title, theme),
    { x: node.x + TITLE_INSET_X, y: node.y + TITLE_INSET_Y },
    frameTitleBounder(measurerAdapterOf(bounder), theme),
  );
}

/**
 * Every compression shape of a `group`/`partition` node, in draw order.
 *
 * - `USymbolFrame` (`usymbol` absent): the rect, ignorable on both axes
 *   (`USymbolFrame.java:70-71`), then {@link frameTabShape} and
 *   {@link frameTitleShapes}.
 * - `package`/`card`/`rectangle`: the symbol's `UPolygon`/`URectangle`
 *   carries no ignore flag (`USymbolFolder.java:93-102`,
 *   `USymbolCard.java:60`, `USymbolRectangle.java:67-68`), so it occupies
 *   its whole box; the title is a plain `UText` at the symbol's own origin
 *   (`activity-renderer-composite-symbols.ts#compositeSymbolTitleOrigin`).
 *   The `ULine`s draw no slot (`SlotFinder.java:84-109` has no `ULine` arm).
 */
export function frameShapes(node: ActivityNodeGeo, bounder: StringBounder, flatTheme: Theme): CompressShape[] {
  const theme = withCompositeStyle(flatTheme, node.compositeStyle);
  const box = { x: node.x, y: node.y, width: node.width, height: node.height };
  if (node.usymbol === undefined) {
    const shapes: CompressShape[] = [
      { kind: 'rect', ...box, ignoreX: true, ignoreY: true },
      frameTabShape(node, theme),
    ];
    return [...shapes, ...frameTitleShapes(node, bounder, theme)];
  }
  const shapes: CompressShape[] = [{ kind: node.usymbol === 'package' ? 'polygon' : 'rect', ...box }];
  const title = node.label ?? '';
  const titleWidth = compositeTitleWidth(theme, title);
  // No `UText` ink, no `SlotFinder#drawText` slot (see frameTitleShapes).
  if (title === '' || titleWidth === 0) return shapes;
  const fontSize = activityFontSize(theme, 'composite');
  const origin = compositeSymbolTitleOrigin(node, node.usymbol, titleWidth);
  const height = bounder.getDimension(title, fontSize).height;
  return [
    ...shapes,
    { kind: 'text', x: origin.x, y: origin.y + fontSize * ASCENT_FRACTION, width: titleWidth, height },
  ];
}
