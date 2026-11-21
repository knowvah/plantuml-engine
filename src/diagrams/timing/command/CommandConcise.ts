import type { Stereotype } from '../../../core/stereo/Stereotype.js';
import type { HColor } from '../../../core/style/Value.js';
import type { TimingDiagram } from '../TimingDiagram.js';
import { CommandStatePlayer } from './CommandStatePlayer.js';

/**
 * `[compact] concise ["Display" as] CODE [#color]`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandConcise.java:41-53
 */
export class CommandConcise extends CommandStatePlayer {
  /** @see CommandConcise.java:43-45 */
  public constructor() {
    super('concise');
  }

  /** @see CommandConcise.java:47-51 */
  protected override createPlayer(
    diagram: TimingDiagram,
    code: string,
    full: string,
    compact: boolean,
    stereotype: Stereotype | undefined,
    backColor: HColor | undefined,
  ): void {
    diagram.createPlayerConcise(code, full, compact, stereotype, backColor);
  }
}
