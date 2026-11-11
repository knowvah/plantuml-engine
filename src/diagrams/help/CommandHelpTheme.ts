/**
 * `help theme`: three header lines, then one creole list item per name.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/help/CommandHelpTheme.java
 */
import { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../core/command/SingleLineCommand2.js';
import { THEME_SOURCES } from '../../core/themes-source.js';
import type { IRegex } from '../../core/regex/IRegex.js';
import { RegexConcat } from '../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../core/regex/RegexLeaf.js';
import type { RegexResult } from '../../core/regex/RegexResult.js';
import type { LineLocation } from '../../core/tim/LineLocation.js';
import type { Help } from './Help.js';

/**
 * `ThemeUtils.getAllThemeNames()`: the bundled `puml-theme-<name>.puml`
 * resources' names (`_none_` included: it is a real resource), sorted with
 * `Collections.sort`, `String#compareTo` order. `THEME_SOURCES` holds the same
 * files, so its keys are that list; no `IOException` can arise from it, so
 * the command's error arm (java:79-84) is unreachable here.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/theme/ThemeUtils.java:204-217
 */
export function getAllThemeNames(): readonly string[] {
  return Object.keys(THEME_SOURCES).sort();
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/help/CommandHelpTheme.java:59-64 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.help.CommandHelpTheme',
    RegexLeaf.start(),
    new RegexLeaf('help'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf('themes?'),
    RegexLeaf.end(),
  );
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/help/CommandHelpTheme.java */
export class CommandHelpTheme extends SingleLineCommand2<Help> {
  constructor() {
    super(getRegexConcat());
  }

  /** `@Explain`: `null`. */
  protected override explainArg(_location: LineLocation | undefined, _arg: RegexResult): string | undefined {
    return undefined;
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/help/CommandHelpTheme.java:74-93 */
  protected executeArg(
    diagram: Help,
    _location: LineLocation | undefined,
    _arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    diagram.add('<b>Help on themes');
    diagram.add(' ');
    diagram.add(' The possible themes are :');
    for (const type of getAllThemeNames()) diagram.add(`* ${type}`);
    return CommandExecutionResult.ok();
  }
}
