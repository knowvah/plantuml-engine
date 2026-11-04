/**
 * Composite-state (`children.length > 0`) box renderer — mission G4 S3,
 * mechanism 6. Split out of renderer.ts to keep that file under the
 * project's 500-line cap, mirroring renderer-box.ts's own precedent for the
 * leaf-box shape (mission G4 S2).
 *
 * Jar-verified byte-for-byte against `bajelo-54-dixe684`'s `Track_FSM`
 * (autonom, `class="entity"`, NO body/action lines — a single header
 * divider only) and `Track_FSM.Run.Do_Sector` (autonom, WITH 2 entry/exit
 * action lines — a SECOND divider + a dedicated action-zone background
 * rect). Both are `EntityImagePseudoState`/`EntityImageState`-adjacent but
 * a DISTINCT upstream shape, `InnerStateAutonom.drawU` — NOT the same
 * anatomy `renderer-box.ts#renderNormal` draws for a leaf box (see the
 * per-layer breakdown below).
 *
 * Box anatomy (`InnerStateAutonom.java`, MARGIN=MARGIN_LINE=5 — SAME
 * constants `state-composite-sizing.ts#measureAutonomWrapper` already
 * dimensions the wrapper with). DRAW ORDER (jar-verified, `Do_Sector`):
 * header path, action-zone bg (if any), outline, divider 1, divider 2 (if
 * any), title text, action text (if any):
 *   1. HEADER background — a half-rounded-top `<path>` (`URectangle
 *      .halfRounded(25)`'s own arc+line sequence, r=12.5 — the SAME math
 *      class's own `renderer-classifier-box.ts#headerBackgroundPath`
 *      already ports, reproduced locally here per this codebase's
 *      established klimt-free-module convention, `layout-ink-extent.ts`'s
 *      own doc comment), spanning the box's own top edge down to
 *      `headerHeight` (= `MARGIN + headerLines.length*fontSize +
 *      MARGIN_LINE`, the SAME divider-offset formula `renderer-box.ts`
 *      uses for a leaf box's OWN header/body divider) — filled via
 *      `resolveStateFill`, NO stroke attribute at all (jar-verified: the
 *      header `<path>` carries only `fill`, unlike class's own
 *      `headerBackgroundPath`, which also strokes it).
 *   2. ACTION-ZONE background — ONLY drawn when `bodyLines.length > 0`
 *      (jar's entry/exit action text): a plain, UNROUNDED `<rect
 *      fill="..." stroke="..." stroke-width="1">` (fill AND stroke are the
 *      SAME resolved color, unlike every other box's border) spanning the
 *      box's full width, from `headerBottom` to `headerBottom +
 *      bodyLines.length*fontSize + MARGIN` — this is what visually reads
 *      as "the action text sits on a continuation of the header's own
 *      background", while the (unfilled) area further down where CHILDREN
 *      are drawn stays transparent so nested boxes show through against the
 *      white canvas.
 *   3. OUTLINE — a full, SOLID (never dashed) `<rect fill="none" stroke=
 *      "#181818" stroke-width="0.5" rx="12.5" ry="12.5">` spanning the
 *      composite's whole bounding box — replaces the pre-mechanism-6
 *      `stroke-dasharray` single-rect approximation entirely.
 *   4. DIVIDER(S) — a full-width `<line>` at `headerBottom` (ALWAYS drawn,
 *      matching the leaf box's own unconditional-divider convention, mission
 *      G4 S2), plus a SECOND `<line>` at the action zone's own bottom edge
 *      (ONLY when `bodyLines.length > 0`).
 *   5. TITLE text — the composite's own display name, CENTERED via
 *      `textLength` (SAME convention as the leaf box's own header text,
 *      `renderer-box.ts`), first baseline at `y0 + MARGIN + ascent`.
 *   6. ACTION text — LEFT-aligned at `x0 + MARGIN`, first baseline at
 *      `headerBottom + ascent` — jar-verified to differ from the leaf box's
 *      OWN body-text offset (`renderer-box.ts`'s `dividerY + MARGIN_LINE +
 *      ascent`) by exactly `MARGIN_LINE`: `InnerStateAutonom`'s own
 *      description-block layout has no equivalent leading gap (algebraically
 *      confirmed against `Do_Sector`: divider at y=339, first action-text
 *      baseline at y=349.8889 = 339 + textAscent(14) exactly, NOT
 *      339 + MARGIN_LINE + textAscent(14)).
 *
 * `node.headerLines === undefined` (a hand-built test geometry; a
 * concurrent-region LEAF never reaches this module since stdd T6a --
 * `renderer.ts#renderNodeWrapped` draws its content alone, `SvekResult.java:69-95`)
 * falls back to the PRE-mechanism-6 shape
 * (dashed outer rect + a single centered, unmeasured label) verbatim —
 * mirrors `renderer-box.ts#renderUnmeasuredFallback`'s identical precedent
 * for the leaf box. A non-autonom `cluster` composite (DOT-native cluster
 * label sizing, a genuinely different upstream code path — `bajelo-54-
 * dixe684`'s own `Track_FSM.Run`, header height 19 vs this shape's own
 * MARGIN-formula 24) was NOT threaded with `headerLines` through mission G4
 * — G5 C3 closed that gap (mechanism 16's shape half, `renderClusterMeasured`
 * below) for the eligibility-gated majority case (`state-composite-
 * cluster.ts#resolveClusterComposite`'s own doc comment); a 'cluster'
 * composite this iteration's gate excluded (multi-line title, non-default
 * font-size, or a border-point `portRanksLabelOnEe` composite) still takes
 * this SAME dashed-rect fallback — a deliberate, named, non-regressing
 * deferral, not a silent gap (`plans/g5-measurer-calibration/ledger.md` §C3).
 *
 * @see ~/git/plantuml/.../svek/InnerStateAutonom.java
 */
