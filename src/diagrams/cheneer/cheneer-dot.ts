/**
 * The DOT input of a Chen EER diagram: `GraphvizImageBuilder#buildImage`'s `printEntities` (one `SvekNode` per
 * leaf, in leaf order) and the `SvekEdge` of each link of `getOrderedLinks`, handed to the one dot-engine seam as a
 * `DotInputGraph`. It is what the DOT-parity gate observes (`setLayoutInputObserver`) against the jar's
 * `svek-1.dot`. Adapted from `activity-legacy/activity-legacy-dot.ts` (cheneer D2): Chen has no groups, notes,
 * partitions or clusters (`ChenEerDiagramFactory.java:58-69`), so `printGroups`, the cluster tables and the note
 * labels have no counterpart. A link to a group is a `Cluster.CENTER_ID` endpoint: `getCluster2` throws, as the jar does.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/GraphvizImageBuilder.java:157-256, 424-451
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/DotStringFactory.java
 */
import type { Entity } from '../../core/abel/Entity.js';
import type { Link } from '../../core/abel/Link.js';
import type { DotInputEdge, DotInputGraph, DotInputNode, DotInputNodeShape } from '../../core/graph-layout.types.js';
import { Rankdir } from '../../core/klimt/geom/Rankdir.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { PragmaKey } from '../../core/skin/PragmaKey.js';
import { createEntityImageBlockInternal, type LegacyLeafImage } from '../../core/svek/GeneralImageBuilder.js';
import type { NodePolygons } from '../../core/svek/image/EntityImageActivity.js';
import { ShapeType } from '../../core/svek/ShapeType.js';
import type { ChenEerDiagram } from './ChenEerDiagram.js';
import { buildEdgeTexts, type ChenEdgeTexts } from './cheneer-edge-text.js';
import { getOrderedLinks } from './cheneer-links.js';
import { getSeparators } from './cheneer-spacing.js';

/** `SvekNode#getPolygon` for a Chen leaf: none reads it (`EntityImageActivity`'s octagon is the only reader). */
export const NO_POLYGONS: NodePolygons = { getNode: () => ({ getPolygon: () => undefined }) };

/** What the DOT build reads: the diagram and the measuring seam. */
export interface ChenDotContext {
  readonly diagram: ChenEerDiagram;
  readonly stringBounder: StringBounder;
}

/** One `SvekNode`: the leaf, its image and the size the DOT gave graphviz. */
export interface ChenDotNode {
  readonly id: string;
  readonly entity: Entity;
  readonly image: LegacyLeafImage;
  readonly width: number;
  readonly height: number;
}

/** One `SvekEdge`: the link and its texts. */
export interface ChenDotEdge {
  readonly id: string;
  readonly link: Link;
  readonly texts: ChenEdgeTexts;
}

/** The result of {@link buildChenDot}. */
export interface ChenDot {
  readonly graph: DotInputGraph;
  readonly nodes: readonly ChenDotNode[];
  readonly edges: readonly ChenDotEdge[];
}

/** `SvekNode#appendShapeInternal`: the DOT shape of an image's `ShapeType`. @see SvekNode.java:327-350 */
export function dotShapeOf(type: ShapeType): DotInputNodeShape {
  if (type === ShapeType.RECTANGLE) return 'rect';
  if (type === ShapeType.DIAMOND) return 'diamond';
  if (type === ShapeType.OVAL) return 'ellipse';
  if (type === ShapeType.CIRCLE) return 'circle';
  throw new Error(`unported: SvekNode shape ${type}`);
}

/** The DOT id of an entity: its uid (`Bibliotekon#getNodeUid` is `sh%04d` of the colour sequence). */
function nodeIdOf(entity: Entity): string {
  return entity.getUid();
}

/** `DotData#getLeafs` filtered by `getUnpackagedEntities`. @see GraphvizImageBuilder.java:473-480 */
function getUnpackagedEntities(diagram: ChenEerDiagram): Entity[] {
  return diagram.leafs().filter((ent) => ent.getParentContainer() === diagram.getRootGroup());
}

/** `printEntities`/`printEntity`. @see GraphvizImageBuilder.java:424-451 */
function printEntities(ctx: ChenDotContext, entities: readonly Entity[]): ChenDotNode[] {
  const nodes: ChenDotNode[] = [];
  for (const ent of entities) {
    if (ent.isRemoved()) continue;

    const image = createEntityImageBlockInternal(ent, ctx.diagram.getSkinParam(), NO_POLYGONS, ctx.diagram);
    const dim = image.calculateDimension(ctx.stringBounder);
    nodes.push({ id: nodeIdOf(ent), entity: ent, image, width: dim.getWidth(), height: dim.getHeight() });
  }
  return nodes;
}

