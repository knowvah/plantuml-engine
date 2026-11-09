import type { ParserPass } from './ParserPass.js';
import { CommandExecutionResult } from './CommandExecutionResult.js';
import { UBrexSingleLineCommand2 } from './UBrexSingleLineCommand2.js';
import type { CucaDiagram } from '../cucadiagram/CucaDiagram.js';
import type { RegexResult } from '../regex/RegexResult.js';
import type { LineLocation } from '../tim/LineLocation.js';
import { UBrexConcat } from '../ubrex/builder/UBrexConcat.js';
import { UBrexLeaf } from '../ubrex/builder/UBrexLeaf.js';
import { UBrexNamed } from '../ubrex/builder/UBrexNamed.js';
import type { UnicodeBracketedExpression } from '../ubrex/UnicodeBracketedExpression.js';

/**
 * `hide <name>` / `show <<stereotype>>`: hides or shows whole elements, by name or by stereotype
 * (`CucaDiagram#hideOrShow2`). Only the first letter of COMMAND is read.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/classdiagram/command/UBrexCommandHideShow2.java:55-110
 */
export class UBrexCommandHideShow2 extends UBrexSingleLineCommand2<CucaDiagram> {
  /** @see UBrexCommandHideShow2.java:57-59 */
  public constructor() {
    super(UBrexCommandHideShow2.getRegexConcat());
  }

  /** @see UBrexCommandHideShow2.java:61-69 */
  static getRegexConcat(): UnicodeBracketedExpression {
    return UBrexConcat.build(
      new UBrexNamed('COMMAND', new UBrexLeaf('【hide-class┇hide┇show-class┇show】')),
      UBrexLeaf.spaceOneOrMore(),
      new UBrexNamed('WHAT', new UBrexLeaf('【 << 〇*「〤<>」>> ┇ 〇+〴S 】 ')),
      UBrexLeaf.end(),
    );
  }

  /** @see UBrexCommandHideShow2.java:71-97 */
  protected override explainArg(_location: LineLocation | undefined, arg: RegexResult): string | undefined {
    const command = arg.get('COMMAND', 0) as string;
    const tmp = command.charAt(0);
    const show = tmp === 's' || tmp === 'S';
    let sb = show ? 'Showing' : 'Hiding';
    const what = (arg.get('WHAT', 0) as string).trim();
    sb += what.startsWith('<<') ? ' the elements stereotyped ' + what : " the elements matching '" + what + "'";
    if (command.includes('-')) sb += " (the '-class' suffix has no specific effect)";
    return sb;
  }

  /** @see UBrexCommandHideShow2.java:99-108 */
  protected override executeArg(
    diagram: CucaDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const tmp = (arg.get('COMMAND', 0) as string).charAt(0);
    const show = tmp === 's' || tmp === 'S';
    const what = (arg.get('WHAT', 0) as string).trim();
    diagram.hideOrShow2(what, show);
    return CommandExecutionResult.ok();
  }
}
