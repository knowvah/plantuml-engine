/**
 * `UBrexCommandElse`: `else`, which makes the enclosing `if`'s branch the last entity again, so the next link
 * leaves the diamond a second time. With no activity yet, or no open `if`, it is an execution error.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram/command/UBrexCommandElse.java:51-86
 */
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../../core/command/ParserPass.js';
import { UBrexSingleLineCommand2 } from '../../../core/command/UBrexSingleLineCommand2.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import type { LineLocation } from '../../../core/tim/LineLocation.js';
import { UBrexConcat } from '../../../core/ubrex/builder/UBrexConcat.js';
import { UBrexLeaf } from '../../../core/ubrex/builder/UBrexLeaf.js';
import type { UnicodeBracketedExpression } from '../../../core/ubrex/UnicodeBracketedExpression.js';
import type { ActivityDiagram } from '../ActivityDiagram.js';

/** @see UBrexCommandElse.java:74, 77 */
const NO_IF_FOR_ELSE = 'No if for this else';

/** @see UBrexCommandElse.java:51 */
export class UBrexCommandElse extends UBrexSingleLineCommand2<ActivityDiagram> {
  /** @see UBrexCommandElse.java:53-55 */
  constructor() {
    super(UBrexCommandElse.getRegexConcat());
  }

  /** @see UBrexCommandElse.java:57-59 */
  static getRegexConcat(): UnicodeBracketedExpression {
    return UBrexConcat.build(new UBrexLeaf('else'), UBrexLeaf.end());
  }

  /** `@Explain`. @see UBrexCommandElse.java:61-68 */
  protected override explainArg(_location: LineLocation | undefined, _arg: RegexResult): string {
    return "Starting the 'else' branch of the enclosing if";
  }

  /** @see UBrexCommandElse.java:70-84 */
  protected override executeArg(
    system: ActivityDiagram,
    _location: LineLocation | undefined,
    _arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    if (system.getLastEntityConsulted() === undefined) return CommandExecutionResult.error(NO_IF_FOR_ELSE);

    if (system.getCurrentContext() === undefined) return CommandExecutionResult.error(NO_IF_FOR_ELSE);

    const branch = system.getCurrentContext()!.getBranch();

    system.setLastEntityConsulted(branch);

    return CommandExecutionResult.ok();
  }
}
