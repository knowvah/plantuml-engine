/**
 * Simple-state (`kind:'normal'`) leaf box renderer — mission G4 S2,
 * mechanism 5. Split out of renderer.ts to keep that file under the
 * project's 500-line cap. Jar-verified byte-for-byte against 3 fixtures:
 * jocela-05-niba392 (title-only, `#red` inline override, no body lines —
 * the divider STILL draws, see below), votoki-67-gufa610 (2-line body,
 * name CENTERED against a body-dominated wider box), gefefe-91-xoge233
 * (1-line body, a single literal space " " — `IDLE :` with no real text).
 *
 * Box anatomy (`EntityImageState.java`, MARGIN=MARGIN_LINE=5 —
 * `state-sizing.ts`'s `STATE_MARGIN_DELTA` doc comment):
 *   - rounded rect, rx=ry=12.5, fill/border via `resolveStateFill`/
 *     `theme.colors.border`, stroke-width 0.5
 *   - a FULL-WIDTH (no 1px inset, unlike class's own divider) horizontal
 *     `<line>` divider at `y = MARGIN + headerHeight + MARGIN_LINE` —
 *     ALWAYS drawn for this render path (jar-verified: jocela-05-niba392
 *     has ZERO body lines yet still draws the divider — `EntityImageState`
 *     draws it unconditionally; only the SEPARATE `EntityImageState
 *     EmptyDescription` shape, gated on `hide empty description` AND no
 *     body — state-sizing.ts's `measureEmptyDescription` — omits it. That
 *     boolean is not threaded onto `StateNodeGeo` this iteration — a named,
 *     deferred remainder, `plans/g4-state-svg/ledger.md` S2)
 *   - header (display/name) line(s) CENTERED (`x = box mid -
 *     textLength/2`), first baseline at `MARGIN + ascent`, subsequent
 *     lines step by `theme.fontSize`
 *   - body (description) line(s) LEFT-aligned at `box.x + MARGIN`, first
 *     baseline at `dividerY + MARGIN_LINE + ascent`
 * Text fill is a HARDCODED `#000000` in the measured path (not
 * `theme.colors.text`) — matches class's own `EntityImageClassHeader`
 * precedent (`renderer-classifier-box.ts#renderRowText`'s identical doc
 * comment); the UNMEASURED fallback path below (json) keeps its
 * PRE-EXISTING `theme.colors.text` behavior unchanged.
 * @see ~/git/plantuml/.../svek/image/EntityImageState.java
 * @see ~/git/plantuml/.../svek/image/EntityImageStateCommon.java (MARGIN/MARGIN_LINE=5)
 */
import { lineTo, moveTo } from '../../core/svg-path-builder.js';
import type { StateNodeGeo, StateTextLine } from './state-geo-types.js';
import { renderStateRuns, renderStateTable, type TableRuleStroke } from './renderer-box-runs.js';
// stdd T5a: the run/table emitters moved to `renderer-box-runs.ts`; every importer is unchanged.
export { renderStateRuns, renderStateTable } from './renderer-box-runs.js';
import type { Theme } from '../../core/theme.js';
import { rect, line, text, path } from '../../core/svg.js';
// G1/G8/G23 (mission state-declared-size-fix): the renderer draws the SAME
// styled runs / table the sizer measured -- see `state-sizing-creole.ts`.
import type { Paint } from '../../core/paint.js';
import { styledLines } from './state-sizing-creole.js';
import {
  STATE_DEFAULT_BACKGROUND,
  resolveStateFillBucketed,
  resolveStateBorder,
  resolveStateFontColor,
  resolveStateFontSize,
  resolveStateBoxRadius,
  textAscent,
  stateBorderStrokeAttrs,
  stateFontFamily,
} from './state-render-colors.js';
import { STATE_DESCRIPTION_BUCKET, STATE_NAME_BUCKET } from './state-bucket-colors.js';
import { nameBlockLeft, renderZonedLeafBox, resolveLeafZoneFills } from './renderer-box-zones.js';
import { stateShadowFilterUrl } from './state-shadow.js';
import { isOOSymbolStereotype, renderOOSymbol } from './renderer-box-symbol.js';

