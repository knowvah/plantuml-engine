/**
 * `CommandCrashAny` — any line at all (`〴.` zero or more times), accepted and
 * ignored. With no `CommonCommands` in `CrashDiagramFactory`, it is what
 * swallows `title`, `scale` and `skinparam` lines.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CommandCrashAny.java
 */
import { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../core/command/ParserPass.js';
import { UBrexSingleLineCommand2 } from '../../core/command/UBrexSingleLineCommand2.js';
import type { RegexResult } from '../../core/regex/RegexResult.js';
import type { LineLocation } from '../../core/tim/LineLocation.js';
import { UBrexLeaf } from '../../core/ubrex/builder/UBrexLeaf.js';
import { UBrexZeroOrMore } from '../../core/ubrex/builder/UBrexZeroOrMore.js';
import type { UnicodeBracketedExpression } from '../../core/ubrex/UnicodeBracketedExpression.js';
import type { CrashDiagram } from './CrashDiagram.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CommandCrashAny.java:51 */
export class CommandCrashAny extends UBrexSingleLineCommand2<CrashDiagram> {
  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CommandCrashAny.java:53-55 */
  constructor() {
    super(CommandCrashAny.getRegexConcat());
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CommandCrashAny.java:57-59 */
  static getRegexConcat(): UnicodeBracketedExpression {
    return new UBrexZeroOrMore(new UBrexLeaf('〴.'));
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CommandCrashAny.java:61-65 */
  protected override explainArg(_location: LineLocation | undefined, _arg: RegexResult): string | undefined {
    return undefined;
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CommandCrashAny.java:67-72 */
  protected override executeArg(
    _diagram: CrashDiagram,
    _location: LineLocation | undefined,
    _arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    return CommandExecutionResult.ok();
  }
}
