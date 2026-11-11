import { fromString } from '../../../core/abel/Position.js';
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import { CommandMultilines2 } from '../../../core/command/CommandMultilines2.js';
import { MultilinesStrategy } from '../../../core/command/MultilinesStrategy.js';
import type { ParserPass } from '../../../core/command/ParserPass.js';
import { Trim } from '../../../core/command/Trim.js';
import { Lazy } from '../../../core/Lazy.js';
import type { IRegex } from '../../../core/regex/IRegex.js';
import { compileInternal } from '../../../core/regex/Pattern2.js';
import { RegexConcat } from '../../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../../core/regex/RegexLeaf.js';
import { Stereotype } from '../../../core/stereo/Stereotype.js';
import * as StereotypePattern from '../../../core/stereo/StereotypePattern.js';
import type { BlocLines } from '../../../core/utils/BlocLines.js';
import type { TimingDiagram } from '../TimingDiagram.js';
import { PLAYER_CODE } from './player-code.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandNoteLong.java:55-56 */
const END = new Lazy<RegExp>(() => compileInternal('^end[%s]?note$'));

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandNoteLong.java:104-120 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.timingdiagram.command.CommandNoteLong',
    RegexLeaf.start(),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf('note'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf(1, 'POSITION', '(top|bottom)'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf('of'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf(1, 'CODE', PLAYER_CODE),
    RegexLeaf.spaceZeroOrMore(),
    StereotypePattern.optional('STEREO'),
    RegexLeaf.spaceZeroOrMore(),
    RegexLeaf.end(),
  );
}

/**
 * `note bottom of WB` … `end note`. `explainNow` (`@Explain`) is not ported.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandNoteLong.java:53-121
 */
export class CommandNoteLong extends CommandMultilines2<TimingDiagram> {
  /** @see CommandNoteLong.java:58-60 */
  public constructor() {
    super(getRegexConcat(), MultilinesStrategy.REMOVE_STARTING_QUOTE, Trim.BOTH, END);
  }

  /** `@Explain` text is not ported (the base class's abstract hook). */
  protected override explainNow(_lines: BlocLines): string | undefined {
    return undefined;
  }

  /** `line0` matched in `isValid`, so `matcher` answers. @see CommandNoteLong.java:84-102 */
  protected override executeNow(
    diagram: TimingDiagram,
    linesIn: BlocLines,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const line0 = this.getStartingPattern().matcher(linesIn.getFirst()!.getTrimmed().getString())!;
    const lines = linesIn.subExtract(1, 1).removeEmptyColumns();
    const code = line0.get('CODE', 0)!;
    const player = diagram.getPlayer(code);
    if (player === undefined) return CommandExecutionResult.error(`Unknown "${code}"`);

    const note = lines.toDisplay();
    const now = diagram.getNow();

    const stereotypeString = line0.get('STEREO', 0);
    const stereotype = stereotypeString === undefined ? undefined : Stereotype.build(stereotypeString);

    player.addNote(now, note, fromString(line0.get('POSITION', 0)!), stereotype);
    return CommandExecutionResult.ok();
  }
}
