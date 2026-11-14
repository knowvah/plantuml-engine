/**
 * `group`/`partition` frame rendering (`USymbolFrame#asBig`,
 * `decoration/symbol/USymbolFrame.java:136-170`, called by
 * `FtileGroup#drawU`, `ftile/vcompact/FtileGroup.java:209-227` --
 * `USymbols.PARTITION`/`USymbols.GROUP` are both a bare `USymbolFrame`,
 * `decoration/symbol/USymbols.java:81,87`). Split into its own module
 * (mission `activity-divergence-drive-2` T3g, family PART) rather than
 * added to `activity-renderer-shapes.ts` -- that file was already at the
 * 500-line cap; its `renderComposite` now just calls into here.
 */

import { stereotypeRoundCorner } from '../../core/theme-element-resolve.js';
import { Fore } from '../../core/klimt/Fore.js';
import { Back } from '../../core/klimt/Back.js';
import type { ActivityNodeGeo } from './layout/tile-layout.js';
import { compositeBucketOf } from '../../core/style-element-scope.js';
import type { Theme } from '../../core/theme.js';
import type { Paint } from '../../core/paint.js';
import type { CompositeUSymbol } from './activity-geometry.types.js';
import {
  compositeSymbolTitleOrigin,
  drawCompositeSymbol,
  type CompositeInk,
} from './activity-renderer-composite-symbols.js';
import { rect, path } from '../../core/svg.js';
import { fmt } from '../../core/svg-format.js';
import { resolveColorToSvgHex } from '../../core/klimt/color/HColorSet.js';
import { activityDisplayBlock, activityTextFontConfiguration, drawActivityTextBlock } from './activity-text-sheet.js';
import { withTitleShapeDeltas } from './activity-title-compress-ug.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import { CreoleMode } from '../../core/klimt/creole/CreoleMode.js';
import { activityFontSize, activityLineThickness, resolveSolidBucketColor } from './activity-style-defaults.js';
import { activityMeasurer } from './activity-string-bounder.js';
import {
  fontConfigurationColor,
  inlineBack,
  scopedBack,
  scopedLine,
  stereotypeBack,
  stereotypeLine,
  stereotypeFont,
} from './activity-scoped-colors.js';
import { frameTitleDimension } from './tiles/gtile-group.js';
import { withCompositeStyle } from './activity-composite-theme.js';
import { paintOf } from '../../core/activity-circle-style.js';
import { bridgeFontConfiguration } from '../../core/klimt/font/FontConfigurationBridge.js';
import { HColorSet } from '../../core/klimt/color/HColorSet.js';
import { svgBack } from './activity-scoped-colors.js';
import { UStroke } from '../../core/klimt/UStroke.js';

/** The root `FontColor black` a frame's title inherits. @see ~/git/plantuml/src/main/resources/skin/plantuml.skin:9 */
const COMPOSITE_TITLE_FONT_COLOR = '#000';

/** `USymbolFrame#drawFrame` (`:68-97`): the title-tab underline, an OPEN
 *  (unfilled) 4-point path from the tab's top-right corner down past a
 *  `cornersize` dog-ear cut to the frame's own left edge. `fmt()` (not raw
 *  interpolation): `textWidth` is derived from `compositeTitleWidth`'s
 *  table-lookup sum, which can land a ULP off a clean decimal
 *  (`19.425000000000004`) -- `svg.ts#attrs` cleans that for every OTHER
 *  numeric attribute in this file, but a `d` string's embedded numbers
 *  bypass it entirely (`class-member-sprite-render.ts`'s own path
 *  builders are the established precedent for `fmt()` here). */
function compositeTabPath(x: number, y: number, textWidth: number, textHeight: number, cornerSize: number): string {
  const x1 = fmt(x + textWidth);
  const y2 = fmt(y + textHeight - cornerSize);
  const x2 = fmt(x + textWidth - cornerSize);
  const y3 = fmt(y + textHeight);
  return `M${x1},${fmt(y)} L${x1},${y2} L${x2},${y3} L${fmt(x)},${y3}`;
}

