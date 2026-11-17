/**
 * `EntityImageJson` / `TextBlockCucaJSon` — the margins a `json` leaf
 * embedded in a cuca diagram insets its cells and title by.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageJson.java
 *
 * Both the class and state engines render json leaves, and each declared
 * this whole set locally. They are one upstream shape: `EntityImageJson` is
 * dispatched from `GeneralImageBuilder` like any other leaf image, so the
 * numbers are not per-engine and never were.
 *
 * Deliberately NOT merged with the `map` leaf's own margins, which hold the
 * same values: `JSON_NAME_MARGIN` and `MAP_NAME_MARGIN` are independently
 * defined upstream (the class engine's own comment already said so), and
 * equal values are not grounds to merge.
 *
 * The image itself (dei T2a) takes its `Entity`/`ISkinParam` reads resolved by the caller (`EntityImageJsonParams`):
 * the description engine is its only consumer (decisions D1); class and state keep their own copies.
 */

import type { JsonNode } from '../../command/JsonNode.js';
import { Back } from '../../klimt/Back.js';
import { HColorSet } from '../../klimt/color/HColorSet.js';
import type { HColorOrPaint } from '../../klimt/color/ColorMapper.js';
import type { Stencil } from '../../klimt/creole/Stencil.js';
import { UGraphicStencil } from '../../klimt/drawing/UGraphicStencil.js';
import { bridgeFontConfiguration } from '../../klimt/font/FontConfigurationBridge.js';
import type { StringBounder } from '../../klimt/font/StringBounder.js';
import { HorizontalAlignment } from '../../klimt/geom/HorizontalAlignment.js';
import { PlacementStrategyY1Y2 } from '../../klimt/geom/PlacementStrategyY1Y2.js';
import { ULayoutGroup } from '../../klimt/geom/ULayoutGroup.js';
import { XDimension2D } from '../../klimt/geom/XDimension2D.js';
import type { TextBlock } from '../../klimt/shape/TextBlock.js';
import { TextBlockUtils } from '../../klimt/shape/TextBlockUtils.js';
import type { FontConfiguration } from '../../klimt/shape/UText.js';
import { UGroup, UGroupType } from '../../klimt/shape/UGroup.js';
import { URectangle } from '../../klimt/shape/URectangle.js';
import type { UGraphic } from '../../klimt/UGraphic.js';
import { UTranslate } from '../../klimt/UTranslate.js';
import type { Pragma } from '../../skin/Pragma.js';
import type { Style } from '../../style/Style.js';
import { StyleSignatureBasic } from '../../style/StyleSignatureBasic.js';
import type { EntityDecorationInfo } from '../DecorateEntityImage.js';
import { ShapeType } from '../ShapeType.js';
import { buildTextBlock } from './EntityImageDescriptionTextBlock.js';
import { applyFore, inGroup, styleColor } from './leaf-image-support.js';
import { TextBlockCucaJSon } from './TextBlockCucaJSon.js';

/** `EntityImageJson:97` — `withMargin(display.create(...), 2, 2)` on the title. */
export const JSON_NAME_MARGIN = 2;

/** `TextBlockCucaJSon#getTextBlock` — `withMargin(result, 5, 2)`, applied to
 *  BOTH a key cell and a scalar value cell. */
export const JSON_CELL_MARGIN_X = 5;
export const JSON_CELL_MARGIN_Y = 2;

/** `EntityImageJson:225` — `private int xMarginCircle = 5`. */
export const JSON_X_MARGIN_CIRCLE = 5;

/** `BodierLikeClassOrObject#marginEmptyFieldsOrMethod`, substituted by
 *  `getMethodOrFieldHeight` when the entries area is empty. Unlike `map`,
 *  this DOES fire for `json` — leafType JSON is not excluded, only MAP is. */
export const JSON_EMPTY_HEIGHT_FALLBACK = 13;

/** What `EntityImageJson`'s constructor reads off its `Entity`, `ISkinParam` and `PortionShower`, resolved by the
 *  caller (the description engine builds it from its node, D1). */
