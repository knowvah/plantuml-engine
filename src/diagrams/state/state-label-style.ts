/**
 * state-label-style.ts — what `SvekEdge#drawU` reads before it builds a state link's label block
 * (stdd T2c): `getMessageTextAlignment` (`SvekEdge.java:376-381`), `skinParam.maxMessageSize()`
 * (`:291-294`) and `classAttributeIconSize()` for `LinkArg.build` (`CommandLinkStateCommon.java:202`);
 * then the block itself, `Display.getWithNewlines(...).create0(font, alignment, wrapWidth,
 * CreoleMode.SIMPLE_LINE)` (`:189`, `:299-300`), as the state creole block, and the reserved box its
 * dimension gives the DOT edge (`:504-507`).
 */
import type { FontSpec, StringMeasurer } from '../../core/measurer.js';
import type { Theme } from '../../core/theme.js';
import type { SpriteRegistry } from '../../core/sprite-registry.js';
import type { ReservedLabelBox } from '../../core/edge-label-box.js';
import type { TransitionGeo } from './state-geo-types.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import { parseWithNewlines } from '../../core/klimt/creole/DisplayNewlines.js';
import { Pragma } from '../../core/skin/Pragma.js';
import { VisibilityModifier } from '../../core/skin/VisibilityModifier.js';
import {
  CLASS_ATTRIBUTE_ICON_SIZE_DEFAULT,
  applyVisibilityIcon,
  computeReservedLabelBox,
} from '../../core/edge-label-box.js';
import { stateCreoleBlock } from './state-sizing-creole.js';

/**
 * stdd T2c: what `SvekEdge.java:287-300` reads before `create0`: `getMessageTextAlignment`
 * (`:376-381` -> `SkinParam.java:722-723`: `stateMessageAlignment`, else `defaultTextAlignment`, else
 * CENTER), `skinParam.maxMessageSize()` as the wrap width, and `classAttributeIconSize()` for
 * `LinkArg.build` (`:202`).
 */
export interface LabelStyle {
  readonly alignment: HorizontalAlignment;
  readonly maxWidth?: number;
  readonly classAttributeIconSize: number;
  /** The diagram's sprites: a `<$name>` atom in the label is an image (`SvekEdge.java:298-299`). */
  readonly sprites?: SpriteRegistry;
}

export function labelStyleOf(theme: Theme): LabelStyle {
  const alignment =
    theme.colors.graph.stateMessageAlignment ??
    theme.colors.elements?.['root']?.horizontalAlignment ??
    HorizontalAlignment.CENTER;
  return {
    alignment,
    ...(theme.maxMessageSize !== undefined ? { maxWidth: theme.maxMessageSize } : {}),
    classAttributeIconSize: theme.classAttributeIconSize ?? CLASS_ATTRIBUTE_ICON_SIZE_DEFAULT,
    ...(theme.sprites !== undefined ? { sprites: theme.sprites } : {}),
  };
}

/** `AtomText`'s tab stop is eight spaces (`AtomText.java:219`, `getTabSize`). */
const LABEL_TAB_SIZE = 8;

/** `Display.getWithNewlines(label)` with the first line's visibility character stripped (`LinkArg.build`),
 *  then `create0(font, alignment, wrapWidth, SIMPLE_LINE)` as the state creole block. */
function labelCreoleBlock(
  labelText: string,
  font: FontSpec,
  measurer: StringMeasurer,
  options: {
    maxWidth?: number | undefined;
    classAttributeIconSize?: number | undefined;
    sprites?: SpriteRegistry | undefined;
  },
): {
  parsed: NonNullable<ReturnType<typeof parseWithNewlines>>;
  vis: ReturnType<typeof applyVisibilityIcon>;
  block: ReturnType<typeof stateCreoleBlock>;
} {
  const parsed = parseWithNewlines(Pragma.createEmpty(), labelText)!;
  const first = parsed.lines[0] ?? '';
  const vis = applyVisibilityIcon(first, options.classAttributeIconSize ?? CLASS_ATTRIBUTE_ICON_SIZE_DEFAULT);
  const displayLines = [vis.iconWidth > 0 ? vis.text : first, ...parsed.lines.slice(1)];
  const block = stateCreoleBlock(displayLines, font, measurer, {
    ...(options.maxWidth !== undefined && options.maxWidth > 0 ? { wrapWidth: options.maxWidth } : {}),
    tabSize: LABEL_TAB_SIZE,
    ...(options.sprites !== undefined ? { spriteRegistry: options.sprites } : {}),
  });
  return { parsed, vis, block };
}

/** The drawn block (`SvekEdge.java:287-300`, `Display#create0`): the `\n`-split lines, the first without its
 *  visibility character, through the state creole block with `maxMessageSize` as the wrap width. */
export function labelDisplayBlock(
  labelText: string,
  ctx: { readonly font: FontSpec; readonly measurer: StringMeasurer },
  style: LabelStyle,
): Pick<NonNullable<TransitionGeo['label']>, 'lines' | 'align' | 'blockWidth' | 'visibility'> {
  const { parsed, vis, block } = labelCreoleBlock(labelText, ctx.font, ctx.measurer, style);
  const modifier = vis.iconWidth > 0 ? VisibilityModifier.getVisibilityModifier(parsed.lines[0] ?? '', false) : null;
  return {
    lines: block.lines,
    align: parsed.naturalHorizontalAlignment ?? style.alignment,
    blockWidth: block.width,
    ...(modifier === null
      ? {}
      : { visibility: { modifier: modifier.name, iconWidth: vis.iconWidth, iconHeight: vis.iconHeight } }),
  };
}

/**
 * stdd T2c: the label's reserved box, with the text's extent taken from the creole block the renderer
 * draws (`SvekEdge.java:300`: `labelText` IS the `create0` block, and `:504-507` reserves its dimension),
 * so a tab stop (`AtomText.java:219-224`) or a run-level size widens the DOT box as it widens the jar's.
 * The margins, floors and icon fold stay `computeReservedLabelBox`'s.
 */
export function measureStateLabelBox(
  text: string,
  font: FontSpec,
  measurer: StringMeasurer,
  isSelfLoop: boolean,
  options: {
    maxWidth?: number | undefined;
    classAttributeIconSize?: number | undefined;
    sprites?: SpriteRegistry | undefined;
  } = {},
): ReservedLabelBox {
  const box = computeReservedLabelBox(text, font, measurer, isSelfLoop, {
    ...(options.maxWidth !== undefined ? { maxWidth: options.maxWidth } : {}),
    ...(options.classAttributeIconSize !== undefined ? { classAttributeIconSize: options.classAttributeIconSize } : {}),
  });
  const { vis, block } = labelCreoleBlock(text, font, measurer, options);
  const measuredWidth = block.width + vis.iconWidth;
  const measuredHeight = Math.max(block.height, vis.iconHeight);
  return {
    ...box,
    measuredWidth,
    measuredHeight,
    reservedWidth: Math.floor(measuredWidth + 2 * box.marginLabel),
    reservedHeight: measuredHeight + 2 * box.marginLabel,
  };
}
