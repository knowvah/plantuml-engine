/**
 * `CommandSpot`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/wire/CommandSpot.java
 */
import type { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../core/command/SingleLineCommand2.js';
import type { IRegex } from '../../core/regex/IRegex.js';
import { RegexConcat } from '../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../core/regex/RegexLeaf.js';
import { HColorSet } from '../../core/klimt/color/HColorSet.js';
import { RegexOptional } from '../../core/regex/RegexOptional.js';
import type { RegexResult } from '../../core/regex/RegexResult.js';
import type { LineLocation } from '../../core/tim/LineLocation.js';
import type { StringLocated } from '../../core/tim/StringLocated.js';
import type { WireDiagram } from './WireDiagram.js';
import { hasUnicodeFold } from './wire-common-commands.js';

function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.wire.CommandSpot',
    RegexLeaf.start(),
    new RegexLeaf('spot'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf(1, 'NAME', '([\\w][.\\w]*)'),
    new RegexOptional(
      new RegexConcat(
        new RegexLeaf('\\('),
        RegexLeaf.spaceZeroOrMore(),
        new RegexLeaf(2, 'X', '(-?\\d+(%|%[-+]\\d+)?)'),
        RegexLeaf.spaceZeroOrMore(),
        new RegexLeaf(','),
        RegexLeaf.spaceZeroOrMore(),
        new RegexLeaf(2, 'Y', '(-?\\d+(%|%[-+]\\d+)?)'),
        RegexLeaf.spaceZeroOrMore(),
        new RegexLeaf('\\)'),
      ),
    ),
    new RegexOptional(new RegexConcat(RegexLeaf.spaceZeroOrMore(), new RegexLeaf(1, 'COLOR', '(#\\w+)?'))),
    RegexLeaf.spaceZeroOrMore(),
    RegexLeaf.end(),
  );
}

/** `doTrim` false: indentation is significant (wrp D4). */
export class CommandSpot extends SingleLineCommand2<WireDiagram> {
  constructor() {
    super(false, getRegexConcat());
  }

  /** `\\w` in the name is ASCII in Java (wrp D9): `iu` would fold U+017F and U+212A into it. */
  public override isCommandForbidden(line: StringLocated): boolean {
    return hasUnicodeFold(line.getString());
  }

  protected override executeArg(
    diagram: WireDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const name = arg.get('NAME', 0)!;
    const stringColor = arg.get('COLOR', 0);
    const color = stringColor === undefined ? undefined : HColorSet.instance().getColor(stringColor);
    return diagram.spot(name, color, arg.get('X', 0), arg.get('Y', 0));
  }
}
