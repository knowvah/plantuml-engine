import { PanelsRectangle } from './graphic/PanelsRectangle.js';
import type { Panels } from './graphic/Panels.js';
import { AbstractStatePlayer } from './AbstractStatePlayer.js';
import type { PlayerBaseArgs } from './Player.js';

/** The six `PlayerRectangle` constructor arguments (D16). */
export type PlayerRectangleArgs = PlayerBaseArgs;

/** `AbstractStatePlayer`'s constraint offset for a rectangle player (PlayerRectangle.java:48). */
const CONSTRAINT_OFFSET = 1;

/**
 * `rectangle "Rect" as R`: states as boxes on a ribbon.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/PlayerRectangle.java:44-61
 */
export class PlayerRectangle extends AbstractStatePlayer {
  /** java:46-49: `SName.rectangle`. */
  public constructor(args: PlayerRectangleArgs) {
    super({ ...args, sname: 'rectangle', constraintOffset: CONSTRAINT_OFFSET });
  }

  /** java:51-59 */
  protected override buildPlayerPanels(): Panels {
    const result = new PanelsRectangle({
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
