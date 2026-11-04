/**
 * Transition label placement — shared by every state-layout pipeline (flat,
 * T3; composite, T4) so antiparallel transitions don't overlap their labels.
 * Split out to a standalone module (no dependents) to avoid an import cycle
 * between ./layout.ts and the composite-pass modules, both of which need it.
 *
 * G8/T2 (`plans/g8-label-placement/`): D1 replaces the perpendicular-offset
 * guess with a jar-faithful centre->anchor conversion whenever the layout
 * result actually placed the label (graphviz reads the FIXEDSIZE box back
 * and reports its centre, `SvekEdge.java:741-745,808-813` -- dot places,
 * jar reads back) -- gated on `labelX !== undefined`, never truthiness (D1).
 * The legacy perpendicular formula stays as the explicit fallback for edges
 * whose result carries no label position (orphan-swept edges, paths that
 * never handed the label to graphviz).
 *
 * @see plans/g8-label-placement/spec.md (§1a mechanism, §2 formula, §6 fallback contract)
 * @see plans/g8-label-placement/decisions.md (D1/D2)
 */

import type { Transition } from './ast.js';
import type { FontSpec, StringMeasurer } from '../../core/measurer.js';
import type { ReservedLabelBox } from '../../core/edge-label-box.js';
import type { LabelInkBox, StateTextLine, TransitionGeo } from './state-geo-types.js';
import { labelDisplayBlock, measureStateLabelBox, type LabelStyle } from './state-label-style.js';
import { transitionLabelText } from './state-dot-graph.js';
import {
  CLASS_ATTRIBUTE_ICON_SIZE_DEFAULT,
  computeReservedLabelBox,
  computeMergedLabelBox,
} from '../../core/edge-label-box.js';
// T4 (`note-on-link`, `state-declared-size-fix`): the SAME `EntityImageNoteLink`
// dimension `state-dot-graph.ts#computeEdgeLabelBox`/`state-composite-edge-
// label.ts#computeEdgeLabelBox` already feed the DOT graph -- reused here so
// the DRAWN box (this file) and the RESERVED box (DOT) never disagree.
import { measureLinkNoteDim } from '../../core/svek/image/EntityImageNoteLink.js';
import { buildRenderLines } from './state-note-layout.js';
import { noteDrawnFirst, placeMergedOperands, unionInk, type MergedPlacement } from './state-link-note-merge.js';

/** Label offset perpendicular to the edge direction -- legacy fallback only
 *  (D1): still used verbatim when the layout result carries no label
 *  position at all. */
const LABEL_PERP = 12;

// Relocated to `core/edge-label-box.ts` (T1) -- one box formula for every
// engine, per that module's header. Re-exported so `state-composite-edge-
// label.ts` and any other state caller is unchanged.
export { computeReservedLabelBox };
export { labelStyleOf, measureStateLabelBox, type LabelStyle } from './state-label-style.js';

/**
 * Closed-form centre->anchor conversion (spec.md §2, no fixture-conditional
 * terms -- D5). `centre` is the graphviz-returned label position
 * (`labelX`/`labelY`); the FIXEDSIZE box jar actually placed is centered
 * there, and jar draws its (with-margin) `labelText` block's top-left at
 * that box's own top-left corner + `marginLabel` (spec.md §1b) -- the
 * visible text therefore starts `marginLabel` further in from the box's own
 * corner on the x axis. The y axis needs no floor/margin split: `reservedHeight
 * = measuredHeight + 2*marginLabel` is already exact for every jar-verified
 * case (`fontSize`/`marginLabel` both integers, `measuredHeight = lines *
 * fontSize`), so `anchor.y` reduces algebraically to `centre.y -
 * measuredHeight/2 + ascent` with zero residual from the floor.
 *
 * Jar-verified 11/11 exact (spec.md §3): 3 composite-pass nesting depths,
 * the flat (non-composite) pipeline, self-loops with BOTH `marginLabel`
 * values, and duplicate parallel edges between the same state pair.
 */