/**
 * `dimTitle.getWidth()` of the frame title (`USymbolFrame.java:146,150`),
 * shared by the renderer and the compression adapter
 * (`layout/compress/shapes-of-frame.ts`) so both read one width.
 */
export function compositeTitleWidth(theme: Theme, title: string): number {
  return compositeTitleDimension(theme, title).width;
}

/** `dimTitle` whole (`USymbolFrame.java:146`, `USymbolRectangle.java:124`): the
 *  title block's width and height, a sprite's box included. */
export function compositeTitleDimension(
  theme: Theme,
  title: string,
): { readonly width: number; readonly height: number } {
  return frameTitleDimension(title, activityMeasurer(theme), theme);
}

/** The frame's `<symbol>/composite` style colours (`FtileGroup.java:101-102`):
 *  `activityDiagram { composite { LineColor black; BackgroundColor transparent } }`
 *  (`plantuml.skin:364-368`), each overridden by the `Partition*` skinparams
 *  (`FromSkinparamToStyle.java:131-132`). */
interface CompositeStyle {
  readonly backColor: string;
  readonly borderColor: string;
}

function compositeStyle(theme: Theme): CompositeStyle {
  const g = theme.colors.graph;
  return {
    backColor: g.partitionBackground ?? 'none',
    borderColor: g.partitionBorder ?? '#000',
  };
}

/** What selects a frame's signature, and the merged style it resolved to. */
type CompositeSubject = Pick<ActivityNodeGeo, 'kind' | 'usymbol' | 'stereotype' | 'compositeStyle'>;

/**
 * `ColorMapper.DARK_MODE`'s switch (`TitledDiagram.java:294`) for the merged-style reads. No theme field carries
 * `skinparam mode dark` to the renderer, and none is needed here: under `mode dark` every `composite.<symbol>` bucket
 * is written off the dark-scheme builder (`style-element-scope.ts#elementScopeColors`, smc D2), and those tiers answer
 * before this read (pso D2). Rows `activity__frameorder-rectangle-{background-partition-then-own-dark,dark-default}`.
 */
const MERGED_IS_DARK = false;

/** `FtileGroup.java:101-102`: `style.value(name).asColor(...)` of `stylePartition`, the frame's ONE merged style
 *  (`CommandPartition3.java:160-161`); a transparent colour prints `none` (`SvgGraphics.java:517-525`). */
function mergedPaint(node: CompositeSubject, name: 'BackGroundColor' | 'LineColor'): Paint | undefined {
  const style = node.compositeStyle;
  return style === undefined ? undefined : svgBack(paintOf(style, name, MERGED_IS_DARK));
}

/** `FtileGroup.java:99`: `style.getFontConfiguration(...)`'s colour; a transparent one draws no text
 *  (`DriverTextSvg.java:92-93`, {@link fontConfigurationColor}). */
function mergedTitleColor(node: CompositeSubject): string | undefined {
  const style = node.compositeStyle;
  if (style === undefined) return undefined;
  const color = bridgeFontConfiguration(style.getFontConfiguration(HColorSet.instance())).color;
  return color === null ? TRANSPARENT_TITLE : resolveColorToSvgHex(color);
}

/** What {@link fontConfigurationColor} reads as `isTransparent()`. */
const TRANSPARENT_TITLE = 'transparent';

/** `symbol.getSNames()` of `FtileGroup.java:90`: the node's USymbol, or the frame its kind is. */
function compositeSymbolOf(node: CompositeSubject): string {
  return node.usymbol ?? (node.kind === 'group' ? 'group' : 'partition');
}

/** The key T2a resolved this frame's own signature to (D2, {@link compositeBucketOf}). */
function compositeBucket(node: CompositeSubject): string {
  return compositeBucketOf(compositeSymbolOf(node));
}

/** The signature's back: its stereotype (`CommandPartition3.java:160`, `withTOBECHANGED`), else the merged value. */
function compositeBack(node: CompositeSubject, theme: Theme): Paint | undefined {
  return (
    stereotypeBack(theme, compositeSymbolOf(node), node.stereotype) ??
    // `skinparam partition { BackgroundColor<<x>> }` is `composite<<x>>` (`FromSkinparamToStyle.java:132`).
    stereotypeBack(theme, 'composite', node.stereotype) ??
    scopedBack(theme, compositeBucket(node))
  );
}

