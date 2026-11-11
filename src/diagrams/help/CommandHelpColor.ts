/**
 * `help color`: three header lines, then one creole list item per name.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/help/CommandHelpColor.java
 */
import { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../core/command/SingleLineCommand2.js';
import { HColorSet } from '../../core/klimt/color/HColorSet.js';
import type { IRegex } from '../../core/regex/IRegex.js';
import { RegexConcat } from '../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../core/regex/RegexLeaf.js';
import type { RegexResult } from '../../core/regex/RegexResult.js';
import type { LineLocation } from '../../core/tim/LineLocation.js';
import type { Help } from './Help.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/help/CommandHelpColor.java:55-60 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.help.CommandHelpColor',
    RegexLeaf.start(),
    new RegexLeaf('help'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf('colors?'),
    RegexLeaf.end(),
  );
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/help/CommandHelpColor.java */
export class CommandHelpColor extends SingleLineCommand2<Help> {
  constructor() {
    super(getRegexConcat());
  }

  /** `@Explain`: `null`. */
  protected override explainArg(_location: LineLocation | undefined, _arg: RegexResult): string | undefined {
    return undefined;
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/help/CommandHelpColor.java:70-79 */
  protected executeArg(
    diagram: Help,
    _location: LineLocation | undefined,
    _arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    diagram.add('<b>Help on colors');
    diagram.add(' ');
    diagram.add(' The possible colors are :');
    for (const type of HColorSet.instance().names()) diagram.add(`* ${type}`);
    return CommandExecutionResult.ok();
  }
}
