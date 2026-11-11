/**
 * `TitleBox`: a rule's name in bold, its text drawn on the baseline (`height - descent`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/TitleBox.java:47-71
 */
import { addFontStyle } from '../../core/klimt/creole/command/AddStyle.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import type { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import { TextBlockMemoized } from '../../core/klimt/shape/TextBlockMemoized.js';
import { type FontConfiguration, FontStyle, UText } from '../../core/klimt/shape/UText.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';

export class TitleBox extends TextBlockMemoized {
  private readonly value: string;
  private readonly fc: FontConfiguration;
  private readonly utext: UText;

  /** @see TitleBox.java:53-57 */
  constructor(value: string, fc: FontConfiguration) {
    super();
    this.value = value;
    this.fc = addFontStyle(fc, FontStyle.BOLD);
    this.utext = UText.build(value, this.fc);
  }

  /** `stringBounder.calculateDimension(fc.getFont(), value)`. @see TitleBox.java:59-62 */
  protected calculateDimensionSlow(stringBounder: StringBounder): XDimension2D {
    return stringBounder.calculateDimension(this.fc, this.value);
  }

  /** @see TitleBox.java:64-68 */
  drawU(ug: UGraphic): void {
    const dimText = this.calculateDimension(ug.getStringBounder());
    ug.apply(new UTranslate(0, dimText.getHeight() - this.utext.getDescent(ug.getStringBounder()))).draw(this.utext);
  }
}
