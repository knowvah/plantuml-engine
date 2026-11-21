import type { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../../core/command/SingleLineCommand2.js';
import type { IRegex } from '../../../core/regex/IRegex.js';
import { RegexConcat } from '../../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../../core/regex/RegexLeaf.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import type { LineLocation } from '../../../core/tim/LineLocation.js';
import type { TimingDiagram } from '../TimingDiagram.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandTimeAxisUnit.java:60-70 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.timingdiagram.command.CommandTimeAxisUnit',
    RegexLeaf.start(),
    new RegexLeaf('time'),
    new RegexLeaf('[-_ ]?'),
    new RegexLeaf('axis'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf('unit'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf(1, 'UNIT', '[%g]([^%g]+)[%g]'),
    RegexLeaf.end(),
  );
}

/**
 * `time-axis unit "ms"` (upstream db06d70e18e, #2982): the unit drawn right-aligned on the last tick of the axis.
 * `mandatoryFirstTokensFast` is a dispatch shortcut this port does not have.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandTimeAxisUnit.java:52-88
 */
export class CommandTimeAxisUnit extends SingleLineCommand2<TimingDiagram> {
  /** @see CommandTimeAxisUnit.java:56-58 */
  public constructor() {
    super(getRegexConcat());
  }

  /** @see CommandTimeAxisUnit.java:72-77 */
  protected override explainArg(_location: LineLocation | undefined, arg: RegexResult): string {
    return `Setting the time axis unit to "${arg.get('UNIT', 0)!}"`;
  }

  /** @see CommandTimeAxisUnit.java:79-83 */
  protected override executeArg(
    diagram: TimingDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    return diagram.setTimeAxisUnit(arg.get('UNIT', 0)!);
  }
}
