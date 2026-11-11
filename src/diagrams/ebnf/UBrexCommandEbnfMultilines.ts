/**
 * `UBrexCommandEbnfMultilines`: a rule over several lines, from `id =` to the first line ending in `;`, the whole
 * block handed to `PSystemEbnf#addBlocLines` with no comments.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/UBrexCommandEbnfMultilines.java:53-88
 */
import type { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import { MultilinesStrategy } from '../../core/command/MultilinesStrategy.js';
import type { ParserPass } from '../../core/command/ParserPass.js';
import { Trim } from '../../core/command/Trim.js';
import { UBrexCommandMultilines2 } from '../../core/command/UBrexCommandMultilines2.js';
import { Lazy } from '../../core/Lazy.js';
import { UBrexConcat } from '../../core/ubrex/builder/UBrexConcat.js';
import { UBrexLeaf } from '../../core/ubrex/builder/UBrexLeaf.js';
import { UBrexNamed } from '../../core/ubrex/builder/UBrexNamed.js';
import type { UnicodeBracketedExpression } from '../../core/ubrex/UnicodeBracketedExpression.js';
import type { BlocLines } from '../../core/utils/BlocLines.js';
import type { PSystemEbnf } from './PSystemEbnf.js';

/** @see UBrexCommandEbnfMultilines.java:55 */
const END = new Lazy<UnicodeBracketedExpression>(() => new UBrexLeaf('〇+〘 〄>; 〙'));

/** @see UBrexCommandEbnfMultilines.java:61-71 */
export function getRegexConcat(): UnicodeBracketedExpression {
  return new UBrexNamed(
    'LINE',
    UBrexConcat.build(
      new UBrexLeaf('「〴an_」'),
      new UBrexLeaf('〇*「〴an_-」'),
      UBrexLeaf.spaceZeroOrMore(),
      new UBrexLeaf('='),
      new UBrexLeaf('〇*〴.'),
    ),
  );
}

export class UBrexCommandEbnfMultilines extends UBrexCommandMultilines2<PSystemEbnf> {
  /** @see UBrexCommandEbnfMultilines.java:57-59 */
  constructor() {
    super(getRegexConcat(), MultilinesStrategy.KEEP_STARTING_QUOTE, Trim.BOTH, END);
  }

  /** @see UBrexCommandEbnfMultilines.java:73-79 */
  protected explainNow(lines: BlocLines): string {
    return `Declaring an EBNF rule with ${lines.size()} lines`;
  }

  /** @see UBrexCommandEbnfMultilines.java:81-86 */
  protected executeNow(diagram: PSystemEbnf, lines: BlocLines, _currentPass: ParserPass): CommandExecutionResult {
    return diagram.addBlocLines(lines, null, null);
  }
}