import { roundedBottomRectD, roundedTopRectD } from '../../core/svg-path-builder.js';
import type { StateNodeGeo, StateTextLine } from './state-geo-types.js';
import { isTransparentColor, type Paint } from '../../core/paint.js';
import type { Theme } from '../../core/theme.js';
import type { StringMeasurer } from '../../core/measurer.js';
import { renderFrameCluster } from './renderer-frame-cluster.js';
import { rect, line, text } from '../../core/svg.js';
// G1/G8/G23: one engine, one text/table/symbol emitter -- see
// `renderer-box.ts`'s own doc comments for each.
import { renderStateTextLines, renderOOSymbol, isOOSymbolStereotype } from './renderer-box.js';
import { styledLines } from './state-sizing-creole.js';
import {
  STATE_DEFAULT_BACKGROUND,
  resolveStateFillBucketed,
  resolveStateBodyFill,
  resolveStateBorder,
  resolveStateFontColor,
  resolveStateBoxRadius,
  textAscent,
  stateBorderStrokeAttrs,
} from './state-render-colors.js';
import { roundedZone } from './renderer-box-zones.js';
import { clusterTitleBlockX, stateNameAlignment, textBlockWidth, titleLineX } from './renderer-composite-title.js';
import { stateShadowFilterUrl } from './state-shadow.js';

/** `UStroke.simple()` (`UStroke.java:75-77`), the thickness of a `ug` no style stroke was applied to: `Cluster#drawUState`
 *  draws the symbol on the raw `ug` (`Cluster.java:505-507`), unlike the leaf (`EntityImageState.java:129-133`). */
const DEFAULT_STROKE_WIDTH = 1;
import { STATE_DESCRIPTION_BUCKET, STATE_NAME_BUCKET } from './state-bucket-colors.js';

