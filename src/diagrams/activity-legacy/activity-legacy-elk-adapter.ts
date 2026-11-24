/**
 * `ElkDiagramAdapter` over the legacy activity engine (lae D1, #158). Upstream's ELK maker is cuca-level
 * (`CucaDiagram.java:478-479`): a legacy activity diagram with `!pragma layout elk` takes `CucaDiagramFileMakerElk`,
 * which reads the abel model directly. This engine keeps that model (`Entity`, `Link`), so each member is the Java
 * call it names, answered from it, as `cheneer-elk-adapter.ts` does for Chen. A leaf is the entity's
 * `printEntityInternal` image: `GeneralImageBuilder.createEntityImageBlock`, the image the svek path sizes
 * (`activity-legacy-dot.ts`). The simplifier never runs on the ELK path (`CucaDiagramFileMakerSvek.java:67` is the
 * svek maker's), so `getSvekImage()` is never set and never read.
 *
 * Identity: a leaf or a group is named by its uid, the root group by `''`, a link by `link<index into getLinks()>`.
 * The entities are read live: `muteToType` turns an empty partition into a leaf that `leafs()` then lists
 * (`CucaDiagram.java:894-904`), as upstream's maker sees it.
 *
 * Port-only: the polygon store the octagon image reads stays empty, as upstream's: `Bibliotekon#createNode`
 * registers the svek node (`CucaDiagramFileMakerElk.java:380`) but nothing solves its polygon on this path.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/elk/CucaDiagramFileMakerElk.java
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/elk/MyElkDrawing.java
 */
