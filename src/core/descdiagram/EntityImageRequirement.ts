/**
 * `EntityImageRequirement` — a Problem Frames requirement: its text (under its stereotype, when it has one) in a
 * dashed ellipse fitted by `TextBlockInEllipse`. A creole horizontal rule inside is clipped to the ellipse, as in a
 * use case (`MyUGraphicEllipse`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/descdiagram/EntityImageRequirement.java:71-210
 */
import { Back } from '../klimt/Back.js';
import { HColorSet } from '../klimt/color/HColorSet.js';
import { bridgeFontConfiguration } from '../klimt/font/FontConfigurationBridge.js';
import type { HColorOrPaint } from '../klimt/color/ColorMapper.js';
import type { Stencil } from '../klimt/creole/Stencil.js';
import { AbstractUGraphicHorizontalLine } from '../klimt/drawing/AbstractUGraphicHorizontalLine.js';
import { Fore } from '../klimt/Fore.js';
import type { StringBounder } from '../klimt/font/StringBounder.js';
import { HorizontalAlignment } from '../klimt/geom/HorizontalAlignment.js';
import type { XDimension2D } from '../klimt/geom/XDimension2D.js';
import type { TextBlock } from '../klimt/shape/TextBlock.js';
import { TextBlockInEllipse } from '../klimt/shape/TextBlockInEllipse.js';
import { TextBlockUtils } from '../klimt/shape/TextBlockUtils.js';
import type { UEllipse } from '../klimt/shape/UEllipse.js';
import type { UHorizontalLine } from '../klimt/shape/UHorizontalLine.js';
import type { FontConfiguration } from '../klimt/shape/UText.js';
import type { UGraphic } from '../klimt/UGraphic.js';
import { UStroke } from '../klimt/UStroke.js';
import type { UTranslate } from '../klimt/UTranslate.js';
import type { Style } from '../style/Style.js';
import { StyleSignatureBasic } from '../style/StyleSignatureBasic.js';
import { buildTextBlock } from '../svek/image/EntityImageDescriptionTextBlock.js';
import { descAtomOps } from '../svek/image/EntityImageDescriptionDelegates.js';
import { buildCreate2Name } from '../svek/image/EntityImageDescriptionName.js';
import type { GuillemetPair } from '../text/Guillemet.js';
import { ShapeType } from '../svek/ShapeType.js';

/** `StyleSignatureBasic.of(root, element, componentDiagram, requirement)`. @see EntityImageRequirement.java:97-100 */
export const REQUIREMENT_STYLE_SIGNATURE = StyleSignatureBasic.of('root', 'element', 'componentDiagram', 'requirement');

/** `new UStroke(7, 7, 1.5)`, the default border. @see EntityImageRequirement.java:107-114 */
const REQUIREMENT_DASH = 7;
const REQUIREMENT_THICKNESS = 1.5;
/** `UStroke.withThickness(1.5)` for a clipped horizontal rule. @see EntityImageRequirement.java:204 */
const HLINE_THICKNESS = 1.5;

/** What `EntityImageRequirement` reads off its entity, resolved by the caller (decisions D1). */
export interface EntityImageRequirementParams {
  /** `entity.getDisplay()`, lines joined by `\n`. */
  readonly display: string;
  /** `stereotype.getLabel(guillemet)`, or `undefined` when there is none (`:82-91`). */
  readonly stereoLabel: string | undefined;
  /** `getStyle()`: the body text's font and wrap (`BodyFactory.create2(..., getStyle())`, `:79-80`). */
  readonly style: Style;
  /** `FontConfiguration.create(getSkinParam(), FontParam.REQUIREMENT_STEREOTYPE, stereotype)` (`:87`). */
  readonly stereoFont: FontConfiguration;
  /** `getSkinParam().guillemet()`, read by the body's creole. */
  readonly guillemet?: GuillemetPair | undefined;
  /** `getColors().getColor(ColorType.LINE)`, else `ColorParam.requirementBorder` (`:127-129`). */
  readonly lineColor: HColorOrPaint;
  /** `getColors().getColor(ColorType.BACK)`, else `ColorParam.requirementBackground` (`:131-133`). */
  readonly backColor: HColorOrPaint;
  /** `getThickness(LineParam.requirementBorder, stereo)`; `undefined` takes the dashed default (`:107-114`). */
  readonly stroke?: UStroke | undefined;
}

