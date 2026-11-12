/**
 * `EntityImageDegenerated`: what `GraphvizImageBuilder#buildImage` returns for a diagram with exactly one leaf, no
 * link and no group: the leaf's own image, translated by `delta` and padded by `delta` on every side, with no
 * graphviz pass. The draw ends with an invisible `UEmpty(delta, delta)` at the far corner, which the ink measure
 * sees.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/EntityImageDegenerated.java:46-111
 */
import type { StringBounder } from '../klimt/font/StringBounder.js';
import { XDimension2D } from '../klimt/geom/XDimension2D.js';
import { UEmpty } from '../klimt/shape/UEmpty.js';
import type { TextBlock } from '../klimt/shape/TextBlock.js';
import type { UGraphic } from '../klimt/UGraphic.js';
import { UTranslate } from '../klimt/UTranslate.js';

/** `delta`. @see EntityImageDegenerated.java:49 */
export const DEGENERATED_DELTA = 7;

/** @see EntityImageDegenerated.java:46 */
export class EntityImageDegenerated implements TextBlock {
  private readonly orig: TextBlock;

  /** @see EntityImageDegenerated.java:51-54 */
  constructor(orig: TextBlock) {
    this.orig = orig;
  }

  /** `orig.calculateDimension(stringBounder).delta(delta * 2, delta * 2)`. @see EntityImageDegenerated.java:66-69 */
  calculateDimension(stringBounder: StringBounder): XDimension2D {
    const dim = this.orig.calculateDimension(stringBounder);
    return new XDimension2D(dim.getWidth() + DEGENERATED_DELTA * 2, dim.getHeight() + DEGENERATED_DELTA * 2);
  }

  /** @see EntityImageDegenerated.java:83-88 */
  drawU(ug: UGraphic): void {
    this.orig.drawU(ug.apply(new UTranslate(DEGENERATED_DELTA, DEGENERATED_DELTA)));

    const dim = this.calculateDimension(ug.getStringBounder());
    ug.apply(new UTranslate(dim.getWidth() - DEGENERATED_DELTA, dim.getHeight() - DEGENERATED_DELTA)).draw(
      new UEmpty(DEGENERATED_DELTA, DEGENERATED_DELTA),
    );
  }
}
