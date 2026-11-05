/**
 * TextBlockArrow2: the magic-arrow glyph of a link label, a triangle pointing along the link.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/shape/TextBlockArrow2.java:50-90
 */
import { Back } from '../Back.js';
import { Fore } from '../Fore.js';
import { UTranslate } from '../UTranslate.js';
import type { UGraphic } from '../UGraphic.js';
import { XDimension2D } from '../geom/XDimension2D.js';
import { UPolygon } from './UPolygon.js';
import type { FontConfiguration } from './UText.js';
import type { TextBlock } from './TextBlock.js';

/** `final double beta = Math.PI * 4 / 5`, `TextBlockArrow2.java:68`. */
const BETA = (Math.PI * 4) / 5;
/** `(int) (size * .80)`, `:63`. */
const TRIANGLE_RATIO = 0.8;

export class TextBlockArrow2 implements TextBlock {
  private readonly size: number;
  private readonly color: string | null;

  /** `angle` is `guide.getArrowDirectionInRadian()`. */
  constructor(
    private readonly angle: number,
    font: FontConfiguration,
  ) {
    this.size = font.size;
    this.color = font.color;
  }

  drawU(ug0: UGraphic): void {
    if (this.color === null) return;
    // `triSize` is an int and `triSize / 2` integer division (`:63-66`).
    const triSize = Math.trunc(this.size * TRIANGLE_RATIO);
    const half = Math.trunc(triSize / 2);
    const ug = ug0
      .apply(new Fore(this.color))
      .apply(new Back(this.color))
      .apply(new UTranslate(half, this.size / 2));
    const point = (alpha: number): { x: number; y: number } => ({
      x: half * Math.sin(alpha),
      y: half * Math.cos(alpha),
    });
    const triangle = new UPolygon([
      point(this.angle),
      point(this.angle + BETA),
      point(this.angle - BETA),
      point(this.angle),
    ]);
    ug.draw(triangle);
  }

  calculateDimension(): XDimension2D {
    return new XDimension2D(this.size, this.size);
  }
}