/** @see EntityImageRequirement.java:151-209 */
class MyUGraphicEllipse extends AbstractUGraphicHorizontalLine {
  /** @see EntityImageRequirement.java:162-167 */
  constructor(
    ug: UGraphic,
    private readonly startingX: number,
    private readonly yTheoricalPosition: number,
    private readonly ellipse: UEllipse,
  ) {
    super(ug);
  }

  /** @see EntityImageRequirement.java:157-160 */
  protected copy(ug: UGraphic): AbstractUGraphicHorizontalLine {
    return new MyUGraphicEllipse(ug, this.startingX, this.yTheoricalPosition, this.ellipse);
  }

  /** @see EntityImageRequirement.java:169-178 */
  private getNormalized(y: number): number {
    if (y < this.yTheoricalPosition) throw new Error('IllegalArgumentException');
    const yy = y - this.yTheoricalPosition;
    if (yy > this.ellipse.getHeight()) throw new Error('IllegalArgumentException');
    return yy;
  }

  /** @see EntityImageRequirement.java:188-201 */
  private getStencil2(translate: UTranslate): Stencil {
    const dy = translate.getDy();
    return {
      getStartingX: (_sb: StringBounder, y: number): number =>
        this.startingX + this.ellipse.getStartingX(this.getNormalized(y + dy)),
      getEndingX: (_sb: StringBounder, y: number): number =>
        this.startingX + this.ellipse.getEndingX(this.getNormalized(y + dy)),
    };
  }

  /** @see EntityImageRequirement.java:203-206 */
  protected drawHline(ug: UGraphic, line: UHorizontalLine, translate: UTranslate): void {
    line.drawLineInternal(ug.apply(translate), this.getStencil2(translate), 0, UStroke.withThickness(HLINE_THICKNESS));
  }
}

/** @see EntityImageRequirement.java:71 */
export class EntityImageRequirement {
  private readonly desc: TextBlock;

  /** @see EntityImageRequirement.java:77-95 */
  constructor(private readonly p: EntityImageRequirementParams) {
    // `BodyFactory.create2(...)` is `new BodyEnhanced1(...)` (`BodyFactory.java:74-77`), whose body margins the ellipse
    // is fitted around; `buildCreate2Name` is description's `create2` for a display (`EntityImageDescriptionName.ts`).
    const minimumWidth = p.style.value('MinimumWidth').asDouble();
    const tmp = buildCreate2Name(
      p.display,
      styleFontOf(p.style),
      descAtomOps(undefined, undefined),
      p.guillemet,
      minimumWidth,
    );
    if (p.stereoLabel === undefined) {
      this.desc = tmp;
    } else {
      const stereo = buildTextBlock(p.stereoLabel, p.stereoFont, HorizontalAlignment.CENTER);
      this.desc = TextBlockUtils.mergeTB(stereo, tmp, HorizontalAlignment.CENTER);
    }
  }

  /** @see EntityImageRequirement.java:107-114 */
  private getStroke(): UStroke {
    return this.p.stroke ?? new UStroke(REQUIREMENT_DASH, REQUIREMENT_DASH, REQUIREMENT_THICKNESS);
  }

  /** @see EntityImageRequirement.java:116-118 */
  calculateDimension(stringBounder: StringBounder): XDimension2D {
    return new TextBlockInEllipse(this.desc, stringBounder).calculateDimension(stringBounder);
  }

  /** @see EntityImageRequirement.java:120-145 */
  drawU(ug0: UGraphic): void {
    const ellipse = new TextBlockInEllipse(this.desc, ug0.getStringBounder());
    const ug = ug0.apply(this.getStroke()).apply(new Fore(this.p.lineColor)).apply(new Back(this.p.backColor));
    ellipse.drawU(new MyUGraphicEllipse(ug, 0, 0, ellipse.getUEllipse()));
  }

  /** @see EntityImageRequirement.java:147-149 */
  getShapeType(): ShapeType {
    return ShapeType.OVAL;
  }
}

/** `style.getFontConfiguration(set)`, as every core image reads it. */
function styleFontOf(style: Style): FontConfiguration {
  return bridgeFontConfiguration(style.getFontConfiguration(HColorSet.instance()));
}
