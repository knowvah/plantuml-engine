/**
 * `CommandMove`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/wire/CommandMove.java
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
    'net.sourceforge.plantuml.wire.CommandMove',
    RegexLeaf.start(),
    new RegexLeaf(1, 'INDENT', JAVA_INDENT),
    new RegexLeaf('move'),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf('\\('),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf(1, 'X', '(-?\\d+)'),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf(','),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf(1, 'Y', '(-?\\d+)'),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf('\\)'),
    RegexLeaf.spaceZeroOrMore(),
    RegexLeaf.end(),
  );
}

/** `doTrim` false: indentation is significant (wrp D4). */
export class CommandMove extends SingleLineCommand2<WireDiagram> {
  constructor() {
    super(false, getRegexConcat());
  }

  protected override executeArg(
    diagram: WireDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const indent = arg.get('INDENT', 0)!;
    return diagram.wmove(indent, Number(arg.get('X', 0)!), Number(arg.get('Y', 0)!));
  }
}
