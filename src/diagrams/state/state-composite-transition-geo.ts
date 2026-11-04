/**
 * state-composite-transition-geo.ts — one pass's `TransitionGeo`s, built from
 * its `DotLayoutResult`: the un-swap of `reversed` edges, the unclipped label
 * placement, and `DotStringFactory#solve`'s edge loop (the compound clip, in
 * `allLines()` order — `state-transition-clip.ts#clipLinesInSolveOrder`).
 * Split out of `state-composite-pass.ts` (500-line file cap, lgm T1b); that
 * module re-exports {@link buildLevelTransitionGeos}, so no importer changed.
 */

import type { DotLayoutResult } from '../../core/graph-layout.js';
import type { Transition } from './ast.js';
import type { PassAccumulator } from './state-composite-pass-types.js';
import type { TransitionGeo } from './state-geo-types.js';
import { sortSpecsByCreationIndex } from './state-composite-pseudo.js';
import { attachTransitionLabel } from './state-transition-label.js';
import { clipLinesInSolveOrder, clusterAnchorRectsOf } from './state-transition-clip.js';
import { shiftTransition } from './state-composite-geo-shift.js';
import { noteLineGeo, noteLinesOf } from './state-note-lines.js';

/** Fully-labeled TransitionGeo for one pass's own edges — in that pass's OWN
 *  (possibly locally-rooted, pre-shift) coordinate space. Exported for reuse
 *  by ./state-composite-geo.ts's top-level assembly (same helper, no need
 *  for a second copy at the geometry layer).
 *
 *  G5 C5 (edge/link document order, a sub-finding of ledger §C3's item 1
 *  "document order" -- same Java read, same fixture): `acc.edgeSources`'
 *  own push order is NOT jar's real edge-draw order once a `'cluster'`-
 *  classified composite's OWN internal transitions get swept into THIS
 *  SAME pass (mechanism 16's own "a cluster shares its container pass's
 *  edges" rule, `state-composite-geo.ts#materializeCluster`'s doc comment)
 *  -- `resolveMember`'s recursive walk resolves a cluster's OWN scope
 *  (pushing ITS internal edges) BEFORE `buildTopLevelPass`'s own explicit
 *  `addLevelEdges('', ast.transitions, ...)` call for the CONTAINING
 *  scope's edges, so a cluster's internal edge lands in `acc.edges` BEFORE
 *  an OUTER edge that was declared (and jar-created) EARLIER. Jar's real
 *  rule (`~/git/plantuml/.../svek/GraphvizImageBuilder.java:229`, `for
 *  (Link link : dotData.getLinks()) { ...; addLine(line); }`, run AFTER
 *  `printGroups`/`printEntities` -- `Bibliotekon.java`'s own `allLines`
 *  `ArrayList` is a pure registration-order list, mirroring `allCluster`/
 *  `allNodes`) draws EVERY edge in ONE pass, in `dotData.getLinks()`'s own
 *  parse-time creation order -- jar-verified `gojuja-90-pune699`: `*start*-
 *  to-A` (`[*] --> A`, declared/created line 3) draws BEFORE `*start*A-to-
 *  Configuring` (`A`'s own internal `[*] --> Configuring`, declared line 6,
 *  inside `A`), even though `A`'s internal edge is resolved FIRST by this
 *  port's own `resolveMember` walk. `sortSpecsByCreationIndex` (this SAME
 *  file's own top-level sibling function) applies unchanged -- edges
 *  without a `creationIndex` sort to the end, preserving their pre-existing
 *  relative order (mirrors that function's own doc comment).
 *
 *  G7 T12: a `reversed` edgeSource (`isReversedDirection` above) had its DOT
 *  `from`/`to` swapped so graphviz ranks the semantic target above the
 *  semantic source; `edgeResult.points`/the resolved endpoint ids are
 *  un-swapped back to semantic source->target order HERE, before building
 *  the `TransitionGeo`, so every downstream consumer (`renderer-arrowhead
 *  .ts`'s `points[0]`=source/`points[length-1]`=target convention,
 *  `attachTransitionLabel`'s perpendicular-offset formula, the renderer's
 *  `<path id>` construction) keeps its existing contract unchanged -- none
 *  of those files are in this task's write-set. Reversing a well-formed
 *  `1+3n` flat cubic-bezier point list end-to-end (`[...points].reverse()`)
 *  yields the mathematically identical curve traversed backward (each
 *  segment's two control points are adjacent in the flat list, so a global
 *  reverse also correctly swaps each segment's own control-point order) --
 *  the rendered curve is visually IDENTICAL to jar's, but not byte-identical
 *  to jar's own literal `<path d>` text: jar keeps the DOT-native point
 *  order and instead swaps WHICH end draws the arrowhead decoration
 *  (`SvekEdge.java:702-709`: `getDecor2()` at the DOT tail,`getDecor1()` at
 *  the DOT head). Verified against `kotagu-43-miza629`'s real jar SVG
 *  (`test-results/dot-cache/state/kotagu-43-miza629/in.svg`): the
 *  `<!--reverse link SubComposite to *start*CompositeState-->` path's `d`
 *  starts near SubComposite (DOT tail) and ends near `[*]` (DOT head), with
 *  the arrowhead polygon at the SubComposite (start) end -- this port's own
 *  un-reversed-back point order instead starts at `[*]` (semantic source)
 *  and ends at SubComposite (semantic target), keeping the EXISTING
 *  points[length-1]-is-target arrowhead convention correct without touching
 *  the renderer. Flagged as a known, deliberate divergence from jar's exact
 *  SVG bytes for a follow-up SVG-focused task once these fixtures become
 *  pin candidates (none of the 57 currently-pinned svg-state goldens use a
 *  `-left-`/`-up-`/bare-reverse-arrow transition, so this divergence is
 *  invisible to every currently-pinned fixture). */
