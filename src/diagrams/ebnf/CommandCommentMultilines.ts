/**
 * `CommandCommentMultilines`: a `(* … *)` comment over several lines, added as a note without its two-character
 * delimiters (`removeFewChars(2)`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/CommandCommentMultilines.java:53-85
 */
import type { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import { CommandMultilines2 } from '../../core/command/CommandMultilines2.js';
import { MultilinesStrategy } from '../../core/command/MultilinesStrategy.js';
import type { ParserPass } from '../../core/command/ParserPass.js';
import { Trim } from '../../core/command/Trim.js';
import { Lazy } from '../../core/Lazy.js';
import type { IRegex } from '../../core/regex/IRegex.js';
import { compileInternal } from '../../core/regex/Pattern2.js';
import { RegexConcat } from '../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../core/regex/RegexLeaf.js';
import type { BlocLines } from '../../core/utils/BlocLines.js';
import type { PSystemEbnf } from './PSystemEbnf.js';

/** @see CommandCommentMultilines.java:55-56 */
const END = new Lazy<RegExp>(() => compileInternal('^.*\\*\\)[%s]*$'));
/** `removeFewChars(2)`: `(*` and `*)`. @see CommandCommentMultilines.java:81 */
const DELIMITER_LENGTH = 2;

/** @see CommandCommentMultilines.java:62-68 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.ebnf.CommandCommentMultilines',
    RegexLeaf.start(),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf('\\(\\*'),
    new RegexLeaf('.*'),
    RegexLeaf.end(),
  );
}

export class CommandCommentMultilines extends CommandMultilines2<PSystemEbnf> {
  /** @see CommandCommentMultilines.java:58-60 */
  constructor() {
    super(getRegexConcat(), MultilinesStrategy.KEEP_STARTING_QUOTE, Trim.BOTH, END);
  }

  /** @see CommandCommentMultilines.java:70-76 */
  protected explainNow(lines: BlocLines): string {
    return `Adding an EBNF comment with ${lines.size()} lines of text`;
  }

  /** @see CommandCommentMultilines.java:78-83 */
  protected executeNow(diagram: PSystemEbnf, lines: BlocLines, _currentPass: ParserPass): CommandExecutionResult {
    const note = lines.removeFewChars(DELIMITER_LENGTH).toDisplay();
    return diagram.addNote(note, undefined);
  }
}
