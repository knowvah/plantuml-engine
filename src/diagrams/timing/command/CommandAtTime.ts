import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../../core/command/SingleLineCommand2.js';
import type { IRegex } from '../../../core/regex/IRegex.js';
import { RegexConcat } from '../../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../../core/regex/RegexLeaf.js';
import { RegexOptional } from '../../../core/regex/RegexOptional.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import type { LineLocation } from '../../../core/tim/LineLocation.js';
import type { TimingDiagram } from '../TimingDiagram.js';
import { TimeTickBuilder } from './TimeTickBuilder.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandAtTime.java:57-69 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.timingdiagram.command.CommandAtTime',
    RegexLeaf.start(),
    TimeTickBuilder.expressionAtWithArobase('TIME'),
    new RegexOptional(
      new RegexConcat(
        RegexLeaf.spaceOneOrMore(),
        new RegexLeaf('as'),
        RegexLeaf.spaceOneOrMore(),
        new RegexLeaf(':'),
        new RegexLeaf(1, 'CODE', '([%pLN_.]+)'),
      ),
    ),
    RegexLeaf.spaceZeroOrMore(),
    RegexLeaf.end(),
  );
}

/**
 * `@100`, `@+50`, `@0 as :start`. `explainArg` (`@Explain`) is not ported.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandAtTime.java:51-97
 */
export class CommandAtTime extends SingleLineCommand2<TimingDiagram> {
  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandAtTime.java:53-55 */
  public constructor() {
    super(getRegexConcat());
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandAtTime.java:88-97 */
  protected override executeArg(
    diagram: TimingDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const timeTick = TimeTickBuilder.parseTimeTick('TIME', arg, diagram);
    if (timeTick === undefined) return CommandExecutionResult.error('What time?');

    const code = arg.get('CODE', 0);
    diagram.addTime(timeTick, code);
    return CommandExecutionResult.ok();
  }
}