type EdgePoints = DotLayoutResult['edges'][number]['points'];

/** G7 T12 helper (extracted from `buildLevelTransitionGeos` to stay under the
 *  project's per-function CCN cap -- pure data reshaping, no new behavior):
 *  un-swaps a `reversed` edgeSource's routed points + resolved endpoint ids
 *  back to semantic source->target order -- see `buildLevelTransitionGeos`'s
 *  own doc comment for the full jar-verified derivation. */
function resolveTransitionGeometry(
  reversed: boolean | undefined,
  points: EdgePoints,
  resolved: { from: string; to: string } | undefined,
  nodeRects: ReadonlyMap<string, { x: number; y: number; width: number; height: number }>,
): { points: EdgePoints; from: string | undefined; to: string | undefined; inverted: boolean } {
  // stdd T2b: no un-swap. `Link#getInv` (`Link.java:145-151`) made the target `cl1`; the DOT edge and
  // the `dotPath` run `cl1 -> cl2`, and the renderer draws the head at the start from the inversed
  // decors (`SvekEdge.java:680-684`). Only graphviz's own inversion is undone (`SvekEdge.java:640-655`).
  const node1 = resolved === undefined ? undefined : nodeRects.get(resolved.from);
  const node2 = resolved === undefined ? undefined : nodeRects.get(resolved.to);
  return {
    points: undoGraphvizInversion(points, node1, node2),
    from: resolved?.from,
    to: resolved?.to,
    inverted: reversed === true,
  };
}

/**
 * `SvekEdge#solveLine` (`SvekEdge.java:640-655`): "Sometime, GraphViz inverses the result line" -- when both
 * ends are nodes and the path's start lies nearer node 2's centre than node 1's, the path is reversed.
 */
export function undoGraphvizInversion(
  points: EdgePoints,
  node1: { x: number; y: number; width: number; height: number } | undefined,
  node2: { x: number; y: number; width: number; height: number } | undefined,
): EdgePoints {
  if (node1 === undefined || node2 === undefined || points.length < 2) return points;
  const start = points[0]!;
  const end = points[points.length - 1]!;
  const c1 = { x: node1.x + node1.width / 2, y: node1.y + node1.height / 2 };
  const c2 = { x: node2.x + node2.width / 2, y: node2.y + node2.height / 2 };
  const normal = Math.hypot(start.x - c1.x, start.y - c1.y) + Math.hypot(end.x - c2.x, end.y - c2.y);
  const inversed = Math.hypot(start.x - c2.x, start.y - c2.y) + Math.hypot(end.x - c1.x, end.y - c1.y);
  return inversed < normal ? [...points].reverse() : points;
}

