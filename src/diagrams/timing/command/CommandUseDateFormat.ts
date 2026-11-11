import type { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../../core/command/SingleLineCommand2.js';
import type { IRegex } from '../../../core/regex/IRegex.js';
import { RegexConcat } from '../../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../../core/regex/RegexLeaf.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import type { LineLocation } from '../../../core/tim/LineLocation.js';
import type { TimingDiagram } from '../TimingDiagram.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandUseDateFormat.java:56-68 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.timingdiagram.command.CommandUseDateFormat',
    RegexLeaf.start(),
    new RegexLeaf('use'),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf('date'),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf('format'),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf(1, 'FORMAT', '[%g]([^%g]+)[%g]'),
    RegexLeaf.end(),
  );
}

/**
 * `use date format "yy-MM-dd"`: `Bad date format` for a pattern `SimpleDateFormat` rejects (D4). `explainArg`
 * (`@Explain`) is not ported.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandUseDateFormat.java:50-80
 */
export class CommandUseDateFormat extends SingleLineCommand2<TimingDiagram> {
  /** @see CommandUseDateFormat.java:52-54 */
  public constructor() {
    super(getRegexConcat());
  }

  /** @see CommandUseDateFormat.java:75-79 */
  protected override executeArg(
    diagram: TimingDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    return diagram.useDateFormat(arg.get('FORMAT', 0)!);
  }
}
