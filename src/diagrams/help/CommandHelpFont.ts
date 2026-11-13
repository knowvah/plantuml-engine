/**
 * `help font`: three header lines, then one creole list item per name.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/help/CommandHelpFont.java
 */
import { availableFontFamilyNames } from '../../core/available-font-family-names.js';
import { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../core/command/SingleLineCommand2.js';
import type { IRegex } from '../../core/regex/IRegex.js';
import { RegexConcat } from '../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../core/regex/RegexLeaf.js';
import type { RegexResult } from '../../core/regex/RegexResult.js';
import type { LineLocation } from '../../core/tim/LineLocation.js';
import type { Help } from './Help.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/help/CommandHelpFont.java:56-61 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.help.CommandHelpFont',
    RegexLeaf.start(),
    new RegexLeaf('help'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf('fonts?'),
    RegexLeaf.end(),
  );
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/help/CommandHelpFont.java */
export class CommandHelpFont extends SingleLineCommand2<Help> {
  constructor() {
    super(getRegexConcat());
  }

  /** `@Explain`: `null`. */
  protected override explainArg(_location: LineLocation | undefined, _arg: RegexResult): string | undefined {
    return undefined;
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/help/CommandHelpFont.java:71-81 */
  protected executeArg(
    diagram: Help,
    _location: LineLocation | undefined,
    _arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    diagram.add('<b>Help on font');
    diagram.add(' ');
    diagram.add(' The possible font on your system are :');
    for (const type of availableFontFamilyNames()) diagram.add(`* ${type}`);
    return CommandExecutionResult.ok();
  }
}
