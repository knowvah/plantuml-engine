import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../../core/command/SingleLineCommand2.js';
import type { IRegex } from '../../../core/regex/IRegex.js';
import { RegexConcat } from '../../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../../core/regex/RegexLeaf.js';
import { RegexOr } from '../../../core/regex/RegexOr.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import type { LineLocation } from '../../../core/tim/LineLocation.js';
import { PlayerAnalog } from '../PlayerAnalog.js';
import type { TimingDiagram } from '../TimingDiagram.js';
import { parseInt32 } from './parse-int32.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandTicks.java:57-76 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.timingdiagram.command.CommandTicks',
    RegexLeaf.start(),
    new RegexLeaf(1, 'PLAYER', '([%pLN_.@]+)'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf('ticks'),
    RegexLeaf.spaceOneOrMore(),
    new RegexOr(
      new RegexLeaf('every'),
      new RegexConcat(
        new RegexLeaf('num'),
        RegexLeaf.spaceOneOrMore(),
        new RegexLeaf('on'),
        RegexLeaf.spaceOneOrMore(),
        new RegexLeaf('multiple'),
      ),
    ),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf(1, 'NUM', '([0-9]+)'),
    RegexLeaf.end(),
  );
}

/**
 * `A ticks every 5`, `A ticks num on multiple 5`: only an analog player takes it. `explainArg` (`@Explain`) is not
 * ported.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandTicks.java:51-107
 */
export class CommandTicks extends SingleLineCommand2<TimingDiagram> {
  /** @see CommandTicks.java:53-55 */
  public constructor() {
    super(getRegexConcat());
  }

  /** `Integer.parseInt` on `[0-9]+`. @see CommandTicks.java:94-106 */
  protected override executeArg(
    diagram: TimingDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const code = arg.get('PLAYER', 0)!;
    const player = diagram.getPlayer(code);
    if (player === undefined) return CommandExecutionResult.error(`No such participant ${code}`);

    if (player instanceof PlayerAnalog) player.setTicks(parseInt32(arg.get('NUM', 0)));
    return CommandExecutionResult.ok();
  }
}
