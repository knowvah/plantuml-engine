/**
 * `UBrexCommandEndPartition`: `}` or `end partition`, which closes the group the last `partition` opened. The
 * grammar's third alternative is `UBrexLeaf.end()` ALONE, so the empty line is also an `end partition` (upstream's
 * `UBrexOr(..., UBrexLeaf.end())`, not a `UBrexConcat(..., end())`); kept (D9).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram/command/UBrexCommandEndPartition.java:52-85
 */
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../../core/command/ParserPass.js';
import { UBrexSingleLineCommand2 } from '../../../core/command/UBrexSingleLineCommand2.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import type { LineLocation } from '../../../core/tim/LineLocation.js';
import { UBrexConcat } from '../../../core/ubrex/builder/UBrexConcat.js';
import { UBrexLeaf } from '../../../core/ubrex/builder/UBrexLeaf.js';
import { UBrexOr } from '../../../core/ubrex/builder/UBrexOr.js';
import type { UnicodeBracketedExpression } from '../../../core/ubrex/UnicodeBracketedExpression.js';
import type { ActivityDiagram } from '../ActivityDiagram.js';

/** @see UBrexCommandEndPartition.java:80 */
const NO_PARTITION_DEFINED = 'No partition defined';

/** @see UBrexCommandEndPartition.java:52 */
export class UBrexCommandEndPartition extends UBrexSingleLineCommand2<ActivityDiagram> {
  /** @see UBrexCommandEndPartition.java:54-56 */
  constructor() {
    super(UBrexCommandEndPartition.getRegexConcat());
  }

  /** @see UBrexCommandEndPartition.java:58-65 */
  static getRegexConcat(): UnicodeBracketedExpression {
    return UBrexConcat.build(
      new UBrexOr(
        UBrexConcat.build(new UBrexLeaf('end'), UBrexLeaf.spaceZeroOrMore(), new UBrexLeaf('partition')),
        new UBrexLeaf('}'),
        UBrexLeaf.end(),
      ),
    );
  }

  /** `@Explain`. @see UBrexCommandEndPartition.java:67-73 */
  protected override explainArg(_location: LineLocation | undefined, _arg: RegexResult): string {
    return 'Closing the current partition';
  }

  /** @see UBrexCommandEndPartition.java:75-83 */
  protected override executeArg(
    diagram: ActivityDiagram,
    _location: LineLocation | undefined,
    _arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const result = diagram.endGroup();
    if (!result) return CommandExecutionResult.error(NO_PARTITION_DEFINED);

    return CommandExecutionResult.ok();
  }
}