/** The signature's line: its stereotype (`CommandPartition3.java:160`, `withTOBECHANGED`), else the merged value. */
function compositeLine(node: CompositeSubject, theme: Theme): Paint | undefined {
  return stereotypeLine(theme, compositeSymbolOf(node), node.stereotype) ?? scopedLine(theme, compositeBucket(node));
}

/**
 * The title's colour, `style.getFontConfiguration` of `FtileGroup.java:99`: the stereotype's and bucket values (dss D2),
 * then the frame's merged style (pso D2), where `addConFont("Partition", SName.composite)` (`FromSkinparamToStyle.java:133`)
 * and the symbol's own `addMagic` font (`:278`, `:129,212,223`) meet and the later declaration wins
 * (`DarkString.java:54-57`). A hand-built theme with no `compositeStyleOf` keeps the flat tiers, then the root
 * `FontColor black` (`plantuml.skin:9`).
 */
function compositeTitleColor(node: CompositeSubject, theme: Theme): string {
  return (
    stereotypeFont(theme, compositeSymbolOf(node), node.stereotype) ??
    resolveSolidBucketColor(theme.colors.elements?.[compositeBucket(node)]?.font) ??
    mergedTitleColor(node) ??
    flatTitleColor(node, theme) ??
    COMPOSITE_TITLE_FONT_COLOR
  );
}

function flatTitleColor(node: CompositeSubject, theme: Theme): string | undefined {
  const partition = theme.colors.graph.partitionFontColor;
  if (partition !== undefined) return resolveColorToSvgHex(partition);
  return node.usymbol === undefined ? undefined : resolveSolidBucketColor(theme.colors.elements?.[node.usymbol]?.font);
}

/** The per-symbol ink fields a `skinparam` can set, before the cascade. */
interface SymbolInk {
  readonly fill?: Paint;
  readonly stroke?: Paint;
  readonly strokeWidth?: number;
  readonly roundCorner?: number;
}

/**
 * What `FtileGroup.getStyleSignature(symbol)`'s signature
 * (`FtileGroup.java:89-92`: `of(root, element, activityDiagram,
 * symbol.getSNames(), composite)`) lets a `skinparam` reach, by keyword:
 * `card`/`rectangle` -> their own `addMagic` block
 * (`FromSkinparamToStyle.java:212,223`: colours, thickness, corner);
 * `package` -> `addMagic(SName.package_)` (`:129`) via the `packageBackground`/
 * `packageBorder`/`packageBorderThickness` theme fields; `group` ->
 * `packageBackgroundColor`/`packageBorderColor` only, which upstream also
 * converts onto `SName.group` (`:127-128`) -- no thickness or corner;
 * `partition` -> none (its `Partition*` skinparams sit on `composite` itself,
 * `:131-132`, and are read by {@link compositeInk} for every keyword).
 */
/** `style.value(PName.RoundCorner)` of the frame's style re-signed with its stereotype (`FtileGroup.java:89-92,103`):
 *  the stereotype tier first, else the symbol's own block. */
function roundCornerSpread(node: ActivityNodeGeo, theme: Theme, own: number | undefined): { roundCorner?: number } {
  const labels = node.stereotype === undefined ? [] : [node.stereotype];
  const value = stereotypeRoundCorner(theme, node.usymbol ?? 'rectangle', labels) ?? own;
  return value === undefined ? {} : { roundCorner: value };
}

