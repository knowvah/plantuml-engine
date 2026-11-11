/**
 * `help type`: three header lines, then one creole list item per name.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/help/CommandHelpType.java
 */
import { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../core/command/SingleLineCommand2.js';
import { LanguageDescriptor } from '../../core/syntax/LanguageDescriptor.js';
import type { IRegex } from '../../core/regex/IRegex.js';
import { RegexConcat } from '../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../core/regex/RegexLeaf.js';
import type { RegexResult } from '../../core/regex/RegexResult.js';
import type { LineLocation } from '../../core/tim/LineLocation.js';
import type { Help } from './Help.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/help/CommandHelpType.java:55-60 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.help.CommandHelpType',
    RegexLeaf.start(),
    new RegexLeaf('help'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf('types?'),
    RegexLeaf.end(),
  );
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/help/CommandHelpType.java */
export class CommandHelpType extends SingleLineCommand2<Help> {
  constructor() {
    super(getRegexConcat());
  }

  /** `@Explain`: `null`. */
  protected override explainArg(_location: LineLocation | undefined, _arg: RegexResult): string | undefined {
    return undefined;
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/help/CommandHelpType.java:70-79 */
  protected executeArg(
    diagram: Help,
    _location: LineLocation | undefined,
    _arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    diagram.add('<b>Help on types');
    diagram.add(' ');
    diagram.add(' The possible types are :');
    for (const type of new LanguageDescriptor().getType()) diagram.add(`* ${type}`);
    return CommandExecutionResult.ok();
  }
}
