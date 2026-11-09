/**
 * `EntityImageNote` — a note leaf (`note right: text` of a legacy activity diagram): the sizing half
 * (`GraphvizImageBuilder` writes the note's DOT node from it) and `drawU`: the plain folded box, or the Opale
 * notched towards the one entity it is linked to (`setOpaleLine`).
 *
 * Port-only: `drawU`'s `other.getMagneticBorder()` and this image's own are `MagneticBorderNone` for every image
 * `GeneralImageBuilder` answers in this engine (no `EntityImageDescription`), so both forces are zero and `other`
 * is not held. The Smetana branch (`opaleLink`, `setOpaleLink`) is not ported: the dot engine is the one in use.
 *
 * The text block is `BodyFactory.create3(strings, skinParam, horizontalAlignment, fontConfiguration,
 * style.wrapWidth(), style)`, whose upstream `Style` feeds two scalars (`BodyEnhanced2StyleValues`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageNote.java:80-148
 */
import type { Entity } from '../../abel/Entity.js';
import { ColorType } from '../../abel/ColorType.js';
import { Direction } from '../../abel/Direction.js';
import { UGraphicStencil } from '../../klimt/drawing/UGraphicStencil.js';
import { XPoint2D } from '../../klimt/geom/XPoint2D.js';
import type { DotPath } from '../../klimt/shape/DotPath.js';
import { UStroke } from '../../klimt/UStroke.js';
import { UTranslate } from '../../klimt/UTranslate.js';
import type { Url } from '../../url/Url.js';
import { Opale, OPALE_CORNERSIZE, getOpaleStrategy } from './Opale.js';
import { corner, polygonNormal } from './OpalePolygons.js';
import { BodyFactory } from '../../cucadiagram/BodyFactory.js';
import { bridgeFontConfiguration } from '../../klimt/font/FontConfigurationBridge.js';
import type { StringBounder } from '../../klimt/font/StringBounder.js';
import { HorizontalAlignment } from '../../klimt/geom/HorizontalAlignment.js';
import { XDimension2D } from '../../klimt/geom/XDimension2D.js';
import type { TextBlock } from '../../klimt/shape/TextBlock.js';
import { TextBlockUtils } from '../../klimt/shape/TextBlockUtils.js';
import type { UGraphic } from '../../klimt/UGraphic.js';
import type { Display } from '../../klimt/creole/Display.js';
import type { Style } from '../../style/Style.js';
import { StyleSignatureBasic } from '../../style/StyleSignatureBasic.js';
import type { StyleSignature } from '../../style/StyleSignature.js';
import { ShapeType } from '../ShapeType.js';
import { AbstractEntityImage, type LeafImageSkinParam } from './AbstractEntityImage.js';
import {
  applyBack,
  applyFore,
  asPaintColor,
  entityGroup,
  inGroup,
  mergedStyleOf,
  styleColor,
  type PaintColor,
} from './leaf-image-support.js';

/** @see EntityImageNote.java:77-79 */
const MARGIN_X1 = 6;
const MARGIN_X2 = 15;
const MARGIN_Y = 5;

/** What `setOpaleLine(line, node, other)` hands the note: the link's solved path and the note's own corner. */
export interface OpaleLine {
  /** `SvekEdge#isOpale`: the link spline is a single bezier (`SvekEdge.java:769-770, 804-806`). */
  isOpale(): boolean;
  /** `SvekEdge#getDotPath`, in the frame of `nodeMin`. */
  getDotPath(): DotPath;
  /** `SvekNode#getMinX/getMinY` of the note. */
  readonly nodeMin: { readonly x: number; readonly y: number };
}

/** The `startUrl`/`closeUrl` surface of concrete UGraphics, outside the scoped `UGraphic` interface. */
type UGraphicWithUrl = UGraphic & Partial<{ startUrl(url: Url): void; closeUrl(): void }>;

/** `CornerParam.DEFAULT.getRoundKey()`. @see CornerParam.java */
const ROUND_CORNER_KEY = 'roundcorner';

