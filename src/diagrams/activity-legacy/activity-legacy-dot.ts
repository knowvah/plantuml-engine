/**
 * The DOT input of a legacy activity diagram: `GraphvizImageBuilder#buildImage`'s `printGroups` /
 * `printEntities` (one `SvekNode` per leaf, one `Cluster` per partition, created in that order) and the
 * `SvekEdge` of each link of `getOrderedLinks`, handed to the one dot-engine seam as a `DotInputGraph`. It is
 * what the DOT-parity gate observes (`setLayoutInputObserver`) against the jar's `svek-N.dot`.
 *
 * `CucaDiagramFileMakerSvek#getTextBlock` runs `CucaDiagramSimplifierActivity#simplify` BEFORE building this graph
 * (java:67-68); it replaces each autarkic group by a leaf whose image is a nested svek pass (`GroupMakerActivity`,
 * which builds this same graph over an {@link ActivityLegacyDotScope} of its own). That runs in `layout.ts` ahead of
 * {@link buildActivityLegacyDot}; a group of any other non-`PACKAGE` type reaching this module throws `unported:`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/GraphvizImageBuilder.java:157-256, 345-405
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/CucaDiagramFileMakerSvek.java:59-87
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/DotStringFactory.java
 */
import type { Entity } from '../../core/abel/Entity.js';
import { LeafType } from '../../core/abel/LeafType.js';
import { GroupType } from '../../core/abel/GroupType.js';
import { InnerActivity } from '../../core/svek/InnerActivity.js';
import { EntityImageState } from '../../core/svek/image/EntityImageState.js';
import type { Link } from '../../core/abel/Link.js';
import type {
  DotInputCluster,
  DotInputEdge,
  DotInputGraph,
  DotInputNode,
  DotInputNodeShape,
} from '../../core/graph-layout.types.js';
import { Rankdir } from '../../core/klimt/geom/Rankdir.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import type { StringMeasurer } from '../../core/measurer.js';
import { PragmaKey } from '../../core/skin/PragmaKey.js';
import { createClusterHeader, type ClusterHeaderResult } from '../../core/svek/ClusterHeader.js';
import { createEntityImageBlockInternal, type LegacyLeafImage } from '../../core/svek/GeneralImageBuilder.js';
import type { NodePolygons, OctagonPolygon } from '../../core/svek/image/EntityImageActivity.js';
import { ShapeType } from '../../core/svek/ShapeType.js';
import { getStyleName } from '../../core/svek/diagram-type-style-name.js';
import type { ActivityDiagram } from './ActivityDiagram.js';
import { buildEdgeTexts, type EdgeTexts } from './activity-legacy-edge-text.js';
import { getOrderedLinks } from './activity-legacy-links.js';
import { getSeparators } from './activity-legacy-spacing.js';
import type { ActivityLegacySkinParam } from './activity-legacy-skin-param.js';

/** `SvekEdge#appendTable`'s `-5` on the title height. @see ClusterDotString.java:123-125 */
const TITLE_TABLE_HEIGHT_REDUCTION = 5;

/**
 * What `DotData` holds besides the diagram: the top parent, the links, the leaves and the group hierarchy a
 * `GraphvizImageBuilder` pass prints. The root pass reads the whole diagram ({@link rootScope}); a nested pass
 * (`GroupMakerActivity`) reads one group.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/dot/DotData.java:54-100
 */
export interface ActivityLegacyDotScope {
  /** `DotData#getTopParent`, also the root `printGroups` starts from. */
  readonly topParent: Entity;
  readonly links: readonly Link[];
  readonly leafs: readonly Entity[];
  /** `GroupHierarchy#getChildrenGroups`. */
  readonly getChildrenGroups: (parent: Entity) => readonly Entity[];
  /** `GroupHierarchy#isEmpty`. */
  readonly isEmpty: (g: Entity) => boolean;
  /**
   * The nested pass hands `buildImage` an empty `dotStrings[]`, so `createDotString` never writes `nodesep` or
   * `ranksep`. @see GroupMakerActivity.java:141, DotStringFactory.java:136-143
   */
  readonly omitSeparators: boolean;
}

