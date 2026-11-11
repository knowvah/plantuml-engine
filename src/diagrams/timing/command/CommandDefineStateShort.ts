import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../../core/command/SingleLineCommand2.js';
import type { IRegex } from '../../../core/regex/IRegex.js';
import { RegexConcat } from '../../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../../core/regex/RegexLeaf.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import type { LineLocation } from '../../../core/tim/LineLocation.js';
import type { TimingDiagram } from '../TimingDiagram.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandDefineStateShort.java:58-67 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.timingdiagram.command.CommandDefineStateShort',
    RegexLeaf.start(),
    new RegexLeaf(1, 'PLAYER', '([%pLN_.@]+)'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf('has'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf(1, 'STATE', '([-%pLN_.@]+)'),
    new RegexLeaf(3, 'STATES', '((,([-%pLN_.@]+))*)'),
    RegexLeaf.end(),
  );
}

/**
 * `WB has Idle,Processing`: each state is defined with its label equal to its code. `explainArg` (`@Explain`) is
 * not ported.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandDefineStateShort.java:52-105
 */
export class CommandDefineStateShort extends SingleLineCommand2<TimingDiagram> {
  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandDefineStateShort.java:54-56 */
  public constructor() {
    super(getRegexConcat());
  }

  /** `StringTokenizer(states, ",")`: the non-empty tokens. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandDefineStateShort.java:98-102 */
  private static tokens(states: string): string[] {
    return states.split(',').filter((token) => token.length > 0);
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandDefineStateShort.java:88-105 */
  protected override executeArg(
    diagram: TimingDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const playerCode = arg.get('PLAYER', 0)!;
    const player = diagram.getPlayer(playerCode);
    if (player === undefined) return CommandExecutionResult.error(`Unknown ${playerCode}`);

    const stateCode = arg.get('STATE', 0)!;
    player.defineState(stateCode, stateCode);
    const states = arg.get('STATES', 0);
    if (states !== undefined) {
      for (const token of CommandDefineStateShort.tokens(states)) player.defineState(token, token);
    }
    return CommandExecutionResult.ok();
  }
}
