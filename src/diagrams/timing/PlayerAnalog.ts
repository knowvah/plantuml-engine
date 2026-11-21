import { AbstractNumericPlayer, type NumericPlayerArgs } from './AbstractNumericPlayer.js';
import type { Panels } from './graphic/Panels.js';
import { PanelsAnalog } from './graphic/PanelsAnalog.js';

/** The five `PlayerAnalog` constructor arguments. */
export type PlayerAnalogArgs = NumericPlayerArgs;

/**
 * `analog "Vcore" between -4.5 and 6.5 as VCC`: a polyline over numeric values.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/PlayerAnalog.java:44-56
 */
export class PlayerAnalog extends AbstractNumericPlayer {
  /** java:46-48: `SName.analog`. */
  public constructor(args: PlayerAnalogArgs) {
    super(args, 'analog');
  }

  /** java:50-54 */
  protected override buildPlayerPanels(): Panels {
    return new PanelsAnalog({
      ruler: this.getRuler(),
      skinParam: this.getSkinParam(),
      suggestedHeight: this.getSuggestedHeight(),
      style: this.getStyle(),
      timeSeries: this.getTimeSeries(),
      constraints: this.getConstraints(),
      initialState: this.getInitialState(),
      ticksEvery: this.getTicksEvery(),
    });
  }
}