export function transitionLabelAnchor(
  centre: { x: number; y: number },
  text: string,
  font: FontSpec,
  measurer: StringMeasurer,
  isSelfLoop: boolean,
): { x: number; y: number } {
  return anchorFromCentre(centre, measureLabel(text, { font, measurer }, isSelfLoop));
}

/** The reserved box plus the first line's ascent -- everything both the
 *  anchor conversion and the ink box need, measured once. */
interface MeasuredLabel {
  readonly box: ReservedLabelBox;
  readonly ascent: number;
  /** stdd T4b: the first line's measured text height (`LimitFinder#drawText`'s `dim.getHeight()`). */
  readonly firstLineHeight: number;
}

function measureLabel(text: string, ctx: LabelMeasureCtx, isSelfLoop: boolean): MeasuredLabel {
  const { font, measurer, style } = ctx;
  // stdd T2c: `wrapWidth` is `skinParam.maxMessageSize()` (`SvekEdge.java:291-294`); the icon size is
  // `classAttributeIconSize()` (`:202`).
  const options = {
    maxWidth: style?.maxWidth ?? 0,
    classAttributeIconSize: style?.classAttributeIconSize ?? CLASS_ATTRIBUTE_ICON_SIZE_DEFAULT,
    ...(style?.sprites !== undefined ? { sprites: style.sprites } : {}),
  };
  const box = measureStateLabelBox(text, font, measurer, isSelfLoop, options);
  return {
    box,
    ascent: font.size - measurer.getDescent(font, box.lines[0]!),
    firstLineHeight: measurer.measure(box.lines[0]!, font).height,
  };
}

/** `SvgGraphics.java:700-706`: the drawn `<text>`'s `textLength` is the
 *  string's measured width. Only a single-line label drawn verbatim has one
 *  string to measure; a label whose drawn text differs from its measured
 *  line (creole markup, multi-line) keeps no `textLength`, as before. */
function drawnTextLength(
  labelText: string,
  { box }: MeasuredLabel,
  ctx: LabelMeasureCtx,
): { textLength: number } | Record<string, never> {
  if (box.lines.length !== 1 || box.lines[0] !== labelText) return {};
  return { textLength: ctx.measurer.measure(labelText, ctx.font).width };
}

function anchorFromCentre(centre: { x: number; y: number }, { box, ascent }: MeasuredLabel): { x: number; y: number } {
  return {
    x: centre.x - box.reservedWidth / 2 + box.marginLabel,
    y: centre.y - box.measuredHeight / 2 + ascent,
  };
}

/**
 * Round to the 2 decimals graphviz's SVG writer prints — the precision jar's
 * label geometry actually carries.
 *
 * PlantUML never sees a full-precision label position: it scrapes `dot
 * -Tsvg`'s TEXT, taking the min corner of the invisible label table's
 * `points="..."` (`svek/SvekEdge.java:808-813`, `SvekUtils.getMinXY`), and
 * graphviz prints every coordinate through
 * `snprintf(buf, 50, "%.02f", num)`.
 *
 * Measured, not assumed: real graphviz 15.1.1 on jar's own
 * `test-results/dot-cache/state/bemena-23-zebu249/svek-1.dot` puts the
 * `EvNewValueSaved` box corner at `235.61` where our engine carries
 * `235.61168` — the whole of that fixture's residual composite-width error
 * once the marged-box fold is correct.
 *
 * Applied to the ink box ONLY, never to `label.x`/`label.y`: the draw
 * anchor is pinned
 * and must stay byte-identical (mission decision D5). We therefore draw the
 * label at the unquantized x where jar draws the quantized one — ≤0.005px,
 * inside the 0.01px SVG-conformance band.
 *
 * `toFixed` rounds half away from zero where C's `%.02f` rounds half to
 * even; they differ only for a double that is an exact `n.xx5`, which a
 * layout coordinate is not in practice. The `+ 0` normalizes `-0`, matching
 * graphviz's own `num > -0.005 && num < 0.005` guard.
 *
 * @see ~/git/graphviz/lib/gvc/gvdevice.c:513-528 (`gvprintdouble`)
 * @see .agent-notes/class-edge-spline-2dp-quantization.md
 */
