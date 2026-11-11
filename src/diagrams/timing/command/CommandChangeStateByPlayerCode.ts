import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../../core/command/ParserPass.js';
import type { IRegex } from '../../../core/regex/IRegex.js';
import { RegexConcat } from '../../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../../core/regex/RegexLeaf.js';
import { RegexOptional } from '../../../core/regex/RegexOptional.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import type { LineLocation } from '../../../core/tim/LineLocation.js';
import type { TimingDiagram } from '../TimingDiagram.js';
import { CommandChangeState } from './CommandChangeState.js';
import { PLAYER_CODE } from './player-code.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandChangeStateByPlayerCode.java:59-77 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.timingdiagram.command.CommandChangeStateByPlayerCode',
    RegexLeaf.start(),
    new RegexLeaf(1, 'CODE', PLAYER_CODE),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf('is'),
    RegexLeaf.spaceZeroOrMore(),
    CommandChangeState.getStateOrHidden(),
    RegexLeaf.spaceZeroOrMore(),
    CommandChangeState.color().getRegex(),
    RegexLeaf.spaceZeroOrMore(),
    new RegexOptional(
      new RegexConcat(
        RegexLeaf.spaceZeroOrMore(),
        new RegexLeaf(':'),
        RegexLeaf.spaceZeroOrMore(),
        new RegexLeaf(1, 'COMMENT', '(.*?)'),
      ),
    ),
    RegexLeaf.spaceZeroOrMore(),
    RegexLeaf.end(),
  );
}

/**
 * `WB is Idle #pink : comment`: the player named by the code, at the diagram's current time. `explainArg`
 * (`@Explain`) is not ported.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandChangeStateByPlayerCode.java:52-107
 */
export class CommandChangeStateByPlayerCode extends CommandChangeState {
  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandChangeStateByPlayerCode.java:55-57 */
  public constructor() {
    super(getRegexConcat());
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandChangeStateByPlayerCode.java:98-107 */
  protected override executeArg(
    diagram: TimingDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const code = arg.get('CODE', 0)!;
    const player = diagram.getPlayer(code);
    if (player === undefined) return CommandExecutionResult.error(`Unknown "${code}"`);

    const now = diagram.getNow();
    return this.addState(diagram, arg, player, now);
  }
}
