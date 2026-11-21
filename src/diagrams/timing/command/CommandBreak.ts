import type { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../../core/command/SingleLineCommand2.js';
import type { IRegex } from '../../../core/regex/IRegex.js';
import { RegexConcat } from '../../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../../core/regex/RegexLeaf.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import type { LineLocation } from '../../../core/tim/LineLocation.js';
import type { TimingDiagram } from '../TimingDiagram.js';
import { TimeTickBuilder } from './TimeTickBuilder.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandBreak.java:61-73 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.timingdiagram.command.CommandBreak',
    RegexLeaf.start(),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf('break'),
    RegexLeaf.spaceOneOrMore(),
    TimeTickBuilder.expressionAtWithoutArobase('FROM'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf('to'),
    RegexLeaf.spaceOneOrMore(),
    TimeTickBuilder.expressionAtWithoutArobase('TO'),
    RegexLeaf.spaceZeroOrMore(),
    RegexLeaf.end(),
  );
}

/**
 * `break <from> to <to>` (upstream baf98040f42, #2981): squeezes a stretch of the time axis into half a tick
 * interval. `mandatoryFirstTokensFast` is a dispatch shortcut this port does not have.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandBreak.java:53-98
 */
export class CommandBreak extends SingleLineCommand2<TimingDiagram> {
  /** @see CommandBreak.java:57-59 */
  public constructor() {
    super(getRegexConcat());
  }

  /** FROM/TO are described lexically, not resolved against the diagram. @see CommandBreak.java:75-83 */
  protected override explainArg(_location: LineLocation | undefined, arg: RegexResult): string {
    const from = TimeTickBuilder.describeTime('FROM', arg);
    const to = TimeTickBuilder.describeTime('TO', arg);
    return `Breaking the time axis from ${from} to ${to}`;
  }

  /** @see CommandBreak.java:85-91 */
  protected override executeArg(
    diagram: TimingDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const tickFrom = TimeTickBuilder.parseTimeTick('FROM', arg, diagram);
    const tickTo = TimeTickBuilder.parseTimeTick('TO', arg, diagram);
    return diagram.addBreak(tickFrom, tickTo);
  }
}
