import type { Panels } from './graphic/Panels.js';
import { PanelsRobust } from './graphic/PanelsRobust.js';
import { AbstractStatePlayer } from './AbstractStatePlayer.js';
import type { PlayerBaseArgs } from './Player.js';

/** The six `PlayerRobust` constructor arguments (D16). */
export type PlayerRobustArgs = PlayerBaseArgs;

/** `AbstractStatePlayer`'s constraint offset for a robust player (PlayerRobust.java:49). */
const CONSTRAINT_OFFSET = 2.5;

/**
 * `robust "Web Browser" as WB`: one row per state, with a step waveform.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/PlayerRobust.java:45-63
 */
export class PlayerRobust extends AbstractStatePlayer {
  /** java:47-50: `SName.robust`. */
  public constructor(args: PlayerRobustArgs) {
    super({ ...args, sname: 'robust', constraintOffset: CONSTRAINT_OFFSET });
  }

  /** java:52-61: the label map's values are the declared states; the changes are in their `TreeSet` order. */
  protected override buildPlayerPanels(): Panels {
    const result = new PanelsRobust({
      ruler: this.getRuler(),
      skinParam: this.getSkinParam(),
      someStates: this.getStatesLabel().values(),
      suggestedHeight: this.getSuggestedHeight(),
      style: this.getStyle(),
      constraints: this.getConstraints(),
    });
    result.setInitialState(this.getInitialState(), this.getInitialColors());
    for (const change of this.getChanges()) result.addChange(change);

    return result;
  }
}
