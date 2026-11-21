import type { Stereotype } from '../../../core/stereo/Stereotype.js';
import type { HColor } from '../../../core/style/Value.js';
import type { TimingDiagram } from '../TimingDiagram.js';
import { CommandStatePlayer } from './CommandStatePlayer.js';

/**
 * `[compact] robust ["Display" as] CODE [#color]`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandRobust.java:41-53
 */
export class CommandRobust extends CommandStatePlayer {
  /** @see CommandRobust.java:43-45 */
  public constructor() {
    super('robust');
  }

  /** @see CommandRobust.java:47-51 */
  protected override createPlayer(
    diagram: TimingDiagram,
    code: string,
    full: string,
    compact: boolean,
    stereotype: Stereotype | undefined,
    backColor: HColor | undefined,
  ): void {
    diagram.createPlayerRobust(code, full, compact, stereotype, backColor);
  }
}
