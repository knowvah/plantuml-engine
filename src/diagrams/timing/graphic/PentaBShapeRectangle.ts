import type { Fashion } from '../../../core/klimt/Fashion.js';
import type { UDrawable } from '../../../core/klimt/shape/UDrawable.js';
import { UPath } from '../../../core/klimt/shape/UPath.js';
import { URectangle } from '../../../core/klimt/shape/URectangle.js';
import type { UGraphic } from '../../../core/klimt/UGraphic.js';

/**
 * The box after the last change of a rectangle player: filled with no outline, then outlined on top, left and
 * bottom only.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/graphic/PentaBShapeRectangle.java:43-70
 */
export class PentaBShapeRectangle implements UDrawable {
  readonly #width: number;
  readonly #height: number;
  readonly #context: Fashion;

  private constructor(width: number, height: number, context: Fashion) {
    this.#width = width;
    this.#height = height;
    this.#context = context;
  }

  public static create(width: number, height: number, context: Fashion): PentaBShapeRectangle {
    return new PentaBShapeRectangle(width, height, context);
  }

  /** java:59-70 */
  public drawU(ug: UGraphic): void {
    const polygon = URectangle.build(this.#width, this.#height);
    this.#context.withForeColor(this.#context.getBackColor()).apply(ug).draw(polygon);

    const path = UPath.none();
    path.moveTo(this.#width, 0);
    path.lineTo(0, 0);
    path.lineTo(0, this.#height);
    path.lineTo(this.#width, this.#height);
    this.#context.apply(ug).draw(path);
  }
}
