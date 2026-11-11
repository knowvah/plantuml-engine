import { URectangle } from '../../../core/klimt/shape/URectangle.js';
import type { UGraphic } from '../../../core/klimt/UGraphic.js';
import type { ChangeState } from '../ChangeState.js';
import type { PanelsArgs } from './Panels.js';
import { PanelsState } from './PanelsState.js';
import { PentaAShapeRectangle } from './PentaAShapeRectangle.js';
import { PentaBShapeRectangle } from './PentaBShapeRectangle.js';

/** The six `PanelsRectangle` constructor arguments (D16): the same as `PanelsArgs`. */
export type PanelsRectangleArgs = PanelsArgs;

/**
 * The panels of a `rectangle` player: boxes between changes, open boxes at both ends.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/graphic/PanelsRectangle.java:48-75
 */
export class PanelsRectangle extends PanelsState {
  public constructor(args: PanelsRectangleArgs) {
    super(args);
  }

  /** java:55-59 */
  protected override drawHexa(ug: UGraphic, len: number, change: ChangeState): void {
    const shape = URectangle.build(len, this.getRibbonHeight());
    change.getContext(this.skinParam, this.style).apply(ug).draw(shape);
  }

  /** java:61-66 */
  protected override drawPentaA(ug: UGraphic, len: number, change: ChangeState): void {
    const shape = PentaAShapeRectangle.create(len, this.getRibbonHeight(), this.getContextWithInitialColors(change));
    shape.drawU(ug);
  }

  /** java:68-73 */
  protected override drawPentaB(ug: UGraphic, len: number, change: ChangeState): void {
    const shape = PentaBShapeRectangle.create(
      len,
      this.getRibbonHeight(),
      change.getContext(this.skinParam, this.style),
    );
    shape.drawU(ug);
  }
}
