/**
 * `EntityImageMap` — a `map` leaf: the json image's header (name over an optional stereotype, margin 2,2) above a
 * `TextBlockMap`, in a rounded box. It differs from `EntityImageJson` where the Java does: the border takes the
 * entity's own `LINE` colour first (`##colour` on the declaration), an empty body adds no height (the 13 fallback is
 * `LeafType.MAP`-excluded), and its row ports are the body's, below the title (`getPorts`).
 *
 * The constructor takes its `Entity`/`ISkinParam` reads resolved by the caller (`EntityImageMapParams`), as
 * `EntityImageJson` does; the description engine is its consumer (decisions D1), class keeps its own sizing.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageMap.java:79-257
 */
import { TextBlockMap } from '../../cucadiagram/TextBlockMap.js';
import { Back } from '../../klimt/Back.js';
import type { HColorOrPaint } from '../../klimt/color/ColorMapper.js';
import { HColorSet } from '../../klimt/color/HColorSet.js';
import type { Stencil } from '../../klimt/creole/Stencil.js';
import { UGraphicStencil } from '../../klimt/drawing/UGraphicStencil.js';
import { Fore } from '../../klimt/Fore.js';
import { bridgeFontConfiguration } from '../../klimt/font/FontConfigurationBridge.js';
import type { StringBounder } from '../../klimt/font/StringBounder.js';
import { HorizontalAlignment } from '../../klimt/geom/HorizontalAlignment.js';
import { PlacementStrategyY1Y2 } from '../../klimt/geom/PlacementStrategyY1Y2.js';
import { ULayoutGroup } from '../../klimt/geom/ULayoutGroup.js';
import { XDimension2D } from '../../klimt/geom/XDimension2D.js';
import type { TextBlock } from '../../klimt/shape/TextBlock.js';
import { TextBlockUtils } from '../../klimt/shape/TextBlockUtils.js';
import { UGroup, UGroupType } from '../../klimt/shape/UGroup.js';
import type { FontConfiguration } from '../../klimt/shape/UText.js';
import { URectangle } from '../../klimt/shape/URectangle.js';
import type { UGraphic } from '../../klimt/UGraphic.js';
import { UTranslate } from '../../klimt/UTranslate.js';
import type { Pragma } from '../../skin/Pragma.js';
import type { Style } from '../../style/Style.js';
import { StyleSignatureBasic } from '../../style/StyleSignatureBasic.js';
import type { EntityDecorationInfo } from '../DecorateEntityImage.js';
import type { Ports } from '../Ports.js';
import { ShapeType } from '../ShapeType.js';
import { buildTextBlock } from './EntityImageDescriptionTextBlock.js';
import { inGroup, styleColor } from './leaf-image-support.js';

/** `withMargin(display.create(...), 2, 2)` on the name. @see EntityImageMap.java:97 */
const MAP_NAME_MARGIN = 2;
/** `private int xMarginCircle = 5`. @see EntityImageMap.java:230 */
const MAP_X_MARGIN_CIRCLE = 5;

/** `StyleSignatureBasic.of(root, element, objectDiagram, map)`. @see EntityImageMap.java:137-139 */
export const MAP_STYLE_SIGNATURE = StyleSignatureBasic.of('root', 'element', 'objectDiagram', 'map');
/** `getStyleHeader`'s signature. @see EntityImageMap.java:146-149 */
export const MAP_HEADER_STYLE_SIGNATURE = MAP_STYLE_SIGNATURE.addSName('header');

/** What `EntityImageMap`'s constructor and `drawU` read off the entity, resolved by the caller. */
export interface EntityImageMapParams {
  /** The group `drawU` opens (`EntityImageMap.java:189-195`). */
  readonly entity: EntityDecorationInfo;
  /** `entity.getDisplay()`, lines joined by `\n`. */
  readonly display: string;
  /** `stereotype.getLabels(guillemet)`, or `undefined` when `stereo` is null (`:99-101`). */
  readonly stereoLabels: readonly string[] | undefined;
  /** `BodierMap`'s table (`BodierMap#getMap`). */
  readonly map: ReadonlyMap<string, string>;
  /** `getStyle()` (`:141-144`) and `getStyleHeader()` (`:146-149`). */
  readonly style: Style;
  readonly styleHeader: Style;
  /** `FontConfiguration.create(getSkinParam(), FontParam.OBJECT_STEREOTYPE, stereotype)` (`:103-104`). */
  readonly stereoFont: FontConfiguration;
  /** `getColors().getColor(ColorType.LINE / BACK / HEADER)` (`:157-159`). */
  readonly lineColor?: HColorOrPaint | undefined;
  readonly backColor?: HColorOrPaint | undefined;
  readonly headerBackColor?: HColorOrPaint | undefined;
  readonly pragma?: Pragma;
}

/** @see EntityImageMap.java:79 */
export class EntityImageMap implements Stencil {
  private readonly name: TextBlock;
  private readonly stereo: TextBlock | undefined;
  private readonly entries: TextBlockMap;
  private readonly roundCorner: number;
  private readonly set = HColorSet.instance();

