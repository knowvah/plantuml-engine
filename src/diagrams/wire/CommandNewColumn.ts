/**
 * `CommandNewColumn`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/wire/CommandNewColumn.java
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
    'net.sourceforge.plantuml.wire.CommandNewColumn',
    RegexLeaf.start(),
    new RegexLeaf(1, 'INDENT', JAVA_INDENT),
    new RegexLeaf('-+'),
    RegexLeaf.spaceZeroOrMore(),
    RegexLeaf.end(),
  );
}

/** `doTrim` false: indentation is significant (wrp D4). */
export class CommandNewColumn extends SingleLineCommand2<WireDiagram> {
  constructor() {
    super(false, getRegexConcat());
  }

  protected override executeArg(
    diagram: WireDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    return diagram.newColumn(arg.get('INDENT', 0)!);
  }
}
