/**
 * PacketBlock — one drawn field of a packet row: `width` bit columns by
 * `height` bit rows, its label centred inside. A field split across rows is
 * marked open on a side, but nothing draws the open side (pep D6).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/packetdiag/PacketBlock.java
 */
import type { Fashion } from '../../core/klimt/Fashion.js';
import { CreoleMode } from '../../core/klimt/creole/CreoleMode.js';
import { Display } from '../../core/klimt/creole/Display.js';
import { UGraphicStencil } from '../../core/klimt/drawing/UGraphicStencil.js';
import { bridgeFontConfiguration } from '../../core/klimt/font/FontConfigurationBridge.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import { LineBreakStrategy } from '../../core/klimt/LineBreakStrategy.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import type { FontConfiguration } from '../../core/klimt/shape/UText.js';
import { TextBlockUtils } from '../../core/klimt/shape/TextBlockUtils.js';
import { URectangle } from '../../core/klimt/shape/URectangle.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UStroke } from '../../core/klimt/UStroke.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { Style } from '../../core/style/Style.js';
import { StyleSignatureBasic } from '../../core/style/StyleSignatureBasic.js';
import type { SkinParam } from './packet-skin-param.js';

/** The space above and below the label. @see PacketBlock.java:256 */
const V_MARGIN = 10;
/** What replaces the cut tail of a label too wide for its block. @see PacketBlock.java:235 */
const ABBR_PAD = '...';

/** The six-argument constructor's `leftOpen, rightOpen`. @see PacketBlock.java:131 */
export interface OpenSides {
  readonly leftOpen: boolean;
  readonly rightOpen: boolean;
}

/** The four-argument constructor's sides. @see PacketBlock.java:98-100 */
const CLOSED: OpenSides = { leftOpen: false, rightOpen: false };

/** @see PacketBlock.java:76 */
export class PacketBlock {
  /**
   * The dashed stroke an open side would be drawn with. Upstream declares it
   * and nothing reads it: `getShapeTextBlock` draws a closed rectangle (pep D6).
   * @see PacketBlock.java:78
   */
  static readonly openerStroke = new UStroke(5, 5, 1);

  /** In bit columns, before scale. @see PacketBlock.java:84 */
  private readonly width: number;
  /** In bit rows. @see PacketBlock.java:89 */
  private height: number;
  /** @see PacketBlock.java:94 */
  private readonly label: string;
  /** @see PacketBlock.java:96 */
  private readonly skinParam: SkinParam;
  /** Set by the split and never drawn (pep D6). @see PacketBlock.java:98 */
  private leftOpen = false;
  /** Set by the split and never drawn (pep D6). @see PacketBlock.java:100 */
  private rightOpen = false;

  /**
   * Both constructors: the open sides default closed. Java's six-argument form
   * passes the two sides as one object (pep D8).
   * @see PacketBlock.java:111-116, 131-138
   */
  constructor(width: number, height: number, label: string, skinParam: SkinParam, open: OpenSides = CLOSED) {
    this.width = width;
    this.height = height;
    this.label = label;
    this.skinParam = skinParam;
    this.leftOpen = open.leftOpen;
    this.rightOpen = open.rightOpen;
  }

  /** @see PacketBlock.java:146-148 */
  openLeft(leftOpen: boolean): void {
    this.leftOpen = leftOpen;
  }

  /** @see PacketBlock.java:157-159 */
  openRight(rightOpen: boolean): void {
    this.rightOpen = rightOpen;
  }

  /** Not upstream: reads the never-drawn open side for the tests (pep D6). */
  isLeftOpen(): boolean {
    return this.leftOpen;
  }

  /** Not upstream: reads the never-drawn open side for the tests (pep D6). */
  isRightOpen(): boolean {
    return this.rightOpen;
  }

  /** @see PacketBlock.java:166-168 */
  getWidth(): number {
    return this.width;
  }

  /** @see PacketBlock.java:175-177 */
  getHeight(): number {
    return this.height;
  }

  /** @see PacketBlock.java:184-186 */
  setHeight(height: number): void {
    this.height = height;
  }

  /** @see PacketBlock.java:194-196 */
  getDrawWidth(scale: number): number {
    return this.width * scale;
  }

  /** @see PacketBlock.java:204-206 */
  getDrawHeight(scale: number): number {
    return this.height * scale;
  }

  /** @see PacketBlock.java:214-216 */
  getLabel(): string {
    return this.label;
  }

