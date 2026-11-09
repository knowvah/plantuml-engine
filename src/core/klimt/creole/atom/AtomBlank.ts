/**
 * The blank header of a word-wrapped list line (`Fission#blank`): an atom of the header's own size and starting
 * altitude that draws nothing, so a continuation line of a `* item` starts under the item's text, not under its bullet.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/creole/Fission.java:226-246
 */
import type { StringBounder } from '../../font/StringBounder.js';
import type { UGraphic } from '../../UGraphic.js';
import type { XDimension2D } from '../../geom/XDimension2D.js';
import type { Atom } from '../SheetBlock1.js';
import { AbstractAtom } from './AbstractAtom.js';

export class AtomBlank extends AbstractAtom {
  private readonly header: Atom;

  constructor(header: Atom) {
    super();
    this.header = header;
  }

  protected calculateDimensionSlow(stringBounder: StringBounder): XDimension2D {
    return this.header.calculateDimension(stringBounder);
  }

  getStartingAltitude(stringBounder: StringBounder): number {
    return this.header.getStartingAltitude(stringBounder);
  }

  drawU(_ug: UGraphic): void {
    // Fission.java:243 `public void drawU(UGraphic ug) { }`
  }
}