/** `new DotData(diagram, diagram.getRootGroup(), getOrderedLinks(), diagram.leafs(), diagram, diagram)`. @see CucaDiagramFileMakerSvek.java:73-74 */
export function rootScope(diagram: ActivityDiagram): ActivityLegacyDotScope {
  return {
    topParent: diagram.getRootGroup(),
    links: getOrderedLinks(diagram),
    leafs: diagram.leafs(),
    getChildrenGroups: (parent) => diagram.getChildrenGroups(parent),
    isEmpty: (g) => diagram.isEmpty(g),
    omitSeparators: false,
  };
}

/** What the DOT build reads: the diagram, its scope and the two measuring seams. */
export interface ActivityLegacyDotContext {
  readonly diagram: ActivityDiagram;
  /** The pass's `DotData`; the whole diagram when absent. */
  readonly scope?: ActivityLegacyDotScope;
  readonly stringBounder: StringBounder;
  /** The string measurer the `note on link` label merge uses. */
  readonly measurer: StringMeasurer;
}

/** One `SvekNode`: the leaf, its image and the size the DOT gave graphviz. */
export interface ActivityLegacyDotNode {
  readonly id: string;
  readonly entity: Entity;
  readonly image: LegacyLeafImage;
  readonly width: number;
  readonly height: number;
}

/** One `SvekEdge`: the link and its texts. */
export interface ActivityLegacyDotEdge {
  readonly id: string;
  readonly link: Link;
  readonly texts: EdgeTexts;
}

/** One `Cluster`: the group and its header. */
export interface ActivityLegacyDotCluster {
  readonly id: string;
  readonly group: Entity;
  readonly header: ClusterHeaderResult;
}

/** The result of {@link buildActivityLegacyDot}. */
export interface ActivityLegacyDot {
  readonly graph: DotInputGraph;
  readonly nodes: readonly ActivityLegacyDotNode[];
  readonly edges: readonly ActivityLegacyDotEdge[];
  readonly clusters: readonly ActivityLegacyDotCluster[];
  /** The polygons `SvekNode#getPolygon` answers once the layout is solved; the images read them (octagon). */
  readonly polygons: NodePolygonStore;
}

/**
 * The slice of `Bibliotekon` the leaf images read (`getNode(entity).getPolygon()`): filled by the renderer (T2c)
 * from the solved layout, empty until then.
 */
export class NodePolygonStore implements NodePolygons {
  private readonly polygons = new Map<Entity, OctagonPolygon>();

  setPolygon(entity: Entity, polygon: OctagonPolygon): void {
    this.polygons.set(entity, polygon);
  }

  getNode(entity: Entity): { getPolygon(): OctagonPolygon | undefined } {
    return { getPolygon: () => this.polygons.get(entity) };
  }
}

/** `SvekNode#appendShapeInternal`: the DOT shape of an image's `ShapeType`. @see SvekNode.java:327-350 */
export function dotShapeOf(type: ShapeType): DotInputNodeShape {
  if (type === ShapeType.RECTANGLE || type === ShapeType.FOLDER) return 'rect';
  if (type === ShapeType.OCTAGON) return 'octagon';
  if (type === ShapeType.HEXAGON) return 'hexagon';
  if (type === ShapeType.DIAMOND) return 'diamond';
  if (type === ShapeType.CIRCLE) return 'circle';
  if (type === ShapeType.OVAL) return 'ellipse';
  if (type === ShapeType.ROUND_RECTANGLE) return 'rounded';
  throw new Error(`unported: SvekNode shape ${type}`);
}

/** The DOT id of an entity: its uid (`Bibliotekon#getNodeUid` is `sh%04d` of the colour sequence). */
function nodeIdOf(entity: Entity): string {
  return entity.getUid();
}

