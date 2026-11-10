/**
 * `CommandRegexfSingleLine`: any line, handed to `PSystemRegex#addBlocLines` as one `StringLocated`. Its `(.*)`
 * takes every line the common commands decline, so a regex source never meets `Syntax Error?`. `doTrim = true`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/regexdiagram/CommandRegexfSingleLine.java:53-80
 */
import type { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../core/command/SingleLineCommand2.js';
import type { IRegex } from '../../core/regex/IRegex.js';
import { RegexConcat } from '../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../core/regex/RegexLeaf.js';
import type { RegexResult } from '../../core/regex/RegexResult.js';
import type { LineLocation } from '../../core/tim/LineLocation.js';
import { StringLocated } from '../../core/tim/StringLocated.js';
import { BlocLines } from '../../core/utils/BlocLines.js';
import type { PSystemRegex } from './PSystemRegex.js';

/** @see CommandRegexfSingleLine.java:59-64 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.regexdiagram.CommandRegexfSingleLine',
    RegexLeaf.start(),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf(1, 'LINE', '(.*)'),
    RegexLeaf.end(),
  );
}

export class CommandRegexfSingleLine extends SingleLineCommand2<PSystemRegex> {
  /** @see CommandRegexfSingleLine.java:55-57 */
  constructor() {
    super(true, getRegexConcat());
  }

  /** @see CommandRegexfSingleLine.java:66-71 */
  protected override explainArg(_location: LineLocation | undefined, arg: RegexResult): string {
    return `Adding the regex source line '${String(arg.get('LINE', 0))}'`;
  }

  /** @see CommandRegexfSingleLine.java:73-80 */
  protected executeArg(
    diagram: PSystemRegex,
    location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const line = arg.get('LINE', 0) ?? '';
    const string = new StringLocated(line, location);
    return diagram.addBlocLines(BlocLines.from([string]));
  }
}