export { isOOSymbolStereotype, renderOOSymbol };

const STATE_BOX_RX = 12.5;
import {
  ENTITY_IMAGE_MARGIN as MARGIN,
  ENTITY_IMAGE_MARGIN_LINE as MARGIN_LINE,
} from '../../core/svek/IEntityImage.js';
/** `USymbolFrame#getMargin`/`BodyEnhanced1#getMarginX` -- duplicated from
 *  `state-sizing.ts`'s own `SDL_MARGIN`/`BODY_MARGIN_X` (this codebase's
 *  established per-module constant convention, `STATE_BOX_RX`'s own
 *  precedent above/`renderer-composite-box.ts`'s identical duplication). */
const SDL_MARGIN = { x1: 15, x2: 25, y1: 20, y2: 10 };
const BODY_MARGIN_X = 6;

/**
 * Draws a measured text block: one line per entry, each line's own styled
 * runs starting at `xForLine(ln)`, advancing the baseline by each line's
 * OWN measured height (`fontSize` for an ordinary line, the whole grid box
 * for a creole TABLE stripe).
 *
 * SI30 D2/D3: tracks the running `lineTop` (the line's own TOP edge, not a
 * pre-computed baseline) so each line's -- and, inside it, each run's --
 * baseline can be reconstructed independently via {@link runBaseline} from
 * the `Sea`-computed `line.height` and per-run `dy`, rather than one shared
 * per-block offset. `startY` keeps its pre-SI30 meaning (the FIRST line's
 * own baseline, `ascent` below the block's top) for every existing caller;
 * `lineTop = startY - ascent` recovers the top once, since `ascent` is a
 * caller-supplied CONSTANT (not itself `Sea`-derived).
 */
export function renderStateTextLines(
  lines: readonly StateTextLine[],
  xForLine: (ln: StateTextLine) => number,
  startY: number,
  theme: Theme,
  // mission G4 S15: `skinparam stateFontColor<<X>>` -- see
  // `state-render-colors.ts#resolveStateFontColor`'s own doc comment.
  // Defaults to jar's own hardcoded `#000000` label-text default (every
  // pre-S15 call site's unchanged behavior).
  opts: {
    readonly fill?: string;
    readonly fontSize?: number;
    readonly back?: Paint;
    readonly fontWeight?: '700';
    /** stdd T5a -- see `renderStateTable`'s `ruleStroke`. */
    readonly tableRuleStroke?: TableRuleStroke;
  } = {},
): string {
  // mission G4 S16: `skinparam stateFontSize<<X>>` -- see
  // `state-render-colors.ts#resolveStateFontSize`'s own doc comment.
  const fontSize = opts.fontSize ?? theme.fontSize;
  const style = {
    fontFamily: stateFontFamily(theme),
    fill: opts.fill ?? '#000000',
    ...(opts.back !== undefined ? { back: opts.back } : {}),
    ...(opts.fontWeight !== undefined ? { fontWeight: opts.fontWeight } : {}),
  };
  const ascent = textAscent(fontSize);
  let out = '';
  let lineTop = startY - ascent;
  for (const ln of styledLines(lines, fontSize)) {
    const height = ln.height === 0 ? fontSize : ln.height;
    if (ln.table !== undefined) {
      out += renderStateTable(ln.table, xForLine(ln), lineTop + TABLE_STRIPE_MARGIN_Y, {
        fontFamily: stateFontFamily(theme),
        fontSize,
        fill: style.fill,
        ascent,
        ...(opts.tableRuleStroke !== undefined ? { ruleStroke: opts.tableRuleStroke } : {}),
      });
      lineTop += height;
      continue;
    }
    out += renderStateRuns(ln.runs, xForLine(ln), lineTop, height, style);
    lineTop += height;
  }
  return out;
}

