import type { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../../core/command/SingleLineCommand2.js';
import type { IRegex } from '../../../core/regex/IRegex.js';
import { RegexConcat } from '../../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../../core/regex/RegexLeaf.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import type { LineLocation } from '../../../core/tim/LineLocation.js';
import { TimeAxisStategy } from '../TimeAxisStategy.js';
import type { TimingDiagram } from '../TimingDiagram.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandHideTimeAxis.java:56-65 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.timingdiagram.command.CommandHideTimeAxis',
    RegexLeaf.start(),
    new RegexLeaf(1, 'COMMAND', '(hide|manual)'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf('time'),
    new RegexLeaf('.?'),
    new RegexLeaf('axis'),
    RegexLeaf.end(),
  );
}

/**
 * `hide time axis`, `manual time axis`. `explainArg` (`@Explain`) is not ported.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandHideTimeAxis.java:50-85
 */
export class CommandHideTimeAxis extends SingleLineCommand2<TimingDiagram> {
  /** @see CommandHideTimeAxis.java:52-54 */
  public constructor() {
    super(getRegexConcat());
  }

  /** `"MANUAL".equalsIgnoreCase(cmd)`. @see CommandHideTimeAxis.java:77-84 */
  protected override executeArg(
    diagram: TimingDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const cmd = arg.get('COMMAND', 0)!;
    if (cmd.toUpperCase() === 'MANUAL') return diagram.setTimeAxisStategy(TimeAxisStategy.MANUAL);
    return diagram.setTimeAxisStategy(TimeAxisStategy.HIDDEN);
  }
}