  /** @see PacketBlock.java:218-221 */
  getStyle(): Style {
    // `getMergedStyle` answers undefined only for an undefined builder; the skin param always has one.
    return StyleSignatureBasic.of('root', 'element', 'packetdiagDiagram', 'rectangle').getMergedStyle(
      this.skinParam.getCurrentStyleBuilder(),
    )!;
  }

  /** @see PacketBlock.java:223-225 */
  getFashion(): Fashion {
    return this.getStyle().getSymbolContext(this.skinParam.getIHtmlColorSet());
  }

  /** `getStyle().getFontConfiguration(skinParam.getIHtmlColorSet())`, bridged to the creole's shape. */
  private getFontConfiguration(): FontConfiguration {
    return bridgeFontConfiguration(this.getStyle().getFontConfiguration(this.skinParam.getIHtmlColorSet()));
  }

  /** @see PacketBlock.java:227-231 */
  private getLabelTextBlock(label: string): TextBlock {
    const fontConfiguration = this.getFontConfiguration();
    return Display.getWithNewlines(this.skinParam.getPragma(), label).create8(
      { fontConfiguration, spriteContainer: this.skinParam, atomOps: this.skinParam.atomOps },
      HorizontalAlignment.CENTER,
      CreoleMode.SIMPLE_LINE,
      LineBreakStrategy.NONE,
    );
  }

  /**
   * The label, or the label cut char by char with `...` once it is as wide
   * as the block. The loop tests `labelDim + padDim` but assigns `labelDim`
   * from the abbreviation, which already holds the pad: mirrored as written.
   * @see PacketBlock.java:233-253
   */
  private getLabelTextBlockAbbr(stringBounder: StringBounder, bitWidth: number): TextBlock {
    // `getStyle().getUFont()`: the bridged configuration's family and size are that
    // font's, in the shape the port's `StringBounder` measures (the label's own).
    const font = this.getFontConfiguration();
    const padDim = stringBounder.calculateDimension(font, ABBR_PAD);
    let labelDim = stringBounder.calculateDimension(font, this.label);
    const reqWidth = this.getDrawWidth(bitWidth);
    if (labelDim.getWidth() < reqWidth) return this.getLabelTextBlock(this.label);
    // Shrink label char by char, this is technically wrong when there's multiple
    // Unicode code points
    let abbr = this.label;
    for (let i = this.label.length; i > 0; i--) {
      if (labelDim.getWidth() + padDim.getWidth() < reqWidth) break;
      abbr = this.label.substring(0, i) + ABBR_PAD;
      labelDim = stringBounder.calculateDimension(font, abbr);
    }
    return this.getLabelTextBlock(abbr);
  }

  /** @see PacketBlock.java:255-293 */
  getShapeTextBlock(stringBounder: StringBounder, bitWidth: number, bitHeight: number): TextBlock {
    const reqWidth = this.getDrawWidth(bitWidth);
    const fashion = this.getFashion();
    const label = this.getLabelTextBlockAbbr(stringBounder, bitWidth);
    const labelHeight = label.calculateDimension(stringBounder).getHeight();
    const totalSpare = Math.max(0, this.getDrawHeight(bitHeight) - labelHeight - V_MARGIN - V_MARGIN);
    const topSpare = totalSpare / 2.0;
    const bottomSpare = totalSpare - topSpare;
    const topSpacer = TextBlockUtils.empty(reqWidth, topSpare);
    const bottomSpacer = TextBlockUtils.empty(reqWidth, bottomSpare);
    const calculateDimension = (): XDimension2D =>
      new XDimension2D(reqWidth, topSpare + labelHeight + bottomSpare + V_MARGIN + V_MARGIN);

    return {
      calculateDimension,
      drawU(ug: UGraphic): void {
        const dim = calculateDimension();
        if (dim.getWidth() === 0 || dim.getHeight() === 0) return;
        ug = UGraphicStencil.create(ug, dim);
        ug = fashion.apply(ug);
        const shape = URectangle.build(dim.getWidth(), dim.getHeight()).rounded(fashion.getRoundCorner());
        shape.setDeltaShadow(fashion.getDeltaShadow());
        ug.draw(shape);

        const tb = TextBlockUtils.mergeTB(topSpacer, label, HorizontalAlignment.CENTER);
        const full = TextBlockUtils.mergeTB(tb, bottomSpacer, HorizontalAlignment.CENTER);
        full.drawU(ug.apply(new UTranslate(0, V_MARGIN)));
      },
    };
  }
}