function svgPrecision(v: number): number {
  return Number(v.toFixed(2)) + 0;
}

/** The label fields `TransitionGeo.label` carries beyond text and anchor:
 *  the floored DOT reservation (`width`/`height`, unchanged) and the
 *  unfloored, box-anchored ink extent ({@link LabelInkBox}). */
function labelBoxFields(
  anchor: { x: number; y: number },
  { box, ascent, firstLineHeight }: MeasuredLabel,
): { width: number; height: number; inkBox: LabelInkBox } {
  // `LimitFinder#drawEmpty` over `TextBlockMarged`'s own `UEmpty`: the
  // marged block's top-left corner, and its UNfloored dimension.
  const boxTop = anchor.y - ascent - box.marginLabel;
  // stdd T4b: `TextBlockMarged#drawU` (`TextBlockMarged.java:79-87`) then draws the text, and
  // `LimitFinder#drawText` (`LimitFinder.java:217-224`) reaches `baseline - (height - 1.5)`: above
  // the marged box for a 13px label (11.5 over an ascent of 10.111 plus 1), lurage-50's 0.389.
  // The text term is plain double arithmetic on the quantized anchor (jar: 17.5 - 11.5 = 6, then 38.389
  // for the node), so only the box corner keeps `svgPrecision`.
  const textTop = anchor.y - (firstLineHeight - 1.5);
  const top = Math.min(svgPrecision(boxTop), textTop);
  return {
    width: box.reservedWidth,
    height: box.reservedHeight,
    inkBox: {
      x: svgPrecision(anchor.x - box.marginLabel),
      y: top,
      width: box.measuredWidth + 2 * box.marginLabel,
      height: box.measuredHeight + 2 * box.marginLabel + (svgPrecision(boxTop) - top),
    },
  };
}

/** Legacy perpendicular-offset placement (D1 fallback, unchanged formula) --
 *  used only when the layout result carries no label position at all. */
function perpendicularOffsetLabel(
  points: ReadonlyArray<{ x: number; y: number }>,
): { x: number; y: number } | undefined {
  if (points.length < 2) return undefined;
  let mid: { x: number; y: number };
  if (points.length === 2) {
    const p0 = points[0]!;
    const p1 = points[1]!;
    mid = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
  } else {
    mid = points[Math.floor(points.length / 2)]!;
  }
  const p0 = points[0]!;
  const pLast = points[points.length - 1]!;
  const eDx = pLast.x - p0.x;
  const eDy = pLast.y - p0.y;
  const eLen = Math.sqrt(eDx * eDx + eDy * eDy) || 1;
  return {
    x: mid.x + (eDy / eLen) * LABEL_PERP,
    y: mid.y + (-eDx / eLen) * LABEL_PERP - 4,
  };
}

/** Layout result fields {@link attachTransitionLabel} needs -- a narrow
 *  structural subset of `DotLayoutResult['edges'][number]` so this module
 *  stays decoupled from the full result shape (only `labelX`/`labelY` are
 *  ever read; `labelWidth`/`labelHeight` are NOT -- the box stored on
 *  `TransitionGeo.label` is independently recomputed via
 *  {@link computeReservedLabelBox} from the transition's OWN text, so it
 *  reflects the SAME jar-verified formula regardless of which pipeline
 *  built the edge or whether that pipeline's own DOT-input box happened to
 *  carry margin/floor already). */
interface LabelEdgeResult {
  readonly labelX?: number;
  readonly labelY?: number;
}

/** {@link attachTransitionLabel}'s return shape -- shared by the inline-label
 *  and note-on-link arms (T4). */
