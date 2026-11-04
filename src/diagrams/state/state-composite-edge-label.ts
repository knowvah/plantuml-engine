/**
 * Transition edge label/xlabel attribute building — split out of
 * ./state-composite-pass.ts (mission A4 Phase L, 500-line file-cap
 * compliance; pure move, zero behavior change) for its own coherent
 * concern: turning a `Transition`'s guard/action/label/note-on-link fields
 * into the DOT edge `label`/`labelWidth`/`labelHeight` (or `xlabel*` under
 * `skinparam linetype ortho`) attributes.
 *
 * @see ~/git/plantuml/.../svek/SvekEdge.java
 */

import type { Transition } from './ast.js';
import type { SpriteRegistry } from '../../core/sprite-registry.js';
import type { FontSpec, StringMeasurer } from '../../core/measurer.js';
import type { DotInputEdge } from '../../core/graph-layout.js';
import type { DiagramCtx } from './state-composite-pass.js';
import type { ReservedLabelBox } from '../../core/edge-label-box.js';
import { measureStateLabelBox } from './state-transition-label.js';
import { computeMergedLabelBox } from '../../core/edge-label-box.js';
// `EntityImageNoteLink`'s real dimension — shared-seam-extraction T6, D1:
// ONE port, `core/svek/image/EntityImageNoteLink.ts`, replacing this file's
// former private copy (was duplicated from ./state-dot-graph.ts to avoid an
// import cycle; the core module has no such cycle, both files import it).
import { measureLinkNoteDim } from '../../core/svek/image/EntityImageNoteLink.js';

/** Guard/action/plain label — same precedence as ./state-dot-graph.ts's
 *  `transitionLabelText` (duplicated to avoid an import cycle: layout.ts
 *  imports ./state-composite-pass.ts; both read the same four `Transition`
 *  fields). */
function transitionLabelOf(t: Transition): string | undefined {
  if (t.label !== undefined) return t.label;
  if (t.guard !== undefined && t.action !== undefined) return `[${t.guard}] / ${t.action}`;
  if (t.guard !== undefined) return `[${t.guard}]`;
  if (t.action !== undefined) return `/ ${t.action}`;
  return undefined;
}

type EdgeAttrs = NonNullable<DotInputEdge['attributes']>;

/** See ./state-dot-graph.ts's `computeEdgeLabelBox` (same split rationale:
 *  keep `edgeLabelAttrs`'s own optional-presence branching separate from
 *  this one's which-formula branching). `halfWidth`/`hasMiddleDecor` are
 *  always false for state — see `core/svek/image/EntityImageNoteLink.ts`'s
 *  doc comment for the `measureLinkNoteDim` citations. */
/** `SvekEdge.java:291-294`'s wrap width and the diagram's sprites, for the label's creole block. */
interface LabelWrap {
  readonly maxWidth: number | undefined;
  readonly sprites: SpriteRegistry | undefined;
}

function computeEdgeLabelBox(
  t: Transition,
  text: string | undefined,
  font: FontSpec,
  measurer: StringMeasurer,
  wrap: LabelWrap,
): ReservedLabelBox {
  // stdd T2c/T3a: the box is the creole block's (`measureStateLabelBox`), sprites included.
  if (t.linkNote === undefined) return measureStateLabelBox(text!, font, measurer, t.from === t.to, wrap);
  const { maxWidth } = wrap;
  return computeMergedLabelBox({
    label: text ?? '',
    noteDim: measureLinkNoteDim(t.linkNote, { family: font.family }, measurer),
    position: t.linkNotePosition ?? 'bottom',
    halfWidth: false,
    hasMiddleDecor: false,
    font,
    measurer,
    maxWidth,
  });
}

/** Both `labelWidth`/`labelHeight` (DOT-gate) and `labelBoxWidth`/
 *  `labelBoxHeight` (the real `@knowvah/dot-engine` layout input) are set
 *  together from the same box, including when a `note on link` is attached
 *  — T9 closes the gap the prior "merged label+note margin story is still
 *  unverified" comment named; see `computeEdgeLabelBox`. */
function edgeLabelAttrs(t: Transition, font: FontSpec, measurer: StringMeasurer, wrap: LabelWrap): EdgeAttrs {
  const text = transitionLabelOf(t);
  if (text === undefined && t.linkNote === undefined) return {};
  const box = computeEdgeLabelBox(t, text, font, measurer, wrap);
  return {
    label: text ?? t.linkNote ?? '',
    labelWidth: box.reservedWidth,
    labelHeight: box.reservedHeight,
    labelBoxWidth: box.reservedWidth,
    labelBoxHeight: box.reservedHeight,
  };
}

/** Under `skinparam linetype ortho`, svek routes the main edge label through
 *  `xlabel` instead of `label` (SvekEdge.java:434-441) — duplicated from
 *  ./state-dot-graph.ts's `moveLabelToXlabel` (D1). */
function moveLabelToXlabel(attrs: EdgeAttrs): void {
  if (attrs.label === undefined) return;
  attrs.xlabel = attrs.label;
  attrs.xlabelWidth = attrs.labelWidth!;
  attrs.xlabelHeight = attrs.labelHeight!;
  delete attrs.label;
  delete attrs.labelWidth;
  delete attrs.labelHeight;
}

export function buildEdgeAttrs(t: Transition, font: FontSpec, ctx: DiagramCtx): EdgeAttrs {
  const attrs: EdgeAttrs = {
    minLen: (t.length ?? 2) - 1,
    // G20: same expression as `ctx.theme.linetype` below (D3 precedent).
    ...edgeLabelAttrs(t, font, ctx.measurer, { maxWidth: ctx.theme.maxMessageSize, sprites: ctx.theme.sprites }),
  };
  if (ctx.theme.linetype === 'ortho') moveLabelToXlabel(attrs);
  return attrs;
}