/** `GraphvizImageBuilder`'s state while it prints groups and entities. */
class DotBuilder {
  readonly nodes: ActivityLegacyDotNode[] = [];
  readonly clusters: ActivityLegacyDotCluster[] = [];
  readonly polygons = new NodePolygonStore();
  /** The node ids of each cluster, filled as entities are printed. */
  private readonly members = new Map<string, string[]>();
  private readonly dotClusters: DotInputCluster[] = [];
  private readonly ctx: ActivityLegacyDotContext;
  private readonly scope: ActivityLegacyDotScope;

  constructor(ctx: ActivityLegacyDotContext, scope: ActivityLegacyDotScope) {
    this.ctx = ctx;
    this.scope = scope;
  }

  /** @see GraphvizImageBuilder.java:424-441 (`printEntities`) */
  printEntities(entities: readonly Entity[], clusterId: string | undefined): void {
    for (const ent of entities) {
      if (ent.isRemoved()) continue;

      this.printEntity(ent, clusterId);
    }
  }

  /** @see GraphvizImageBuilder.java:443-451 */
  private printEntity(ent: Entity, clusterId: string | undefined): void {
    const image = this.printEntityInternal(ent);
    const dim = image.calculateDimension(this.ctx.stringBounder);
    const id = nodeIdOf(ent);
    this.nodes.push({ id, entity: ent, image, width: dim.getWidth(), height: dim.getHeight() });
    if (clusterId !== undefined) this.members.get(clusterId)!.push(id);
  }

  /**
   * `ent.getSvekImage() == null ? createEntityImageBlock(...) : ent.getSvekImage()`: an autarkic group the
   * simplifier overrode carries its nested image.
   * @see GraphvizImageBuilder.java:362-381
   */
  private printEntityInternal(ent: Entity): LegacyLeafImage {
    const override = ent.getSvekImage();
    if (override === undefined)
      return createEntityImageBlockInternal(ent, this.ctx.diagram.getSkinParam(), this.polygons, this.ctx.diagram);

    if (override instanceof InnerActivity || override instanceof EntityImageState) return override;

    throw new Error('unported: an svek image override other than InnerActivity or EntityImageState');
  }

  /** @see GraphvizImageBuilder.java:489-505 */
  printGroups(parent: Entity, parentClusterId: string | undefined): void {
    for (const g of this.scope.getChildrenGroups(parent)) {
      if (g.isRemoved()) continue;

      if (this.scope.isEmpty(g) && g.getGroupType() === GroupType.PACKAGE) {
        g.muteToType(LeafType.EMPTY_PACKAGE);
        this.printEntity(g, parentClusterId);
      } else {
        this.printGroup(g, parentClusterId);
      }
    }
  }

  /** @see GraphvizImageBuilder.java:507-517 */
  private printGroup(g: Entity, parentClusterId: string | undefined): void {
    if (g.getGroupType() !== GroupType.PACKAGE)
      // An INNER_ACTIVITY inside an INNER_ACTIVITY: the outer pass draws the inner group as a cluster, the
      // simplifier then overrides it to a leaf, and the jar's `Cluster#getStyle` crashes on `Entity#checkGroup`
      // (`UnsupportedOperationException`, an error page, Entity.java:355, Cluster.java:388). Mirrored as an error.
      throw new Error(`UnsupportedOperationException: group type ${String(g.getGroupType())} drawn as a cluster`);

    const { diagram, stringBounder } = this.ctx;
    const skinParam = diagram.getSkinParam();
    const header = createClusterHeader(g, getStyleName(diagram.getDiagramType()), skinParam, diagram, stringBounder);
    // `Cluster#getClusterId` is `cluster` + the colour sequence value; the parity comparator wants `cluster<digits>`.
    const id = `cluster${this.clusters.length + 1}`;
    this.clusters.push({ id, group: g, header });
    this.members.set(id, []);
    this.dotClusters.push(this.dotClusterOf(id, g, header, parentClusterId));
    this.printEntities(g.leafs(), id);
    this.printGroups(g, id);
  }