/** `URectangle.halfRounded`'s own `roundCorner/2` — SAME `rx`/`ry` value as
 *  a leaf box's own outline (`renderer-box.ts#STATE_BOX_RX`), duplicated
 *  per this codebase's established per-module constant convention
 *  (`state-sizing.ts`'s own "D1, duplicate consciously" doc comment). Passed
 *  as EVERY call site's own `fallback` to `resolveStateBoxRadius` (mission
 *  G6 T4) -- overridden per-diagram by a `<style> stateDiagram { RoundCorner
 *  N } }` cascade, unchanged otherwise. */
const STATE_BOX_RX = 12.5;
import {
  ENTITY_IMAGE_MARGIN as MARGIN,
  ENTITY_IMAGE_MARGIN_LINE as MARGIN_LINE,
} from '../../core/svek/IEntityImage.js';

/** `URectangle.halfRounded(roundCorner=25)`'s own arc+line sequence
 *  (r=`STATE_BOX_RX`), reproduced as a local string-builder — the SAME math
 *  `renderer-classifier-box.ts#headerBackgroundPath` already ports for
 *  class, but WITHOUT a stroke attribute (jar-verified: the composite
 *  header `<path>` carries only `fill`, never `stroke`/`stroke-width`). */
function compositeHeaderPath(
  x0: number,
  y0: number,
  width: number,
  headerHeight: number,
  fill: Paint,
  r: number,
): string {
  const x1 = x0 + width;
  const y1 = y0 + headerHeight;
  return roundedZone(roundedTopRectD(x0, y0, x1, y1, r), fill);
}

/** G5 C3, mechanism 16 shape half: the BOTTOM-half mirror of
 *  `compositeHeaderPath` above -- jar's real `'cluster'`-classified
 *  composite fills its ENTIRE body (not just the header, unlike the
 *  autonom shape below), a SEPARATE filled `<path>` from `headerBottom` to
 *  the box's own bottom edge, rounded at the BOTTOM two corners only.
 *  jar-verified byte-exact against `decede-10-buvu414`'s cluster `E`:
 *  `M223.82,42.5 L305.82,42.5 L305.82,121.5 A1,1 0 0 1 304.82,122.5
 *  L224.82,122.5 A1,1 0 0 1 223.82,121.5 L223.82,42.5` (x0=223.82,
 *  y0=23.5, width=82, height=99, headerHeight=19, r=1 -- this fixture's own
 *  `<style> stateDiagram { RoundCorner 2 } }` cascade, RESOLVED (mission G6
 *  T4) via the `r` parameter's own `resolveStateBoxRadius(theme,
 *  STATE_BOX_RX)` call at each of this function's two call sites, no longer
 *  a gap). */
function compositeBodyPath(
  x0: number,
  y0: number,
  width: number,
  height: number,
  headerHeight: number,
  fill: Paint,
  r: number,
): string {
  const x1 = x0 + width;
  const yTop = y0 + headerHeight;
  const y1 = y0 + height;
  return roundedZone(roundedBottomRectD(x0, yTop, x1, y1, r), fill);
}

/** G1/G23: the composite box draws the SAME styled runs / creole table the
 *  sizer measured, through `renderer-box.ts`'s shared emitter (one engine,
 *  one helper -- no duplication across the two state box shapes). */
function renderCompositeTextLines(
  lines: readonly StateTextLine[],
  xForLine: (ln: StateTextLine) => number,
  startY: number,
  theme: Theme,
  // mission G6 T4: `StateFontColor<<X>>`/`<style> state { FontColor } }`/
  // the `stateDiagram { FontColor } }` cascade alias -- see
  // `state-render-colors.ts#resolveStateFontColor`'s own doc comment.
  // Defaults to jar's own hardcoded `#000000` title-text default (every
  // pre-T4 call site's unchanged behavior).
  style: { readonly fill?: string; readonly fontWeight?: '700' } = {},
): string {
  return renderStateTextLines(lines, xForLine, startY, theme, { fill: style.fill ?? '#000000', ...style });
}