type TransitionLabelResult = NonNullable<TransitionGeo['label']>;

/** `font`+`measurer` as a single optional pair -- collapses both label arms'
 *  param count under this project's 5-param cap (mirrors `FlatNoteGeoCtx`'s
 *  own bundling precedent, `renderer-note.ts`). `undefined` for a pass whose
 *  accumulator was built outside this task's write-set
 *  (`state-composite-concurrent.ts`'s own `newAccumulator()`, concurrent-
 *  region passes) -- both arms degrade to their box-less legacy shape then. */
interface LabelMeasureCtx {
  readonly font: FontSpec;
  readonly measurer: StringMeasurer;
  /** stdd T2c: absent on a hand-built call; the label then keeps its pre-T2c single `text`. */
  readonly style?: LabelStyle;
}

/** `attachTransitionLabel`'s fourth argument: the font alone (older callers) or the whole context. */
export type LabelFontOrCtx = FontSpec | LabelMeasureCtx;

function labelCtxOf(
  fontOrCtx: LabelFontOrCtx | undefined,
  measurer: StringMeasurer | undefined,
): LabelMeasureCtx | undefined {
  if (fontOrCtx === undefined) return undefined;
  if ('measurer' in fontOrCtx) return fontOrCtx;
  return measurer === undefined ? undefined : { font: fontOrCtx, measurer };
}

// ---------------------------------------------------------------------------
// `note ... on link` (T4, `note-on-link`/`state-declared-size-fix`)
// ---------------------------------------------------------------------------

/** The `note on link` box: the SAME `computeMergedLabelBox` formula
 *  `state-dot-graph.ts#computeEdgeLabelBox`/`state-composite-edge-label.ts
 *  #computeEdgeLabelBox` already feed the DOT graph's `labelWidth`/
 *  `labelHeight`, so the drawn box and the DOT reservation never disagree
 *  (`SvekEdge.java:741-747`, `hasNoteLabelText()` folds the SAME merged
 *  `labelText` block both places). */
function measureNoteBox(
  t: Transition,
  labelText: string | undefined,
  font: FontSpec,
  measurer: StringMeasurer,
): ReservedLabelBox {
  return computeMergedLabelBox({
    label: labelText ?? '',
    noteDim: measureLinkNoteDim(t.linkNote!, { family: font.family }, measurer),
    position: t.linkNotePosition ?? 'bottom',
    halfWidth: false,
    hasMiddleDecor: false,
    font,
    measurer,
  });
}

/** `note on link`'s anchor is the box's own TOP-LEFT corner -- no
 *  `marginLabel`/ascent inset, unlike an inline label's baseline anchor.
 *  `SvekEdge.java:741-747`'s `labelText` is the RAW `EntityImageNoteLink`
 *  block whenever the inline label is empty (`Display.isNull` ->
 *  `EMPTY_TEXT_BLOCK` -> `TextBlockUtils.mergeLR`/`mergeTB`'s own
 *  short-circuit, `:281-282,318-325`) -- the merged block then carries NO
 *  extra `addVisibilityModifier`/`TextBlockMarged` wrap, so `labelXY`'s own
 *  dimension IS the note's preferred box, positioned at the graphviz-read
 *  centre with no further inset. A non-empty inline label merged with a note
 *  (`mergeLR`/`mergeTB` over two REAL blocks) is {@link attachMergedLinkLabel}
 *  (dss T3e): this anchor is then the MERGED block's corner. */
function noteAnchorFromCentre(centre: { x: number; y: number }, box: ReservedLabelBox): { x: number; y: number } {
  return { x: centre.x - box.reservedWidth / 2, y: centre.y - box.reservedHeight / 2 };
}

/** `Rose.java:65-66` -- `paddingX`/`paddingY`, both 5, `Rose#createComponentNote`
 *  passes into every `ComponentRoseNote` (`Rose.java:114-115`); the SAME
 *  constant `renderer-note.ts`'s own (unexported) copy uses as a DRAW offset
 *  -- duplicated here (D1) because the ink fold below needs it too, and this
 *  file has no import path to the renderer without a cycle
 *  (`renderer-note.ts` -> `state-geo-types.ts`, not this file). */
