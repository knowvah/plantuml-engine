import type { Fashion } from '../../../core/klimt/Fashion.js';
import type { UDrawable } from '../../../core/klimt/shape/UDrawable.js';
import { UPath } from '../../../core/klimt/shape/UPath.js';
import { UPolygon } from '../../../core/klimt/shape/UPolygon.js';
import type { UGraphic } from '../../../core/klimt/UGraphic.js';

/** The 12 px slope of the pointed end (PentaAShape.java:49). */
const DELTA = 12;

/**
 * The pentagon before the first change of a concise player: flat at the left, pointed at the right. Filled with
 * no outline (the fore colour is the back colour), then outlined by an open path with no left edge.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/graphic/PentaAShape.java:43-80
 */
export class PentaAShape implements UDrawable {
  readonly #width: number;
  readonly #height: number;
  readonly #context: Fashion;

  private constructor(width: number, height: number, context: Fashion) {
    this.#width = width;
    this.#height = height;
    this.#context = context;
  }

  public static create(width: number, height: number, context: Fashion): PentaAShape {
    return new PentaAShape(width, height, context);
  }

  /** java:61-80 */
  public drawU(ug: UGraphic): void {
    const w = this.#width;
    const h = this.#height;
    const polygon = new UPolygon();
    polygon.addPoint(0, 0);
    polygon.addPoint(w - DELTA, 0);
    polygon.addPoint(w, h / 2);
    polygon.addPoint(w - DELTA, h);
    polygon.addPoint(0, h);

    this.#context.withForeColor(this.#context.getBackColor()).apply(ug).draw(polygon);

    const path = UPath.none();
    path.moveTo(0, 0);
    path.lineTo(w - DELTA, 0);
    path.lineTo(w, h / 2);
    path.lineTo(w - DELTA, h);
    path.lineTo(0, h);

    this.#context.apply(ug).draw(path);
  }
}
