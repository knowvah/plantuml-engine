import type { UGraphic } from '../../../core/klimt/UGraphic.js';
import type { ChangeState } from '../ChangeState.js';
import { HexaShape } from './HexaShape.js';
import type { PanelsArgs } from './Panels.js';
import { PanelsState } from './PanelsState.js';
import { PentaAShape } from './PentaAShape.js';
import { PentaBShape } from './PentaBShape.js';

/** The six `PanelsConcise` constructor arguments (D16): the same as `PanelsArgs`. */
export type PanelsConciseArgs = PanelsArgs;

/**
 * The panels of a `concise` player: hexagons between changes, pentagons at both ends.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/graphic/PanelsConcise.java:47-72
 */
export class PanelsConcise extends PanelsState {
  public constructor(args: PanelsConciseArgs) {
    super(args);
  }

  /** java:54-58 */
  protected override drawHexa(ug: UGraphic, len: number, change: ChangeState): void {
    const shape = HexaShape.create(len, this.getRibbonHeight(), change.getContext(this.skinParam, this.style));
    shape.drawU(ug);
  }

  /** java:60-64: the first pentagon takes the initial state's colours. */
  protected override drawPentaA(ug: UGraphic, len: number, change: ChangeState): void {
    const shape = PentaAShape.create(len, this.getRibbonHeight(), this.getContextWithInitialColors(change));
    shape.drawU(ug);
  }

  /** java:66-70 */
  protected override drawPentaB(ug: UGraphic, len: number, change: ChangeState): void {
    const shape = PentaBShape.create(len, this.getRibbonHeight(), change.getContext(this.skinParam, this.style));
    shape.drawU(ug);
  }
}
