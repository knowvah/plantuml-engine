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
import { stateCreoleBlock, type StateStyledTextLine } from './state-sizing-creole.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import {
  edgeLabelEmbedAtom,
  edgeLabelEmbedDimension,
  splitEdgeLabelEmbeds,
  stackEdgeLabelStripes,
} from '../../core/svek/edge-label-embed.js';

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

/**
 * ele T1b: one stripe of a label whose display holds a `{{ … }}` line, offset from the block's top-left. A text
 * line is one `StripeSimple`; an embed is one `EmbeddedDiagram` atom stripe (`CreoleParser.java:146-170`), drawn by
 * its `block`.
 */
export type StateLabelStripe =
  | { readonly kind: 'text'; readonly line: StateStyledTextLine; readonly dx: number; readonly dy: number }
  | {
      readonly kind: 'image';
      readonly block: TextBlock;
      readonly width: number;
      readonly height: number;
      readonly dx: number;
      readonly dy: number;
    };

/** The stacked block of a label with an embed (`SheetBlock1#initMap`, `SheetBlock1.java:115-171`). */
export interface StateLabelStripes {
  readonly width: number;
  readonly height: number;
  readonly items: readonly StateLabelStripe[];
}

type CreoleOptions = Parameters<typeof stateCreoleBlock>[3];
type UnplacedStripe =
  | { readonly kind: 'text'; readonly line: StateStyledTextLine; readonly width: number; readonly height: number }
  | { readonly kind: 'image'; readonly block: TextBlock; readonly width: number; readonly height: number };

/** The label's stripes when a line opens an embed, else `undefined` (D2: the flat creole block stays). Text runs
 *  keep the state creole block; an embed stripe is the atom's own dimension. `maxMessageSize` cannot split an
 *  embed: `Fission#getSplitted` wraps only at a `ZWSP_SEPARATOR` neutron (`Fission.java:64-79`), and the
 *  atom is one neutron (`EmbeddedDiagram.java:252-255`). */
function labelStripes(
  displayLines: readonly string[],
  ctx: { readonly font: FontSpec; readonly measurer: StringMeasurer; readonly creole: CreoleOptions },
  align: HorizontalAlignment | undefined,
): StateLabelStripes | undefined {
  const segments = splitEdgeLabelEmbeds(displayLines);
  if (segments === undefined) return undefined;
  const unplaced: UnplacedStripe[] = segments.flatMap((segment): UnplacedStripe[] => {
    if (segment.kind === 'text') {
      const lines = stateCreoleBlock(segment.lines, ctx.font, ctx.measurer, ctx.creole).lines;
      return lines.map((line) => ({ kind: 'text', line, width: line.width, height: line.height }));
    }
    // `EmbeddedDiagram`'s `skinParam` only seeds the nested `Previous`; this port's registered renderer inherits the
    // enclosing diagram's skinparams itself (`src/index.ts#prepareBlock`, `inheritingRenderFn`).
    const block = edgeLabelEmbedAtom(segment.source, null);
    return [{ kind: 'image', block, ...edgeLabelEmbedDimension(block) }];
  });
  const stacked = stackEdgeLabelStripes(unplaced, align);
  const items = unplaced.map((stripe, i): StateLabelStripe => {
    const { dx, dy } = stacked.offsets[i]!;
    return stripe.kind === 'text'
      ? { kind: 'text', line: stripe.line, dx, dy }
      : { kind: 'image', block: stripe.block, width: stripe.width, height: stripe.height, dx, dy };
  });
  return { width: stacked.width, height: stacked.height, items };
}

/** Whether the label's first stripe is an embed: no `<text>` then reaches above the marged box
 *  (`LimitFinder#drawText`, `LimitFinder.java:217-224`). */
export function labelOpensWithEmbed(labelText: string): boolean {
  const parsed = parseWithNewlines(Pragma.createEmpty(), labelText);
  return splitEdgeLabelEmbeds(parsed?.lines.slice(0, 1) ?? [])?.[0]?.kind === 'embed';
}

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
    alignment?: HorizontalAlignment | undefined;
  },
): {
  parsed: NonNullable<ReturnType<typeof parseWithNewlines>>;
  vis: ReturnType<typeof applyVisibilityIcon>;
  block: ReturnType<typeof stateCreoleBlock>;
  stripes: StateLabelStripes | undefined;
} {
  const parsed = parseWithNewlines(Pragma.createEmpty(), labelText)!;
  const first = parsed.lines[0] ?? '';
  const vis = applyVisibilityIcon(first, options.classAttributeIconSize ?? CLASS_ATTRIBUTE_ICON_SIZE_DEFAULT);
  const displayLines = [vis.iconWidth > 0 ? vis.text : first, ...parsed.lines.slice(1)];
  const creole: CreoleOptions = {
    ...(options.maxWidth !== undefined && options.maxWidth > 0 ? { wrapWidth: options.maxWidth } : {}),
    tabSize: LABEL_TAB_SIZE,
    ...(options.sprites !== undefined ? { spriteRegistry: options.sprites } : {}),
  };
  const align = parsed.naturalHorizontalAlignment ?? options.alignment;
  const stripes = labelStripes(displayLines, { font, measurer, creole }, align);
  const block = stateCreoleBlock(displayLines, font, measurer, creole);
  return { parsed, vis, block, stripes };
}

/** The drawn block (`SvekEdge.java:287-300`, `Display#create0`): the `\n`-split lines, the first without its
 *  visibility character, through the state creole block with `maxMessageSize` as the wrap width. */
export function labelDisplayBlock(
  labelText: string,
  ctx: { readonly font: FontSpec; readonly measurer: StringMeasurer },
  style: LabelStyle,
): Pick<NonNullable<TransitionGeo['label']>, 'lines' | 'align' | 'blockWidth' | 'visibility' | 'stripes'> {
  const { parsed, vis, block, stripes } = labelCreoleBlock(labelText, ctx.font, ctx.measurer, style);
  const modifier = vis.iconWidth > 0 ? VisibilityModifier.getVisibilityModifier(parsed.lines[0] ?? '', false) : null;
  return {
    lines: block.lines,
    align: parsed.naturalHorizontalAlignment ?? style.alignment,
    blockWidth: stripes?.width ?? block.width,
    ...(stripes === undefined ? {} : { stripes }),
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
  const { vis, block, stripes } = labelCreoleBlock(text, font, measurer, options);
  // ele T1b: a label with an embed reserves the stacked stripes (`SheetBlock1#calculateDimension`).
  const measuredWidth = (stripes ?? block).width + vis.iconWidth;
  const measuredHeight = Math.max((stripes ?? block).height, vis.iconHeight);
  return {
    ...box,
    measuredWidth,
    measuredHeight,
    reservedWidth: Math.floor(measuredWidth + 2 * box.marginLabel),
    reservedHeight: measuredHeight + 2 * box.marginLabel,
  };
}
