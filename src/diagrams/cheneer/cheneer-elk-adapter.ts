/**
 * `ElkDiagramAdapter` over the Chen engine (ceep T3d). Upstream's ELK maker is cuca-level (`CucaDiagram.java:478-479`),
 * so a `@startchen` diagram with `!pragma layout elk` takes `CucaDiagramFileMakerElk` like a class diagram does. Unlike
 * the class and description engines, Chen keeps upstream's abel model (`Entity`, `Link`), so each adapter member is
 * the Java call it names, answered from that model: a leaf is the entity's `printEntityInternal` image (the one the
 * DOT path sizes, `GeneralImageBuilder.createEntityImageBlock`), a link its `Link`.
 *
 * Identity: a leaf is named by its uid; a link by `link<index into getLinks()>`.
 *
 * Chen opens no group (`ChenEerDiagramFactory.java:58-69`), so the cluster half of the adapter (`MyElkCluster`'s
 * reads) is unreachable and throws.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/elk/CucaDiagramFileMakerElk.java
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/elk/MyElkDrawing.java
 */
import type { Entity } from '../../core/abel/Entity.js';
import type { GroupType } from '../../core/abel/GroupType.js';
import type { LeafType } from '../../core/abel/LeafType.js';
import type { Link } from '../../core/abel/Link.js';
import type { ColorType } from '../../core/abel/ColorType.js';
import type { LinkType } from '../../core/decoration/LinkType.js';
import type { USymbol } from '../../core/decoration/symbol/USymbol.js';
import type {
  ElkArrowStyle,
  ElkClusterHeader,
  ElkClusterStyle,
  ElkColors,
  ElkDiagramAdapter,
} from '../../core/elk/ElkDiagramAdapter.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import type { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import type { MagneticBorder } from '../../core/klimt/geom/MagneticBorder.js';
import { MagneticBorderNone } from '../../core/klimt/geom/MagneticBorderNone.js';
import type { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import type { XPoint2D } from '../../core/klimt/geom/XPoint2D.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { TextBlockUtils } from '../../core/klimt/shape/TextBlockUtils.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { UStroke } from '../../core/klimt/UStroke.js';
import type { Paint } from '../../core/paint.js';
import { createEntityImageBlockInternal, type LegacyLeafImage } from '../../core/svek/GeneralImageBuilder.js';
import type { PackageStyleName } from '../../core/svek/PackageStyle.js';
import { StyleBuilder } from '../../core/style/StyleBuilder.js';
import { StyleSignatureBasic } from '../../core/style/StyleSignatureBasic.js';
import type { ChenEerDiagram } from './ChenEerDiagram.js';
import { NO_POLYGONS } from './cheneer-dot.js';
import { createLabelBlock, labelFontOf } from './cheneer-edge-text.js';
import { lightPaintOf } from './renderer-edge.js';

/** `CucaDiagram#getRootGroup()`'s id: no leaf uid is empty. */
const ROOT_GROUP = '';
/** The link id prefix. */
const LINK_ID_PREFIX = 'link';
/** `MyElkEdge#getStyle`'s `SName.classDiagram` (`MyElkDrawing.java:202`), not the diagram's own style name. @see MyElkEdge.java:140-145 */
const ELK_EDGE_STYLE_NAME = 'classDiagram';
/** `marginLabel`: `CucaDiagramFileMakerElk.java:192` (never `6`, whatever the endpoints). */
const MARGIN_LABEL = 1;

/** `Colors` of a link, as `MyElkEdge` reads them: `HColor` as the light paint, `undefined` as `null`. */
function elkColorsOf(link: Link): ElkColors {
  const colors = link.getColors();
  return {
    getColor(key1: ColorType, key2?: ColorType): Paint | null {
      const color = colors.getColor(key1, key2);
      return color === undefined ? null : lightPaintOf(color);
    },
    getSpecificLineStroke(): UStroke | null {
      return colors.getSpecificLineStroke() ?? null;
    },
  };
}

/** Thrown by every member only `MyElkCluster` reads: a Chen diagram has no group. */
function noGroup(member: string): never {
  throw new Error(`cheneer ELK: ${member} is a group member and Chen opens no group`);
}

/**
 * `ElkDiagramAdapter` for a Chen diagram.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/elk/CucaDiagramFileMakerElk.java
 */
export class ChenEerElkAdapter implements ElkDiagramAdapter {
  private readonly entities = new Map<string, Entity>();
  private readonly images = new Map<string, LegacyLeafImage>();
  private readonly links = new Map<string, Link>();

  constructor(
    private readonly diagram: ChenEerDiagram,
    private readonly stringBounder: StringBounder,
  ) {
    if (diagram.groups().length > 0) throw new Error('unported: a Chen diagram with a group under ELK');
    for (const leaf of diagram.leafs()) this.entities.set(leaf.getUid(), leaf);
    diagram.getLinks().forEach((link, index) => this.links.set(`${LINK_ID_PREFIX}${index}`, link));
  }

  private entity(id: string): Entity {
    const entity = this.entities.get(id);
    if (entity === undefined) throw new Error(`cheneer ELK: unknown entity ${id}`);
    return entity;
  }

  private link(id: string): Link {
    const link = this.links.get(id);
    if (link === undefined) throw new Error(`cheneer ELK: unknown link ${id}`);
    return link;
  }

  /** `printEntityInternal(ent)`. @see CucaDiagramFileMakerElk.java:462-474 */
  private printEntityInternal(id: string): LegacyLeafImage {
    const entity = this.entity(id);
    if (entity.isRemoved()) throw new Error('IllegalStateException');

    let image = this.images.get(id);
    if (image === undefined) {
      image = createEntityImageBlockInternal(entity, this.diagram.getSkinParam(), NO_POLYGONS, this.diagram);
      this.images.set(id, image);
    }
    return image;
  }

  // --- CucaDiagram -----------------------------------------------------------

  getDefaultStringBounder(): StringBounder {
    return this.stringBounder;
  }

  getRootGroup(): string {
    return ROOT_GROUP;
  }

  leafs(): readonly string[] {
    return [...this.entities.keys()];
  }

  getChildrenGroups(_groupId: string): readonly string[] {
    return [];
  }

  isEmpty(_groupId: string): boolean {
    return noGroup('isEmpty');
  }

  getLinks(): readonly string[] {
    return [...this.links.keys()];
  }

  // --- Entity ----------------------------------------------------------------

  isRemoved(entityId: string): boolean {
    return this.entity(entityId).isRemoved();
  }

  getGroupType(_groupId: string): GroupType {
    return noGroup('getGroupType');
  }

  muteToType(_groupId: string, _newType: LeafType): void {
    noGroup('muteToType');
  }

  groupLeafs(_groupId: string): readonly string[] {
    return noGroup('groupLeafs');
  }

  /** `Entity#getParentContainer()`: every Chen leaf sits in the root (`CommandCreateEntity` opens no group). */
  getParentContainer(entityId: string): string {
    return this.entity(entityId).getParentContainer() === this.diagram.getRootGroup() ? ROOT_GROUP : entityId;
  }

  getUSymbol(_groupId: string): USymbol | null {
    return noGroup('getUSymbol');
  }

  getPackageStyle(_groupId: string): PackageStyleName | null {
    return noGroup('getPackageStyle');
  }

  getEntityColors(_entityId: string): ElkColors {
    return noGroup('getEntityColors');
  }

  // --- printEntityInternal(ent) + Bibliotekon -----------------------------------

  calculateDimension(entityId: string, stringBounder: StringBounder): XDimension2D {
    return this.printEntityInternal(entityId).calculateDimension(stringBounder);
  }

  /** `IEntityImageUtils.translate(image, UTranslate.point(corner)).drawU(ug)`. @see MyElkDrawing.java:133-142 */
  drawLeaf(entityId: string, ug: UGraphic, corner: XPoint2D): void {
    this.printEntityInternal(entityId).drawU(ug.apply(UTranslate.point(corner)));
  }

  /** A Chen leaf image is a `TextBlock` with no override: `TextBlock#getMagneticBorder` (`TextBlock.java:59`). */
  getMagneticBorder(_entityId: string): MagneticBorder {
    return new MagneticBorderNone();
  }

  // --- ClusterHeader + cluster style (MyElkCluster) ---------------------------

  getClusterHeader(_groupId: string, _stringBounder: StringBounder): ElkClusterHeader {
    return noGroup('getClusterHeader');
  }

  getClusterStyle(_groupId: string): ElkClusterStyle {
    return noGroup('getClusterStyle');
  }

  getClusterStyleForMagneticBorder(_groupId: string, _uSymbol: USymbol): ElkClusterStyle {
    return noGroup('getClusterStyleForMagneticBorder');
  }

  getClusterBackColor(_groupId: string): Paint {
    return noGroup('getClusterBackColor');
  }

  // --- Skin parameters ---------------------------------------------------------

  packageStyle(): PackageStyleName {
    return noGroup('packageStyle');
  }

  getPackageTitleAlignment(): HorizontalAlignment {
    return noGroup('getPackageTitleAlignment');
  }

  getStereotypeAlignment(): HorizontalAlignment {
    return noGroup('getStereotypeAlignment');
  }

  /** `skinParam.getThickness(LineParam.arrow, null)`. @see MyElkEdge.java:171 */
  getArrowThickness(): UStroke | null {
    return this.diagram.getSkinParam().getThickness('arrow');
  }

  // --- Link ----------------------------------------------------------------------

  getEntity1(linkId: string): string {
    return this.link(linkId).getEntity1().getUid();
  }

  getEntity2(linkId: string): string {
    return this.link(linkId).getEntity2().getUid();
  }

  getQuantifier1(linkId: string): string | null {
    return this.link(linkId).getQuantifier1() ?? null;
  }

  getQuantifier2(linkId: string): string | null {
    return this.link(linkId).getQuantifier2() ?? null;
  }

  getRole1(linkId: string): string | null {
    return this.link(linkId).getRole1() ?? null;
  }

  getRole2(linkId: string): string | null {
    return this.link(linkId).getRole2() ?? null;
  }

  /**
   * The ELK maker's `getLabel` for a link with no visibility modifier and no note (Chen has neither): the label
   * block with `addVisibilityModifier`'s margin, then the margin of `:228-229` when it is not empty.
   * @see CucaDiagramFileMakerElk.java:189-248
   */
  getLabel(linkId: string, stringBounder: StringBounder): TextBlock {
    const link = this.link(linkId);
    if (link.getLabel().isNull) return TextBlockUtils.empty(0, 0);

    const skinParam = this.diagram.getSkinParam();
    const block = createLabelBlock(link, labelFontOf(link, skinParam), skinParam);
    const labelOnly = TextBlockUtils.withMargin(block, MARGIN_LABEL, MARGIN_LABEL);
    return TextBlockUtils.isEmpty(labelOnly, stringBounder)
      ? labelOnly
      : TextBlockUtils.withMargin(labelOnly, MARGIN_LABEL, MARGIN_LABEL);
  }

  /** No Chen command sets a quantifier or a role (`CommandAssociate.java:112-117`, `LinkArg.build(label, length)`). */
  getQuantifier(linkId: string, n: 1 | 2, _stringBounder: StringBounder): TextBlock | null {
    const text = n === 1 ? this.getQuantifier1(linkId) : this.getQuantifier2(linkId);
    if (text !== null) throw new Error(`unported: a Chen link quantifier under ELK (${linkId})`);
    return null;
  }

  getRoleLabel(linkId: string, n: 1 | 2, _stringBounder: StringBounder): TextBlock | null {
    const text = n === 1 ? this.getRole1(linkId) : this.getRole2(linkId);
    if (text !== null) throw new Error(`unported: a Chen link role under ELK (${linkId})`);
    return null;
  }

  isInvis(linkId: string): boolean {
    return this.link(linkId).isInvis();
  }

  isHidden(linkId: string): boolean {
    return this.link(linkId).isHidden();
  }

  getType(linkId: string): LinkType {
    return this.link(linkId).getType();
  }

  /** `MyElkEdge#getStyle`, merged, then `LineColor` and `getStroke()`. @see MyElkEdge.java:140-145, 159, 170 */
  getArrowStyle(linkId: string): ElkArrowStyle {
    const link = this.link(linkId);
    const builder = link.getStyleBuilder();
    if (!(builder instanceof StyleBuilder)) throw new Error('ClassCastException: the link has no StyleBuilder');
    const style = StyleSignatureBasic.of('root', 'element', ELK_EDGE_STYLE_NAME, 'arrow')
      .withTOBECHANGED(link.getStereotype())
      .getMergedStyle(builder);
    if (style === undefined) throw new Error('NullPointerException: no arrow style merged for the link');
    const lineColor = style.value('LineColor').asColor(this.diagram.getSkinParam().getIHtmlColorSet());
    return { lineColor: lightPaintOf(lineColor), stroke: style.getStroke() };
  }

  /** `Link#getColors()`: never null upstream. @see MyElkEdge.java:161-162 */
  getLinkColors(linkId: string): ElkColors | null {
    return elkColorsOf(this.link(linkId));
  }

  /** Dead behind {@link getLinkColors}, which is never null (`MyElkEdge.java:164`). */
  getSpecificColor(_linkId: string): Paint | null {
    return null;
  }
}
