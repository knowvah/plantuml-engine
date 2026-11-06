/**
 * `Display.getWithNewlines(pragma, quantifier).create(cardinalityFont, CENTER, skinParam)` (`SvekEdge.java:329-340`):
 * a quantifier is a creole block, so `<size:12>` sizes it and takes no width of its own. `appendTable` passes its
 * dimension through with `(int)` casts (`SvekEdge.java:504-507`).
 */
import { stripLeadingEscapedChar } from '../edge-label-box.js';
import { splitDisplayLines } from '../klimt/creole/DisplayNewlines.js';
import { HorizontalAlignment } from '../klimt/geom/HorizontalAlignment.js';
import type { FontSpec, StringMeasurer } from '../measurer.js';
import { MeasurerStringBounder } from '../measurer-bounder.js';
import { buildTextBlock } from './image/EntityImageDescriptionTextBlock.js';

export interface QuantifierBlockBox {
  /** The block's own width and height, before `appendTable`'s casts. */
  readonly width: number;
  readonly height: number;
  readonly reservedWidth: number;
  readonly reservedHeight: number;
  /** The text as drawn, a line per stripe. */
  readonly text: string;
}

export function measureQuantifierBlock(text: string, font: FontSpec, measurer: StringMeasurer): QuantifierBlockBox {
  const lines = splitDisplayLines(text).lines.map(stripLeadingEscapedChar);
  const block = buildTextBlock(
    lines.join('\n'),
    { color: '#000000', styles: new Set(), ...font },
    HorizontalAlignment.CENTER,
  );
  const dim = block.calculateDimension(new MeasurerStringBounder(measurer));
  return {
    width: dim.getWidth(),
    height: dim.getHeight(),
    reservedWidth: Math.trunc(dim.getWidth()),
    reservedHeight: Math.trunc(dim.getHeight()),
    text: lines.join('\n'),
  };
}