  /** The `DotInputCluster` of a plain `PACKAGE` group: `ClusterDotString#printInternal`'s wrappers and title. */
  private dotClusterOf(
    id: string,
    g: Entity,
    header: ClusterHeaderResult,
    parentClusterId: string | undefined,
  ): DotInputCluster {
    const cluster: DotInputCluster = { id, nodeIds: this.members.get(id)!, ...parentOf(parentClusterId) };
    // `protection0`/`protection1` (`p0`/`p1`) are off under swimlanes, which add the lane's rank scaffolding instead
    // (`useSwimlanes(ACTIVITY)`). @see ClusterDotString.java:157-170, 299-315, SkinParam.java:850-859
    if (this.ctx.diagram.getSkinParam().swimlanes()) cluster.swimlane = true;
    else cluster.innerMarginLevels = 1;
    // `cluster.isLabel()`: the title table. @see Cluster.java:671-673, ClusterDotString.java:121-127
    if (header.titleAndAttributeWidth > 0 || header.titleAndAttributeHeight > 0) {
      const height = header.titleAndAttributeHeight - TITLE_TABLE_HEIGHT_REDUCTION;
      cluster.label = g.getDisplay().toString();
      cluster.labelWidth = header.titleAndAttributeWidth;
      cluster.labelHeight = height;
      cluster.titleTableWidth = header.titleAndAttributeWidth;
      cluster.titleTableHeight = height;
    }
    return cluster;
  }

  get dotClusterList(): DotInputCluster[] {
    return this.dotClusters;
  }
}

function parentOf(parentClusterId: string | undefined): { parentId?: string } {
  return parentClusterId === undefined ? {} : { parentId: parentClusterId };
}

/** `link.getEntity1()`/`getEntity2()` must be leaves: a link to a partition is `Cluster.CENTER_ID`, not ported. */
function requireLeaf(entity: Entity): Entity {
  if (entity.isGroup()) throw new Error('unported: a link to a partition (Cluster.CENTER_ID)');
  return entity;
}