const ROSE_NOTE_PADDING = 5;

/** {@link labelBoxFields}'s note-on-link counterpart. The ink box is NOT the
 *  full preferred box `width`/`height` carry (`EntityImageNoteLink
 *  #calculateDimensionSlow` reports the FULL `ComponentRoseNote` preferred
 *  size, `pure+31`/`pure+20`) -- `ComponentRoseNote#drawInternalU` only
 *  PAINTS pixels within the INSET `getTextWidth`x`getTextHeight` polygon
 *  (`Opale.getPolygonNormal(x2, textHeight, ...)`, `x2`/`textHeight` both
 *  already `2 * ROSE_NOTE_PADDING` smaller than the preferred box -- see
 *  `renderer-note.ts#renderNoteOnLink`'s own derivation), so a REAL
 *  `LimitFinder` ink walk over the drawn primitives (`InnerStateAutonom
 *  .java:186-193`) sees only that smaller box, not the logical `calculate
 *  Dimension()` one. Jar-verified against `tumaba-64-tosu281`'s own
 *  canonical SVG (`test-results/visual-qa-svg/canonical/state/tumaba-64-
 *  tosu281.svg`): the drawn note polygon is `M54.21,315 ... L92.21,338`
 *  (38x23 -- `reservedWidth-2*ROSE_NOTE_PADDING` x `reservedHeight-2*
 *  ROSE_NOTE_PADDING` exactly), and folding THAT box (not the full 48x33
 *  one) is what closes `SubState`'s declared width to the jar-verified
 *  target (`findings/note.md#tumaba-64-tosu281`'s own `childImg.width=
 *  89.21px`) -- the full box overshoots by exactly `ROSE_NOTE_PADDING`. */
function noteBoxFields(
  anchor: { x: number; y: number },
  box: ReservedLabelBox,
  noteText: string,
  ctx: LabelMeasureCtx,
  noteColor?: string,
): { width: number; height: number; inkBox: LabelInkBox; noteLines: readonly StateTextLine[]; noteColor?: string } {
  return {
    ...(noteColor !== undefined ? { noteColor } : {}),
    width: box.reservedWidth,
    height: box.reservedHeight,
    inkBox: {
      x: svgPrecision(anchor.x + ROSE_NOTE_PADDING),
      y: svgPrecision(anchor.y + ROSE_NOTE_PADDING),
      width: box.reservedWidth - 2 * ROSE_NOTE_PADDING,
      height: box.reservedHeight - 2 * ROSE_NOTE_PADDING,
    },
    // dss T3f: the same lines an entity note draws (`Display`, `AtomText`), so a
    // leading space is an `x` shift (`DriverTextSvg.java:114-126`).
    noteLines: buildRenderLines(noteText, { fontFamily: ctx.font.family }, ctx.measurer),
  };
}

/** The note box's own anchor: the graphviz-read centre when the layout
 *  result placed the label, else the legacy perpendicular-offset point
 *  (D1's fallback, unchanged formula) -- same precedence as the inline-label
 *  arm's own gate. */
function resolveNoteAnchor(
  points: ReadonlyArray<{ x: number; y: number }>,
  edgeResult: LabelEdgeResult | undefined,
  measured: ReservedLabelBox | undefined,
): { x: number; y: number } | undefined {
  if (edgeResult?.labelX !== undefined && measured !== undefined) {
    return noteAnchorFromCentre({ x: edgeResult.labelX, y: edgeResult.labelY! }, measured);
  }
  return perpendicularOffsetLabel(points);
}

/** dss T3e: the merged block of a note and a NON-empty inline label, placed (`SvekEdge.java:307-325`,
 *  see `state-link-note-merge.ts`). */
