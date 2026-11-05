/**
 * CardBox — one board card: a fixed 150×70 shadowed rectangle, black on
 * light gray, and its label as a creole sheet at `(3, 3)`. It reads no
 * style, skinparam or theme (bep D6): `skin rose`, `monochrome` and
 * `<style>` leave the card `#C0C0C0`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/board/CardBox.java
 */
import { FontConfiguration } from '../../core/abel/FontConfiguration.js';
import { Back } from '../../core/klimt/Back.js';
import { HColors } from '../../core/klimt/color/HColors.js';
import type { Display } from '../../core/klimt/creole/Display.js';
import { Fore } from '../../core/klimt/Fore.js';
import { bridgeFontConfiguration } from '../../core/klimt/font/FontConfigurationBridge.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { UFontFactory } from '../../core/klimt/font/UFontFactory.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { URectangle } from '../../core/klimt/shape/URectangle.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { SkinParam } from './board-skin-param.js';

/** @see CardBox.java:69 */
const CARD_WIDTH = 150;
/** @see CardBox.java:69 */
const CARD_HEIGHT = 70;
/** @see CardBox.java:74 */
const CARD_DELTA_SHADOW = 1;
/** `UFontFactory.sansSerif(14)`. @see CardBox.java:78 */
const CARD_FONT_SIZE = 14;
/** `new UTranslate(3, 3)`. @see CardBox.java:79 */
const LABEL_OFFSET = 3;

/** @see CardBox.java:53 */
export class CardBox implements TextBlock {
  /** @see CardBox.java:55 */
  private readonly label: Display;
  /** @see CardBox.java:56 */
  private readonly skinParam: SkinParam;

  /** @see CardBox.java:58-61 */
  constructor(label: Display, skinParam: SkinParam) {
    this.label = label;
    this.skinParam = skinParam;
  }

  /** @see CardBox.java:67-70 */
  calculateDimension(_stringBounder: StringBounder): XDimension2D {
    return new XDimension2D(CARD_WIDTH, CARD_HEIGHT);
  }

  /** @see CardBox.java:72-81 */
  drawU(ug: UGraphic): void {
    const dim = this.calculateDimension(ug.getStringBounder());
    const rect = URectangle.build(dim.getWidth(), dim.getHeight());
    rect.setDeltaShadow(CARD_DELTA_SHADOW);

    ug.apply(new Fore(HColors.BLACK)).apply(new Back(HColors.LIGHT_GRAY)).draw(rect);

    // `label.create(fc, LEFT, skinParam)` is `create7(..., CreoleMode.FULL)` (Display.java:614-617).
    const fontConfiguration = bridgeFontConfiguration(
      FontConfiguration.blackBlueTrue(UFontFactory.sansSerif(CARD_FONT_SIZE)),
    );
    this.label
      .create(
        { fontConfiguration, spriteContainer: this.skinParam, atomOps: this.skinParam.atomOps },
        HorizontalAlignment.LEFT,
      )
      .drawU(ug.apply(new UTranslate(LABEL_OFFSET, LABEL_OFFSET)));
  }
}
