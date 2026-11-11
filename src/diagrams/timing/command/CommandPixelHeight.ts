import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../../core/command/SingleLineCommand2.js';
import type { IRegex } from '../../../core/regex/IRegex.js';
import { RegexConcat } from '../../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../../core/regex/RegexLeaf.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import type { LineLocation } from '../../../core/tim/LineLocation.js';
import type { TimingDiagram } from '../TimingDiagram.js';
import { parseInt32 } from './parse-int32.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandPixelHeight.java:56-72 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.timingdiagram.command.CommandPixelHeight',
    RegexLeaf.start(),
    new RegexLeaf(1, 'PLAYER', '([%pLN_.@]+)'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf('is'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf(1, 'NUM', '([0-9]+)'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf('pixels?'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf('height'),
    RegexLeaf.end(),
  );
}

/**
 * `A is 50 pixels height`. `explainArg` (`@Explain`) is not ported.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandPixelHeight.java:50-96
 */
export class CommandPixelHeight extends SingleLineCommand2<TimingDiagram> {
  /** @see CommandPixelHeight.java:52-54 */
  public constructor() {
    super(getRegexConcat());
  }

  /** `Integer.parseInt` on `[0-9]+`. @see CommandPixelHeight.java:84-95 */
  protected override executeArg(
    diagram: TimingDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const code = arg.get('PLAYER', 0)!;
    const player = diagram.getPlayer(code);
    if (player === undefined) return CommandExecutionResult.error(`No such participant ${code}`);

    player.setHeight(parseInt32(arg.get('NUM', 0)));
    return CommandExecutionResult.ok();
  }
}