/**
 * `getCluster2`: the cluster whose groups hold `entityMutable`. Chen opens no cluster (its factory has no group
 * command, `ChenEerDiagramFactory.java:58-69`), so `bibliotekon.allCluster()` is empty and it always throws: a link to
 * the root (`{ A, }` resolves "" to it) crashes the jar, because `buildImage` catches only `IllegalStateException`
 * (GraphvizImageBuilder.java:260).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/SvekEdge.java:219-225
 */
function getCluster2(entityMutable: Entity): never {
  throw new Error(`IllegalArgumentException: SvekEdge#getCluster2 (${entityMutable.getName()})`);
}

/**
 * The `SvekEdge` constructor's endpoint step: `getNodeUid` throws `IllegalStateException` for a leaf with no node,
 * which `buildImage` catches, logs and drops (answered `false` here); a group answers `Cluster.getSpecialPointId`,
 * whose `CENTER_ID` sends the constructor to {@link getCluster2} (ltail first, then lhead).
 * @see Bibliotekon.java:124-138, SvekEdge.java:249-256, GraphvizImageBuilder.java:226-262
 */
function isDrawable(link: Link, placed: ReadonlySet<Entity>): boolean {
  const entity1 = link.getEntity1();
  const entity2 = link.getEntity2();
  if (!placed.has(entity1) && !entity1.isGroup()) return false;
  if (!placed.has(entity2) && !entity2.isGroup()) return false;
  if (entity1.isGroup()) getCluster2(entity1);
  if (entity2.isGroup()) getCluster2(entity2);
  return true;
}

/** The label's lines, which the Svek-DOT text carries as a placeholder (its box is the table). */
function labelTextOf(link: Link): string {
  const label = link.getLabel();
  return label.isNull ? '' : label.asList().map(String).join('\n');
}

/** `taillabel` and `headlabel`: the quantifier, else the role. @see SvekEdge.java:403-424 */
function addEndLabels(
  attributes: NonNullable<DotInputEdge['attributes']>,
  texts: ChenEdgeTexts,
  stringBounder: StringBounder,
): void {
  const tail = texts.startTailText ?? texts.startTailRoleText;
  const head = texts.endHeadText ?? texts.endHeadRoleText;
  if (tail !== undefined) Object.assign(attributes, { tailLabel: ' ', ...dimOf(tail, 'tail', stringBounder) });
  if (head !== undefined) Object.assign(attributes, { headLabel: ' ', ...dimOf(head, 'head', stringBounder) });
}

/** `appendTable(sb, text.calculateDimension(stringBounder), ...)`: the `(int)` size of an end label. */
function dimOf(
  block: { calculateDimension(sb: StringBounder): { getWidth(): number; getHeight(): number } },
  end: 'tail' | 'head',
  stringBounder: StringBounder,
): Record<string, number> {
  const dim = block.calculateDimension(stringBounder);
  return { [`${end}LabelWidth`]: Math.trunc(dim.getWidth()), [`${end}LabelHeight`]: Math.trunc(dim.getHeight()) };
}

/** The label table: `dimNote.delta(2 * labelShield)`, truncated by `appendTable`. @see SvekEdge.java:440-444 */
function addLabel(attributes: NonNullable<DotInputEdge['attributes']>, edge: ChenDotEdge, ortho: boolean): void {
  const { link, texts } = edge;
  if (texts.labelDim === undefined) return;

  const width = Math.trunc(texts.labelDim.width + 2 * texts.labelShield);
  const height = Math.trunc(texts.labelDim.height + 2 * texts.labelShield);
  const label = labelTextOf(link);
  if (ortho) Object.assign(attributes, { xlabel: label, xlabelWidth: width, xlabelHeight: height });
  else
    Object.assign(attributes, {
      label,
      labelWidth: width,
      labelHeight: height,
      labelBoxWidth: width,
      labelBoxHeight: height,
    });
}

