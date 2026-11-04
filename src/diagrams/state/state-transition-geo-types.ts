/**
 * Transition geometry types of the state-diagram layout engine -- split out of ./state-geo-types.ts (which
 * re-exports them, keeping every import path) when that file passed the repo's 500-line cap (stdd T6b).
 */

import type { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import type { StateStyledTextLine } from './state-sizing-creole.js';
import type { StateTextLine } from './state-geo-types.js';

/**
 * A transition label's own INK contribution — the `UEmpty` upstream's
 * `TextBlockMarged#drawU` emits for the whole marged block before drawing
 * the glyphs inset by `marginLabel`
 * (`klimt/shape/TextBlockMarged.java:79-87`, dimension at `:74-77`), which
 * `LimitFinder#drawEmpty` then folds at full size with no inset
 * (`klimt/drawing/LimitFinder.java:159-162`).
 *
 * Distinct from `TransitionGeo.label`'s `width`/`height` in BOTH terms, and
 * that is the whole point:
 *
 * - **Size.** `width` here is `measuredWidth + 2*marginLabel`, UNfloored.
 *   `label.width` is the DOT reservation, floored by upstream's `(int)`
 *   cast (`svek/SvekEdge.java:504-507`) and correct for that use only.
 * - **Anchor.** `x`/`y` are the reserved box's own top-left corner —
 *   `labelXY.getPosition()`, which is where upstream draws the marged block
 *   (`SvekEdge.java:951-954`). `label.x`/`label.y` are the drawn TEXT
 *   anchor, one `marginLabel` (plus the ascent, on y) further in.
 *
 * `x`/`y` carry graphviz's own 2-decimal SVG print precision; `width`/
 * `height` do not. See `state-transition-label.ts#svgPrecision`.
 */
export interface LabelInkBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * dss T3e: the inline label of a link that also carries a `note ... on link`, drawn in the same merged
 * block (`SvekEdge.java:307-325,950-954`). `dx`/`dy` are the `<text>` baseline anchor relative to the
 * note's top-left (`TransitionGeo.label.x`/`y`), so every pass's shift of that corner moves the label
 * with it.
 */
export interface LinkLabelGeo {
  readonly text: string;
  readonly dx: number;
  readonly dy: number;
  readonly textLength?: number;
}

export interface TransitionGeo {
  /** stdd T5a: `Link#isHidden` (`Link.java:458-460`): `-[hidden]->` or an end `Entity#isHidden`;
   *  `SvekResult.java:98` draws it through `UHidden`, which keeps only the `UComment`. */
  hidden?: true;
  from: string;
  to: string;
  points: Array<{ x: number; y: number }>;
  /** dss T3f: set on a note's own `Link` when no Opale notch replaces it
   *  (`state-note-layout.ts#noteLinesOf`), its `<path id>`. No decor, dashed. */
  noteLinkId?: string;
  /** `width`/`height` (G8 T2, additive): the jar-verified reserved label
   *  box (`state-transition-label.ts#computeReservedLabelBox`, spec.md §1a
   *  -- margin+floor around the measured text) that both the renderer and
   *  the ink walk (`layout-ink-extent.ts`'s `labelInk` param) need. Absent
   *  for a label built without a font/measurer available (concurrent-region
   *  passes, `state-composite-concurrent.ts`, out of this task's write-set)
   *  -- both consumers already treat absence as "fold the point only",
   *  the pre-existing behavior.
   *
   *  `inkBox` (mission `transition-label-ink`, T3) is what the ink walk
   *  reads instead; see {@link LabelInkBox} for why the two differ. Present
   *  exactly when `width`/`height` are. */
  label?: {
    text: string;
    x: number;
    y: number;
    /** The drawn string's measured width (`SvgGraphics.java:700-706`
     *  `textLength`); absent when the drawn text is not one measured line. */
    textLength?: number;
    width?: number;
    height?: number;
    inkBox?: LabelInkBox;
    /** T4 (`note-on-link`, `state-declared-size-fix`): present exactly when
     *  this label carries a `note ... on link` (`Transition.linkNote`) --
     *  the note's own per-line text/width (mirrors `StateNodeGeo.noteLines`'s
     *  shape/naive-measurement convention, `state-note-layout.ts#measureNote`)
     *  so the renderer draws the real `EntityImageNoteLink`/`ComponentRoseNote`
     *  folded-corner box instead of a plain `<text>` glyph
     *  (`state-renderer-transitions.ts#buildTransitionLabelMarkup`). `x`/`y`
     *  are then the box's own TOP-LEFT corner (no `marginLabel`/ascent
     *  inset -- `SvekEdge.java:741-747`'s `labelText` is the RAW
     *  `EntityImageNoteLink` block when the inline label is empty, `Display
     *  .isNull` -> `EMPTY_TEXT_BLOCK` -> `TextBlockUtils.mergeTB`'s
     *  short-circuit, `:302,318-325`), and `width`/`height`/`inkBox` are the
     *  SAME reserved box `state-dot-graph.ts#computeEdgeLabelBox` already
     *  feeds the DOT graph, so `layout-ink-extent.ts#addTransitionInk`'s
     *  existing `label.inkBox` fold (unchanged by this task) reserves it
     *  for free once populated. `undefined` for an ordinary inline label. */
    noteLines?: readonly StateTextLine[];
    /** stdd T5b -- `Transition.linkNoteColor`, the note's fill (fotigo-12). */
    noteColor?: string;
    /** dss T3e: the inline label drawn beside the note, in the merged block (`SvekEdge.java:307-325`).
     *  Present only with `noteLines` and a non-empty label; then `x`/`y`/`width`/`height` are the NOTE
     *  operand's own box and `inkBox` the union of both operands. */
    linkLabel?: LinkLabelGeo;
    /** dss T3e: the note operand leads the label (`Position.LEFT`/`TOP`, `SvekEdge.java:318-325`), so it
     *  is drawn first. */
    noteFirst?: boolean;
    /** stdd T2c: the label as `SvekEdge.java:287-300` draws it -- `Display.getWithNewlines` lines through
     *  `create0(font, alignment, wrapWidth, SIMPLE_LINE)`, one `TextBlock` line each (runs carry tab
     *  stops and leading-space advances). Absent on a hand-built geometry: the renderer draws `text`. */
    lines?: readonly StateStyledTextLine[];
    /** `getMessageTextAlignment` or the label's own `\l`/`\r` (`Display.java:648-649`). */
    align?: HorizontalAlignment;
    /** The text block's width, the lines' alignment reference. */
    blockWidth?: number;
    /** The first line's ascent: `y` is its baseline, the block top is `y - ascent`. */
    ascent?: number;
    /** `LinkArg.build`'s stripped visibility character and `addVisibilityModifier`'s icon
     *  (`SvekEdge.java:363-374`): `applyVisibilityIcon`'s `size + 2` by `size + 3`. */
    visibility?: { readonly modifier: string; readonly iconWidth: number; readonly iconHeight: number };
  };
  /** mission G4 S7 -- see `StateNodeGeo.creationIndex`'s own doc comment;
   *  same raw-value contract, sourced from `Transition.creationIndex`. */
  creationIndex?: number;
  /** stdd T2a: the raw `-[...]->` bracket, for `Link#applyStyle` at draw time (`state-link-style.ts`). */
  arrowStyle?: string;
  /** stdd T2a: the link's `<<stereotype>>`, the `withTOBECHANGED` tier of the arrow style. */
  stereotype?: string;
  /** stdd T2b: `Link#isInverted` -- a LEFT/UP link replaced by `getInv()` (`CommandLinkStateCommon.java:205-206`,
   *  `Link.java:145-151`). `from`/`to` are then the swapped `cl1`/`cl2` (target first), `points` run that way, and
   *  the decors are `LinkType#getInversed`, so the head sits at the path start. */
  inverted?: true;
  /** stdd T6b: `Link#isAutoLinkOfAGroup` (`Link.java:341-348`), a composite's self-link. `SvekEdge#drawU`
   *  translates the whole link by `cluster.width - (rawStart.x - cluster.minX) + dx` (`SvekEdge.java:863-868`):
   *  the start sits on the cluster's right edge while `calculateDimension` measures (dx 0), and the draw adds
   *  the pass's `moveDelta` once more -- `state-composite-transition-geo.ts#shiftGroupAutoLinks`. */
  groupAutoLink?: true;
  /**
   * mission G4 S15: `Transition.crossStart`/`.circleEnd` (`x-->`/`-->o`
   * arrow decorations, `LinkDecor.CIRCLE_CROSS`/`ARROW_AND_CIRCLE`),
   * threaded through unchanged from the AST -- both pipelines
   * (`layout.ts#buildFlatTransitionGeos`, `state-composite-pass.ts
   * #buildLevelTransitionGeos`) already have the source `Transition` in
   * scope where `TransitionGeo` is built, so this is a pure pass-through,
   * consumed only by `renderer-arrowhead.ts#buildCircleEndMarkup`/
   * `#buildCrossStartMarkup`. `undefined` for every ordinary transition
   * (the overwhelming majority) and for a hand-built test geometry.
   * @see plans/g4-state-svg/ledger.md (S15)
   */
  crossStart?: boolean;
  circleEnd?: boolean;
}
