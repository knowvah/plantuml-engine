import { PanelsConcise } from './graphic/PanelsConcise.js';
import type { Panels } from './graphic/Panels.js';
import { AbstractStatePlayer } from './AbstractStatePlayer.js';
import type { PlayerBaseArgs } from './Player.js';

/** The six `PlayerConcise` constructor arguments (D16). */
export type PlayerConciseArgs = PlayerBaseArgs;

/** `AbstractStatePlayer`'s constraint offset for a concise player (PlayerConcise.java:49). */
const CONSTRAINT_OFFSET = 1.0;

/**
 * `concise "Web User" as WU`: states as hexagons on a ribbon.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/PlayerConcise.java:45-62
 */
export class PlayerConcise extends AbstractStatePlayer {
  /** java:47-50: `SName.concise`. */
  public constructor(args: PlayerConciseArgs) {
    super({ ...args, sname: 'concise', constraintOffset: CONSTRAINT_OFFSET });
  }

  /** java:52-60: the changes are handed over in their `TreeSet` order. */
  protected override buildPlayerPanels(): Panels {
    const result = new PanelsConcise({
      ruler: this.getRuler(),
      skinParam: this.getSkinParam(),
      notes: this.getNotes(),
      suggestedHeight: this.getSuggestedHeight(),
      style: this.getStyle(),
      constraints: this.getConstraints(),
    });
    result.setInitialState(this.getInitialState(), this.getInitialColors());
    for (const change of this.getChanges()) result.addChange(change);

    return result;
  }
}