/** `StripeTable`'s own `new AtomWithMargin(table, 2, 2)`
 *  (`StripeTable.java:82`) -- the grid starts `marginY1` below the stripe's
 *  own top edge. Duplicated from `state-sizing-creole.ts#TABLE_MARGIN_Y`,
 *  this codebase's established per-module constant convention (see
 *  `SDL_MARGIN` above). */
const TABLE_STRIPE_MARGIN_Y = 2;

/**
 * `kind:'json'` (mission A4 Phase L iter 20) and any other pre-measurement
 * caller reuse this UNCHANGED fallback (`node.headerLines === undefined`):
 * a single centered, unmeasured `<text>`, matching the pre-S2 behavior
 * exactly — faithful `shape=plaintext` TABLE content for json is deferred
 * (renderer.ts's own `renderJson` doc comment), not attempted here.
 */
function renderUnmeasuredFallback(node: StateNodeGeo, theme: Theme, box: string): string {
  return (
    box +
    text(node.x + node.width / 2, node.y + node.height / 2 + theme.fontSize / 2, node.display, {
      textAnchor: 'middle',
      fill: theme.colors.text,
      fontFamily: stateFontFamily(theme),
      fontSize: theme.fontSize,
    })
  );
}

/**
 * mission G4 S5: `EntityImageStateEmptyDescription.drawU` -- rect ONLY (no
 * divider, no body), label CENTERED both horizontally AND vertically
 * (`xDesc = (dimTotal.width - dimHeader.width) / 2`, `yDesc = (dimTotal
 * .height - dimHeader.height) / 2` in upstream's own coordinates; `
 * dimHeader.height` is `headerLines.length * fontSize`, matching every
 * other box's own `MEASURE_LINES`-derived text-block-height convention).
 * jar-verified `gopumi-11-pise779`'s `S1` (single line, MIN 50x40 box):
 * box x=25.86 y=86 w=50 h=40, text x=42.285 y=109.8889 -- `yDesc = (40 -
 * 14)/2 = 13`, baseline = `node.y + 13 + textAscent(14) = 86 + 23.8889 =
 * 109.8889`, EXACT match.
 * @see ~/git/plantuml/.../svek/image/EntityImageStateEmptyDescription.java
 */
function renderEmptyDescription(node: StateNodeGeo, theme: Theme, box: string, fill: Paint): string {
  const headerLines = node.headerLines!;
  // mission G4 S16: `skinparam stateFontSize<<X>>` -- see
  // `state-render-colors.ts#resolveStateFontSize`'s own doc comment.
  const fontSize = resolveStateFontSize(node, theme, theme.fontSize);
  const ascent = textAscent(fontSize);
  const textBlockHeight = headerLines.length * fontSize;
  const yDesc = (node.height - textBlockHeight) / 2;
  // unwind2-S11: `applyColor` (`EntityImageStateEmptyDescription#drawU`)
  // puts the fill on the `ug` the name draws with -- a sprite's tint back.
  const headerMarkup = renderStateTextLines(
    headerLines,
    () => nameBlockLeft(node, headerLines),
    node.y + yDesc + ascent,
    theme,
    { fill: '#000000', fontSize, back: fill },
  );
  return box + headerMarkup;
}

