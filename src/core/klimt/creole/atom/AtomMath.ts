/**
 * AtomMath — upstream: klimt/creole/atom/AtomMath.java (`extends
 * AbstractAtom implements Atom`). Wraps one `ScientificEquationSafe` (the
 * accumulated `<latex>...</latex>` / `<math>...</math>` formula) as a
 * measurable, drawable `Atom` -- the whole `StripeLatex` block, constructed
 * directly by it as `AtomTree` is by `StripeTree`.
 *
 * Since upstream `aa79d2d80ee` the atom measures with
 * `math.getDimension(stringBounder)` and draws with `math.drawU(ug, fore,
 * back)`: the formula is drawn on the UGraphic itself, and a formula that
 * cannot be made is its source in monospace text. Both now live in
 * `ScientificEquationSafe.ts`, whose module comment names the one divergence
 * (KaTeX's image for JLaTeXMath's glyph outlines).
 *
 * The `TIKZ` branches of both methods (java:63-65, :76-82) are not ported:
 * this port's `StringBounder`/`UGraphic` have no `matchesProperty`, the
 * architectural decision `Sea.ts` documents (TikZ is an output format the
 * port does not have).
 *
 * `foreground`/`background` arrive as resolved colour strings
 * (`FontConfiguration.color`), the port's spelling of a simple colour, so
 * `instanceof HColorSimple` (java:84-89) is "not null". `StripeLatex` passes
 * the run's `extendedColor` as the background (`StripeLatex.java:90`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/creole/atom/AtomMath.java:49-93
 */
import { AbstractAtom } from './AbstractAtom.js';
import { HColors } from '../../color/HColors.js';
import type { XDimension2D } from '../../geom/XDimension2D.js';
import type { ScientificEquationSafe } from '../../../math/ScientificEquationSafe.js';
import type { UGraphic } from '../../UGraphic.js';
import type { StringBounder } from '../../font/StringBounder.js';
import type { Atom } from '../SheetBlock1.js';

export class AtomMath extends AbstractAtom implements Atom {
  private readonly math: ScientificEquationSafe;
  private readonly foreground: string | null;
  private readonly background: string | null;

  /** @see AtomMath.java:55-59 */
  constructor(math: ScientificEquationSafe, foreground: string | null, background: string | null) {
    super();
    this.math = math;
    this.foreground = foreground;
    this.background = background;
  }

  /** @see AtomMath.java:61-67 */
  protected calculateDimensionSlow(stringBounder: StringBounder): XDimension2D {
    return this.math.getDimension(stringBounder);
  }

  /** @see AtomMath.java:69-71 */
  getStartingAltitude(_stringBounder: StringBounder): number {
    return 0;
  }

  /** Only a plain colour is used: black for none, and no background for none. @see AtomMath.java:73-93 */
  drawU(ug: UGraphic): void {
    const fore = this.foreground ?? HColors.BLACK;
    this.math.drawU(ug, fore, this.background);
  }
}
