import { fromString } from '../../../core/abel/Position.js';
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../../core/command/SingleLineCommand2.js';
import { Display } from '../../../core/klimt/creole/Display.js';
import type { IRegex } from '../../../core/regex/IRegex.js';
import { RegexConcat } from '../../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../../core/regex/RegexLeaf.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import { Stereotag } from '../../../core/abel/Stereotag.js';
import { Stereotype } from '../../../core/stereo/Stereotype.js';
import * as StereotypePattern from '../../../core/stereo/StereotypePattern.js';
import type { LineLocation } from '../../../core/tim/LineLocation.js';
import type { TimingDiagram } from '../TimingDiagram.js';
import { PLAYER_CODE } from './player-code.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandNote.java:58-79 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.timingdiagram.command.CommandNote',
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
    new RegexLeaf(4, 'TAGS', `${Stereotag.pattern()}?`),
    StereotypePattern.optional('STEREO'),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf(':'),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf(1, 'NOTE', '(.+)'),
    RegexLeaf.spaceZeroOrMore(),
    RegexLeaf.end(),
  );
}

/**
 * `note top of WU : text`. The `TAGS` group is parsed and never read (java:101-102 comment). `explainArg`
 * (`@Explain`) is not ported.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandNote.java:55-132
 */
export class CommandNote extends SingleLineCommand2<TimingDiagram> {
  /** @see CommandNote.java:57-59 */
  public constructor() {
    super(getRegexConcat());
  }

  /** @see CommandNote.java:106-131 */
  protected override executeArg(
    diagram: TimingDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const code = arg.get('CODE', 0)!;
    const player = diagram.getPlayer(code);
    if (player === undefined) return CommandExecutionResult.error(`Unknown "${code}"`);

    const note = Display.getWithNewlines(diagram.getPragma(), arg.get('NOTE', 0)!);
    const now = diagram.getNow();

    const stereotypeString = arg.get('STEREO', 0);
    const stereotype = stereotypeString === undefined ? undefined : Stereotype.build(stereotypeString);

    player.addNote(now, note, fromString(arg.get('POSITION', 0)!), stereotype);
    return CommandExecutionResult.ok();
  }
}
