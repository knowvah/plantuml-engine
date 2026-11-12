import { Colors } from '../../core/abel/Colors.js';
import { FontConfiguration } from '../../core/abel/FontConfiguration.js';
import { HColors } from '../../core/klimt/color/HColors.js';
import { Display } from '../../core/klimt/creole/Display.js';
import { bridgeFontConfiguration } from '../../core/klimt/font/FontConfigurationBridge.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { UFontFactory } from '../../core/klimt/font/UFontFactory.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import type { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import { Fore } from '../../core/klimt/Fore.js';
import { ULine } from '../../core/klimt/shape/ULine.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import type { UStroke } from '../../core/klimt/UStroke.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import { ActivityColorParam } from '../../core/skin/ColorParam.js';
import { getColor } from '../../core/skin/SkinParamUtils.js';
import type { Style } from '../../core/style/Style.js';
import { StyleSignatureBasic } from '../../core/style/StyleSignatureBasic.js';
import { asPaintColor, mergedStyleOf } from '../../core/svek/image/leaf-image-support.js';
import { BoxStyle } from '../activity/ftile/BoxStyle.js';
import { FtileBox } from '../activity/ftile/vertical/FtileBox.js';
import { FtileCircleStart } from '../activity/ftile/vertical/FtileCircleStart.js';
import { FtileDiamond } from '../activity/ftile/vertical/FtileDiamond.js';
import { AbstractConnectorPuzzle } from './AbstractConnectorPuzzle.js';
import { BpmElementType } from './BpmElementType.js';
import { Where, WHERE_VALUES } from './ConnectorPuzzle.js';
import type { BpmSkinParam } from './Placeable.js';

/** The red stub length. @see BpmElement.java:129-139 */
const STUB = 10;

/** `UFontFactory.serif(14)` of the unreachable `END` branch. @see BpmElement.java:163 */
const END_FONT_SIZE = 14;

/**
 * BpmElement — a start circle, a merge diamond or a docked event box, with a
 * red 10-px stub toward each direction it connects.
 *
 * `BpmElementType.END` has no command, so the red serif-14 text branch of
 * `toTextBlockInternal` (java:163-169) is unreachable; it is kept (D8).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/BpmElement.java:62-185
 */
export class BpmElement extends AbstractConnectorPuzzle {
  /** @see BpmElement.java:64 */
  private readonly id: string | null;
  /** @see BpmElement.java:65 */
  private readonly type: BpmElementType;
  /** @see BpmElement.java:66 */
  private readonly display: Display;
  /** @see BpmElement.java:172 */
  private dimension: XDimension2D | undefined;

  /** The two-argument overload passes a `null` label. @see BpmElement.java:70-78 */
  constructor(id: string | null, type: BpmElementType, label: string | null = null) {
    super();
    this.id = id;
    this.type = type;
    this.display = Display.getWithNewlines(this.getPragma(), label);
  }

  /** @see BpmElement.java:80-86 */
  toString(): string {
    if (this.id === null) return `${this.type}(${this.display.toString()})`;
    return `${this.type}(${this.id})`;
  }

  /** @see BpmElement.java:88-90 */
  getType(): BpmElementType {
    return this.type;
  }

  /** @see BpmElement.java:92-94 */
  getDisplay(): Display {
    return this.display;
  }

  /** The raw block, then a red stub per held direction. @see BpmElement.java:96-123 */
  toTextBlock(skinParam: BpmSkinParam): TextBlock {
    const raw = this.toTextBlockInternal(skinParam);
    return {
      drawU: (ugIn: UGraphic): void => {
        raw.drawU(ugIn);
        const ug = ugIn.apply(new Fore(HColors.RED));
        for (const w of WHERE_VALUES)
          if (this.have(w)) this.drawLine(ug, w, raw.calculateDimension(ug.getStringBounder()));
      },
      calculateDimension: (stringBounder: StringBounder) => raw.calculateDimension(stringBounder),
    };
  }

  /** @see BpmElement.java:125-140 */
  private drawLine(ug: UGraphic, w: Where, total: XDimension2D): void {
    const width = total.getWidth();
    const height = total.getHeight();
    if (w === Where.WEST) ug.apply(new UTranslate(-STUB, height / 2)).draw(ULine.hline(STUB));
    if (w === Where.EAST) ug.apply(new UTranslate(width, height / 2)).draw(ULine.hline(STUB));
    if (w === Where.NORTH) ug.apply(new UTranslate(width / 2, -STUB)).draw(ULine.vline(STUB));
    if (w === Where.SOUTH) ug.apply(new UTranslate(width / 2, height)).draw(ULine.vline(STUB));
  }

  /** @see BpmElement.java:142-148 */
  private getStyle(skinParam: BpmSkinParam): Style {
    const signature = StyleSignatureBasic.of('root', 'element', 'activityDiagram', 'circle');
    return mergedStyleOf(signature, skinParam.getCurrentStyleBuilder());
  }

  /** @see BpmElement.java:150-170 */
  toTextBlockInternal(skinParam: BpmSkinParam): TextBlock {
    if (this.type === BpmElementType.START)
      return new FtileCircleStart(skinParam, undefined, this.getStyle(skinParam), Colors.empty());
    if (this.type === BpmElementType.MERGE) {
      const borderColor = asPaintColor(getColor(skinParam, undefined, ActivityColorParam.activityBorder));
      const backColor = asPaintColor(getColor(skinParam, undefined, ActivityColorParam.activityBackground));
      return new FtileDiamond(skinParam, backColor, borderColor, undefined);
    }
    if (this.type === BpmElementType.DOCKED_EVENT) {
      return FtileBox.create({
        skinParam,
        label: this.display,
        swimlane: undefined,
        boxStyle: BoxStyle.PLAIN,
        stereotype: undefined,
        styleBuilder: undefined,
      });
    }
    return this.endBlock(skinParam);
  }

  /**
   * The unreachable `END` text: red serif 14 (Java passes a `null` underline
   * stroke, which only a hyperlink would read).
   * @see BpmElement.java:163-169
   */
  private endBlock(skinParam: BpmSkinParam): TextBlock {
    const font = UFontFactory.serif(END_FONT_SIZE);
    const fc = bridgeFontConfiguration(
      FontConfiguration.create(font, HColors.RED, HColors.RED, null as unknown as UStroke),
    );
    const ctx = { fontConfiguration: fc, spriteContainer: skinParam, atomOps: skinParam.atomOps(fc) };
    if (Display.isNull(this.display))
      return Display.getWithNewlines(skinParam.getPragma(), this.type).create(ctx, HorizontalAlignment.LEFT);
    return this.display.create(ctx, HorizontalAlignment.LEFT);
  }

  /** Memoised. @see BpmElement.java:174-179 */
  getDimension(stringBounder: StringBounder, skinParam: BpmSkinParam): XDimension2D {
    this.dimension ??= this.toTextBlock(skinParam).calculateDimension(stringBounder);
    return this.dimension;
  }

  /** @see BpmElement.java:181-183 */
  getId(): string | null {
    return this.id;
  }
}
