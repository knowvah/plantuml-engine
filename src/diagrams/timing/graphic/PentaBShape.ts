import type { Fashion } from '../../../core/klimt/Fashion.js';
import type { UDrawable } from '../../../core/klimt/shape/UDrawable.js';
import { UPath } from '../../../core/klimt/shape/UPath.js';
import { UPolygon } from '../../../core/klimt/shape/UPolygon.js';
import type { UGraphic } from '../../../core/klimt/UGraphic.js';

/** The 12 px slope of the pointed end (PentaBShape.java:49). */
const DELTA = 12;

/**
 * The pentagon after the last change of a concise player: pointed at the left, open at the right. Filled with no
 * outline, then outlined by an open path with no right edge.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/graphic/PentaBShape.java:43-79
 */
export class PentaBShape implements UDrawable {
  readonly #width: number;
  readonly #height: number;
  readonly #context: Fashion;

  private constructor(width: number, height: number, context: Fashion) {
    this.#width = width;
    this.#height = height;
    this.#context = context;
  }

  public static create(width: number, height: number, context: Fashion): PentaBShape {
    return new PentaBShape(width, height, context);
  }

  /** java:61-79 */
  public drawU(ug: UGraphic): void {
    const w = this.#width;
    const h = this.#height;
    const polygon = new UPolygon();
    polygon.addPoint(DELTA, 0);
    polygon.addPoint(w, 0);
    polygon.addPoint(w, h);
    polygon.addPoint(DELTA, h);
    polygon.addPoint(0, h / 2);

    this.#context.withForeColor(this.#context.getBackColor()).apply(ug).draw(polygon);

    const path = UPath.none();
    path.moveTo(w, 0);
    path.lineTo(DELTA, 0);
    path.lineTo(0, h / 2);
    path.lineTo(DELTA, h);
    path.lineTo(w, h);
    this.#context.apply(ug).draw(path);
  }
}
