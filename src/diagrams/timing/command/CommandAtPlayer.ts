import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../../core/command/SingleLineCommand2.js';
import type { IRegex } from '../../../core/regex/IRegex.js';
import { RegexConcat } from '../../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../../core/regex/RegexLeaf.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import type { LineLocation } from '../../../core/tim/LineLocation.js';
import type { TimingDiagram } from '../TimingDiagram.js';
import { PLAYER_CODE } from './player-code.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandAtPlayer.java:56-62 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.timingdiagram.command.CommandAtPlayer',
    RegexLeaf.start(),
    new RegexLeaf('@'),
    new RegexLeaf(1, 'PLAYER', PLAYER_CODE),
    RegexLeaf.spaceZeroOrMore(),
    RegexLeaf.end(),
  );
}

/**
 * `@WB`: the last player becomes WB. `explainArg` (`@Explain`) is not ported.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandAtPlayer.java:50-81
 */
export class CommandAtPlayer extends SingleLineCommand2<TimingDiagram> {
  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandAtPlayer.java:52-54 */
  public constructor() {
    super(getRegexConcat());
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandAtPlayer.java:73-81 */
  protected override executeArg(
    diagram: TimingDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const code = arg.get('PLAYER', 0)!;
    const player = diagram.getPlayer(code);
    if (player === undefined) return CommandExecutionResult.error(`No such participant ${code}`);

    diagram.setLastPlayer(player);
    return CommandExecutionResult.ok();
  }
}
