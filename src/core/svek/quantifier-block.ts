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
import type { TextBlock } from '../klimt/shape/TextBlock.js';
import { buildTextBlock } from './image/EntityImageDescriptionTextBlock.js';
import { edgeLabelSheetBlock } from './edge-label-embed.js';

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
  const config = { color: '#000000', styles: new Set<never>(), ...font };
  const textBlock = (ls: readonly string[]): TextBlock =>
    buildTextBlock(ls.join('\n'), config, HorizontalAlignment.CENTER);
  // ele T2a: `create` goes through `CreoleParser#createSheetSlow`, so a `{{` line is an embed stripe (`:146-170`).
  const block = edgeLabelSheetBlock(lines, textBlock, HorizontalAlignment.CENTER) ?? textBlock(lines);
  const dim = block.calculateDimension(new MeasurerStringBounder(measurer));
  return {
    width: dim.getWidth(),
    height: dim.getHeight(),
    reservedWidth: Math.trunc(dim.getWidth()),
    reservedHeight: Math.trunc(dim.getHeight()),
    text: lines.join('\n'),
  };
}