import type { ColorType } from '../../core/abel/ColorType.js';
import type { Colors } from '../../core/abel/Colors.js';
import type { Entity } from '../../core/abel/Entity.js';
import type { GroupType } from '../../core/abel/GroupType.js';
import type { LeafType } from '../../core/abel/LeafType.js';
import type { Link } from '../../core/abel/Link.js';
import { Position } from '../../core/abel/Position.js';
import type { LinkType } from '../../core/decoration/LinkType.js';
import type { USymbol } from '../../core/decoration/symbol/USymbol.js';
import type {
  ElkArrowStyle,
  ElkClusterHeader,
  ElkClusterStyle,
  ElkColors,
  ElkDiagramAdapter,
} from '../../core/elk/ElkDiagramAdapter.js';
import { CreoleMode } from '../../core/klimt/creole/CreoleMode.js';
import type { CreoleRenderContext } from '../../core/klimt/creole/DisplayCreole.js';
import { Display } from '../../core/klimt/creole/Display.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { HorizontalAlignment, horizontalAlignmentFromString } from '../../core/klimt/geom/HorizontalAlignment.js';
import type { MagneticBorder } from '../../core/klimt/geom/MagneticBorder.js';
import { MagneticBorderNone } from '../../core/klimt/geom/MagneticBorderNone.js';
import { VerticalAlignment } from '../../core/klimt/geom/VerticalAlignment.js';
import type { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import type { XPoint2D } from '../../core/klimt/geom/XPoint2D.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { TextBlockUtils } from '../../core/klimt/shape/TextBlockUtils.js';
import type { FontConfiguration } from '../../core/klimt/shape/UText.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { UStroke } from '../../core/klimt/UStroke.js';
import type { Paint } from '../../core/paint.js';
import { createEntityImageBlockInternal, type LegacyLeafImage } from '../../core/svek/GeneralImageBuilder.js';
import { EntityImageNoteLink } from '../../core/svek/image/EntityImageNoteLink.js';
import type { PackageStyleName } from '../../core/svek/PackageStyle.js';
import { StyleSignatureBasic } from '../../core/style/StyleSignatureBasic.js';
import type { ActivityDiagram } from './ActivityDiagram.js';
import { NodePolygonStore } from './activity-legacy-dot.js';
import { arrowSignature, labelFontOf, styleBuilderOf } from './activity-legacy-edge-text.js';
import {
  elkClusterBackColor,
  elkClusterHeader,
  elkClusterStyle,
  elkClusterStyleForMagneticBorder,
  elkPackageTitleAlignment,
} from './activity-legacy-elk-cluster.js';
import { arrowFontConfiguration } from './activity-legacy-font-param.js';
import { packageStyleOf } from './renderer-cluster.js';
import { lightPaintOf } from './renderer-edge.js';

/** `CucaDiagram#getRootGroup()`'s id: no entity uid is empty. */
const ROOT_GROUP = '';
/** The link id prefix. */
const LINK_ID_PREFIX = 'link';
/** `marginLabel`: `CucaDiagramFileMakerElk.java:182`, `:192` (never `6`, whatever the endpoints). */
const MARGIN_LABEL = 1;
/** `DiagramType.ACTIVITY.getStyleName()`: `MyElkEdge#getStyle` reads the diagram's own style name. @see MyElkEdge.java:140-144 */
const STYLE_NAME = 'activityDiagram';

/** `Colors` as the ELK path reads them: `HColor` as the light paint, `undefined` as `null`. */
function elkColorsOf(colors: Colors): ElkColors {
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

/**
 * `ElkDiagramAdapter` for a legacy activity diagram.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/elk/CucaDiagramFileMakerElk.java
 */
export class ActivityLegacyElkAdapter implements ElkDiagramAdapter {
  private readonly entities = new Map<string, Entity>();
  private readonly images = new Map<string, LegacyLeafImage>();
  private readonly links = new Map<string, Link>();
  /** `getBibliotekon()` as the octagon image reads it: never solved on this path. */
  private readonly polygons = new NodePolygonStore();

  constructor(
    private readonly diagram: ActivityDiagram,
    private readonly stringBounder: StringBounder,
  ) {
    for (const entity of [...diagram.leafs(), ...diagram.groups()]) this.entities.set(entity.getUid(), entity);
    diagram.getLinks().forEach((link, index) => this.links.set(`${LINK_ID_PREFIX}${index}`, link));
  }

  private entity(id: string): Entity {
    if (id === ROOT_GROUP) return this.diagram.getRootGroup();
    const entity = this.entities.get(id);
    if (entity === undefined) throw new Error(`activity-legacy ELK: unknown entity ${id}`);
    return entity;
  }

  private idOf(entity: Entity): string {
    return entity === this.diagram.getRootGroup() ? ROOT_GROUP : entity.getUid();
  }

  private link(id: string): Link {
    const link = this.links.get(id);
    if (link === undefined) throw new Error(`activity-legacy ELK: unknown link ${id}`);
    return link;
  }

  /** `printEntityInternal(ent)`: `getSvekImage()` is always null here (lae D2). @see CucaDiagramFileMakerElk.java:462-475 */
  private printEntityInternal(id: string): LegacyLeafImage {
    const entity = this.entity(id);
    if (entity.isRemoved()) throw new Error('IllegalStateException');

    let image = this.images.get(id);
    if (image === undefined) {
      image = createEntityImageBlockInternal(entity, this.diagram.getSkinParam(), this.polygons, this.diagram);
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

  /** `CucaDiagram#leafs()`, read live: a muted empty partition is a leaf from then on. @see CucaDiagram.java:894-904 */
  leafs(): readonly string[] {
    return this.diagram.leafs().map((leaf) => leaf.getUid());
  }

  getChildrenGroups(groupId: string): readonly string[] {
    return this.diagram.getChildrenGroups(this.entity(groupId)).map((g) => g.getUid());
  }

  isEmpty(groupId: string): boolean {
    return this.diagram.isEmpty(this.entity(groupId));
  }

  getLinks(): readonly string[] {
    return [...this.links.keys()];
  }

  // --- Entity ----------------------------------------------------------------

  isRemoved(entityId: string): boolean {
    return this.entity(entityId).isRemoved();
  }

  getGroupType(groupId: string): GroupType {
    const groupType = this.entity(groupId).getGroupType();
    if (groupType === undefined) throw new Error(`activity-legacy ELK: ${groupId} is not a group`);
    return groupType;
  }

  muteToType(groupId: string, newType: LeafType): void {
    this.entity(groupId).muteToType(newType);
  }

  groupLeafs(groupId: string): readonly string[] {
    return this.entity(groupId)
      .leafs()
      .map((leaf) => leaf.getUid());
  }

  getParentContainer(entityId: string): string {
    const parent = this.entity(entityId).getParentContainer();
    if (parent === undefined) throw new Error(`activity-legacy ELK: ${entityId} has no parent container`);
    return this.idOf(parent);
  }

  /** No legacy activity command gives a group a `USymbol`. */
  getUSymbol(groupId: string): USymbol | null {
    return this.entity(groupId).getUSymbol() ?? null;
  }

  getPackageStyle(groupId: string): PackageStyleName | null {
    return this.entity(groupId).getPackageStyle() ?? null;
  }

  getEntityColors(entityId: string): ElkColors {
    return elkColorsOf(this.entity(entityId).getColors());
  }

  // --- printEntityInternal(ent) + Bibliotekon -----------------------------------

  calculateDimension(entityId: string, stringBounder: StringBounder): XDimension2D {
    return this.printEntityInternal(entityId).calculateDimension(stringBounder);
  }

  /** `IEntityImageUtils.translate(image, UTranslate.point(corner)).drawU(ug)`. @see MyElkDrawing.java:133-142 */
  drawLeaf(entityId: string, ug: UGraphic, corner: XPoint2D): void {
    this.printEntityInternal(entityId).drawU(ug.apply(UTranslate.point(corner)));
  }

  /**
   * No legacy leaf image overrides `getMagneticBorder` (upstream's overrides are `EntityImageDescription`, `Cluster`
   * and `EntityImageDegenerated`), so it is `TextBlock#getMagneticBorder`'s none (`TextBlock.java:59`).
   */
  getMagneticBorder(_entityId: string): MagneticBorder {
    return new MagneticBorderNone();
  }

  // --- ClusterHeader + cluster style (MyElkCluster) ---------------------------

  getClusterHeader(groupId: string, stringBounder: StringBounder): ElkClusterHeader {
    return elkClusterHeader(this.diagram, this.entity(groupId), stringBounder);
  }

  getClusterStyle(groupId: string): ElkClusterStyle {
    return elkClusterStyle(this.diagram, this.entity(groupId));
  }

  getClusterStyleForMagneticBorder(groupId: string, uSymbol: USymbol): ElkClusterStyle {
    return elkClusterStyleForMagneticBorder(this.diagram, this.entity(groupId), uSymbol);
  }

  getClusterBackColor(groupId: string): Paint {
    return elkClusterBackColor(this.diagram, this.entity(groupId));
  }

  // --- Skin parameters ---------------------------------------------------------

  /** `skinParam.packageStyle()`: `renderer-cluster.ts#packageStyleOf`, the svek cluster's reading. @see SkinParam.java:819-826 */
  packageStyle(): PackageStyleName {
    return packageStyleOf(this.diagram.getSkinParam());
  }

  getPackageTitleAlignment(): HorizontalAlignment {
    return elkPackageTitleAlignment(this.diagram);
  }

  /** `skinParam.getStereotypeAlignment()`, as the svek cluster reads it (`renderer-cluster.ts#buildCluster`). @see SkinParam.java:741-748 */
  getStereotypeAlignment(): HorizontalAlignment {
    return (
      horizontalAlignmentFromString(this.diagram.getSkinParam().getValue('stereotypealignment')) ??
      HorizontalAlignment.CENTER
    );
  }

  /** `skinParam.getThickness(LineParam.arrow, null)`. @see MyElkEdge.java:171 */
  getArrowThickness(): UStroke | null {
    return this.diagram.getSkinParam().getThickness('arrow');
  }

  // --- Link ----------------------------------------------------------------------

  getEntity1(linkId: string): string {
    return this.idOf(this.link(linkId).getEntity1());
  }

  getEntity2(linkId: string): string {
    return this.idOf(this.link(linkId).getEntity2());
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

  /** The creole context of `font` over this diagram's skin. */
  private contextOf(font: FontConfiguration): CreoleRenderContext {
    const skinParam = this.diagram.getSkinParam();
    return { fontConfiguration: font, spriteContainer: skinParam, atomOps: skinParam.atomOps };
  }

  /**
   * `labelOnly` of the maker's `getLabel`: the label in the arrow style's font, wrapped at the style's
   * `MaximumWidth` else `maxMessageSize`, then `addVisibilityModifier`'s margin. The magic-arrow branches are
   * commented out upstream (`:205-207`, `:224-226`), so a guide line draws as plain text.
   * @see CucaDiagramFileMakerElk.java:173-184, 210-228
   */
  private labelOnly(link: Link): TextBlock {
    if (link.getLabel().isNull) return TextBlockUtils.EMPTY_TEXT_BLOCK;

    const skinParam = this.diagram.getSkinParam();
    const arrowStyle = arrowSignature(link).getMergedStyle(styleBuilderOf(link));
    const styleWidth = arrowStyle?.wrapWidth();
    const wrapWidth =
      styleWidth !== undefined && styleWidth.getMaxWidth() > 0 ? styleWidth : skinParam.maxMessageSize();
    // `getMessageTextAlignment` of a non-state diagram. @see CucaDiagramFileMakerElk.java:166-171
    const alignment = skinParam.getDefaultTextAlignment(HorizontalAlignment.CENTER);
    const block = link
      .getLabel()
      .create0(this.contextOf(labelFontOf(link, skinParam)), alignment, wrapWidth, CreoleMode.SIMPLE_LINE);
    // A visibility modifier (`LinkArg.build`'s leading `+`/`-`/`#`/`~`) needs `VisibilityModifier#getUBlock`.
    if (link.getVisibilityModifier() !== undefined) throw new Error('unported: ELK label visibility modifier');
    return TextBlockUtils.withMargin(block, MARGIN_LABEL, MARGIN_LABEL);
  }

  /**
   * The maker's `getLabel`: `labelOnly`, a second margin when it has no note, else merged with the link's note on
   * the note's side. Never undefined: an empty label is `empty(0, 0)` (`TextBlockUtils.java:57`).
   * @see CucaDiagramFileMakerElk.java:190-248
   */
  getLabel(linkId: string, stringBounder: StringBounder): TextBlock {
    const link = this.link(linkId);
    const labelOnly = this.labelOnly(link);
    const note = link.getNote();
    if (note === undefined) {
      if (labelOnly === TextBlockUtils.EMPTY_TEXT_BLOCK) return TextBlockUtils.empty(0, 0);
      if (TextBlockUtils.isEmpty(labelOnly, stringBounder)) return labelOnly;
      return TextBlockUtils.withMargin(labelOnly, MARGIN_LABEL, MARGIN_LABEL);
    }
    const noteOnly = new EntityImageNoteLink(
      note.getDisplay(),
      note.getColors(),
      this.diagram.getSkinParam(),
      styleBuilderOf(link),
    );
    const position = note.getPosition();
    if (position === Position.LEFT) return TextBlockUtils.mergeLR(noteOnly, labelOnly, VerticalAlignment.CENTER);
    if (position === Position.RIGHT) return TextBlockUtils.mergeLR(labelOnly, noteOnly, VerticalAlignment.CENTER);
    if (position === Position.TOP) return TextBlockUtils.mergeTB(noteOnly, labelOnly, HorizontalAlignment.CENTER);
    return TextBlockUtils.mergeTB(labelOnly, noteOnly, HorizontalAlignment.CENTER);
  }

  /**
   * The maker's `getQuantifier`: the `FontParam.ARROW` skin font, null when empty. The legacy `if` condition is
   * quantifier 2 (`UBrexCommandIf.java:212-215`).
   * @see CucaDiagramFileMakerElk.java:251-264
   */
  getQuantifier(linkId: string, n: 1 | 2, stringBounder: StringBounder): TextBlock | null {
    const text = n === 1 ? this.getQuantifier1(linkId) : this.getQuantifier2(linkId);
    if (text === null) return null;

    const skinParam = this.diagram.getSkinParam();
    const label = Display.getWithNewlines(skinParam.getPragma(), text).create(
      this.contextOf(arrowFontConfiguration(skinParam)),
      skinParam.getDefaultTextAlignment(HorizontalAlignment.CENTER),
    );
    return TextBlockUtils.isEmpty(label, stringBounder) ? null : label;
  }

  /** No legacy activity command sets a role (`LinkArg.build(label, length, ...)`, `CommandLinkActivity.java:297`). */
  getRoleLabel(linkId: string, n: 1 | 2, _stringBounder: StringBounder): TextBlock | null {
    const text = n === 1 ? this.getRole1(linkId) : this.getRole2(linkId);
    if (text !== null) throw new Error(`unported: a legacy activity link role under ELK (${linkId})`);
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

  /**
   * `MyElkEdge#getStyle`: `ARROW` + the diagram's style name + the stereotype, merged on the skin's CURRENT style
   * builder (not the link's), then `LineColor` and `getStroke()`.
   * @see MyElkEdge.java:140-145, 159, 170
   */
  getArrowStyle(linkId: string): ElkArrowStyle {
    const link = this.link(linkId);
    const skinParam = this.diagram.getSkinParam();
    const style = StyleSignatureBasic.of('root', 'element', STYLE_NAME, 'arrow')
      .withTOBECHANGED(link.getStereotype())
      .getMergedStyle(skinParam.getCurrentStyleBuilder());
    if (style === undefined) throw new Error('NullPointerException: no arrow style merged for the link');
    const lineColor = style.value('LineColor').asColor(skinParam.getIHtmlColorSet());
    return { lineColor: lightPaintOf(lineColor), stroke: style.getStroke() };
  }

  /** `Link#getColors()`: never null upstream. @see MyElkEdge.java:161-162 */
  getLinkColors(linkId: string): ElkColors | null {
    return elkColorsOf(this.link(linkId).getColors());
  }

  /** Dead behind {@link getLinkColors}, which is never null (`MyElkEdge.java:164`). */
  getSpecificColor(_linkId: string): Paint | null {
    return null;
  }
}
