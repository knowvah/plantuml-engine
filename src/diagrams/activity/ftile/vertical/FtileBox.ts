import type { Colors } from '../../../../core/abel/Colors.js';
import { Back } from '../../../../core/klimt/Back.js';
import { Fore } from '../../../../core/klimt/Fore.js';
import type { UGraphic } from '../../../../core/klimt/UGraphic.js';
import { UStroke } from '../../../../core/klimt/UStroke.js';
import { UTranslate } from '../../../../core/klimt/UTranslate.js';
import { HColors } from '../../../../core/klimt/color/HColors.js';
import { CreoleMode } from '../../../../core/klimt/creole/CreoleMode.js';
import type { Display } from '../../../../core/klimt/creole/Display.js';
import type { AtomOps } from '../../../../core/klimt/creole/Sea.js';
import { SheetBlock1 } from '../../../../core/klimt/creole/SheetBlock1.js';
import { SheetBlock2 } from '../../../../core/klimt/creole/SheetBlock2.js';
import type { Stencil } from '../../../../core/klimt/creole/Stencil.js';
import { bridgeFontConfiguration } from '../../../../core/klimt/font/FontConfigurationBridge.js';
import type { StringBounder } from '../../../../core/klimt/font/StringBounder.js';
import type { ClockwiseTopRightBottomLeft } from '../../../../core/klimt/geom/ClockwiseTopRightBottomLeft.js';
import { HorizontalAlignment } from '../../../../core/klimt/geom/HorizontalAlignment.js';
import type { TextBlock } from '../../../../core/klimt/shape/TextBlock.js';
import type { FontConfiguration } from '../../../../core/klimt/shape/UText.js';
import type { OptionStore } from '../../../../core/skin/SkinParamFresh.js';
import { SkinParamColors } from '../../../../core/skin/SkinParamColors.js';
import type { Stereotype } from '../../../../core/stereo/Stereotype.js';
import type { Style } from '../../../../core/style/Style.js';
import type { StyleBuilder } from '../../../../core/style/StyleBuilder.js';
import { StyleSignatureBasic } from '../../../../core/style/StyleSignatureBasic.js';
import type { HColor } from '../../../../core/style/Value.js';
import { asPaintColor, mergedStyleOf } from '../../../../core/svek/image/leaf-image-support.js';
import { OptionKey } from '../../../../core/tim/EaterOption.js';
import { AbstractFtile, type FtileStyledSkin } from '../AbstractFtile.js';
import type { BoxStyle } from '../BoxStyle.js';
import { FtileGeometry } from '../FtileGeometry.js';

/** `UStroke.withThickness(1)`, the `SheetBlock2` stroke. @see FtileBox.java:181-182 */
const SHEET_BLOCK2_THICKNESS = 1;

/** `UStroke.withThickness(2)`, the `!option debug` outline. @see FtileBox.java:204 */
const DEBUG_THICKNESS = 2;

/**
 * The skin `FtileBox` reads: the `ISkinParam` members plus `options()`
 * (`FtileBox.java:201`) and ADR-9's creole `atomOps` (the port's
 * `SheetBlock1` measures through it; `SkinParamFresh#atomOps`).
 */
export interface FtileBoxSkin extends FtileStyledSkin {
  options(): OptionStore;
  atomOps(fontConfiguration: FontConfiguration): AtomOps;
}

/**
 * `create`'s six arguments as one object (D11, the 5-parameter cap).
 * `swimlane` is always `undefined` here (`BpmElement.java:168`).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/vertical/FtileBox.java:138-139
 */
export interface FtileBoxCreateArgs {
  readonly skinParam: FtileBoxSkin;
  readonly label: Display;
  readonly swimlane: undefined;
  readonly boxStyle: BoxStyle | undefined;
  readonly stereotype: Stereotype | undefined;
  readonly styleBuilder: StyleBuilder | undefined;
}

/**
 * FtileBox — the rounded activity box BPM draws a docked event in: a
 * `SheetBlock2` over the label's creole sheet inset by the style's padding,
 * outlined by `BoxStyle`, with `!option debug`'s blue outline first.
 *
 * Not ported, as in `FtileBoxOld`: the `Ftile` graph members
 * `getInLinkRendering`/`getSwimlanes`/`getSwimlaneIn`/`getSwimlaneOut`
 * (java:107-123) and the fields behind them, `inRendering` (java:155) and
 * `swimlane`. `AbstractFtile.ts` declares none of them, so `create` does
 * not merge `styleArrow` (java:147), whose one reader is `inRendering`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/vertical/FtileBox.java:78-249
 */