/** `InnerStateAutonom.drawU`'s own attribute-zone height -- the summed
 *  measured line heights, not `count * fontSize`: a creole TABLE stripe is
 *  one line whose height is the whole grid box (`state-sizing-creole.ts
 *  #tableLine`). Identical to `count * fontSize` for every ordinary line. */
function textBlockHeight(lines: readonly StateTextLine[], theme: Theme): number {
  let out = 0;
  for (const ln of styledLines(lines)) out += ln.height === 0 ? theme.fontSize : ln.height;
  return out;
}

/** Pre-mechanism-6 shape — dashed outer rect + a single centered,
 *  unmeasured label. See this module's own top doc comment for when this
 *  fires (`node.headerLines === undefined`). */
function renderCompositeFallback(node: StateNodeGeo, theme: Theme): string {
  const outerBox = rect(node.x, node.y, node.width, node.height, {
    fill: theme.colors.background,
    stroke: theme.colors.border,
    strokeWidth: 1,
    strokeDasharray: '6,3',
    rx: 8,
  });
  const label = text(node.x + node.width / 2, node.y + theme.fontSize + 4, node.display, {
    textAnchor: 'middle',
    fill: theme.colors.text,
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSize,
  });
  return outerBox + label;
}

/** Layers 1/3/4a/5 (header path, outline, header/body divider, title) —
 *  ALWAYS drawn regardless of whether an action zone is present. Split out
 *  of {@link renderCompositeMeasured} to stay under this project's
 *  per-function token-length cap. Returns the four markup strings plus the
 *  shared values {@link buildActionZone} needs (`dividerY1`/`ascent`/`fill`)
 *  so the two halves never independently re-derive the same numbers. */
function buildCoreLayers(
  node: StateNodeGeo,
  theme: Theme,
): {
  header: string;
  outline: string;
  shadowRect: string;
  divider1: string;
  title: string;
  dividerY1: number;
  ascent: number;
  fill: Paint;
  fontColor: string;
} {
  const headerLines = node.headerLines!;
  // mission G4 S10: `state`-element bucket tier -- see `resolveStateFillBucketed`'s own doc comment.
  // dss T3c: the header is the `name` zone (`InnerStateAutonom.java:107-109`).
  const fill = resolveStateFillBucketed(node, theme, STATE_DEFAULT_BACKGROUND, STATE_NAME_BUCKET);
  // G4 S9: `StateBorderColor<<X>>` cascade -- see `resolveStateBorder`'s own
  // doc comment. Jar-verified `semala-31-joji042`'s own composite `a`.
  const border = resolveStateBorder(node, theme);
  // mission G6 T4: `<style> stateDiagram { RoundCorner N } }` cascade --
  // see `resolveStateBoxRadius`'s own doc comment.
  const radius = resolveStateBoxRadius(theme, STATE_BOX_RX);
  // mission G6 T4: `StateFontColor<<X>>`/the `stateDiagram { FontColor } }`
  // cascade -- see `resolveStateFontColor`'s own doc comment.
  // dss T3c: the title is the `name` zone (`InnerStateAutonom.java:102`, `ClusterHeader.java:156-157`).
  const fontColor = resolveStateFontColor(node, theme, '#000000', STATE_NAME_BUCKET);
  const ascent = textAscent(theme.fontSize);
  const headerHeight = MARGIN + headerLines.length * theme.fontSize + MARGIN_LINE;
  const dividerY1 = node.y + headerHeight;

  const header = compositeHeaderPath(node.x, node.y, node.width, headerHeight, fill, radius);
  const outline = rect(node.x, node.y, node.width, node.height, {
    fill: 'none',
    stroke: border,
    ...stateBorderStrokeAttrs(node, theme),
    rx: radius,
    ry: radius,
  });
  // mission skin-file-loading Batch 2: `RoundedContainer.drawU`
  // (`~/git/plantuml/.../svek/RoundedContainer.java:78-92`) draws a SECOND,
  // shadow-only rect at the SAME geometry/border/radius as `outline` above
  // (`fill=none`/transparent bg, `filter="url(#...)"`) FIRST -- before the
  // header/action-zone panels -- whenever `shadowing > 0`; `outline` itself
  // (drawn AFTER the panels, so the border shows on top of the fills) never
  // carries the filter attr. jar-verified byte-shape against nimana-36-
  // veco708's own "yes" composite: TWO identical `<rect x=7 y=144 .../>`
  // entries, the FIRST (pre-fills) carrying `filter="url(#...)"`, the SECOND
  // (post-fills, this function's own `outline`) not.
  const shadowRect =
    node.shadowing !== undefined && node.shadowing > 0
      ? rect(node.x, node.y, node.width, node.height, {
          fill: 'none',
          stroke: border,
          ...stateBorderStrokeAttrs(node, theme),
          rx: radius,
          ry: radius,
          filter: stateShadowFilterUrl(),
        })
      : '';
  const divider1 = line(node.x, dividerY1, node.x + node.width, dividerY1, {
    stroke: border,
    ...stateBorderStrokeAttrs(node, theme),
  });
  // `name.drawU(translate((total.width - text.width) / 2, MARGIN))` (`InnerStateAutonom.java:150`): the block is
  // centred; its lines follow the `name` style's alignment (`:91`, stdd T5a).
  const title = renderCompositeTextLines(
    headerLines,
    titleLineX(node, headerLines, (node.width - textBlockWidth(headerLines)) / 2, theme),
    node.y + MARGIN + ascent,
    theme,
    { fill: fontColor },
  );

  return { header, outline, shadowRect, divider1, title, dividerY1, ascent, fill, fontColor };
}

