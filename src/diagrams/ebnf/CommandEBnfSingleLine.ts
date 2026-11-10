/**
 * `CommandEBnfSingleLine`: a rule on one line, `[(* above *)] id [(* below *)] = … ;`, handed to
 * `PSystemEbnf#addBlocLines` as `id + "=" + line`. `doTrim = true`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/CommandEBnfSingleLine.java:54-118
 */
import type { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../core/command/SingleLineCommand2.js';
import type { IRegex } from '../../core/regex/IRegex.js';
import { RegexConcat } from '../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../core/regex/RegexLeaf.js';
import { RegexOptional } from '../../core/regex/RegexOptional.js';
import type { RegexResult } from '../../core/regex/RegexResult.js';
import type { LineLocation } from '../../core/tim/LineLocation.js';
import { StringLocated } from '../../core/tim/StringLocated.js';
import { BlocLines } from '../../core/utils/BlocLines.js';
import type { PSystemEbnf } from './PSystemEbnf.js';

/** A `(* … *)` comment beside the id, captured as `name`. @see CommandEBnfSingleLine.java:63-69, :73-79 */
function comment(name: string): IRegex {
  return new RegexOptional(
    new RegexConcat(
      RegexLeaf.spaceZeroOrMore(),
      new RegexLeaf('\\(\\*'),
      new RegexLeaf(1, name, '(.*[^%s].*)'),
      new RegexLeaf('\\*\\)'),
      RegexLeaf.spaceZeroOrMore(),
    ),
  );
}

/** @see CommandEBnfSingleLine.java:60-86 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.ebnf.CommandEBnfSingleLine',
    RegexLeaf.start(),
    comment('COMMENTA'),
    new RegexLeaf(1, 'ID', '([%pLN_][-%pLN_]*)'),
    comment('COMMENTB'),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf(1, 'EQUALS', '(=)'),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf(1, 'LINE', '(.*;)'),
    RegexLeaf.end(),
  );
}

export class CommandEBnfSingleLine extends SingleLineCommand2<PSystemEbnf> {
  /** @see CommandEBnfSingleLine.java:56-58 */
  constructor() {
    super(true, getRegexConcat());
  }

  /** @see CommandEBnfSingleLine.java:88-102 */
  protected override explainArg(_location: LineLocation | undefined, arg: RegexResult): string {
    let sb = `Declaring the EBNF rule '${String(arg.get('ID', 0))}'`;
    if (arg.get('COMMENTA', 0) !== undefined) sb += ' with a comment above';
    if (arg.get('COMMENTB', 0) !== undefined) sb += ' with a comment below';
    return sb;
  }

  /** @see CommandEBnfSingleLine.java:104-117 */
  protected executeArg(
    diagram: PSystemEbnf,
    location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const full = `${String(arg.get('ID', 0))}${String(arg.get('EQUALS', 0))}${String(arg.get('LINE', 0))}`;
    const commentAbove = arg.get('COMMENTA', 0) ?? null;
    const commentBelow = arg.get('COMMENTB', 0) ?? null;
    const string = new StringLocated(full, location);
    return diagram.addBlocLines(BlocLines.from([string]), commentAbove, commentBelow);
  }
}
