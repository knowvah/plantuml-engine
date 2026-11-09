/**
 * The notes `GraphvizImageBuilder#buildImage` opalises: a `note` leaf with exactly one visible link, to a non-note,
 * is drawn notched towards that entity and its link is not drawn (`SvekEdge#drawU` returns when `opale`). The link
 * stays plain when its spline is more than one bezier (`SvekEdge.java:769-770, 804-806`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/GraphvizImageBuilder.java:130-148, 216-229, 313-326
 */
import type { Entity } from '../../core/abel/Entity.js';
import { LeafType } from '../../core/abel/LeafType.js';
import { buildDotPathFromSplinePoints } from '../../core/svek/svek-edge-geometry.js';
import { EntityImageNote } from '../../core/svek/image/EntityImageNote.js';
import type { ActivityLegacyEdgeGeo, ActivityLegacyGeometry, ActivityLegacyNodeGeo } from './layout.js';
import type { ActivityLegacySkinParam } from './activity-legacy-skin-param.js';

/** `SvekEdge#isOpalisable`: `dotPath.getBeziers().size() <= 1`; a spline is `1 + 3n` points. */
const SINGLE_BEZIER_POINTS = 4;

/** `onlyOneLink`. @see GraphvizImageBuilder.java:313-326 */
function onlyOneLink(entity: Entity, edges: readonly ActivityLegacyEdgeGeo[]): ActivityLegacyEdgeGeo | undefined {
  let single: ActivityLegacyEdgeGeo | undefined;
  for (const edge of edges) {
    if (edge.link.isInvis() || !edge.link.contains(entity)) continue;
    if (single !== undefined) return undefined;
    single = edge;
  }
  return single;
}

/** `isOpalisable(entity)`. @see GraphvizImageBuilder.java:130-148 */
function isOpalisable(
  entity: Entity,
  edges: readonly ActivityLegacyEdgeGeo[],
  skinParam: ActivityLegacySkinParam,
): boolean {
  if (skinParam.strictUmlStyle() || entity.isGroup() || entity.getLeafType() !== LeafType.NOTE) return false;
  const single = onlyOneLink(entity, edges);
  return single !== undefined && single.link.getOther(entity).getLeafType() !== LeafType.NOTE;
}

function bind(node: ActivityLegacyNodeGeo, edge: ActivityLegacyEdgeGeo): boolean {
  if (!(node.image instanceof EntityImageNote)) return false;
  const opale = edge.points.length <= SINGLE_BEZIER_POINTS;
  node.image.setOpaleLine({
    isOpale: () => opale,
    getDotPath: () => buildDotPathFromSplinePoints(edge.points),
    nodeMin: { x: node.x, y: node.y },
  });
  return opale;
}

/** Binds every opalisable note to its link; answers the links that are not drawn. */
export function bindOpaleNotes(
  geometry: ActivityLegacyGeometry,
  skinParam: ActivityLegacySkinParam,
): ReadonlySet<ActivityLegacyEdgeGeo> {
  const hidden = new Set<ActivityLegacyEdgeGeo>();
  const nodeOf = (entity: Entity): ActivityLegacyNodeGeo | undefined => geometry.nodes.find((n) => n.entity === entity);
  for (const edge of geometry.edges) {
    for (const entity of [edge.link.getEntity1(), edge.link.getEntity2()]) {
      if (!isOpalisable(entity, geometry.edges, skinParam)) continue;
      const node = nodeOf(entity);
      if (node !== undefined && bind(node, edge)) hidden.add(edge);
      break;
    }
  }
  return hidden;
}