/** The `DotInputEdge` of one `SvekEdge`. @see SvekEdge.java:294-327, 403-470 (`appendLine`) */
function dotEdgeOf(edge: ChenDotEdge, ortho: boolean, stringBounder: StringBounder): DotInputEdge {
  const { id, link, texts } = edge;
  const attributes: NonNullable<DotInputEdge['attributes']> = { minLen: link.getLength() - 1 };
  addLabel(attributes, edge, ortho);
  addEndLabels(attributes, texts, stringBounder);
  if (link.isInvis()) attributes.invis = true;

  // `link.isConstraint() == false`. @see SvekEdge.java:475
  if (!link.isConstraint()) attributes.constraint = false;

  return {
    id,
    from: nodeIdOf(link.getEntity1()),
    to: nodeIdOf(link.getEntity2()),
    attributes,
    ...(link.isInverted() ? { inverted: true as const } : {}),
  };
}

/** One `SvekEdge` per non-removed link of `getOrderedLinks`. @see GraphvizImageBuilder.java:199-229 */
function buildEdges(ctx: ChenDotContext, nodes: readonly ChenDotNode[]): ChenDotEdge[] {
  const edges: ChenDotEdge[] = [];
  const placed = new Set(nodes.map((n) => n.entity));
  for (const link of getOrderedLinks(ctx.diagram)) {
    if (link.isRemoved()) continue;

    if (!isDrawable(link, placed)) continue;

    const texts = buildEdgeTexts(link, { skinParam: ctx.diagram.getSkinParam(), stringBounder: ctx.stringBounder });
    edges.push({ id: `edge-${edges.length}`, link, texts });
  }
  return edges;
}

/** `getDotStringSkek`'s `aspect=`/`ratio=` lines, as `DotStringFactory#createDotString` appends them verbatim
 *  (DotStringFactory.java:140-146). @see ~/git/plantuml/src/main/java/net/atmp/CucaDiagram.java:399-415 */
function skekGraphAttrs(diagram: ChenEerDiagram): Pick<DotInputGraph, 'aspect' | 'ratio'> {
  const attrs: { aspect?: string; ratio?: string } = {};
  for (const line of diagram.getDotStringSkek()) {
    const value = line.slice(line.indexOf('=') + 1, line.endsWith(';') ? -1 : undefined);
    if (line.startsWith(ASPECT_PREFIX)) attrs.aspect = value;
    else if (line.startsWith(RATIO_PREFIX)) attrs.ratio = value;
  }
  return attrs;
}

/** The two `getDotStringSkek` lines that reach the graph unchanged. @see net/atmp/CucaDiagram.java:408, 412 */
const ASPECT_PREFIX = 'aspect=';
const RATIO_PREFIX = 'ratio=';

/**
 * The `DotInputGraph` of `diagram` and the objects the renderer needs back from it.
 * @see GraphvizImageBuilder.java:152-256
 */
export function buildChenDot(ctx: ChenDotContext): ChenDot {
  const { diagram, stringBounder } = ctx;
  const skinParam = diagram.getSkinParam();
  const dotSplines = skinParam.getDotSplines();
  // `printGroups(root)` prints nothing (no groups), then `printEntities(getUnpackagedEntities())`.
  const nodes = printEntities(ctx, getUnpackagedEntities(diagram));
  const edges = buildEdges(ctx, nodes);
  const kermor = diagram.getPragma().isTrue(PragmaKey.KERMOR);
  const dotNodes: DotInputNode[] = nodes.map((n) => ({
    id: n.id,
    width: n.width,
    height: n.height,
    shape: dotShapeOf(n.image.getShapeType()),
  }));
  const { nodesep, ranksep } = getSeparators(edges, skinParam, stringBounder, kermor);
  const graph: DotInputGraph = {
    nodes: dotNodes,
    edges: edges.map((e) => dotEdgeOf(e, dotSplines === 'ortho', stringBounder)),
    nodeSep: nodesep,
    rankSep: ranksep,
    nodeSepExplicit: true,
    rankSepExplicit: true,
    // The jar writes `arrowtail=none,arrowhead=none` on every edge (`SvekEdge#appendLine`): drawn by the renderer.
    manualArrowheads: true,
    ...(skinParam.getRankdir() === Rankdir.LEFT_TO_RIGHT ? { rankDir: 'LR' as const } : {}),
    ...(dotSplines !== undefined ? { linetype: dotSplines } : {}),
    ...(kermor ? { kermor: true as const } : {}),
    ...skekGraphAttrs(diagram),
  };
  return { graph, nodes, edges };
}