/** One routed transition of a pass, endpoints in DOT (`cl1 -> cl2`) order —
 *  what `buildLevelTransitionGeos` clips and then turns into a `TransitionGeo`. */
interface PreparedTransition {
  t: Transition;
  edgeId: string;
  edgeResult: DotLayoutResult['edges'][number];
  points: EdgePoints;
  from: string;
  to: string;
  inverted: boolean;
}

const creationOf = (t: Transition): { creationIndex?: number } =>
  t.creationIndex !== undefined ? { creationIndex: t.creationIndex } : {};

function buildTransitionGeo(acc: PassAccumulator, p: PreparedTransition, clippedPoints: EdgePoints): TransitionGeo {
  const { t, edgeResult, from, to } = p;
  // D1'a: the label is attached from the UNCLIPPED points, and only the
  // points STORED on the geo are clipped. Upstream's label position is
  // `getXY(fullSvg, noteLabelColor)` (`SvekEdge.java:742-746`) -- read out
  // of the graphviz SVG, never derived from `dotPath` -- so a
  // path-independent label is the faithful outcome. This port's
  // `attachInlineTransitionLabel` falls back to
  // `perpendicularOffsetLabel(points)` when no measurer is present
  // (`state-transition-label.ts:386-394`), and that arm is real (the
  // concurrent-region passes build their accumulator without one), so
  // feeding it the clipped path would invent a dependency upstream has not.
  const label = attachTransitionLabel(
    t,
    p.points,
    edgeResult,
    acc.labelFont !== undefined && acc.measurer !== undefined
      ? {
          font: acc.labelFont,
          measurer: acc.measurer,
          ...(acc.labelStyle !== undefined ? { style: acc.labelStyle } : {}),
        }
      : undefined,
  );
  return {
    from,
    to,
    points: clippedPoints,
    ...(label !== undefined ? { label } : {}),
    ...(t.creationIndex !== undefined ? { creationIndex: t.creationIndex } : {}),
    ...(t.arrowStyle !== undefined ? { arrowStyle: t.arrowStyle } : {}),
    ...(t.stereotype !== undefined ? { stereotype: t.stereotype } : {}),
    ...(p.inverted ? { inverted: true as const } : {}),
    ...(t.crossStart !== undefined ? { crossStart: t.crossStart } : {}),
    ...(t.circleEnd !== undefined ? { circleEnd: t.circleEnd } : {}),
  };
}

