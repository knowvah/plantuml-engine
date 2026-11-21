import type { Stereotype } from '../../../core/stereo/Stereotype.js';
import type { AbstractNumericPlayer } from '../AbstractNumericPlayer.js';
import type { TimingDiagram } from '../TimingDiagram.js';
import { CommandNumericPlayer } from './CommandNumericPlayer.js';

/**
 * `[compact] analog "Display" as CODE [between 0 and 3]`, `analog "Display" between 0 and 3 as CODE`, `analog CODE [between 0 and 3]`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandAnalog.java:42-54
 */
export class CommandAnalog extends CommandNumericPlayer {
  /** @see CommandAnalog.java:44-46 */
  public constructor() {
    super('analog');
  }

  /** @see CommandAnalog.java:48-52 */
  protected override createPlayer(
    diagram: TimingDiagram,
    code: string,
    full: string,
    compact: boolean,
    stereotype: Stereotype | undefined,
  ): AbstractNumericPlayer {
    return diagram.createPlayerAnalog(code, full, compact, stereotype);
  }
}
