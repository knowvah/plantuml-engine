/**
 * `SingleLine` — one line of {@link TileText}s laid side by side. Only the
 * `rawText` factory is ported (its sole caller is {@link TextBlockRaw}); the
 * creole `withSomeHtmlTag` factory is not reached by this port. The baseline
 * of every tile is `maxDeltaY`: the line's height less the tile's, plus the
 * tile's font size.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/shape/SingleLine.java:47-136
 */
import type { StringBounder } from '../font/StringBounder.js';
import { XDimension2D } from '../geom/XDimension2D.js';
import type { UGraphic } from '../UGraphic.js';
import { UTranslate } from '../UTranslate.js';
import { TextBlockMemoized } from './TextBlockMemoized.js';
import { TileText } from './TileText.js';
import type { FontConfiguration } from './UText.js';

export class SingleLine extends TextBlockMemoized {
  private constructor(private readonly blocs: readonly TileText[]) {
    super();
  }

  /** An empty text is one space. @see SingleLine.java:53-60 */
  static rawText(text: string, fontConfiguration: FontConfiguration): SingleLine {
    return new SingleLine([new TileText(text.length === 0 ? ' ' : text, fontConfiguration)]);
  }

  /** @see SingleLine.java:66-76 */
  protected calculateDimensionSlow(stringBounder: StringBounder): XDimension2D {
    let width = 0;
    let height = 0;
    for (const b of this.blocs) {
      const size2D = b.calculateDimension(stringBounder);
      width += size2D.getWidth();
      height = Math.max(height, size2D.getHeight());
    }
    return new XDimension2D(width, height);
  }

  /** @see SingleLine.java:95-107 */
  private maxDeltaY(ug: UGraphic): number {
    let result = 0;
    const dim = this.calculateDimension(ug.getStringBounder());
    for (const b of this.blocs) {
      const dimBloc = b.calculateDimension(ug.getStringBounder());
      result = Math.max(result, dim.getHeight() - dimBloc.getHeight() + b.getFontSize2D());
    }
    return result;
  }

  /** Every bloc is a `TileText` here, so only the first arm of the loop is reachable. @see SingleLine.java:109-124 */
  drawU(ug: UGraphic): void {
    const deltaY = this.maxDeltaY(ug);
    let x = 0;
    for (const b of this.blocs) {
      b.drawU(ug.apply(new UTranslate(x, deltaY)));
      x += b.calculateDimension(ug.getStringBounder()).getWidth();
    }
  }
}
