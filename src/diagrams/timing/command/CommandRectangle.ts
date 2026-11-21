import type { Stereotype } from '../../../core/stereo/Stereotype.js';
import type { HColor } from '../../../core/style/Value.js';
import type { TimingDiagram } from '../TimingDiagram.js';
import { CommandStatePlayer } from './CommandStatePlayer.js';

/**
 * `[compact] rectangle ["Display" as] CODE [#color]`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandRectangle.java:41-53
 */
export class CommandRectangle extends CommandStatePlayer {
  /** @see CommandRectangle.java:43-45 */
  public constructor() {
    super('rectangle');
  }

  /** @see CommandRectangle.java:47-51 */
  protected override createPlayer(
    diagram: TimingDiagram,
    code: string,
    full: string,
    compact: boolean,
    stereotype: Stereotype | undefined,
    backColor: HColor | undefined,
  ): void {
    diagram.createPlayerRectangle(code, full, compact, stereotype, backColor);
  }
}
