import type { ParserPass } from './ParserPass.js';
import { CommandExecutionResult } from './CommandExecutionResult.js';
import { UBrexSingleLineCommand2 } from './UBrexSingleLineCommand2.js';
import type { RegexResult } from '../regex/RegexResult.js';
import type { LineLocation } from '../tim/LineLocation.js';
import { UBrexConcat } from '../ubrex/builder/UBrexConcat.js';
import { UBrexLeaf } from '../ubrex/builder/UBrexLeaf.js';
import type { UnicodeBracketedExpression } from '../ubrex/UnicodeBracketedExpression.js';

/**
 * `hide footbox` / `show footbox` in a diagram type that has no footbox: accepted, no effect.
 * `S` is upstream's `TitledDiagram`; `executeArg` never reads it.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/UBrexCommandFootboxIgnored.java:50-80
 */
export class UBrexCommandFootboxIgnored<S = unknown> extends UBrexSingleLineCommand2<S> {
  /** @see UBrexCommandFootboxIgnored.java:52-54 */
  public constructor() {
    super(UBrexCommandFootboxIgnored.getRegexConcat());
  }

  /** @see UBrexCommandFootboxIgnored.java:57-63 */
  static getRegexConcat(): UnicodeBracketedExpression {
    return UBrexConcat.build(
      new UBrexLeaf('【 hide┇show 】'),
      UBrexLeaf.spaceZeroOrMore(),
      new UBrexLeaf('footbox'),
      UBrexLeaf.end(),
    );
  }

  /** @see UBrexCommandFootboxIgnored.java:65-73 */
  protected override explainArg(_location: LineLocation | undefined, _arg: RegexResult): string | undefined {
    return "Accepted but ignored: 'footbox' has no effect in this diagram type";
  }

  /** @see UBrexCommandFootboxIgnored.java:75-79 */
  protected override executeArg(
    _diagram: S,
    _location: LineLocation | undefined,
    _arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    return CommandExecutionResult.ok();
  }
}
