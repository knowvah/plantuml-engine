/**
 * The layout side of a `leafType` leaf (decisions D2): its DOT node, sized by the image the renderer draws
 * (`description-entity-image.ts`), and the fields the geo tree carries to the renderer.
 *
 * A json or map leaf is `ShapeType.RECTANGLE_HTML_FOR_PORTS` (`EntityImageJson.java:240-242`,
 * `EntityImageMap.java:245-247`), which `SvekNode` writes as a `shape=plaintext` row table with no width or height
 * (`SvekNode.java:268-296`): one cell for a json, a band per key for a map. `portRows` selects that emission, as the
 * class engine's json and map do (`class-port-rows.ts`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/SvekNode.java:132-137,268-296
 */
import type { DotInputNode } from '../../core/graph-layout.js';
import type { StringMeasurer } from '../../core/measurer.js';
import { MeasurerStringBounder } from '../../core/measurer-bounder.js';
import type { DescriptiveNode } from './ast.js';
import type { DescriptiveLink } from './ast.js';
import type { DotInputEdge } from '../../core/graph-layout.js';
import { EntityImageMap } from '../../core/svek/image/EntityImageMap.js';
import { EntityImageJson } from '../../core/svek/image/EntityImageJson.js';
import { ShapeType } from '../../core/svek/ShapeType.js';
import { Ports } from '../../core/svek/Ports.js';
import { leafTypeImageFor, type LeafImageEnv } from './description-entity-image.js';
import type { DescriptionNodeGeo } from './layout-helpers-types.js';

/** A `leafType` leaf's size from its image, or `undefined` for any other leaf. The degenerate single-leaf path reads
 *  it too: `EntityImageDegenerated` wraps whatever image `GeneralImageBuilder` built (`EntityImageDegenerated.java`). */
export function leafTypeDims(
  node: DescriptiveNode,
  env: LeafImageEnv,
  measurer: StringMeasurer,
): { width: number; height: number } | undefined {
  const image = leafTypeImageFor(node, env);
  if (image === undefined) return undefined;
  const dim = image.calculateDimension(new MeasurerStringBounder(measurer));
  return { width: dim.getWidth(), height: dim.getHeight() };
}

/** The DOT node of a `leafType` leaf, or `undefined` for any other leaf (it keeps `measureLeafNode`). */
export function leafTypeDotNode(
  id: string,
  node: DescriptiveNode,
  env: LeafImageEnv,
  measurer: StringMeasurer,
): DotInputNode | undefined {
  const image = leafTypeImageFor(node, env);
  if (image === undefined) return undefined;
  const bounder = new MeasurerStringBounder(measurer);
  const dim = image.calculateDimension(bounder);
  // A Problem Frames image is `ShapeType.RECTANGLE` (a plain rect) or, for a requirement, `OVAL`
  // (`EntityImageRequirement.java:147-149`), which `SvekNode` writes as `shape=ellipse`.
  if (!(image instanceof EntityImageMap) && !(image instanceof EntityImageJson)) {
    const oval = image.getShapeType() === ShapeType.OVAL;
    return { id, width: dim.getWidth(), height: dim.getHeight(), ...(oval ? { shape: 'ellipse' as const } : {}) };
  }
  // `TextBlockCucaJSon#getPorts` is empty; `EntityImageMap#getPorts` is one band per key (`EntityImageMap.java:116-119`).
  const ports = image instanceof EntityImageMap ? image.getPorts(bounder).getAllPortGeometry() : [];
  const portRows = ports.map((g) => ({ id: g.getId(), position: g.getPosition(), height: g.getHeight() }));
  return { id, width: dim.getWidth(), height: dim.getHeight(), shape: 'plaintext', portRows };
}

/** Copies the `leafType` payload onto the leaf's geo node. */
export function copyLeafType(astNode: DescriptiveNode, geo: DescriptionNodeGeo): void {
  if (astNode.leafType !== undefined) geo.leafType = astNode.leafType;
  if (astNode.jsonValue !== undefined) geo.jsonValue = astNode.jsonValue;
  if (astNode.mapBodier !== undefined) geo.mapBodier = astNode.mapBodier;
}

/** The attribute bag every description edge carries. */
type EdgeAttributes = NonNullable<DotInputEdge['attributes']>;

/** Copies a group's `declaredAsGroup` and `groupType` onto its geo node. */
export function copyGroupFields(astNode: DescriptiveNode, geo: DescriptionNodeGeo): void {
  if (astNode.declaredAsGroup === true) geo.declaredAsGroup = true;
  if (astNode.groupType !== undefined) geo.groupType = astNode.groupType;
}

/**
 * A link that leaves a map row (`link.setPortMembers(key, null)`) tails at that row's port: `SvekEdge` writes the
 * tail as `sh:port` (`Link.java:219-231`, `svek-dot-emit.ts#edgeRef`).
 */
export function withTailPort(link: DescriptiveLink, attributes: EdgeAttributes): EdgeAttributes {
  if (link.tailPortMember === undefined) return attributes;
  return { ...attributes, tailport: Ports.encodePortNameToId(link.tailPortMember) };
}
