/**
 * The size of a creole `<math>`/`<latex>` atom for the engines that read the data-oriented `CreoleAtom` instead of
 * building an `AtomMath`: upstream reaches `ScientificEquationSafe#getDimension` from every engine through the same
 * `StripeLatex` -> `AtomMath` (`AtomMath.java:61-67`), so a formula JLaTeXMath rejects (`rollback`, set by
 * `CommandCreoleMath`/`CommandCreoleLatex`) is its monospace source's block, and any other is the TeXIcon box, which
 * KaTeX's image takes (DIVERGENCES.md, "LaTeX rendering engine").
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/math/ScientificEquationSafe.java:110-115
 */
import type { StringBounder } from '../klimt/font/StringBounder.js';
import { FontStack } from '../klimt/font/FontStack.js';
import { MARGIN, SIZE_14 } from '../klimt/shape/GraphicStrings.js';
import { renderLatexAsImage } from '../latex.js';
import { text } from '../svg-shapes-text.js';
import { UImage } from '../klimt/shape/UImage.js';
import type { UGraphic } from '../klimt/UGraphic.js';
import { drawRollback, rollbackDimension } from './ScientificEquationSafe.js';

/** The fields of the `'latex'` creole atom this reads. */
export interface LatexAtomLike {
  readonly expr: string;
  readonly color?: string | null | undefined;
  readonly rollback?: string | undefined;
}

/** `MathDrawing#draw`'s "null for black" (`MathDrawing.java:51-55`). */
const NULL_FOREGROUND = '#000000';

/**
 * Where a string-built renderer draws a rollback, which `GraphicStrings#drawU` draws as one `TextBlockRaw` line:
 * the text `MARGIN` in from the box (GraphicStrings.java:160-175), its baseline at `MARGIN` plus the line's
 * `maxDeltaY`, the line height less the tile's plus the font size (SingleLine.java:95-107) -- for the one monospace
 * 14 tile, the tile's own height, so `height - MARGIN`. `textWidth` is the tile's width; the font is
 * `GraphicStrings.monospaced14` (GraphicStrings.java:131-133), black (`TEXTCOLOR`, :68).
 */
export interface RollbackLayout {
  readonly text: string;
  readonly width: number;
  readonly height: number;
  readonly textWidth: number;
  readonly dx: number;
  readonly baseline: number;
  readonly fontSize: number;
  readonly fontFamily: string;
}

export function rollbackLayout(formula: string, stringBounder: StringBounder): RollbackLayout {
  const dim = rollbackDimension(formula, stringBounder);
  return {
    text: formula,
    width: dim.getWidth(),
    height: dim.getHeight(),
    textWidth: dim.getWidth() - 2 * MARGIN,
    dx: MARGIN,
    baseline: dim.getHeight() - MARGIN,
    fontSize: SIZE_14,
    fontFamily: FontStack.build(FontStack.MONOSPACE).getSvgFamily(),
  };
}

/** `GraphicStrings.TEXTCOLOR`'s light colour, black (GraphicStrings.java:68). */
const ROLLBACK_TEXT_COLOR = '#000000';

/** A rolled-back formula drawn by a string-built renderer: its source in monospace, `top` being the atom box's top
 *  (`AtomMath#drawU` -> `ScientificEquationSafe#drawU`, ScientificEquationSafe.java:124-128). */
export function rollbackSvgText(layout: RollbackLayout, x: number, top: number): string {
  return text(x + layout.dx, top + layout.baseline, layout.text, {
    fill: ROLLBACK_TEXT_COLOR,
    fontFamily: layout.fontFamily,
    fontSize: layout.fontSize,
    lengthAdjust: 'spacing',
    textLength: layout.textWidth,
  });
}

/**
 * `AtomMath#drawU` for a `'latex'` creole atom drawn on a UGraphic: the rollback as monospace text
 * (ScientificEquationSafe.java:124-128), else KaTeX's image of the formula. `raster` keeps the image's raster box for
 * a `Footprint` that measures it as the description engine's does (`UImage.java:87-92`).
 */
export function drawLatexAtom(atom: LatexAtomLike, ug: UGraphic, raster = false): void {
  if (atom.rollback !== undefined) return drawRollback(atom.rollback, ug);
  const r = renderLatexAsImage(atom.expr, atom.color ?? NULL_FOREGROUND);
  const box = raster ? { rasterWidth: r.width, rasterHeight: r.height } : undefined;
  ug.draw(UImage.build(r.width, r.height, r.href, box));
}

export function latexAtomDimension(
  atom: LatexAtomLike,
  stringBounder: StringBounder,
): { width: number; height: number } {
  if (atom.rollback !== undefined) {
    const dim = rollbackDimension(atom.rollback, stringBounder);
    return { width: dim.getWidth(), height: dim.getHeight() };
  }
  const { width, height } = renderLatexAsImage(atom.expr, atom.color ?? NULL_FOREGROUND);
  return { width, height };
}