function placeLinkOperands(
  t: Transition,
  anchor: { x: number; y: number },
  merged: ReservedLabelBox,
  label: MeasuredLabel,
  ctx: LabelMeasureCtx,
): MergedPlacement {
  return placeMergedOperands({
    position: t.linkNotePosition ?? 'bottom',
    anchor,
    note: measureLinkNoteDim(t.linkNote!, { family: ctx.font.family }, ctx.measurer),
    label: { width: label.box.measuredWidth + 2 * label.box.marginLabel, height: label.box.reservedHeight },
    merged: { width: merged.measuredWidth, height: merged.measuredHeight },
    marginLabel: label.box.marginLabel,
    ascent: label.ascent,
  });
}

/** dss T3e: a note merged with a NON-empty inline label -- both operands drawn in the merged block
 *  (`SvekEdge.java:307-325,950-954`). `x`/`y` stay the NOTE's top-left, the label rides in `linkLabel`,
 *  `inkBox` is the union of the note polygon and the label's marged `UEmpty`. */
function attachMergedLinkLabel(
  t: Transition,
  labelText: string,
  anchor: { x: number; y: number },
  merged: ReservedLabelBox,
  ctx: LabelMeasureCtx,
): TransitionLabelResult {
  const label = measureLabel(labelText, ctx, false);
  const placed = placeLinkOperands(t, anchor, merged, label, ctx);
  const noteBox = measureNoteBox(t, undefined, ctx.font, ctx.measurer);
  const note = noteBoxFields(placed.note, noteBox, t.linkNote!, ctx, t.linkNoteColor);
  const { x, y, width, height } = placed.labelBlock;
  return {
    text: labelText,
    x: placed.note.x,
    y: placed.note.y,
    ...note,
    inkBox: unionInk(note.inkBox, { x: svgPrecision(x), y: svgPrecision(y), width, height }),
    linkLabel: {
      text: labelText,
      dx: placed.labelBaseline.x - placed.note.x,
      dy: placed.labelBaseline.y - placed.note.y,
      ...drawnTextLength(labelText, label, ctx),
    },
    noteFirst: noteDrawnFirst(t.linkNotePosition ?? 'bottom'),
  };
}

/** {@link attachTransitionLabel}'s `t.linkNote !== undefined` arm -- same
 *  measured/anchor/boxFields shape as the inline-label arm below, so a
 *  reviewer can read the two side by side. */