interface ActionZone {
  /** The y below the description zone: where the `body` zone starts (`InnerStateAutonom.java`'s `RoundedContainer`, `RoundedContainer.java:84-85`). */
  bottomY: number;
  bg: string;
  divider2: string;
  text: string;
}

const EMPTY_ACTION_ZONE: ActionZone = { bottomY: 0, bg: '', divider2: '', text: '' };

/** Layers 2/4b/6 (action-zone background, second divider, action text) —
 *  ONLY drawn when `bodyLines.length > 0`. Returned as three SEPARATE
 *  strings (not one concatenated blob) because layers 2/4b/6 interleave
 *  with the core layers' own 3/4a/5 in the jar's real draw order — see this
 *  module's top doc comment (layer 6 for the jar-verified `dividerY1 +
 *  ascent` offset). */
function buildActionZone(node: StateNodeGeo, theme: Theme, dividerY1: number, ascent: number): ActionZone {
  const bodyLines = node.bodyLines ?? [];
  if (bodyLines.length === 0) return { ...EMPTY_ACTION_ZONE, bottomY: dividerY1 };
  const border = resolveStateBorder(node, theme);
  const actionZoneHeight = textBlockHeight(bodyLines, theme) + MARGIN;
  const dividerY2 = dividerY1 + actionZoneHeight;
  // dss T3c: the action zone is the `description` zone (`InnerStateAutonom.java:110-112`).
  const zoneFill = resolveStateFillBucketed(node, theme, STATE_DEFAULT_BACKGROUND, STATE_DESCRIPTION_BUCKET);
  const bg = rect(node.x, dividerY1, node.width, actionZoneHeight, {
    fill: zoneFill,
    stroke: zoneFill,
    strokeWidth: 1,
  });
  const divider2 = line(node.x, dividerY2, node.x + node.width, dividerY2, {
    stroke: border,
    ...stateBorderStrokeAttrs(node, theme),
  });
  const text_ = renderCompositeTextLines(bodyLines, () => node.x + MARGIN, dividerY1 + ascent, theme, {
    fill: resolveStateFontColor(node, theme, '#000000', STATE_DESCRIPTION_BUCKET),
  });
  return { bottomY: dividerY2, bg, divider2, text: text_ };
}