export function buildLevelTransitionGeos(acc: PassAccumulator, result: DotLayoutResult): TransitionGeo[] {
  const edgePosMap = new Map(result.edges.map((e) => [e.id, e]));
  // mission G4 S7 (discovered while jar-verifying mechanism 10's own fix,
  // `nelupe-49-xova546`): a `'[*]'` transition's RESOLVED scope-local
  // pseudo-anchor id (`__init_<scopeId>`/`__final_<scopeId>`,
  // `levelEndpointId` above) already lives on `acc.edges` (`addLevelEdges`/
  // `sweepOrphanEdges` both resolve before pushing) -- reading `t.from`/
  // `t.to` directly off the ORIGINAL `Transition` instead re-introduces the
  // raw `'[*]'` AST token into `svgEndpointId`'s `<path id>` build
  // (renderer.ts), which only recognizes the FLAT pipeline's own
  // `INITIAL_ID`/`FINAL_ID` constants -- jar-verified
  // `id="*start*s7_2-to-chat1"` (expected) vs `id="[*]-to-chat1"` (this
  // port, pre-fix).
  const edgeEndpoints = new Map(acc.edges.map((e) => [e.id, { from: e.from, to: e.to }]));
  // SI32 T2 (D1'/D2'): `clipLinesInSolveOrder` IS `DotStringFactory#solve`'s
  // own edge loop (`DotStringFactory.java:465-466`), scoped -- as upstream's
  // is -- to ONE graphviz layout result, and run in `allLines()` order (lgm
  // T1b: each line's `projectionCluster.manageEntryExitPoint` mutates the
  // cluster rectangle the next line clips against, `SvekEdge.java:660-672`).
  // The clip is `SvekEdge#solveLine`'s `simulateCompound` reassignment; see
  // `state-transition-clip.ts` for the per-nesting-level derivation and the
  // two sibling passes (`alignEdgesAtLabelNodes`, `manageCollision`).
  const nodeRects = new Map(result.nodes.map((n) => [n.id, n]));
  const prepared: PreparedTransition[] = [];
  for (const { t, edgeId, reversed } of acc.edgeSources) {
    const edgeResult = edgePosMap.get(edgeId);
    if (edgeResult === undefined) continue;
    const geo = resolveTransitionGeometry(reversed, edgeResult.points, edgeEndpoints.get(edgeId), nodeRects);
    prepared.push({
      t,
      edgeId,
      edgeResult,
      points: geo.points,
      from: geo.from ?? t.from,
      to: geo.to ?? t.to,
      inverted: geo.inverted,
    });
  }
  const noteLines = noteLinesOf(
    acc.noteLinks ?? [],
    (id) => edgePosMap.get(id),
    (link) => edgeEndpoints.get(link),
  );
  const lines = [
    ...prepared.map((p) => ({ key: p.edgeId, from: p.from, to: p.to, points: p.points, ...creationOf(p.t) })),
    ...noteLines,
  ];
  const clipped = clipLinesInSolveOrder(acc, result, lines);
  const anchorRects = clusterAnchorRectsOf(acc.clusters, result);
  const geos = prepared.map((p) => placeGroupAutoLink(buildTransitionGeo(acc, p, clipped.get(p.edgeId)!), anchorRects));
  return sortSpecsByCreationIndex([...geos, ...noteLines.map((l) => noteLineGeo(l, clipped.get(l.key)!))]);
}

/** stdd T6b: `Link#isAutoLinkOfAGroup` (`Link.java:341-348`). `SvekEdge#drawU` translates the link by
 *  `cl.getRectangleArea().getWidth() - (dotPath.getStartPoint().getX() - cl.getRectangleArea().getMinX())`
 *  (`SvekEdge.java:863-868`): while `SvekResult#calculateDimension` measures, `dx` is 0 and the cluster
 *  unmoved, so the start lands on the cluster's right edge -- that is this pass-frame placement, which the
 *  ink walks see. The draw reads the MOVED cluster against the RAW start, adding the pass's `moveDelta`
 *  once more: {@link shiftGroupAutoLinks}, applied where that delta is known. polodo-05's `Failed`. */
function placeGroupAutoLink(
  geo: TransitionGeo,
  anchorRects: ReadonlyMap<string, { readonly x: number; readonly width: number }>,
): TransitionGeo {
  if (geo.from !== geo.to) return geo;
  const rect = anchorRects.get(geo.from);
  const start = geo.points[0];
  if (rect === undefined || start === undefined) return geo;
  return { ...shiftTransition(geo, rect.x + rect.width - start.x, 0), groupAutoLink: true };
}

/** The second `dx` of `SvekEdge.java:863-869` for every {@link TransitionGeo.groupAutoLink}: `passDx` is the
 *  pass's `moveDelta` in this port's frame, and the jar's own is `passDx - originShiftX`, the raw svek frame
 *  being this frame plus `DotLayoutResult.originShift` (`StateGeometry.originShift`'s doc). */
export function shiftGroupAutoLinks(
  transitions: readonly TransitionGeo[],
  passDx: number,
  originShiftX: number,
): TransitionGeo[] {
  const extra = passDx - originShiftX;
  if (extra === 0) return [...transitions];
  return transitions.map((t) => (t.groupAutoLink === true ? shiftTransition(t, extra, 0) : t));
}
