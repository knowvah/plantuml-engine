/**
 * `CommandListSprite`: `listsprite` or `listsprites` alone on the line. `executeArg` changes nothing — the page is
 * drawn from the diagram's sprites whether or not the line is there; the command only keeps it from being
 * `Syntax Error?`. `doTrim = true` (`SingleLineCommand2(IRegex)`, SingleLineCommand2.java:56-58), so
 * `  listsprite` is claimed; `RegexConcat` compiles case-insensitively, so `ListSprites` is too.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/sprite/CommandListSprite.java:50-73
 */
import { CommandExecutionResult } from '../../command/CommandExecutionResult.js';
import type { ParserPass } from '../../command/ParserPass.js';
import { SingleLineCommand2 } from '../../command/SingleLineCommand2.js';
import type { IRegex } from '../../regex/IRegex.js';
import { RegexConcat } from '../../regex/RegexConcat.js';
import { RegexLeaf } from '../../regex/RegexLeaf.js';
import type { RegexResult } from '../../regex/RegexResult.js';
import type { TitledDiagram } from '../../TitledDiagram.js';
import type { LineLocation } from '../../tim/LineLocation.js';

/** @see CommandListSprite.java:56-61 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.klimt.sprite.CommandListSprite',
    RegexLeaf.start(),
    new RegexLeaf('listsprites?'),
    RegexLeaf.end(),
  );
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/sprite/CommandListSprite.java:50 */
export class CommandListSprite extends SingleLineCommand2<TitledDiagram> {
  /** @see CommandListSprite.java:52-54 */
  constructor() {
    super(getRegexConcat());
  }

  /** @see CommandListSprite.java:63-67 */
  protected override explainArg(_location: LineLocation | undefined, _arg: RegexResult): string {
    return "Accepted but ignored: 'listsprites' has no effect";
  }

  /** @see CommandListSprite.java:69-72 */
  protected executeArg(
    _system: TitledDiagram,
    _location: LineLocation | undefined,
    _arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    return CommandExecutionResult.ok();
  }
}