function renderCompositeMeasured(node: StateNodeGeo, theme: Theme): string {
  const core = buildCoreLayers(node, theme);
  const action = buildActionZone(node, theme, core.dividerY1, core.ascent);
  // mission skin-file-loading Batch 2: `core.shadowRect` (empty string when
  // `node.shadowing` is unset/0 -- byte-identical to the pre-Batch-2 return
  // for every shadow-off fixture) is drawn FIRST, matching jar's own
  // `RoundedContainer.drawU` order (shadow rect, then header/action-zone
  // panels, then the border-only `outline` on top) -- see
  // `buildCoreLayers`'s own doc comment.
  // G8: `InnerStateAutonom.drawU:162-163` calls the SAME
  // `EntityImageState.drawSymbol` at the wrapper's own bottom-right corner
  // (draw-only -- `calculateDimensionSlow:186-197` has no `heightSymbol`
  // term, unlike the leaf `EntityImageState`).
  const symbol = isOOSymbolStereotype(node.stereotype)
    ? renderOOSymbol(node.x + node.width, node.y + node.height, core.fill, resolveStateBorder(node, theme))
    : '';
  // dss T3c site 6: `RoundedContainer.drawU` (`RoundedContainer.java:84-85`) draws the
  // south zone after the centre one; `RoundedSouth` skips a transparent colour.
  const bodyFill = resolveStateBodyFill(node, theme);
  const body =
    bodyFill === undefined
      ? ''
      : compositeBodyPath(
          node.x,
          node.y,
          node.width,
          node.height,
          action.bottomY - node.y,
          bodyFill,
          resolveStateBoxRadius(theme, STATE_BOX_RX),
        );
  return (
    core.shadowRect +
    core.header +
    action.bg +
    body +
    core.outline +
    core.divider1 +
    action.divider2 +
    core.title +
    action.text +
    symbol
  );
}

/**
 * stdd T3c: the non-autonom composite, `Cluster#drawUState` (`Cluster.java:450-510`) over a
 * `RoundedContainer` (`RoundedContainer.java:78-100`), in its draw order: the shadow rect
 * (`:81-84`), north (`:86`), centre (`drawCenter`, `:95-100`: a rect stroked `UStroke.simple()`
 * in its own colour), south (`:88-89`, `RoundedSouth` skips a transparent colour), the outline
 * (`:91`), the hline under the name (`:93`), the hline under the description (`:95-96`); then the
 * title (`Cluster.java:495-497`, `state.name { HorizontalAlignment center }` per line and for the
 * block) at graphviz's title-table top (`clusterTitleBaselineMargin`), the description at
 * `(minX + MARGIN, minY + nameHeight + MARGIN/2)` (`:499-501`) and the `<<O-O>>` symbol on the
 * default stroke (`:503-507`). `nameHeight` is `node.clusterHeaderHeight` (`:489-490`);
 * `descriptionHeight` is the block's height + `MARGIN` when there is one (`:487`).
 */
