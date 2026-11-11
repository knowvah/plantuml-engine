/**
 * `UBrexCommandComment`: a standalone `(* … *)` on one line, added as a note (the text trimmed).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/UBrexCommandComment.java:48-73
 */
import type { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../core/command/ParserPass.js';
import { UBrexSingleLineCommand2 } from '../../core/command/UBrexSingleLineCommand2.js';
import { Display } from '../../core/klimt/creole/Display.js';
import type { RegexResult } from '../../core/regex/RegexResult.js';
import type { LineLocation } from '../../core/tim/LineLocation.js';
import { UnicodeBracketedExpression } from '../../core/ubrex/UnicodeBracketedExpression.js';
import type { PSystemEbnf } from './PSystemEbnf.js';

/** @see UBrexCommandComment.java:54-56 */
function getRegexConcat(): UnicodeBracketedExpression {
  return UnicodeBracketedExpression.build('〇*〴s (* 〶$COMMENT=〄>〘*) 〇*〴s 〒$〙');
}

export class UBrexCommandComment extends UBrexSingleLineCommand2<PSystemEbnf> {
  /** @see UBrexCommandComment.java:50-52 */
  constructor() {
    super(getRegexConcat());
  }

  /** `COMMENT` is always captured when the pattern matched. @see UBrexCommandComment.java:58-63 */
  protected explainArg(_location: LineLocation | undefined, arg: RegexResult): string {
    return `Adding an EBNF comment "${arg.get('COMMENT', 0)!.trim()}"`;
  }

  /** @see UBrexCommandComment.java:65-71 */
  protected executeArg(
    diagram: PSystemEbnf,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const tmp = arg.get('COMMENT', 0)!.trim();
    const note = Display.getWithNewlines(diagram.getPragma(), tmp);
    return diagram.addNote(note, undefined);
  }
}
