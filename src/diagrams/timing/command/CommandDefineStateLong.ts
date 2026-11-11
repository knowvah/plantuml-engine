import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../../core/command/SingleLineCommand2.js';
import type { IRegex } from '../../../core/regex/IRegex.js';
import { RegexConcat } from '../../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../../core/regex/RegexLeaf.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import type { LineLocation } from '../../../core/tim/LineLocation.js';
import type { TimingDiagram } from '../TimingDiagram.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandDefineStateLong.java:56-67 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.timingdiagram.command.CommandDefineStateLong',
    RegexLeaf.start(),
    new RegexLeaf(1, 'PLAYER', '([%pLN_.@]+)'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf('has'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf(1, 'LABEL', '[%g]([^%g]+)[%g]'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf('as'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf(1, 'STATE', '([%pLN_.@]+)'),
    RegexLeaf.end(),
  );
}

/**
 * `WB has "Waiting for input" as Wait`. `explainArg` (`@Explain`) is not ported.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandDefineStateLong.java:50-91
 */
export class CommandDefineStateLong extends SingleLineCommand2<TimingDiagram> {
  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandDefineStateLong.java:52-54 */
  public constructor() {
    super(getRegexConcat());
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandDefineStateLong.java:80-91 */
  protected override executeArg(
    diagram: TimingDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const playerCode = arg.get('PLAYER', 0)!;
    const player = diagram.getPlayer(playerCode);
    if (player === undefined) return CommandExecutionResult.error(`Unknown ${playerCode}`);

    const label = arg.get('LABEL', 0)!;
    const stateCode = arg.get('STATE', 0)!;
    player.defineState(stateCode, label);
    return CommandExecutionResult.ok();
  }
}
