/**
 * A scope's notes among its siblings, and the note links no Opale notch replaces
 * (dss T3f; split from ./state-note-layout.ts for the 500-line cap).
 *
 * @see ~/git/plantuml/.../svek/GraphvizImageBuilder.java
 * @see ~/git/plantuml/.../svek/SvekEdge.java
 */
import { isOpalisableSpline } from '../../core/svek/image/Opale.js';
import type { TransitionGeo } from './state-geo-types.js';
import type { NoteEdgeCandidate, NoteSpec } from './state-note-layout.js';

/** A leaf-or-group sibling {@link moveNotesToCreationOrder} reads the tick of. */
export interface NoteSibling {
  readonly id: string;
  readonly creationIndex?: number;
}

/**
 * Moves each note ahead of the first sibling created after it: a scope's leafs
 * print to DOT in creation order (`GraphvizImageBuilder.java:348-355`), and a
 * freestanding note is created on pass ONE, among the declarations
 * (`CommandFactoryNote`, the base class's default pass). An attached note, on
 * pass THREE, has no later sibling and stays last. A node no sibling names (a
 * nested cluster's member, a zaent point) is passed over: groups print apart
 * from a scope's leafs.
 */
export function moveNotesToCreationOrder<T>(
  list: T[],
  idOf: (item: T) => string,
  notes: readonly NoteSpec[],
  siblings: readonly NoteSibling[],
): void {
  const ticks = new Map(siblings.map((s) => [s.id, s.creationIndex]));
  for (const note of notes) {
    const tick = note.creationIndex;
    if (tick === undefined) continue;
    const to = list.findIndex((item) => (ticks.get(idOf(item)) ?? -Infinity) > tick);
    if (to < 0) continue;
    const from = list.findIndex((item) => idOf(item) === note.id);
    list.splice(to, 0, ...list.splice(from, 1));
  }
}

/** A drawn note `Link`: {@link noteLinesOf} found no notch for it. */
export interface NoteLine {
  readonly key: string;
  readonly from: string;
  readonly to: string;
  readonly points: { x: number; y: number }[];
  /** `Link#idCommentForSvg` for a link with no decor at either end (`-` separator). */
  readonly svgId: string;
  readonly creationIndex?: number;
}

/** {@link NoteLine} as the geometry the renderer draws, on `points`. */
export function noteLineGeo(line: NoteLine, points: { x: number; y: number }[]): TransitionGeo {
  return {
    from: line.from,
    to: line.to,
    points,
    noteLinkId: line.svgId,
    ...(line.creationIndex !== undefined ? { creationIndex: line.creationIndex } : {}),
  };
}

/**
 * The note links this pass draws as a dashed line: `SvekEdge#drawU` returns early
 * only for an opale line (`SvekEdge.java:833-834`), and `SvekEdge.java:769-770`
 * clears opale on a spline of more than one bezier.
 */
export function noteLinesOf(
  links: readonly NoteEdgeCandidate[],
  edgeOf: (id: string) => { readonly points: { x: number; y: number }[] } | undefined,
  endpointsOf: (id: string) => { readonly from: string; readonly to: string } | undefined,
): NoteLine[] {
  const out: NoteLine[] = [];
  for (const link of links) {
    const edge = edgeOf(link.id);
    if (edge === undefined || (link.opalisable && isOpalisableSpline(edge.points))) continue;
    const ends = endpointsOf(link.id);
    if (ends === undefined) continue;
    out.push({
      key: link.id,
      from: ends.from,
      to: ends.to,
      points: edge.points,
      svgId: link.fromNote ? `${link.gmnName}-${link.target}` : `${link.target}-${link.gmnName}`,
      ...(link.creationIndex !== undefined ? { creationIndex: link.creationIndex } : {}),
    });
  }
  return out;
}
