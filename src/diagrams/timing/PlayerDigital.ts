import { AbstractNumericPlayer, type NumericPlayerArgs } from './AbstractNumericPlayer.js';
import type { Panels } from './graphic/Panels.js';
import { PanelsDigital } from './graphic/PanelsDigital.js';

/** The five `PlayerDigital` constructor arguments. */
export type PlayerDigitalArgs = NumericPlayerArgs;

/**
 * `digital "Bus" between 0 and 3 as B`: numeric values held until the next sample (a step, no interpolation).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/PlayerDigital.java:44-56
 */
export class PlayerDigital extends AbstractNumericPlayer {
  /** java:46-48: `SName.digital`. */
  public constructor(args: PlayerDigitalArgs) {
    super(args, 'digital');
  }

  /** java:50-54 */
  protected override buildPlayerPanels(): Panels {
    return new PanelsDigital({
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