/**
 * mission G4 S14: `EntityImageState2`/`USymbolFrame#drawFrame` -- a
 * `<<sdlreceive>>` leaf box draws UNWRAPPED (no `<g>`, `wrapClassFor`'s own
 * doc comment), a plain (non-rounded-header, still `rx/ry=12.5`) box, a
 * fold-notch `<path>` (`textWidth = width/3`, `cornersize = 7`,
 * `textHeight = 12` -- `USymbolFrame#drawFrame`'s own `dimTitle.getWidth()
 * === 0` branch, since `asSmall` always passes an empty `dimTitle`), and a
 * single TOP-LEFT-ANCHORED (not centered) label at `x = node.x +
 * SDL_MARGIN.x1 + BODY_MARGIN_X`, `y = node.y + SDL_MARGIN.y1 + ascent`
 * (`USymbolFrame#asSmall`'s own `UTranslate(margin.getX1(), margin.getY1())`
 * placement of the merged stereotype+label block -- the stereotype
 * TextBlock is always empty for state's own `asSmall` call, so only the
 * label's own baseline offset (`ascent`) is added). NO divider line (only
 * `EntityImageState`'s own box draws one). jar-verified byte-exact against
 * `cekolo-21-gini183`'s own sdlreceive node (rect 407.46,7 115.0875x44;
 * path `M445.8225,7 L445.8225,12 L438.8225,19 L407.46,19`; text
 * 428.46,37.8889).
 * @see ~/git/plantuml/.../svek/image/EntityImageState2.java
 * @see ~/git/plantuml/.../decoration/symbol/USymbolFrame.java#drawFrame
 * @see state-sizing.ts's `SDL_MARGIN`/`BODY_MARGIN_X` doc comment
 * @see plans/g4-state-svg/ledger.md (S14)
 */
export function renderSdlReceive(node: StateNodeGeo, theme: Theme): string {
  const fill = resolveStateFillBucketed(node, theme, STATE_DEFAULT_BACKGROUND);
  const border = resolveStateBorder(node, theme);
  // mission G6 T4: `<style> stateDiagram { RoundCorner N } }` cascade --
  // see `resolveStateBoxRadius`'s own doc comment.
  const radius = resolveStateBoxRadius(theme, STATE_BOX_RX);
  const box = rect(node.x, node.y, node.width, node.height, {
    fill,
    stroke: border,
    ...stateBorderStrokeAttrs(node, theme),
    rx: radius,
    ry: radius,
  });

  const textWidth = node.width / 3;
  const cornerSize = 7;
  const textHeight = 12;
  const x0 = node.x;
  const y0 = node.y;
  const d = [
    moveTo(x0 + textWidth, y0),
    lineTo(x0 + textWidth, y0 + textHeight - cornerSize),
    lineTo(x0 + textWidth - cornerSize, y0 + textHeight),
    lineTo(x0, y0 + textHeight),
  ].join(' ');
  const notch = path(d, { stroke: border, ...stateBorderStrokeAttrs(node, theme) });

  // mission G4 S16: `skinparam stateFontSize<<X>>` -- see
  // `state-render-colors.ts#resolveStateFontSize`'s own doc comment.
  const fontSize = resolveStateFontSize(node, theme, theme.fontSize);
  const ascent = textAscent(fontSize);
  // dss T3e site 19: `EntityImageState2.java:80-86,98-99`: the `state` style's FontColor, as a leaf's.
  const label = text(node.x + SDL_MARGIN.x1 + BODY_MARGIN_X, node.y + SDL_MARGIN.y1 + ascent, node.display, {
    fill: resolveStateFontColor(node, theme, '#000000'),
    fontFamily: stateFontFamily(theme),
    fontSize,
    lengthAdjust: 'spacing',
    textLength: node.headerLines?.[0]?.width ?? 0,
  });

  return box + notch + label;
}

