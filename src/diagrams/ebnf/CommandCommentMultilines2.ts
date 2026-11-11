/**
 * `CommandCommentMultilines2`: a `(** … **)` documentation comment over several lines, added as a note without its three-character
 * delimiters (`removeFewChars(3)`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/CommandCommentMultilines2.java:53-85
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

/** @see CommandCommentMultilines2.java:55-56 */
const END = new Lazy<RegExp>(() => compileInternal('^.*\\*\\*\\)[%s]*$'));
/** `removeFewChars(3)`: `(**` and `**)`. @see CommandCommentMultilines2.java:81 */
const DELIMITER_LENGTH = 3;

/** @see CommandCommentMultilines2.java:62-68 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.ebnf.CommandCommentMultilines2',
    RegexLeaf.start(),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf('\\(\\*\\*'),
    new RegexLeaf('.*'),
    RegexLeaf.end(),
  );
}

export class CommandCommentMultilines2 extends CommandMultilines2<PSystemEbnf> {
  /** @see CommandCommentMultilines2.java:58-60 */
  constructor() {
    super(getRegexConcat(), MultilinesStrategy.KEEP_STARTING_QUOTE, Trim.BOTH, END);
  }

  /** @see CommandCommentMultilines2.java:70-76 */
  protected explainNow(lines: BlocLines): string {
    return `Adding an EBNF documentation comment with ${lines.size()} lines of text`;
  }

  /** @see CommandCommentMultilines2.java:78-83 */
  protected executeNow(diagram: PSystemEbnf, lines: BlocLines, _currentPass: ParserPass): CommandExecutionResult {
    const note = lines.removeFewChars(DELIMITER_LENGTH).toDisplay();
    return diagram.addNote(note, undefined);
  }
}
