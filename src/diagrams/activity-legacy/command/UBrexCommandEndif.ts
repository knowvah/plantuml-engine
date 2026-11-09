/**
 * `UBrexCommandEndif`: `endif` / `end if`, which closes the enclosing `if` (the context goes back to its parent).
 * With no activity yet, or no open `if`, it is an execution error; `ActivityDiagram#endif` itself would throw
 * on a null context, but both guards run first.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram/command/UBrexCommandEndif.java:50-87
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

/** @see UBrexCommandEndif.java:77, 80 */
const NO_IF_FOR_ENDIF = 'No if for this endif';

/** @see UBrexCommandEndif.java:50 */
export class UBrexCommandEndif extends UBrexSingleLineCommand2<ActivityDiagram> {
  /** @see UBrexCommandEndif.java:53-55 */
  constructor() {
    super(UBrexCommandEndif.getRegexConcat());
  }

  /** `end`, optional spaces, `if`: so `endif`, `end if` and `end  if`. @see UBrexCommandEndif.java:57-63 */
  static getRegexConcat(): UnicodeBracketedExpression {
    return UBrexConcat.build(new UBrexLeaf('end'), UBrexLeaf.spaceZeroOrMore(), new UBrexLeaf('if'), UBrexLeaf.end());
  }

  /** `@Explain`. @see UBrexCommandEndif.java:65-71 */
  protected override explainArg(_location: LineLocation | undefined, _arg: RegexResult): string {
    return 'Closing the enclosing if';
  }

  /** @see UBrexCommandEndif.java:73-85 */
  protected override executeArg(
    diagram: ActivityDiagram,
    _location: LineLocation | undefined,
    _arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    if (diagram.getLastEntityConsulted() === undefined) return CommandExecutionResult.error(NO_IF_FOR_ENDIF);

    if (diagram.getCurrentContext() === undefined) return CommandExecutionResult.error(NO_IF_FOR_ENDIF);

    diagram.endif();

    return CommandExecutionResult.ok();
  }
}