export class FtileBox extends AbstractFtile implements TextBlock {
  /** @see FtileBox.java:80 */
  readonly padding: ClockwiseTopRightBottomLeft;
  /** @see FtileBox.java:83 */
  private readonly tb: TextBlock;
  /** `= 25` upstream, always overwritten by the constructor. @see FtileBox.java:84,172 */
  private readonly roundCorner: number;
  /** @see FtileBox.java:85 */
  private readonly shadowing: number;
  /** `null` upstream where the style has no valid value. @see FtileBox.java:86 */
  private readonly horizontalAlignment: HorizontalAlignment | undefined;
  /** @see FtileBox.java:87 */
  private readonly minimumWidth: number;
  /** @see FtileBox.java:91 */
  private readonly boxStyle: BoxStyle;
  /** @see FtileBox.java:93 */
  private readonly borderColor: HColor | undefined;
  /** @see FtileBox.java:94 */
  private readonly backColor: HColor | undefined;
  /** @see FtileBox.java:95 */
  private readonly style: Style;
  /** @see FtileBox.java:186 */
  private readonly print: string;
  /** `skinParam()` with `options()` (see {@link FtileBoxSkin}). */
  private readonly boxSkin: FtileBoxSkin;

  /** @see FtileBox.java:97-99 */
  static getStyleSignature(): StyleSignatureBasic {
    return StyleSignatureBasic.of('root', 'element', 'activityDiagram', 'activity');
  }

  /** @see FtileBox.java:101-103 */
  static getStyleSignatureArrow(): StyleSignatureBasic {
    return StyleSignatureBasic.of('root', 'element', 'activityDiagram', 'arrow');
  }

  /** @see FtileBox.java:138-149 */
  static create(args: FtileBoxCreateArgs): FtileBox {
    let stereotype = args.stereotype;
    if (stereotype === undefined && args.boxStyle !== undefined) stereotype = args.boxStyle.getStereotype();
    const styleBuilder = args.styleBuilder ?? args.skinParam.getCurrentStyleBuilder();
    const style = mergedStyleOf(FtileBox.getStyleSignature().withTOBECHANGED(stereotype), styleBuilder);
    // `boxStyle` is dereferenced unconditionally in `drawU`/`calculateDimensionFtile` (java:212,240).
    if (args.boxStyle === undefined) throw new Error('NullPointerException: FtileBox has no BoxStyle');
    return new FtileBox(args.skinParam, args.label, args.boxStyle, style);
  }

  /** @see FtileBox.java:151-184 */
  private constructor(skinParam: FtileBoxSkin, label: Display, boxStyle: BoxStyle, styleIn: Style) {
    super(skinParam);
    this.boxSkin = skinParam;
    this.boxStyle = boxStyle;
    const specBack: Colors | undefined = skinParam instanceof SkinParamColors ? skinParam.getColors() : undefined;
    const style = styleIn.eventuallyOverride(specBack);
    this.style = style;
    this.borderColor = style.value('LineColor').asColor(this.getIHtmlColorSet());
    this.backColor = style.value('BackGroundColor').asColor(this.getIHtmlColorSet());
    this.horizontalAlignment = style.getHorizontalAlignment();
    this.padding = style.getPadding();
    this.roundCorner = style.value('RoundCorner').asDouble();
    this.shadowing = style.getShadowing();
    this.minimumWidth = style.value('MinimumWidth').asDouble();
    this.tb = this.createTb(skinParam, label, style);
    this.print = label.toString();
  }