export function renderNormal(node: StateNodeGeo, theme: Theme): string {
  // mission G4 S10: `state`-element bucket tier -- see `resolveStateFillBucketed`'s own doc comment.
  const fill = resolveStateFillBucketed(node, theme, STATE_DEFAULT_BACKGROUND);
  // G4 S9: `StateBorderColor<<X>>` cascade -- see `resolveStateBorder`'s own
  // doc comment.
  const border = resolveStateBorder(node, theme);
  // mission G6 T4: `<style> stateDiagram { RoundCorner N } }` cascade --
  // see `resolveStateBoxRadius`'s own doc comment.
  const radius = resolveStateBoxRadius(theme, STATE_BOX_RX);
  // mission skin-file-loading Batch 2: `EntityImageStateCommon#getShape`
  // sets `deltaShadow` directly on this SAME outline rect (jar draws ONE
  // rect, fill+shadow combined -- unlike the composite shape's own
  // separate shadow-only duplicate, `renderer-composite-box.ts
  // #renderCompositeMeasured`) -- see `StateNodeGeo.shadowing`'s own doc
  // comment for the per-kind eligibility gate this reads (`undefined`/`0`
  // for every pre-Batch-2 fixture, byte-identical `rect()` call).
  const box = rect(node.x, node.y, node.width, node.height, {
    fill,
    stroke: border,
    ...stateBorderStrokeAttrs(node, theme),
    rx: radius,
    ry: radius,
    ...(node.shadowing !== undefined && node.shadowing > 0 ? { filter: stateShadowFilterUrl() } : {}),
  });

  if (node.headerLines === undefined) {
    return renderUnmeasuredFallback(node, theme, box);
  }

  if (node.emptyDescription === true) {
    return renderEmptyDescription(node, theme, box, fill);
  }

  // mission G4 S16: `skinparam stateFontSize<<X>>` -- see
  // `state-render-colors.ts#resolveStateFontSize`'s own doc comment; jar-
  // verified `laferu-31-tice836` (font-size 30, box widened to match the
  // `state-sizing.ts` measurement this SAME resolution feeds at layout
  // time).
  const fontSize = resolveStateFontSize(node, theme, theme.fontSize);
  const ascent = textAscent(fontSize);
  // mission G4 S15: `StateFontColor<<X>>` cascade -- see
  // `resolveStateFontColor`'s own doc comment.
  // dss T3c: the name and the description are two zones (`EntityImageState.java:89-92`), each with its own FontColor.
  const nameFont = resolveStateFontColor(node, theme, '#000000', STATE_NAME_BUCKET);
  const descriptionFont = resolveStateFontColor(node, theme, '#000000', STATE_DESCRIPTION_BUCKET);
  // unwind2-S11: `applyColor` puts the fill on the `ug` both text blocks
  // draw with (`EntityImageState.java` `drawU`), a sprite's tint back.
  const textOpts = { fill: nameFont, fontSize, back: fill };
  // ubt-T2b: `ug = ug.apply(stroke)` (`EntityImageState.java:130-132`) is the `ug` the
  // fields draw with (`:162`), so a creole table's rules take the state's own stroke.
  const bodyOpts = { ...textOpts, fill: descriptionFont, tableRuleStroke: stateBorderStrokeAttrs(node, theme) };
  const headerMarkup = renderStateTextLines(
    node.headerLines,
    () => nameBlockLeft(node, node.headerLines!),
    node.y + MARGIN + ascent,
    theme,
    textOpts,
  );

  const dividerY = node.y + MARGIN + node.headerLines.length * fontSize + MARGIN_LINE;
  const divider = line(node.x, dividerY, node.x + node.width, dividerY, {
    stroke: border,
    ...stateBorderStrokeAttrs(node, theme),
  });

  const bodyLines = node.bodyLines ?? [];
  const bodyMarkup = renderStateTextLines(
    bodyLines,
    () => node.x + MARGIN,
    dividerY + MARGIN_LINE + ascent,
    theme,
    bodyOpts,
  );

  // G8: `EntityImageState.drawU`'s own order -- shape, divider hline,
  // SYMBOL, name, fields (`EntityImageState.java:142-166`).
  const symbol = isOOSymbolStereotype(node.stereotype)
    ? renderOOSymbol(node.x + node.width, node.y + node.height, fill, border)
    : '';

  // dss T3c: zones that differ are drawn by `RoundedContainer`, which replaces the single filled rect.
  const zones = resolveLeafZoneFills(node, theme);
  const shape = zones === undefined ? box : renderZonedLeafBox(node, { zones, border, radius, dividerY, theme });
  return shape + divider + symbol + headerMarkup + bodyMarkup;
}