/** @see EntityImageNote.java:75 */
export class EntityImageNote extends AbstractEntityImage {
  private readonly style: Style;
  private readonly textBlock: TextBlock;
  private readonly noteBackgroundColor: PaintColor;
  private readonly borderColor: PaintColor;
  private readonly shadowing: number;
  private opaleLine: OpaleLine | undefined = undefined;

  /** @see EntityImageNote.java:84-107 */
  constructor(entity: Entity, skinParam: LeafImageSkinParam) {
    super(entity, skinParam);
    const strings = entity.getDisplay();

    this.style = mergedStyleOf(this.getStyleSignature(), skinParam.getCurrentStyleBuilder());
    const entityBack = entity.getColors().getColor(ColorType.BACK);
    const set = skinParam.getIHtmlColorSet();
    this.noteBackgroundColor =
      entityBack === undefined ? styleColor(this.style, 'BackGroundColor', set) : asPaintColor(entityBack);
    this.borderColor = styleColor(this.style, 'LineColor', set);
    this.shadowing = this.style.getShadowing();
    const fontConfiguration = bridgeFontConfiguration(this.style.getFontConfiguration(skinParam.getIHtmlColorSet()));
    const horizontalAlignment = this.style.getHorizontalAlignment() ?? HorizontalAlignment.LEFT;

    if (isSingleEmptyLine(strings)) this.textBlock = TextBlockUtils.empty(0, 0);
    else
      this.textBlock = BodyFactory.create3(
        strings,
        {
          skinParam,
          align: horizontalAlignment,
          titleConfig: fontConfiguration,
          lineBreakStrategy: this.style.wrapWidth(),
        },
        {
          defaultThickness: this.style.value('LineThickness').asDouble(),
          minimumWidth: this.style.value('MinimumWidth').asDoubleDefaultTo(0),
        },
        skinParam.atomOps,
      );
  }

  /** @see EntityImageNote.java:116-118 */
  getPreferredWidth(stringBounder: StringBounder): number {
    return this.getTextWidth(stringBounder);
  }

  /** @see EntityImageNote.java:120-122 */
  getPreferredHeight(stringBounder: StringBounder): number {
    return this.getTextHeight(stringBounder);
  }

  /** @see EntityImageNote.java:128-132 */
  protected getTextHeight(stringBounder: StringBounder): number {
    return this.textBlock.calculateDimension(stringBounder).getHeight() + 2 * MARGIN_Y;
  }

  protected getTextBlock(): TextBlock {
    return this.textBlock;
  }

  /** @see EntityImageNote.java:138-141 */
  protected getPureTextWidth(stringBounder: StringBounder): number {
    return this.textBlock.calculateDimension(stringBounder).getWidth();
  }

  /** @see EntityImageNote.java:143-146 */
  getTextWidth(stringBounder: StringBounder): number {
    return this.getPureTextWidth(stringBounder) + MARGIN_X1 + MARGIN_X2;
  }

  /** @see EntityImageNote.java:148-152 */
  protected calculateDimensionSlow(stringBounder: StringBounder): XDimension2D {
    const height = this.getPreferredHeight(stringBounder);
    const width = this.getPreferredWidth(stringBounder);
    return new XDimension2D(width, height);
  }

  /** `{root, element, <diagram style name>, note}` with the stereotype. @see EntityImageNote.java:154-158 */
  override getStyleSignature(): StyleSignature {
    return StyleSignatureBasic.of('root', 'element', this.getStyleName(), 'note').withTOBECHANGED(this.getStereo());
  }

  /** @see EntityImageNote.java:339-341 */
  getShapeType(): ShapeType {
    return ShapeType.RECTANGLE;
  }

  /** @see EntityImageNote.java:360-364 */
  setOpaleLine(line: OpaleLine): void {
    this.opaleLine = line;
  }