export interface EntityImageJsonParams {
  /** The group `drawU` opens (`EntityImageJson.java:177-182`). */
  readonly entity: EntityDecorationInfo;
  /** `entity.getDisplay()`, lines joined by `\n`. */
  readonly display: string;
  /** `stereotype.getLabels(guillemet)`, or `undefined` when `stereo` is null (`:99-101`). */
  readonly stereoLabels: readonly string[] | undefined;
  /** `BodierJSon`'s value; `undefined` draws the empty entries area (`setJson` never ran, `"Bad data"`). */
  readonly json: JsonNode | undefined;
  /** `getStyle()`: `root.element.objectDiagram.json` with the stereotype (`:143-146`). */
  readonly style: Style;
  /** `getStyleHeader()` (`:148-151`). */
  readonly styleHeader: Style;
  /** `FontConfiguration.create(getSkinParam(), FontParam.OBJECT_STEREOTYPE, stereotype)` (`:103-104`). */
  readonly stereoFont: FontConfiguration;
  /** `getEntity().getColors().getColor(ColorType.BACK / HEADER)` (`:160-162`). */
  readonly backColor?: HColorOrPaint | undefined;
  readonly headerBackColor?: HColorOrPaint | undefined;
  readonly pragma?: Pragma;
}

/** `StyleSignatureBasic.of(root, element, objectDiagram, json)`. @see EntityImageJson.java:138-141 */
export const JSON_STYLE_SIGNATURE = StyleSignatureBasic.of('root', 'element', 'objectDiagram', 'json');
/** `getStyleHeader`'s signature. @see EntityImageJson.java:148-151 */
export const JSON_HEADER_STYLE_SIGNATURE = JSON_STYLE_SIGNATURE.addSName('header');

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageJson.java:79 */
export class EntityImageJson implements Stencil {
  private readonly name: TextBlock;
  private readonly stereo: TextBlock | undefined;
  private readonly entries: TextBlockCucaJSon | undefined;
  private readonly roundCorner: number;
  private readonly set = HColorSet.instance();

  /** @see EntityImageJson.java:88-113 */
  constructor(private readonly p: EntityImageJsonParams) {
    this.roundCorner = p.style.value('RoundCorner').asDouble();
    const fcHeader = bridgeFontConfiguration(p.styleHeader.getFontConfiguration(this.set));
    this.name = TextBlockUtils.withMargin(
      buildTextBlock(p.display, fcHeader, HorizontalAlignment.CENTER),
      JSON_NAME_MARGIN,
      JSON_NAME_MARGIN,
      JSON_NAME_MARGIN,
      JSON_NAME_MARGIN,
    );
    this.stereo =
      p.stereoLabels === undefined
        ? undefined
        : buildTextBlock(p.stereoLabels.join('\n'), p.stereoFont, HorizontalAlignment.CENTER);
    const fontConfiguration = bridgeFontConfiguration(p.style.getFontConfiguration(this.set));
    // `BodierJSon#getBody`: `new TextBlockCucaJSon(fontConfiguration, skinParam, json, style.wrapWidth())`.
    this.entries =
      p.json === undefined
        ? undefined
        : new TextBlockCucaJSon(fontConfiguration, p.json, p.style.wrapWidth().getMaxWidth(), p.pragma);
  }

  /** @see EntityImageJson.java:123-136 */
  calculateDimension(stringBounder: StringBounder): XDimension2D {
    const dimTitle = this.getTitleDimension(stringBounder);
    const dimFields = this.entriesDimension(stringBounder);
    let width = Math.max(dimFields.getWidth(), dimTitle.getWidth() + 2 * JSON_X_MARGIN_CIRCLE);
    const minimumWidth = this.p.style.value('MinimumWidth').asDouble();
    if (width < minimumWidth) width = minimumWidth;
    const height = this.getMethodOrFieldHeight(dimFields) + dimTitle.getHeight();
    return new XDimension2D(width, height);
  }

  /** The title height: where the entries area starts, and the y the DOT row ports translate by (`:115-119`). */
  getTitleHeight(stringBounder: StringBounder): number {
    return this.getTitleDimension(stringBounder).getHeight();
  }

  private entriesDimension(stringBounder: StringBounder): XDimension2D {
    return this.entries?.calculateDimension(stringBounder) ?? new XDimension2D(0, 0);
  }