  /** `fc`, `wrapWidth`, the sheet and the `SheetBlock2`. @see FtileBox.java:166,175,179-182 */
  private createTb(skinParam: FtileBoxSkin, label: Display, style: Style): TextBlock {
    const fc = bridgeFontConfiguration(style.getFontConfiguration(this.getIHtmlColorSet()));
    const wrapWidth = style.wrapWidth();
    // The port's `CreoleParser` requires an alignment where Java would carry `null`.
    const align = skinParam.getDefaultTextAlignment(this.horizontalAlignment ?? HorizontalAlignment.LEFT);
    const sheet = skinParam.sheet(fc, align, CreoleMode.FULL).createSheet(label);
    return new SheetBlock2(
      new SheetBlock1(
        sheet as ConstructorParameters<typeof SheetBlock1>[0],
        wrapWidth,
        skinParam.atomOps(fc),
        skinParam.getPadding(),
      ),
      new MyStencil(this),
      UStroke.withThickness(SHEET_BLOCK2_THICKNESS),
    );
  }

  /** @see FtileBox.java:188-193 */
  toString(): string {
    return this.print;
  }

  /** @see FtileBox.java:195-234 */
  drawU(ugIn: UGraphic): void {
    const dimTotal = this.calculateDimension(ugIn.getStringBounder());
    const widthTotal = dimTotal.getWidth();
    const heightTotal = dimTotal.getHeight();
    let ug = ugIn;
    const options = this.boxSkin.options();
    // `Boolean.parseBoolean`: true only for "true", ignoring case.
    const isDebug = options.getValue(OptionKey.DEBUG)?.toLowerCase() === 'true';
    if (isDebug) {
      ug = ug.apply(new Fore(HColors.BLUE)).apply(UStroke.withThickness(DEBUG_THICKNESS));
      this.boxStyle.drawMeDebug(ug, widthTotal, heightTotal, this.shadowing, this.roundCorner);
    }
    const thickness = this.style.getStroke();
    ug = ug.apply(new Fore(asPaintColor(this.borderColor ?? HColors.none())));
    ug = ug.apply(new Back(asPaintColor(this.backColor ?? HColors.none())));
    ug = ug.apply(thickness);
    this.boxStyle.drawMe(ug, widthTotal, heightTotal, this.shadowing, this.roundCorner);
    this.drawText(ug, dimTotal.getWidth());
  }

  /** The alignment branches. @see FtileBox.java:215-233 */
  private drawText(ug: UGraphic, widthTotal: number): void {
    const padding = this.padding;
    if (this.horizontalAlignment === HorizontalAlignment.LEFT) {
      this.tb.drawU(ug.apply(new UTranslate(padding.getLeft(), padding.getTop())));
    } else if (this.horizontalAlignment === HorizontalAlignment.RIGHT) {
      const dimTb = this.tb.calculateDimension(ug.getStringBounder());
      this.tb.drawU(ug.apply(new UTranslate(widthTotal - dimTb.getWidth() - padding.getRight(), padding.getBottom())));
    } else if (this.horizontalAlignment === HorizontalAlignment.CENTER) {
      const dimTb = this.tb.calculateDimension(ug.getStringBounder());
      this.tb.drawU(ug.apply(new UTranslate((widthTotal - dimTb.getWidth()) / 2, padding.getBottom())));
    }
  }

  /** @see FtileBox.java:237-243 */
  protected calculateDimensionFtile(stringBounder: StringBounder): FtileGeometry {
    let dimRaw = this.tb.calculateDimension(stringBounder);
    dimRaw = dimRaw.delta(
      this.padding.getLeft() + this.padding.getRight(),
      this.padding.getBottom() + this.padding.getTop(),
    );
    dimRaw = dimRaw.atLeast(this.minimumWidth, 0);
    return new FtileGeometry(
      dimRaw.getWidth() + this.boxStyle.getShield(),
      dimRaw.getHeight(),
      dimRaw.getWidth() / 2,
      0,
      dimRaw.getHeight(),
    );
  }

  /** @see FtileBox.java:245-247 */
  getMyChildren(): readonly never[] {
    return [];
  }
}

/**
 * The inner class `FtileBox.MyStencil`: the `SheetBlock2` clip spans the box
 * less its padding.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/vertical/FtileBox.java:125-136
 */
class MyStencil implements Stencil {
  constructor(private readonly outer: FtileBox) {}

  /** @see FtileBox.java:127-129 */
  getStartingX(_stringBounder: StringBounder, _y: number): number {
    return -this.outer.padding.getLeft();
  }

  /** @see FtileBox.java:131-134 */
  getEndingX(stringBounder: StringBounder, _y: number): number {
    const dim = this.outer.calculateDimension(stringBounder);
    return dim.getWidth() - this.outer.padding.getRight();
  }
}
