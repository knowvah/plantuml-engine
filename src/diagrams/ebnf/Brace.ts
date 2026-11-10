/**
 * `Brace`: a horizontal curly brace `width` wide, drawn at stroke 0.5 from four 5 px corners and two lines.
 * `height` is stored and never read, as upstream.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/Brace.java:44-70
 */
import type { UDrawable } from '../../core/klimt/shape/UDrawable.js';
import { ULine } from '../../core/klimt/shape/ULine.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UStroke } from '../../core/klimt/UStroke.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import { CornerCurved } from './CornerCurved.js';

/** `final double cinq = 5;` @see Brace.java:58 */
const CINQ = 5;

export class Brace implements UDrawable {
  private readonly width: number;
  // Written, never read (Brace.java:47).
  private readonly height: number;

  /** @see Brace.java:49-52 */
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  /** @see Brace.java:54-68 */
  drawU(ugIn: UGraphic): void {
    const ug = ugIn.apply(UStroke.withThickness(0.5));
    const width = this.width;

    CornerCurved.createNW(CINQ).drawU(ug);
    CornerCurved.createSE(CINQ).drawU(ug.apply(new UTranslate(width / 2, 0)));
    CornerCurved.createSW(CINQ).drawU(ug.apply(new UTranslate(width / 2, 0)));
    CornerCurved.createNE(CINQ).drawU(ug.apply(new UTranslate(width, 0)));

    ug.apply(new UTranslate(CINQ, 0)).draw(new ULine(width / 2 - 2 * CINQ, 0));
    ug.apply(new UTranslate(CINQ + width / 2, 0)).draw(new ULine(width / 2 - 2 * CINQ, 0));
  }
}