function attachNoteOnLinkLabel(
  t: Transition,
  labelText: string | undefined,
  points: ReadonlyArray<{ x: number; y: number }>,
  edgeResult: LabelEdgeResult | undefined,
  ctx: LabelMeasureCtx | undefined,
): TransitionLabelResult | undefined {
  const text = labelText ?? t.linkNote!;
  const measured = ctx !== undefined ? measureNoteBox(t, labelText, ctx.font, ctx.measurer) : undefined;
  const anchor = resolveNoteAnchor(points, edgeResult, measured);
  if (anchor === undefined) return undefined;
  if (measured === undefined || ctx === undefined) return { text, x: anchor.x, y: anchor.y };
  if (labelText !== undefined) return attachMergedLinkLabel(t, labelText, anchor, measured, ctx);
  return { text, x: anchor.x, y: anchor.y, ...noteBoxFields(anchor, measured, t.linkNote!, ctx, t.linkNoteColor) };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** {@link attachTransitionLabel}'s inline-label arm (guard/action/`label`) --
 *  split out so the public dispatcher stays a thin, low-complexity routing
 *  function (this project's per-function CCN cap); body otherwise unchanged
 *  from the pre-T4 `attachTransitionLabel`. */
function attachInlineTransitionLabel(
  t: Transition,
  labelText: string,
  points: ReadonlyArray<{ x: number; y: number }>,
  edgeResult: LabelEdgeResult | undefined,
  ctx: LabelMeasureCtx | undefined,
): TransitionLabelResult | undefined {
  const isSelfLoop = t.from === t.to;
  // `font`/`measurer` are unavailable only for a pass whose accumulator was
  // built outside this task's write-set (state-composite-concurrent.ts's
  // own `newAccumulator()` call, concurrent-region passes) -- box/anchor
  // conversion needs a real measurer, so those labels keep the EXACT
  // pre-existing perpendicular-only, no-box shape (D1's own "absent falls
  // back unchanged" spirit, generalized to a missing measurer rather than
  // just a missing layout position).
  const measured = ctx !== undefined ? measureLabel(labelText, ctx, isSelfLoop) : undefined;
  // stdd T2c: the drawn lines, only where a style is known (the two real pipelines).
  const display = ctx?.style !== undefined ? labelDisplayBlock(labelText, ctx, ctx.style) : {};

  // D1: gate on `labelX !== undefined` specifically, never truthiness (0 is
  // a valid coordinate) -- `labelY` is present together with `labelX`
  // whenever it is (`graph-layout.ts#toEdgeEntry` sets both from the same
  // `ge.label` pair).
  if (edgeResult?.labelX !== undefined && measured !== undefined) {
    const anchor = anchorFromCentre({ x: edgeResult.labelX, y: edgeResult.labelY! }, measured);
    return {
      text: labelText,
      x: anchor.x,
      y: anchor.y,
      ...drawnTextLength(labelText, measured, ctx!),
      ...labelBoxFields(anchor, measured),
      ...display,
      ascent: measured.ascent,
    };
  }

  const legacy = perpendicularOffsetLabel(points);
  if (legacy === undefined) return undefined;
  // The fallback anchor is this port's own (upstream draws no label at all
  // when graphviz returned no position), so it keeps the SAME box
  // convention rather than a second one.
  const boxFields = measured !== undefined ? labelBoxFields(legacy, measured) : {};
  const lengthField = measured !== undefined ? drawnTextLength(labelText, measured, ctx!) : {};
  const ascentField = measured !== undefined ? { ascent: measured.ascent } : {};
  return { text: labelText, x: legacy.x, y: legacy.y, ...lengthField, ...boxFields, ...display, ...ascentField };
}

/** Attach a transition's label. D1: when the layout result placed the label
 *  (graphviz read the FIXEDSIZE box back) AND a font/measurer is available,
 *  convert its centre to a draw anchor via {@link transitionLabelAnchor};
 *  otherwise fall back to the legacy perpendicular-offset formula,
 *  unchanged. Pure function of the transition, the routed points, and the
 *  layout result.
 *
 *  T4: `t.linkNote !== undefined` routes to {@link attachNoteOnLinkLabel}
 *  instead -- gated ALONGSIDE `labelText` (mirrors `state-dot-graph.ts
 *  #edgeLabelAttrs`'s own `text === undefined && t.linkNote === undefined`
 *  gate) so a note-only transition (no inline `label`/`guard`/`action`)
 *  still attaches a real `TransitionGeo.label`, closing the gap
 *  `findings/note.md#tumaba-64-tosu281` named: `transitionLabelText` itself
 *  is UNCHANGED (still `undefined` for a note-only transition) -- both
 *  callers already treat `linkNote` as a separate, sibling concern. */
export function attachTransitionLabel(
  t: Transition,
  points: ReadonlyArray<{ x: number; y: number }>,
  edgeResult: LabelEdgeResult | undefined,
  fontOrCtx: LabelFontOrCtx | undefined,
  measurer?: StringMeasurer,
): TransitionLabelResult | undefined {
  const labelText = transitionLabelText(t);
  if (labelText === undefined && t.linkNote === undefined) return undefined;
  const ctx = labelCtxOf(fontOrCtx, measurer);
  if (t.linkNote !== undefined) return attachNoteOnLinkLabel(t, labelText, points, edgeResult, ctx);
  return attachInlineTransitionLabel(t, labelText!, points, edgeResult, ctx);
}