/** The `DotInputEdge` of one `SvekEdge`. @see SvekEdge.java:294-327 (`appendLine`) */
function dotEdgeOf(edge: ActivityLegacyDotEdge, ortho: boolean, stringBounder: StringBounder): DotInputEdge {
  const { id, link, texts } = edge;
  const attributes: NonNullable<DotInputEdge['attributes']> = { minLen: link.getLength() - 1 };
  if (texts.labelDim !== undefined) {
    const width = Math.trunc(texts.labelDim.width / (texts.divideLabelWidthByTwo ? 2 : 1));
    const height = Math.trunc(texts.labelDim.height);
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
  addEndLabels(attributes, texts, stringBounder);
  if (link.isInvis()) attributes.invis = true;

  // `link.isConstraint() == false`; `hasTwoEntryPointsSameContainer` is false for a leaf pair. @see SvekEdge.java:475
  if (!link.isConstraint()) attributes.constraint = false;

  return {
    id,
    from: nodeIdOf(requireLeaf(link.getEntity1())),
    to: nodeIdOf(requireLeaf(link.getEntity2())),
    attributes,
    ...(link.isInverted() ? { inverted: true as const } : {}),
  };
}

/** The label's lines, which the Svek-DOT text carries as a placeholder (its box is the table). */
function labelTextOf(link: Link): string {
  const label = link.getLabel();
  return label.isNull ? '' : label.asList().map(String).join('\n');
}

/** `taillabel` and `headlabel`: the quantifier, else the role. @see SvekEdge.java:403-424 */
function addEndLabels(
  attributes: NonNullable<DotInputEdge['attributes']>,
  texts: EdgeTexts,
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

/** `DotData#getLeafs` filtered by `getUnpackagedEntities`. @see GraphvizImageBuilder.java:473-480 */
function getUnpackagedEntities(scope: ActivityLegacyDotScope): Entity[] {
  return scope.leafs.filter((ent) => ent.getParentContainer() === scope.topParent);
}

function hasNode(placed: ReadonlySet<Entity>, entity: Entity): boolean {
  return entity.isGroup() || placed.has(entity);
}

/** One `SvekEdge` per non-removed link of `getOrderedLinks`. @see GraphvizImageBuilder.java:199-229 */
function buildEdges(
  ctx: ActivityLegacyDotContext,
  scope: ActivityLegacyDotScope,
  nodes: readonly ActivityLegacyDotNode[],
): ActivityLegacyDotEdge[] {
  const skinParam = ctx.diagram.getSkinParam();
  const edges: ActivityLegacyDotEdge[] = [];
  const placed = new Set(nodes.map((n) => n.entity));
  for (const link of scope.links) {
    if (link.isRemoved()) continue;

    // `Bibliotekon#getNodeUid` throws `IllegalStateException` for a leaf with no node in this pass (a leaf inside
    // an autarkic group, `B` in `A --> B` `}` `--> (*)`); `buildImage` catches it, logs it and drops the link.
    // A group is a cluster point, not a missing node. @see Bibliotekon.java:126-137, GraphvizImageBuilder.java:226-262
    if (!hasNode(placed, link.getEntity1()) || !hasNode(placed, link.getEntity2())) continue;

    const texts = buildEdgeTexts(link, { skinParam, stringBounder: ctx.stringBounder, measurer: ctx.measurer });
    edges.push({ id: `edge-${edges.length}`, link, texts });
  }
  return edges;
}

/** The graph's `nodesep`/`ranksep`: final values (the activity floor and `skinparam` applied), or none. @see DotStringFactory.java:109-143 */
function separatorAttrs(
  scope: ActivityLegacyDotScope,
  edges: readonly ActivityLegacyDotEdge[],
  skinParam: ActivityLegacySkinParam,
  stringBounder: StringBounder,
  kermor: boolean,
): Pick<DotInputGraph, 'nodeSep' | 'rankSep' | 'nodeSepExplicit' | 'rankSepExplicit' | 'omitSepAttrs'> {
  if (scope.omitSeparators) return { omitSepAttrs: true };

  const { nodesep, ranksep } = getSeparators(edges, skinParam, stringBounder, kermor);
  return { nodeSep: nodesep, rankSep: ranksep, nodeSepExplicit: true, rankSepExplicit: true };
}

/**
 * The `DotInputGraph` of `diagram` and the objects the renderer needs back from it.
 * @see GraphvizImageBuilder.java:157-256
 */
export function buildActivityLegacyDot(ctx: ActivityLegacyDotContext): ActivityLegacyDot {
  const { diagram, stringBounder } = ctx;
  const skinParam = diagram.getSkinParam();
  const dotSplines = skinParam.getDotSplines();
  const scope = ctx.scope ?? rootScope(diagram);
  const builder = new DotBuilder(ctx, scope);
  // `printGroups(root)` then `printEntities(getUnpackagedEntities())`. @see GraphvizImageBuilder.java:152-153
  builder.printGroups(scope.topParent, undefined);
  builder.printEntities(getUnpackagedEntities(scope), undefined);

  const edges = buildEdges(ctx, scope, builder.nodes);
  const kermor = diagram.getPragma().isTrue(PragmaKey.KERMOR);
  const dotNodes: DotInputNode[] = builder.nodes.map((n) => ({
    id: n.id,
    width: n.width,
    height: n.height,
    shape: dotShapeOf(n.image.getShapeType()),
  }));
  const dotEdges = edges.map((e) => dotEdgeOf(e, dotSplines === 'ortho', stringBounder));

  const graph: DotInputGraph = {
    nodes: dotNodes,
    edges: dotEdges,
    ...separatorAttrs(scope, edges, skinParam, stringBounder, kermor),
    // The jar writes `arrowtail=none,arrowhead=none` on every edge (`SvekEdge#appendLine`): drawn by the renderer.
    manualArrowheads: true,
    ...(skinParam.getRankdir() === Rankdir.LEFT_TO_RIGHT ? { rankDir: 'LR' as const } : {}),
    ...(dotSplines !== undefined ? { linetype: dotSplines } : {}),
    ...(kermor ? { kermor: true as const } : {}),
    ...(builder.dotClusterList.length > 0 ? { clusters: builder.dotClusterList } : {}),
  };
  return { graph, nodes: builder.nodes, edges, clusters: builder.clusters, polygons: builder.polygons };
}
