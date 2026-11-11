/**
 * `WPrint`: a line of `print("…")` text, at the cursor position it was given.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/wire/WPrint.java:52-87
 */
import type { Display } from '../../core/klimt/creole/Display.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { UFontFactory } from '../../core/klimt/font/UFontFactory.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import type { UChange } from '../../core/klimt/UChange.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import type { UTranslate } from '../../core/klimt/UTranslate.js';
import type { HColor } from '../../core/style/Value.js';
import { blackBlueTrueChanged, createLeft, getBlack, type WireSkinParam } from './wire-klimt.js';

/** `UFontFactory.sansSerif(10)`. @see WPrint.java:71 */
const PRINT_FONT_SIZE = 10;

export class WPrint {
  private readonly position: UTranslate;
  private readonly color: HColor;
  private readonly label: Display;
  private readonly skinParam: WireSkinParam;

  /** @see WPrint.java:59-64 */
  constructor(skinParam: WireSkinParam, position: UTranslate, color: HColor | undefined, label: Display) {
    this.position = position;
    this.skinParam = skinParam;
    this.label = label;
    this.color = color ?? getBlack();
  }

  /** @see WPrint.java:70-74 */
  private getTextBlock(): TextBlock {
    const fontConfiguration = blackBlueTrueChanged(UFontFactory.sansSerif(PRINT_FONT_SIZE), this.color);
    return createLeft(this.label, fontConfiguration, this.skinParam);
  }

  /** @see WPrint.java:76-78 */
  getPosition(): UChange {
    return this.position;
  }

  /** @see WPrint.java:80-82 */
  drawMe(ug: UGraphic): void {
    this.getTextBlock().drawU(ug);
  }

  /** @see WPrint.java:84-86 */
  getHeight(stringBounder: StringBounder): number {
    return this.getTextBlock().calculateDimension(stringBounder).getHeight();
  }
}
