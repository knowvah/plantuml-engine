/**
 * PacketIndicator — one tick of the bit scale above the grid: a full or
 * short vertical line through `nwdiag.VerticalLine`, and the bit number
 * centred above it when numbered.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/packetdiag/PacketIndicator.java
 */
import type { HColor } from '../../core/abel/Colors.js';
import { HColorGradient } from '../../core/klimt/color/HColorGradient.js';
import { HColorSimple } from '../../core/klimt/color/HColorSimple.js';
import { CreoleMode } from '../../core/klimt/creole/CreoleMode.js';
import { Display } from '../../core/klimt/creole/Display.js';
import { bridgeFontConfiguration } from '../../core/klimt/font/FontConfigurationBridge.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import { Fore } from '../../core/klimt/Fore.js';
import { LineBreakStrategy } from '../../core/klimt/LineBreakStrategy.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { TextBlockMemoized } from '../../core/klimt/shape/TextBlockMemoized.js';
import type { FontConfiguration } from '../../core/klimt/shape/UText.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { Style } from '../../core/style/Style.js';
import { VerticalLine } from '../nwdiag/VerticalLine.js';
import type { SkinParam } from './packet-skin-param.js';

/** @see PacketIndicator.java:72 */
export class PacketIndicator extends TextBlockMemoized {
  /** Height of a full tick. @see PacketIndicator.java:77 */
  static readonly V_LINE_FULL = 32;
  /** Height of a short tick. @see PacketIndicator.java:82 */
  static readonly V_LINE_SHORT = PacketIndicator.V_LINE_FULL / 2;

  /** @see PacketIndicator.java:84 */
  private readonly full: boolean;
  /** @see PacketIndicator.java:86 */
  private readonly numbered: boolean;
  /** @see PacketIndicator.java:88 */
  private readonly bitNumber: string;
  /** @see PacketIndicator.java:90 */
  private readonly style: Style;
  /** @see PacketIndicator.java:92 */
  private readonly skinParam: SkinParam;

  /** @see PacketIndicator.java:108-114 */
  constructor(full: boolean, numbered: boolean, bitNumber: number, style: Style, skinParam: SkinParam) {
    super();
    this.full = full;
    this.numbered = numbered;
    this.style = style;
    this.bitNumber = String(bitNumber);
    this.skinParam = skinParam;
  }

  /** The number is measured whether drawn or not. @see PacketIndicator.java:126-140 */
  drawU(ug: UGraphic): void {
    const numberTb = this.numberTb();
    // number dimension is always calculated for consistent padding
    const numberDim = numberTb.calculateDimension(ug.getStringBounder());

    const lineOffsetY = this.full ? 0 : PacketIndicator.V_LINE_SHORT;
    const lineLength = this.full ? PacketIndicator.V_LINE_FULL : PacketIndicator.V_LINE_SHORT;
    if (this.numbered) {
      const numberYOffset = this.full ? 0 : PacketIndicator.V_LINE_SHORT;
      numberTb.drawU(ug.apply(new UTranslate(-numberDim.getWidth() / 2, numberYOffset)));
    }
    const vLineTb = this.vLineTb(lineOffsetY, lineLength);
    vLineTb.drawU(ug.apply(UTranslate.dy(numberDim.getHeight())));
  }

  /** @see PacketIndicator.java:153-158 */
  protected calculateDimensionSlow(stringBounder: StringBounder): XDimension2D {
    const numberDim = this.numberTb().calculateDimension(stringBounder);
    const vLineHeight = this.full ? PacketIndicator.V_LINE_FULL : PacketIndicator.V_LINE_SHORT;
    return numberDim.mergeTB(new XDimension2D(0, vLineHeight));
  }

  /** @see PacketIndicator.java:160-163 */
  numberTb(): TextBlock {
    const fg = bridgeFontConfiguration(this.style.getFontConfiguration(this.skinParam.getIHtmlColorSet()));
    return PacketIndicator.createNumberTextBlock(fg, this.skinParam, this.bitNumber);
  }

  /** @see PacketIndicator.java:165-167 */
  vLineTb(y: number, height: number): TextBlock {
    return PacketIndicator.createVLineTextBlock(this.style, this.skinParam, y, height);
  }

  /** `NO_CREOLE`, left-aligned. @see PacketIndicator.java:180-183 */
  static createNumberTextBlock(fg: FontConfiguration, skinParam: SkinParam, ...s: string[]): TextBlock {
    return Display.create(...s).create8(
      { fontConfiguration: fg, spriteContainer: skinParam, atomOps: skinParam.atomOps },
      HorizontalAlignment.LEFT,
      CreoleMode.NO_CREOLE,
      LineBreakStrategy.NONE,
    );
  }

  /** @see PacketIndicator.java:198-214 */
  static createVLineTextBlock(style: Style, skinParam: SkinParam, y: number, height: number): TextBlock {
    const lineColor = style.getSymbolContext(skinParam.getIHtmlColorSet()).getForeColor();
    const stroke = style.getStroke();
    return {
      calculateDimension(): XDimension2D {
        return new XDimension2D(stroke.getThickness(), height);
      },
      drawU(ug: UGraphic): void {
        ug = ug.apply(new Fore(drawable(lineColor))).apply(stroke);
        const vLine = new VerticalLine(y, y + height, new Set());
        vLine.drawU(ug);
      },
    };
  }
}

/** `ug.apply(lineColor)`: the driver paints a simple or gradient colour; any other is Java's checked cast. */
function drawable(color: HColor | undefined): HColorSimple | HColorGradient {
  if (color instanceof HColorSimple || color instanceof HColorGradient) return color;
  throw new Error('ClassCastException: the packet indicator line colour is not an HColorSimple');
}