function renderClusterMeasured(node: StateNodeGeo, theme: Theme): string {
  const headerLines = node.headerLines!;
  const bodyLines = node.bodyLines ?? [];
  const nameHeight = node.clusterHeaderHeight!;
  const descriptionHeight = bodyLines.length === 0 ? 0 : textBlockHeight(bodyLines, theme) + MARGIN;
  const titleMargin = node.clusterTitleBaselineMargin ?? MARGIN;
  // `Cluster.java:459-470`: the group's BACK colour for every zone, else `name`/`description`/`body`.
  const fill = resolveStateFillBucketed(node, theme, STATE_DEFAULT_BACKGROUND, STATE_NAME_BUCKET);
  const centerFill = resolveStateFillBucketed(node, theme, STATE_DEFAULT_BACKGROUND, STATE_DESCRIPTION_BUCKET);
  const bodyFill = resolveStateBodyFill(node, theme);
  const border = resolveStateBorder(node, theme);
  const radius = resolveStateBoxRadius(theme, STATE_BOX_RX);
  const fontColor = resolveStateFontColor(node, theme, '#000000', STATE_NAME_BUCKET);
  const ascent = textAscent(theme.fontSize);
  const outlineAttrs = { fill: 'none', stroke: border, ...stateBorderStrokeAttrs(node, theme), rx: radius, ry: radius };
  const strokeAttrs = { stroke: border, ...stateBorderStrokeAttrs(node, theme) };
  const hline = (dy: number): string => line(node.x, node.y + dy, node.x + node.width, node.y + dy, strokeAttrs);

  const shadowRect =
    node.shadowing !== undefined && node.shadowing > 0
      ? rect(node.x, node.y, node.width, node.height, { ...outlineAttrs, filter: stateShadowFilterUrl() })
      : '';
  // `RoundedNorth.java:65-66`: nothing for a transparent colour (xipela-98: `StateBackgroundColor transparent`).
  const north = isTransparentColor(fill)
    ? ''
    : compositeHeaderPath(node.x, node.y, node.width, nameHeight, fill, radius);
  const center =
    descriptionHeight === 0
      ? ''
      : rect(node.x, node.y + nameHeight, node.width, descriptionHeight, {
          fill: centerFill,
          stroke: centerFill,
          strokeWidth: 1,
        });
  const south =
    bodyFill === undefined
      ? ''
      : compositeBodyPath(node.x, node.y, node.width, node.height, nameHeight + descriptionHeight, bodyFill, radius);
  const outline = rect(node.x, node.y, node.width, node.height, outlineAttrs);
  const dividers = hline(nameHeight) + (descriptionHeight > 0 ? hline(nameHeight + descriptionHeight) : '');
  // stdd T1d: `ClusterHeader.java:161-162` -- a `GroupType.PACKAGE` group's title
  // is `package { title { FontStyle bold } }` (`plantuml.skin:72-76`).
  // `getTitleHorizontalAlignment().draw(ug, title, MARGIN, 0, width)` (`Cluster.java:495-497`,
  // `HorizontalAlignment.java:79-90`): LEFT at `MARGIN`, RIGHT at `width - block - MARGIN`, CENTER in the
  // middle; the lines inside follow the same `name` style (stdd T5a, niveno-60).
  const blockX = clusterTitleBlockX(node, textBlockWidth(headerLines), stateNameAlignment(theme));
  const title = renderCompositeTextLines(
    headerLines,
    titleLineX(node, headerLines, blockX, theme),
    node.y + titleMargin + ascent,
    theme,
    { fill: fontColor, ...(node.packageTitle === true ? { fontWeight: '700' as const } : {}) },
  );
  const description = renderCompositeTextLines(
    bodyLines,
    () => node.x + MARGIN,
    node.y + nameHeight + MARGIN / 2 + ascent,
    theme,
    { fill: resolveStateFontColor(node, theme, '#000000', STATE_DESCRIPTION_BUCKET) },
  );
  const symbol = isOOSymbolStereotype(node.stereotype)
    ? renderOOSymbol(node.x + node.width, node.y + node.height, 'none', border, DEFAULT_STROKE_WIDTH)
    : '';
  return shadowRect + north + center + south + outline + dividers + title + description + symbol;
  // #lizard forgives -- `RoundedContainer#drawU` + `Cluster#drawUState`, one layer per statement.
}

export function renderComposite(node: StateNodeGeo, theme: Theme, measurer?: StringMeasurer): string {
  // stdd T6c: `Cluster.java:353-354` draws a group with a `USymbol` through `ClusterDecoration`, not `drawUState`.
  if (node.usymbol === 'frame' && measurer !== undefined) return renderFrameCluster(node, theme, measurer);
  if (node.clusterHeaderHeight !== undefined) return renderClusterMeasured(node, theme);
  if (node.headerLines === undefined) return renderCompositeFallback(node, theme);
  return renderCompositeMeasured(node, theme);
}
