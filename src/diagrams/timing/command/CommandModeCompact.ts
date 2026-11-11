import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../../core/command/SingleLineCommand2.js';
import type { IRegex } from '../../../core/regex/IRegex.js';
import { RegexConcat } from '../../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../../core/regex/RegexLeaf.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import type { LineLocation } from '../../../core/tim/LineLocation.js';
import type { TimingDiagram } from '../TimingDiagram.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandModeCompact.java:56-64 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.timingdiagram.command.CommandModeCompact',
    RegexLeaf.start(),
    new RegexLeaf('mode'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf('compact'),
    RegexLeaf.end(),
  );
}

/**
 * `mode compact`. `explainArg` (`@Explain`) is not ported.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandModeCompact.java:50-77
 */
export class CommandModeCompact extends SingleLineCommand2<TimingDiagram> {
  /** @see CommandModeCompact.java:52-54 */
  public constructor() {
    super(getRegexConcat());
  }

  /** @see CommandModeCompact.java:72-76 */
  protected override executeArg(
    diagram: TimingDiagram,
    _location: LineLocation | undefined,
    _arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    diagram.goCompactMode();
    return CommandExecutionResult.ok();
  }
}
