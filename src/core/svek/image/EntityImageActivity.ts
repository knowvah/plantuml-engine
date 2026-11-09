/**
 * `EntityImageActivity` — an activity box of a legacy activity diagram: a rounded rect (`CORNER` 25 → `rx`
 * 12.5) with its text, drawn with no `<g>` around either (the jar's own quirk, D9). With
 * `skinparam activityShape octagon` the node's polygon is drawn instead.
 *
 * `bibliotekon` is the one upstream collaborator this port does not have yet (`Bibliotekon#getNode`, T2b/T2c):
 * {@link NodePolygons} is the slice `drawOctagon` reads off it.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageActivity.java:62-168
 */
import type { Entity } from '../../abel/Entity.js';
import { bridgeFontConfiguration } from '../../klimt/font/FontConfigurationBridge.js';
import type { StringBounder } from '../../klimt/font/StringBounder.js';
import { HorizontalAlignment } from '../../klimt/geom/HorizontalAlignment.js';
import type { XDimension2D } from '../../klimt/geom/XDimension2D.js';
import type { TextBlock } from '../../klimt/shape/TextBlock.js';
import { URectangle } from '../../klimt/shape/URectangle.js';
import type { UShape } from '../../klimt/UShape.js';
import { UStroke } from '../../klimt/UStroke.js';
import { UTranslate } from '../../klimt/UTranslate.js';
import type { UGraphic } from '../../klimt/UGraphic.js';
import { ColorType } from '../../abel/ColorType.js';
import type { Stereotype } from '../../stereo/Stereotype.js';
import type { StyleSignature } from '../../style/StyleSignature.js';
import { StyleSignatureBasic } from '../../style/StyleSignatureBasic.js';
import type { Url } from '../../url/Url.js';
import { ShapeType } from '../ShapeType.js';
import { AbstractEntityImage, type LeafImageSkinParam } from './AbstractEntityImage.js';
import { asPaintColor, applyBack, applyFore, mergedStyleOf, styleColor } from './leaf-image-support.js';

/** The octagon `SvekNode#getPolygon` answers: a shape with a shadow. */
export interface OctagonPolygon extends UShape {
  setDeltaShadow(deltaShadow: number): void;
}

/** The slice of `Bibliotekon` this image reads: `getNode(entity).getPolygon()`, null when there is none. */
export interface NodePolygons {
  getNode(entity: Entity): { getPolygon(): OctagonPolygon | undefined };
}

/** `CORNER`. @see EntityImageActivity.java:66 */
export const CORNER = 25;
/** @see EntityImageActivity.java:68 */
const MARGIN = 10;
/** The stroke of an octagon node. @see EntityImageActivity.java:100 */
const OCTAGON_THICKNESS = 1.5;

/** The `startUrl`/`closeUrl` surface of concrete UGraphics, outside the scoped `UGraphic` interface. */
type UGraphicWithUrl = UGraphic & Partial<{ startUrl(url: Url): void; closeUrl(): void }>;

/** @see EntityImageActivity.java:64 */
export class EntityImageActivity extends AbstractEntityImage {
  private shadowing = 0;
  private readonly desc: TextBlock;
  private readonly url: Url | undefined;
  private readonly bibliotekon: NodePolygons;

  /** @see EntityImageActivity.java:71-84 */
  constructor(entity: Entity, skinParam: LeafImageSkinParam, bibliotekon: NodePolygons) {
    super(entity, skinParam);
    this.bibliotekon = bibliotekon;

    const style = mergedStyleOf(this.getStyleSignature(), skinParam.getCurrentStyleBuilder());
    const fontConfiguration = bridgeFontConfiguration(style.getFontConfiguration(skinParam.getIHtmlColorSet()));
    const horizontalAlignment = style.getHorizontalAlignment() ?? HorizontalAlignment.LEFT;
    this.shadowing = style.getShadowing();

    this.desc = entity
      .getDisplay()
      .create({ fontConfiguration, spriteContainer: skinParam, atomOps: skinParam.atomOps }, horizontalAlignment);
    this.url = entity.getUrl99();
  }