  /** `Stencil#getStartingX`. @see EntityImageNote.java:366-368 */
  getStartingX(_stringBounder: StringBounder, _y: number): number {
    return 0;
  }

  /** `Stencil#getEndingX`. @see EntityImageNote.java:370-372 */
  getEndingX(stringBounder: StringBounder, _y: number): number {
    return this.calculateDimension(stringBounder).getWidth();
  }

  /** @see EntityImageNote.java:160-232 */
  drawU(ug: UGraphic): void {
    const entity = this.getEntity();
    const url = entity.getUrl99();
    inGroup(ug, entityGroup(entity, 'entity', true), () => {
      if (url !== undefined) (ug as UGraphicWithUrl).startUrl?.(url);
      const ug2 = UGraphicStencil.create(ug, this, UStroke.simple());
      if (this.opaleLine === undefined || !this.opaleLine.isOpale()) this.drawNormal(ug2);
      else this.drawOpale(ug2, this.opaleLine);
      if (url !== undefined) (ug as UGraphicWithUrl).closeUrl?.();
    });
  }

  /** `skinParam.getRoundCorner(CornerParam.DEFAULT, null)`: digits, else 0. @see SkinParam.java:891-916 */
  private getRoundCorner(): number {
    const value = this.getSkinParam().getValue(ROUND_CORNER_KEY);
    return value !== null && /^[0-9]+$/.test(value) ? Number(value) : 0;
  }

  /** @see EntityImageNote.java:274-290 */
  private drawNormal(ug: UGraphic): void {
    const stringBounder = ug.getStringBounder();
    const width = this.getTextWidth(stringBounder);
    const roundCorner = this.getRoundCorner();
    const polygon = polygonNormal(width, this.getTextHeight(stringBounder), roundCorner, OPALE_CORNERSIZE);
    polygon.setDeltaShadow(this.shadowing);

    const colored = applyFore(applyBack(ug, this.noteBackgroundColor), this.borderColor);
    colored.apply(this.style.getStroke()).draw(polygon);
    colored.draw(corner(width, roundCorner, OPALE_CORNERSIZE));
    this.getTextBlock().drawU(colored.apply(new UTranslate(MARGIN_X1, MARGIN_Y)));
  }

  /** The `opaleLine.isOpale()` branch. @see EntityImageNote.java:244-267 */
  private drawOpale(ug: UGraphic, line: OpaleLine): void {
    const stringBounder = ug.getStringBounder();
    let path = line.getDotPath().copy();
    path.moveDelta(-line.nodeMin.x, -line.nodeMin.y);

    const textWidth = this.getTextWidth(stringBounder);
    const textHeight = this.getTextHeight(stringBounder);
    const center = new XPoint2D(textWidth / 2, textHeight / 2);
    if (distance(path.getStartPoint(), center) > distance(path.getEndPoint(), center)) path = path.reverse();

    const start = path.getStartPoint();
    const strategy = OPALE_DIRECTIONS[getOpaleStrategy(textWidth, textHeight, start)];
    const opale = new Opale(
      this.shadowing,
      this.borderColor,
      this.noteBackgroundColor,
      this.textBlock,
      true,
      this.style.getStroke(),
    );
    opale.setRoundCorner(this.getRoundCorner());
    opale.setOpale(strategy, new XPoint2D(start.x, start.y), new XPoint2D(path.getEndPoint().x, path.getEndPoint().y));
    const stroked = ug.apply(this.style.getStroke());
    const own = this.getEntity().getColors().getSpecificLineStroke();
    opale.drawU(own === undefined ? stroked : stroked.apply(own));
  }
}

const OPALE_DIRECTIONS = {
  left: Direction.LEFT,
  right: Direction.RIGHT,
  up: Direction.UP,
  down: Direction.DOWN,
} as const;

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** `strings.size() == 1 && strings.get(0).length() == 0`. @see EntityImageNote.java:103 */
function isSingleEmptyLine(strings: Display): boolean {
  return strings.size() === 1 && strings.get(0).toString().length === 0;
}
