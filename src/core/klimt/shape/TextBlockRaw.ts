/**
 * `TextBlockRaw` — strings drawn as they are, one {@link SingleLine.rawText}
 * per string stacked downwards, no creole. `GraphicStrings` uses it for
 * `CreoleMode.NO_CREOLE`: the error banner and, since upstream `aa79d2d80ee`,
 * the source of a formula that cannot be drawn.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/shape/TextBlockRaw.java:47-98
 */
import type { StringBounder } from '../font/StringBounder.js';
import { XDimension2D } from '../geom/XDimension2D.js';
import type { UGraphic } from '../UGraphic.js';
import { UTranslate } from '../UTranslate.js';
import { SingleLine } from './SingleLine.js';
import { TextBlockMemoized } from './TextBlockMemoized.js';
import type { FontConfiguration } from './UText.js';

export class TextBlockRaw extends TextBlockMemoized {
  private lines2: readonly SingleLine[] | undefined;

  /** @see TextBlockRaw.java:54-57 */
  constructor(
    private readonly strings: readonly string[],
    private readonly fontConfiguration: FontConfiguration,
  ) {
    super();
  }

  /** @see TextBlockRaw.java:59-70 */
  private getLines(): readonly SingleLine[] {
    this.lines2 ??= this.strings.map((s) => SingleLine.rawText(s, this.fontConfiguration));
    return this.lines2;
  }

  /** @see TextBlockRaw.java:72-86 */
  protected calculateDimensionSlow(stringBounder: StringBounder): XDimension2D {
    let width = 0;
    let height = 0;
    for (const line of this.getLines()) {
      const size2D = line.calculateDimension(stringBounder);
      height += size2D.getHeight();
      width = Math.max(width, size2D.getWidth());
    }
    return new XDimension2D(width, height);
  }

  /** @see TextBlockRaw.java:88-96 */
  drawU(ug: UGraphic): void {
    let y = 0;
    for (const line of this.getLines()) {
      line.drawU(ug.apply(UTranslate.dy(y)));
      y += line.calculateDimension(ug.getStringBounder()).getHeight();
    }
  }
}
