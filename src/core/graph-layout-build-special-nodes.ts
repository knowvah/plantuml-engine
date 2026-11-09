/**
 * The layout copies of the HTML-label node shapes (row ports, shield tables, records), split out of
 * ./graph-layout-build.ts for its 500-line cap (laep T3b-2; a pure move, no behavior change).
 */
import type { GvGraphBuilder } from '@knowvah/dot-engine';
import type { DotInputNode } from './graph-layout.types.js';
import { rowPortTable, shieldTable } from './svek-dot-emit-labels.js';
import { inches } from './svek-dot-emit.js';

/** Sizing-irrelevant BGCOLOR for the layout copy of a row-port table — see
 *  {@link addRowPortNode}. */
export const LAYOUT_LABEL_BGCOLOR = 0;

/**
 * B1/M4: a `RECTANGLE_HTML_FOR_PORTS` node, laid out the way the jar's DOT
 * makes graphviz lay it out — `shape=plaintext` carrying the SAME HTML row
 * table `svek-dot-emit.ts` writes, and **no `width`/`height`/`fixedsize` at
 * all** (`SvekNode#appendLabelHtmlSpecialForLink`, svek/SvekNode.java:268-296,
 * emits none). That omission is the whole mechanism: with a real label and no
 * fixed size, `poly_init` pads the label by `PAD` (4·GAP wide, 2·GAP tall) and
 * floors the result at the 54x36 minimum, which the previous
 * `fixedsize`+empty-label fold suppressed.
 *
 * Jar-verified against real graphviz 15.1.1 on the oracle DOT: a 49x18 label
 * becomes a 65x36 node (`gatefi-65-curu360`, M4's sole-cause isolate); 65.94x36
 * → 81x44; 69.49x68 → 85x76; 151.4x72 → 167x80.
 *
 * The engine exposes this directly — `GvNode#setHtmlAttr` tags the value as
 * HTML exactly as `label=<...>` does in DOT text, so no adapter seam is needed
 * (same public seam `addClusters` already uses for cluster title tables).
 *
 * @see ~/git/graphviz/lib/common/shapes.c:1993-2009 (PAD application)
 * @see ~/git/graphviz/lib/common/const.h:251 (GAP = 4)
 */
export function addRowPortNode(b: GvGraphBuilder, n: DotInputNode): void {
  const node = b.addNode(n.id, { shape: 'plaintext' });
  // The table's BGCOLOR is a paint attribute the jar fills from its
  // ColorSequence; it is invisible to sizing, and layout never renders this
  // label, so the emitter's sequence is deliberately not reproduced here.
  node.setHtmlAttr('label', rowPortTable(n, n.portRows ?? [], LAYOUT_LABEL_BGCOLOR));
}

/**
 * cdd-T15 (D6): a qualified class end, laid out exactly as the jar's own
 * DOT makes graphviz lay it out -- `shape=plaintext` carrying the SAME
 * shield table `svek-dot-emit.ts` writes, with no `width`/`height`/
 * `fixedsize` (`SvekNode#appendLabelHtml`, svek/SvekNode.java:245-267,
 * emits none), so `poly_init` pads the table by `PAD` and the `Kal` margin
 * cells really do push the neighbouring rank away -- the same mechanism
 * {@link addRowPortNode} documents one function up. The declared box is
 * recovered in `graph-layout.ts#mapNodes`, which also re-derives the corner
 * from the ASYMMETRIC table (see `DotInputNode.shieldMargins`).
 */
export function addShieldNode(b: GvGraphBuilder, n: DotInputNode): void {
  b.addNode(n.id, { shape: 'plaintext' }).setHtmlAttr('label', shieldTable(n, LAYOUT_LABEL_BGCOLOR));
}

/** A5/T7: the one shape sized from its LABEL rather than the caller's
 *  measured box -- graphviz derives the field grid (and the `<Pn>` ports
 *  edges target) from the record syntax, with width/height as minimums.
 *  Deliberately NO `fixedsize`, matching `SmetanaForJson#createNode`
 *  (`SmetanaForJson.java:233-262`), which would otherwise collapse the very
 *  fields the ports live on. Its own function only so {@link addOneNode}
 *  keeps its pre-cdd-T15 NLOC once the shield branch joined it. */
export function addRecordNode(b: GvGraphBuilder, n: DotInputNode, label: string): void {
  b.addNode(n.id, { shape: 'record', label, width: inches(n.width), height: inches(n.height) });
}
