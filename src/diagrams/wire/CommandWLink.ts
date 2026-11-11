/**
 * `CommandWLink`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/wire/CommandWLink.java
 */
import type { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../core/command/SingleLineCommand2.js';
import type { IRegex } from '../../core/regex/IRegex.js';
import { RegexConcat } from '../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../core/regex/RegexLeaf.js';
import { HColorSet } from '../../core/klimt/color/HColorSet.js';
import { Display } from '../../core/klimt/creole/Display.js';
import { RegexOptional } from '../../core/regex/RegexOptional.js';
import type { RegexResult } from '../../core/regex/RegexResult.js';
import type { LineLocation } from '../../core/tim/LineLocation.js';
import type { StringLocated } from '../../core/tim/StringLocated.js';
import type { WireDiagram } from './WireDiagram.js';
import { hasUnicodeFold } from './wire-common-commands.js';
import { WArrowDirection } from './WArrowDirection.js';
import { WLinkType } from './WLinkType.js';
import { WOrientation } from './WOrientation.js';

/** The optional `(x,y)` after `NAME1`. @see CommandWLink.java:62-73 */
function optionalStart(): IRegex {
  return new RegexOptional(
    new RegexConcat(
      new RegexLeaf('\\('),
      RegexLeaf.spaceZeroOrMore(),
      new RegexLeaf(2, 'X1', '(-?\\d+(%|%[-+]\\d+)?)'),
      RegexLeaf.spaceZeroOrMore(),
      new RegexLeaf(','),
      RegexLeaf.spaceZeroOrMore(),
      new RegexLeaf(2, 'Y1', '(-?\\d+(%|%[-+]\\d+)?)'),
      RegexLeaf.spaceZeroOrMore(),
      new RegexLeaf('\\)'),
    ),
  );
}

function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.wire.CommandWLink',
    RegexLeaf.start(),
    new RegexLeaf(1, 'NAME1', '([\\w][.\\w]*)'),
    optionalStart(),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf(1, 'STYLE', '(\\<?[-=]{1,2}\\>|\\<?[-=]{1,2})'),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf(1, 'NAME2', '([\\w][.\\w]*)'),
    new RegexOptional(new RegexConcat(RegexLeaf.spaceZeroOrMore(), new RegexLeaf(1, 'COLOR', '(#\\w+)?'))),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf(1, 'MESSAGE', '(?::[%s]*(.*))?'),
    RegexLeaf.spaceZeroOrMore(),
    RegexLeaf.end(),
  );
}

/** `doTrim` false: indentation is significant (wrp D4). */
export class CommandWLink extends SingleLineCommand2<WireDiagram> {
  constructor() {
    super(false, getRegexConcat());
  }

  /** `\\w` in the names is ASCII in Java; a label after the colon is free text (`.*`). */
  public override isCommandForbidden(line: StringLocated): boolean {
    return hasUnicodeFold(line.getString().split(':')[0]!);
  }

  protected override executeArg(
    diagram: WireDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const name1 = arg.get('NAME1', 0)!;
    const x1 = arg.get('X1', 0);
    const y1 = arg.get('Y1', 0);

    const name2 = arg.get('NAME2', 0)!;
    const style = arg.get('STYLE', 0)!;
    const type = WLinkType.from(style);
    const direction = WArrowDirection.from(style);
    const orientation = WOrientation.from(style);

    const stringColor = arg.get('COLOR', 0);
    const color = stringColor === undefined ? undefined : HColorSet.instance().getColor(stringColor);

    const message = arg.get('MESSAGE', 0);
    const label = message === undefined ? Display.NULL : Display.getWithNewlines(diagram.getPragma(), message);

    const link = { name1, x1, y1, name2, type, direction, color, label };
    if (orientation === WOrientation.VERTICAL) return diagram.vlink(link);
    return diagram.hlink(link);
  }
}