  /** @see EntityImageJson.java:153-215 */
  drawU(ug0: UGraphic): void {
    const p = this.p;
    const stringBounder = ug0.getStringBounder();
    const dimTotal = this.calculateDimension(stringBounder);
    const dimTitle = this.getTitleDimension(stringBounder);
    const widthTotal = dimTotal.getWidth();
    const heightTotal = dimTotal.getHeight();
    const rect = URectangle.build(widthTotal, heightTotal).rounded(this.roundCorner);
    const style = p.style;
    const borderColor = styleColor(style, 'LineColor', this.set);
    let headerBackcolor: HColorOrPaint | undefined = p.headerBackColor;
    let backcolor: HColorOrPaint | undefined = p.backColor;
    headerBackcolor ??= backcolor ?? styleColor(p.styleHeader, 'BackGroundColor', this.set);
    backcolor ??= styleColor(style, 'BackGroundColor', this.set);
    const back: HColorOrPaint = backcolor;
    const headerBack: HColorOrPaint = headerBackcolor;
    rect.setDeltaShadow(style.getShadowing());
    const stroke = style.getStroke();
    const ug = applyFore(ug0, borderColor).apply(new Back(back));

    const group = new UGroup(p.entity.location ?? null);
    group.put(UGroupType.CLASS, 'entity');
    group.put(UGroupType.ID, `entity_${p.entity.name}`);
    group.put(UGroupType.DATA_ENTITY, p.entity.name);
    group.put(UGroupType.DATA_UID, p.entity.uid);
    group.put(UGroupType.DATA_QUALIFIED_NAME, p.entity.qualifiedName);
    inGroup(ug, group, () => {
      ug.apply(stroke).draw(rect);
      if (colorKey(back) !== colorKey(headerBack)) {
        const rect2 = URectangle.build(widthTotal, dimTitle.getHeight()).halfRounded(this.roundCorner);
        ug.apply(new Back(headerBack)).apply(stroke).draw(rect2);
      }
      const header = new ULayoutGroup(new PlacementStrategyY1Y2(stringBounder));
      if (this.stereo !== undefined) header.add(this.stereo);
      header.add(this.name);
      header.drawU(ug, widthTotal, dimTitle.getHeight());
      if (this.entries !== undefined) {
        this.entries.setTotalWidth(widthTotal);
        this.entries.drawU(UGraphicStencil.create(ug, this, stroke).apply(UTranslate.dy(dimTitle.getHeight())));
      }
    });
  }

  /** @see EntityImageJson.java:217-223 (a json leaf is never `LeafType.MAP`) */
  private getMethodOrFieldHeight(dim: XDimension2D): number {
    const fieldsHeight = dim.getHeight();
    if (fieldsHeight === 0) return JSON_EMPTY_HEIGHT_FALLBACK;
    return fieldsHeight;
  }

  /** `getNameAndSteretypeDimension`. @see EntityImageJson.java:227-238 */
  private getTitleDimension(stringBounder: StringBounder): XDimension2D {
    const nameDim = this.name.calculateDimension(stringBounder);
    const stereoDim =
      this.stereo === undefined ? new XDimension2D(0, 0) : this.stereo.calculateDimension(stringBounder);
    return new XDimension2D(
      Math.max(nameDim.getWidth(), stereoDim.getWidth()),
      nameDim.getHeight() + stereoDim.getHeight(),
    );
  }

  /** @see EntityImageJson.java:244-246 */
  getStartingX(_stringBounder: StringBounder, _y: number): number {
    return 0;
  }

  /** @see EntityImageJson.java:248-250 */
  getEndingX(stringBounder: StringBounder, _y: number): number {
    return this.calculateDimension(stringBounder).getWidth();
  }

  /** @see EntityImageJson.java:240-242 */
  getShapeType(): ShapeType {
    return ShapeType.RECTANGLE_HTML_FOR_PORTS;
  }
}

/** `HColor#equals` over the two back colours `drawU` compares (`EntityImageJson.java:193`). */
function colorKey(color: HColorOrPaint): string {
  if (typeof color === 'string') return color.toLowerCase();
  const withString = color as { asString?: () => string };
  return withString.asString === undefined ? JSON.stringify(color) : withString.asString().toLowerCase();
}