  /** @see EntityImageActivity.java:86-90 */
  protected calculateDimensionSlow(stringBounder: StringBounder): XDimension2D {
    const dim = this.desc.calculateDimension(stringBounder);
    return dim.delta(MARGIN * 2);
  }

  /** @see EntityImageActivity.java:92-107 */
  drawU(ug: UGraphic): void {
    const withUrl = ug as UGraphicWithUrl;
    if (this.url !== undefined) withUrl.startUrl?.(this.url);

    let drawn: UGraphic;
    if (this.getShapeType() === ShapeType.ROUND_RECTANGLE) drawn = this.drawNormal(ug);
    else if (this.getShapeType() === ShapeType.OCTAGON) drawn = this.drawOctagon(ug);
    else throw new Error('UnsupportedOperationException');

    if (this.url !== undefined) (drawn as UGraphicWithUrl).closeUrl?.();
  }

  /** @see EntityImageActivity.java:110-121 */
  private drawOctagon(ug: UGraphic): UGraphic {
    const node = this.bibliotekon.getNode(this.getEntity());
    const octagon = node.getPolygon();
    if (octagon === undefined) return this.drawNormal(ug);

    octagon.setDeltaShadow(this.shadowing);
    const colored = this.applyColors(ug);
    // `UStroke.withThickness(1.5)`, then `draw(octagon)`: the polygon is a klimt shape (a `UPolygon`).
    colored.apply(UStroke.withThickness(OCTAGON_THICKNESS)).draw(octagon);
    this.desc.drawU(colored.apply(new UTranslate(MARGIN, MARGIN)));
    return colored;
  }

  /** @see EntityImageActivity.java:123-141 */
  private drawNormal(ug: UGraphic): UGraphic {
    const stringBounder = ug.getStringBounder();
    const dimTotal = this.calculateDimension(stringBounder);

    const widthTotal = dimTotal.getWidth();
    const heightTotal = dimTotal.getHeight();
    const rect = URectangle.build(widthTotal, heightTotal).rounded(CORNER);
    rect.setDeltaShadow(this.shadowing);

    const colored = this.applyColors(ug);

    const skinParam = this.getSkinParam();
    const style = mergedStyleOf(this.getStyleSignature(), skinParam.getCurrentStyleBuilder());
    const stroke = style.getStroke();

    colored.apply(stroke).draw(rect);

    this.desc.drawU(colored.apply(new UTranslate(MARGIN, MARGIN)));
    return colored;
  }

  /** `{root, element, activityDiagram, activity}` with the stereotype. @see EntityImageActivity.java:143-147 */
  override getStyleSignature(): StyleSignature {
    return StyleSignatureBasic.of('root', 'element', 'activityDiagram', 'activity').withTOBECHANGED(this.getStereo());
  }

  /** The entity's BACK colour wins over the style's `BackGroundColor`. @see EntityImageActivity.java:149-160 */
  private applyColors(ug: UGraphic): UGraphic {
    const skinParam = this.getSkinParam();
    const style = mergedStyleOf(this.getStyleSignature(), skinParam.getCurrentStyleBuilder());
    const set = skinParam.getIHtmlColorSet();
    const borderColor = styleColor(style, 'LineColor', set);
    const entityBack = this.getEntity().getColors().getColor(ColorType.BACK);
    const backcolor = entityBack === undefined ? styleColor(style, 'BackGroundColor', set) : asPaintColor(entityBack);

    return applyBack(applyFore(ug, borderColor), backcolor);
  }

  /** @see EntityImageActivity.java:162-168 */
  getShapeType(): ShapeType {
    const stereotype: Stereotype | undefined = this.getStereo();
    if (this.getSkinParam().useOctagonForActivity(stereotype)) return ShapeType.OCTAGON;

    return ShapeType.ROUND_RECTANGLE;
  }
}