function symbolInk(node: ActivityNodeGeo, theme: Theme): SymbolInk {
  const g = theme.colors.graph;
  if (node.usymbol === 'card' || node.usymbol === 'rectangle') {
    const b = theme.colors.elements?.[node.usymbol];
    const strokeWidth = b?.lineThickness;
    const border = theme.colors.elements?.[compositeBucket(node)]?.border ?? b?.border;
    return {
      ...(b?.background !== undefined ? { fill: b.background } : {}),
      ...(border !== undefined ? { stroke: border } : {}),
      ...(strokeWidth !== undefined ? { strokeWidth } : {}),
      ...roundCornerSpread(node, theme, b?.roundCorner),
    };
  }
  if (node.usymbol !== 'package' && node.kind !== 'group') return {};
  return {
    ...(g.packageBackground !== undefined ? { fill: g.packageBackground } : {}),
    ...(g.packageBorder !== undefined ? { stroke: g.packageBorder } : {}),
    ...(node.usymbol === 'package' && g.packageBorderThickness !== undefined
      ? { strokeWidth: g.packageBorderThickness }
      : {}),
  };
}

/** `FtileGroup.java:101`: the command's `#color`, else the style's `BackGroundColor`. */
function compositeFill(node: ActivityNodeGeo, theme: Theme, flatFill: Paint): Paint {
  return (
    inlineBack(node) ??
    compositeBack(node, theme) ??
    mergedPaint(node, 'BackGroundColor') ??
    theme.colors.graph.partitionBackground ??
    flatFill
  );
}

/** The resolved ink of one group frame (`FtileGroup.java:101-102`): the gated
 *  tiers, then the frame's merged style, where the `Partition*` skinparams (on
 *  `composite`) and the symbol's own block meet and the later declaration wins
 *  (a value's priority, `DarkString.java:54-57`; pso D2). The flat tiers below
 *  it (`Partition*` first, then the symbol's block, then the `plantuml.skin`
 *  composite default) answer only for a hand-built theme with no
 *  `compositeStyleOf`, where the order is lost (`.agent-notes/dss-T3d.md`). */
function compositeInk(node: ActivityNodeGeo, theme: Theme): CompositeInk {
  const base = compositeStyle(theme);
  const g = theme.colors.graph;
  const sym = symbolInk(node, theme);
  return {
    fill: compositeFill(node, theme, sym.fill ?? base.backColor),
    // `FtileGroup.java:102`: the merged `LineColor`, T2a's bucket (D2), over the flat tiers.
    stroke:
      compositeLine(node, theme) ??
      mergedPaint(node, 'LineColor') ??
      g.partitionBorder ??
      sym.stroke ??
      base.borderColor,
    strokeWidth: sym.strokeWidth ?? activityLineThickness(theme, 'composite'),
    // `FtileGroup.java:103`: `style.value(PName.RoundCorner).asDouble()`.
    roundCorner: sym.roundCorner ?? 0,
  };
}

/**
 * `FtileGroup#drawU` (`:209-227`) + `USymbolFrame#asBig`'s `drawU`
 * (`:142-162`): the plain frame `rect` (unchanged from before this
 * mission), the title-tab underline `path`, and the title `text` at a
 * fixed `(3, 1)` inset. `node.label` carries the title verbatim
 * (`tile-coordinates.ts#walkTileGroup`).
 * `USymbolFrame#getWTitle`/`getYpos` (`:76-104`)'s `dimTitle.getWidth() ==
 * 0` branch (an untitled frame) is ported. `asBig`'s `widthFull -
 * widthTitle < 25` branch (`:152-156`) draws the SAME text either way
 * (`AbstractUGraphic.java:121-122` draws a `SpecialText` as its title); the
 * branch only changes the compression footprint, which
 * `layout/compress/shapes-of-frame.ts#frameTitleShapes` ports.
 */
