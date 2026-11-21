import type { Stereotype } from '../../../core/stereo/Stereotype.js';
import type { AbstractNumericPlayer } from '../AbstractNumericPlayer.js';
import type { TimingDiagram } from '../TimingDiagram.js';
import { CommandNumericPlayer } from './CommandNumericPlayer.js';

/**
 * `[compact] digital "Display" as CODE [between 0 and 3]`, `digital "Display" between 0 and 3 as CODE`, `digital CODE [between 0 and 3]`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandDigital.java:42-54
 */
export class CommandDigital extends CommandNumericPlayer {
  /** @see CommandDigital.java:44-46 */
  public constructor() {
    super('digital');
  }

  /** @see CommandDigital.java:48-52 */
  protected override createPlayer(
    diagram: TimingDiagram,
    code: string,
    full: string,
    compact: boolean,
    stereotype: Stereotype | undefined,
  ): AbstractNumericPlayer {
    return diagram.createPlayerDigital(code, full, compact, stereotype);
  }
}
