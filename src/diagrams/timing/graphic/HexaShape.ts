import type { Fashion } from '../../../core/klimt/Fashion.js';
import type { UDrawable } from '../../../core/klimt/shape/UDrawable.js';
import { UPolygon } from '../../../core/klimt/shape/UPolygon.js';
import type { UGraphic } from '../../../core/klimt/UGraphic.js';

/** The 12 px slope of both ends (HexaShape.java:48). */
const DELTA = 12;

/**
 * The hexagon of a concise state between two changes.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/graphic/HexaShape.java:42-71
 */
export class HexaShape implements UDrawable {
  readonly #width: number;
  readonly #height: number;
  readonly #context: Fashion;

  private constructor(width: number, height: number, context: Fashion) {
    this.#width = width;
    this.#height = height;
    this.#context = context;
  }

  public static create(width: number, height: number, context: Fashion): HexaShape {
    return new HexaShape(width, height, context);
  }

  /** java:60-71 */
  public drawU(ug: UGraphic): void {
    ug = this.#context.apply(ug);
    const polygon = new UPolygon();
    polygon.addPoint(DELTA, 0);
    polygon.addPoint(this.#width - DELTA, 0);
    polygon.addPoint(this.#width, this.#height / 2);
    polygon.addPoint(this.#width - DELTA, this.#height);
    polygon.addPoint(DELTA, this.#height);
    polygon.addPoint(0, this.#height / 2);
    ug.draw(polygon);
  }
}
