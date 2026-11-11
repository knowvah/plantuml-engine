import { CommandExecutionResult } from './CommandExecutionResult.js';
import type { ParserPass } from './ParserPass.js';
import { SingleLineCommand2 } from './SingleLineCommand2.js';
import type { IRegex } from '../regex/IRegex.js';
import { RegexConcat } from '../regex/RegexConcat.js';
import { RegexLeaf } from '../regex/RegexLeaf.js';
import type { RegexResult } from '../regex/RegexResult.js';
import type { LineLocation } from '../tim/LineLocation.js';

/**
 * `hide footbox` / `show footbox` in a diagram type that has no footbox: accepted, no effect. The regex form
 * beside `UBrexCommandFootboxIgnored`. `S` is upstream's `TitledDiagram`; `executeArg` never reads it.
 * `explainArg` (`@Explain`) is not ported.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/CommandFootboxIgnored.java:46-73
 */
export class CommandFootboxIgnored<S = unknown> extends SingleLineCommand2<S> {
  /** @see CommandFootboxIgnored.java:48-50 */
  public constructor() {
    super(CommandFootboxIgnored.getRegexConcat());
  }

  /** @see CommandFootboxIgnored.java:52-57 */
  static getRegexConcat(): IRegex {
    return RegexConcat.build(
      'net.sourceforge.plantuml.command.CommandFootboxIgnored',
      RegexLeaf.start(),
      new RegexLeaf(1, '(hide|show)?'),
      RegexLeaf.spaceZeroOrMore(),
      new RegexLeaf('footbox'),
      RegexLeaf.end(),
    );
  }

  /** @see CommandFootboxIgnored.java:69-72 */
  protected override executeArg(
    _diagram: S,
    _location: LineLocation | undefined,
    _arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    return CommandExecutionResult.ok();
  }
}
