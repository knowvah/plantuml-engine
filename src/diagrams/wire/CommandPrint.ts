/**
 * `CommandPrint`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/wire/CommandPrint.java
 */
import type { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../core/command/SingleLineCommand2.js';
import type { IRegex } from '../../core/regex/IRegex.js';
import { RegexConcat } from '../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../core/regex/RegexLeaf.js';
import type { RegexResult } from '../../core/regex/RegexResult.js';
import type { LineLocation } from '../../core/tim/LineLocation.js';
import type { WireDiagram } from './WireDiagram.js';
import { JAVA_INDENT } from './wire-common-commands.js';

function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.wire.CommandPrint',
    RegexLeaf.start(),
    new RegexLeaf(1, 'INDENT', JAVA_INDENT),
    new RegexLeaf('print'),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf('\\('),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf('[%g]'),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf(1, 'TEXT', '(.*)'),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf('[%g]'),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf('\\)'),
    RegexLeaf.spaceZeroOrMore(),
    RegexLeaf.end(),
  );
}

/** `doTrim` false: indentation is significant (wrp D4). */
export class CommandPrint extends SingleLineCommand2<WireDiagram> {
  constructor() {
    super(false, getRegexConcat());
  }

  protected override executeArg(
    diagram: WireDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    return diagram.print(arg.get('INDENT', 0)!, arg.get('TEXT', 0)!);
  }
}
