/**
 * `ETileEmpty`: the empty rule body (`a = ;`), zero by zero, drawing nothing.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/ETileEmpty.java:42-67
 */
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { ETile } from './ETile.js';

export class ETileEmpty extends ETile {
  /** @see ETileEmpty.java:44-46 */
  drawU(_ug: UGraphic): void {}

  /** @see ETileEmpty.java:48-51 */
  push(_tile: ETile): void {
    throw new Error('UnsupportedOperationException');
  }

  /** @see ETileEmpty.java:53-56 */
  getWidth(_stringBounder: StringBounder): number {
    return 0;
  }

  /** @see ETileEmpty.java:58-61 */
  getH1(_stringBounder: StringBounder): number {
    return 0;
  }

  /** @see ETileEmpty.java:63-66 */
  getH2(_stringBounder: StringBounder): number {
    return 0;
  }
}
