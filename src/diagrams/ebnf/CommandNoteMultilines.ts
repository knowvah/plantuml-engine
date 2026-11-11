/**
 * `CommandNoteMultilines`: `note [#color]` … `end note`, added as a note with its colour. In the package but never
 * registered: `PSystemEbnfFactory#initCommandsList` does not add it (eep D4), so only its tests drive it.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/CommandNoteMultilines.java:57-107
 */
import { ColorType } from '../../core/abel/ColorType.js';
import type { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import { CommandMultilines2 } from '../../core/command/CommandMultilines2.js';
import { MultilinesStrategy } from '../../core/command/MultilinesStrategy.js';
import type { ParserPass } from '../../core/command/ParserPass.js';
import { Trim } from '../../core/command/Trim.js';
import { ColorParser } from '../../core/klimt/color/ColorParser.js';
import { Lazy } from '../../core/Lazy.js';
import type { IRegex } from '../../core/regex/IRegex.js';
import { compileInternal } from '../../core/regex/Pattern2.js';
import { RegexConcat } from '../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../core/regex/RegexLeaf.js';
import type { BlocLines } from '../../core/utils/BlocLines.js';
import type { PSystemEbnf } from './PSystemEbnf.js';

/** @see CommandNoteMultilines.java:59-60 */
const END = new Lazy<RegExp>(() => compileInternal('^end[%s]?note$'));

/** @see CommandNoteMultilines.java:66-68 */
function color(): ColorParser {
  return ColorParser.simpleColor(ColorType.BACK);
}

/** @see CommandNoteMultilines.java:70-76 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.ebnf.CommandNoteMultilines',
    RegexLeaf.start(),
    new RegexLeaf('note'),
    RegexLeaf.spaceZeroOrMore(),
    color().getRegex(),
    RegexLeaf.end(),
  );
}

export class CommandNoteMultilines extends CommandMultilines2<PSystemEbnf> {
  /** @see CommandNoteMultilines.java:62-64 */
  constructor() {
    super(getRegexConcat(), MultilinesStrategy.REMOVE_STARTING_QUOTE, Trim.BOTH, END);
  }

  /** @see CommandNoteMultilines.java:78-94 */
  protected explainNow(lines: BlocLines): string {
    const line0 = this.getStartingPattern().matcher(lines.getFirst()!.getTrimmed().getString());
    if (line0 === undefined) return 'Adding a note';

    const colorText = line0.getLazzy('COLOR', 0);
    const bodyLines = lines.size() > 2 ? lines.size() - 2 : 0;

    let sb = `Adding a note with ${bodyLines} lines of text`;
    if (colorText !== undefined) sb += ` with background color ${colorText}`;
    return sb;
  }

  /** `line0` matched in `isValid`, so `matcher` answers. @see CommandNoteMultilines.java:96-105 */
  protected executeNow(diagram: PSystemEbnf, linesIn: BlocLines, _currentPass: ParserPass): CommandExecutionResult {
    const line0 = this.getStartingPattern().matcher(linesIn.getFirst()!.getTrimmed().getString())!;
    const lines = linesIn.subExtract(1, 1).removeEmptyColumns();
    const note = lines.toDisplay();
    const colors = color().getColor(line0.getLazzy('COLOR', 0), diagram.getSkinParam().getIHtmlColorSet());
    return diagram.addNote(note, colors);
  }
}