export function renderComposite(node: ActivityNodeGeo, flatTheme: Theme): string {
  const theme = withCompositeStyle(flatTheme, node.compositeStyle);
  const ink = compositeInk(node, theme);
  const { fill, strokeWidth } = ink;
  const style = { borderColor: ink.stroke };
  if (node.usymbol !== undefined) return renderSymbolComposite(node, node.usymbol, theme, ink);
  const body = rect(node.x, node.y, node.width, node.height, { fill, stroke: style.borderColor, strokeWidth });

  const title = node.label ?? '';
  const titleDim = compositeTitleDimension(theme, title);
  const titleWidth = titleDim.width;
  // `getWTitle`/`getYpos`/`drawFrame`'s own `cornersize` local (`:76-
  // 84,99-104`): an EMPTY title falls back to a width/height-derived tab.
  // ubt-T2a: `dimTitle.getHeight()` is the title block's own height, a
  // sprite's box for `<$sprite>`.
  const textWidth = titleWidth === 0 ? node.width / 3 : titleWidth + 10;
  const cornerSize = titleWidth === 0 ? 7 : 10;
  const textHeight = titleWidth === 0 ? 12 : titleDim.height + 3;
  const tab = path(compositeTabPath(node.x, node.y, textWidth, textHeight, cornerSize), {
    fill: 'none',
    stroke: style.borderColor,
    strokeWidth,
  });

  if (title === '') return body + tab;
  // `USymbolFrame.java:154`: `title.drawU(ug.apply(new UTranslate(3, 1)))`.
  const paint = { color: compositeTitleColor(node, theme), strokeWidth, fore: ink.stroke, back: fill };
  const titleEl = drawCompositeTitle(
    title,
    { x: node.x + 3, y: node.y + 1 },
    { ...paint, deltas: node.titleShapeDeltas },
    theme,
  );
  return body + tab + titleEl;
}

/**
 * `package`/`card`/`rectangle` (`activity-renderer-composite-symbols.ts`):
 * the symbol's own frame, then its title as a plain text block at the
 * symbol's own origin (`USymbolFolder.java:228`, `USymbolCard.java:133-134`,
 * `USymbolRectangle.java:125-133`).
 */
function renderSymbolComposite(
  node: ActivityNodeGeo,
  usymbol: CompositeUSymbol,
  theme: Theme,
  ink: CompositeInk,
): string {
  const title = node.label ?? '';
  const dim = compositeTitleDimension(theme, title);
  const frame = drawCompositeSymbol(node, usymbol, dim, ink);
  if (title === '') return frame;
  const origin = compositeSymbolTitleOrigin(node, usymbol, dim.width);
  const paint = {
    color: compositeTitleColor(node, theme),
    strokeWidth: ink.strokeWidth,
    fore: ink.stroke,
    back: ink.fill,
  };
  return frame + drawCompositeTitle(title, origin, paint, theme);
}

/**
 * `FtileGroup`'s `name` (`FtileGroup.java:104-108`): `title.create(fc,
 * HorizontalAlignment.LEFT, skinParam)` -- a FULL creole Sheet at the
 * composite style's `getFontConfiguration` (`Style.java:259-268`, incl.
 * `HyperLinkColor`), drawn with its top-left at `at`. Every `asBig` draws
 * it on the `ug` `Fashion#apply` gave the frame (`USymbolRectangle.java:
 * 110,133`; `Fashion.java:67-71,86-88`), so the frame's stroke reaches a
 * sprite shape that sets no `stroke-width` (`SvgNanoParser.java:187-195`).
 */
function drawCompositeTitle(
  title: string,
  at: { readonly x: number; readonly y: number },
  paint: {
    readonly color: string;
    readonly strokeWidth: number;
    readonly fore: Paint;
    readonly back: Paint;
    readonly deltas?: ActivityNodeGeo['titleShapeDeltas'];
  },
  theme: Theme,
): string {
  const color = paint.color;
  const fc = {
    ...activityTextFontConfiguration(theme, activityFontSize(theme, 'composite'), 'composite'),
    color: fontConfigurationColor(color),
  };
  const stroke = UStroke.withThickness(paint.strokeWidth);
  const tb = activityDisplayBlock(title, theme, {
    fontConfiguration: fc,
    horizontalAlignment: HorizontalAlignment.LEFT,
    creoleMode: CreoleMode.FULL,
    ambientStroke: stroke,
  });
  // aar-T6a: `Fashion#apply` (`Fashion.java:67-83`) colours the ug too: a creole `----` rule in the title, which
  // sets no colour (`CreoleHorizontalLine.java:92-97`), strokes the frame's fore colour.
  return drawActivityTextBlock(withTitleShapeDeltas(tb, paint.deltas), at, theme, fc, [
    new Fore(paint.fore),
    new Back(paint.back),
    stroke,
  ]);
}