  /** @see EntityImageMap.java:88-113 */
  constructor(private readonly p: EntityImageMapParams) {
    this.roundCorner = p.style.value('RoundCorner').asDouble();
    const fcHeader = bridgeFontConfiguration(p.styleHeader.getFontConfiguration(this.set));
    this.name = TextBlockUtils.withMargin(
      buildTextBlock(p.display, fcHeader, HorizontalAlignment.CENTER),
      MAP_NAME_MARGIN,
      MAP_NAME_MARGIN,
      MAP_NAME_MARGIN,
      MAP_NAME_MARGIN,
    );
    this.stereo =
      p.stereoLabels === undefined
        ? undefined
        : buildTextBlock(p.stereoLabels.join('\n'), p.stereoFont, HorizontalAlignment.CENTER);
    const fontConfiguration = bridgeFontConfiguration(p.style.getFontConfiguration(this.set));
    // `BodierMap#getBody`: `new TextBlockMap(fc, skinParam, map, style.wrapWidth(), style.getHorizontalAlignment())`.
    this.entries = new TextBlockMap(
      fontConfiguration,
      p.map,
      p.style.wrapWidth().getMaxWidth(),
      p.style.getHorizontalAlignment() ?? HorizontalAlignment.LEFT,
      p.pragma,
    );
  }

  /** @see EntityImageMap.java:116-119 */
  getPorts(stringBounder: StringBounder): Ports {
    return this.entries.getPorts(stringBounder).translateY(this.getTitleDimension(stringBounder).getHeight());
  }

  /** @see EntityImageMap.java:124-135 */
  calculateDimension(stringBounder: StringBounder): XDimension2D {
    const dimTitle = this.getTitleDimension(stringBounder);
    const dimFields = this.entries.calculateDimension(stringBounder);
    let width = Math.max(dimFields.getWidth(), dimTitle.getWidth() + 2 * MAP_X_MARGIN_CIRCLE);
    const minClassWidth = this.p.style.value('MinimumWidth').asDouble();
    if (width < minClassWidth) width = minClassWidth;
    // `getMethodOrFieldHeight` (`:222-228`): a map's empty body keeps height 0, the 13 fallback skips `LeafType.MAP`.
    const height = dimFields.getHeight() + dimTitle.getHeight();
    return new XDimension2D(width, height);
  }

  /** @see EntityImageMap.java:151-220 */
  drawU(ug0: UGraphic): void {
    const p = this.p;
    const stringBounder = ug0.getStringBounder();
    const dimTotal = this.calculateDimension(stringBounder);
    const dimTitle = this.getTitleDimension(stringBounder);
    const widthTotal = dimTotal.getWidth();
    const rect = URectangle.build(widthTotal, dimTotal.getHeight()).rounded(this.roundCorner);
    const style = p.style;
    const borderColor: HColorOrPaint = p.lineColor ?? styleColor(style, 'LineColor', this.set);
    const headerBack: HColorOrPaint =
      p.headerBackColor ?? p.backColor ?? styleColor(p.styleHeader, 'BackGroundColor', this.set);
    const back: HColorOrPaint = p.backColor ?? styleColor(style, 'BackGroundColor', this.set);
    rect.setDeltaShadow(style.getShadowing());
    const stroke = style.getStroke();
    const ug = ug0.apply(new Fore(borderColor)).apply(new Back(back));

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
      // `HorizontalAlignment.CENTER.asPlacementStrategy` is `PlacementStrategyY1Y2` (`HorizontalAlignment.java:103-104`).
      const header = new ULayoutGroup(new PlacementStrategyY1Y2(stringBounder));
      if (this.stereo !== undefined) header.add(this.stereo);
      header.add(this.name);
      header.drawU(ug, widthTotal, dimTitle.getHeight());
      this.entries.setTotalWidth(widthTotal);
      this.entries.drawU(UGraphicStencil.create(ug, this, stroke).apply(UTranslate.dy(dimTitle.getHeight())));
    });
  }

  /** `getNameAndSteretypeDimension`. @see EntityImageMap.java:232-243 */
  private getTitleDimension(stringBounder: StringBounder): XDimension2D {
    const nameDim = this.name.calculateDimension(stringBounder);
    const stereoDim =
      this.stereo === undefined ? new XDimension2D(0, 0) : this.stereo.calculateDimension(stringBounder);
    return new XDimension2D(
      Math.max(nameDim.getWidth(), stereoDim.getWidth()),
      nameDim.getHeight() + stereoDim.getHeight(),
    );
  }

  /** @see EntityImageMap.java:245-247 */
  getShapeType(): ShapeType {
    return ShapeType.RECTANGLE_HTML_FOR_PORTS;
  }

  /** @see EntityImageMap.java:249-251 */
  getStartingX(_stringBounder: StringBounder, _y: number): number {
    return 0;
  }

  /** @see EntityImageMap.java:253-255 */
  getEndingX(stringBounder: StringBounder, _y: number): number {
    return this.calculateDimension(stringBounder).getWidth();
  }
}

/** `HColor#equals` over the two back colours `drawU` compares (`EntityImageMap.java:198`). */
function colorKey(color: HColorOrPaint): string {
  if (typeof color === 'string') return color.toLowerCase();
  const withString = color as { asString?: () => string };
  return withString.asString === undefined ? JSON.stringify(color) : withString.asString().toLowerCase();
}
