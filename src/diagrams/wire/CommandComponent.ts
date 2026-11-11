/**
 * `CommandComponent`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/wire/CommandComponent.java
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
import { hasUnicodeFold, JAVA_INDENT } from './wire-common-commands.js';

function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.wire.CommandComponent',
    RegexLeaf.start(),
    new RegexLeaf(1, 'INDENT', JAVA_INDENT),
    new RegexLeaf('\\*'),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf(1, 'NAME', '([\\w]+)'),
    new RegexOptional(
      new RegexConcat(
        RegexLeaf.spaceOneOrMore(),
        new RegexLeaf('\\['),
        new RegexLeaf(1, 'WIDTH', '([\\d]+)'),
        new RegexLeaf('[x*]'),
        new RegexLeaf(1, 'HEIGHT', '([\\d]+)'),
        new RegexLeaf('\\]'),
      ),
    ),
    new RegexOptional(new RegexConcat(RegexLeaf.spaceZeroOrMore(), new RegexLeaf(1, 'COLOR', '(#\\w+)?'))),
    RegexLeaf.spaceZeroOrMore(),
    RegexLeaf.end(),
  );
}

/** `Integer.MAX_VALUE`, past which `Integer.parseInt` throws (wrp D5, D9). */
const INT_MAX = 2147483647;

/** `Integer.parseInt` on `[\d]+`: a `NumberFormatException` past `int`, an error page through `ProtectedCommand`. */
function parseJavaInt(digits: string): number {
  const value = Number(digits);
  if (value > INT_MAX) throw new Error(`java.lang.NumberFormatException: For input string: "${digits}"`);
  return value;
}

/** `doTrim` false: indentation is significant (wrp D4). */
export class CommandComponent extends SingleLineCommand2<WireDiagram> {
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
    const indent = arg.get('INDENT', 0)!;
    const name = arg.get('NAME', 0)!;

    let width = 0;
    let height = 0;
    const widthString = arg.get('WIDTH', 0);
    const heightString = arg.get('HEIGHT', 0);
    if (widthString !== undefined) {
      width = parseJavaInt(widthString);
      height = parseJavaInt(heightString!);
    }

    const stringColor = arg.get('COLOR', 0);
    const color = stringColor === undefined ? undefined : HColorSet.instance().getColor(stringColor);

    return diagram.addComponent(indent, name, width, height, color);
  }
}
