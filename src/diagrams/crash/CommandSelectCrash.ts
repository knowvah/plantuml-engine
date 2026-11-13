/**
 * `CommandSelectCrash` — `crash when parsing|finalizing|drawing`: sets the
 * diagram's crash type, and for `parsing` throws at once from `executeArg`
 * (which `ProtectedCommand` turns into an execution error).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CommandSelectCrash.java
 */
import { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../core/command/ParserPass.js';
import { UBrexSingleLineCommand2 } from '../../core/command/UBrexSingleLineCommand2.js';
import type { RegexResult } from '../../core/regex/RegexResult.js';
import type { LineLocation } from '../../core/tim/LineLocation.js';
import { UBrexConcat } from '../../core/ubrex/builder/UBrexConcat.js';
import { UBrexLeaf } from '../../core/ubrex/builder/UBrexLeaf.js';
import { UBrexNamed } from '../../core/ubrex/builder/UBrexNamed.js';
import { UBrexOr } from '../../core/ubrex/builder/UBrexOr.js';
import type { UnicodeBracketedExpression } from '../../core/ubrex/UnicodeBracketedExpression.js';
import type { CrashDiagram } from './CrashDiagram.js';
import { CrashType, valueOf } from './CrashType.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CommandSelectCrash.java:61 */
const TYPE = 'TYPE';

/** `new IllegalStateException(...)`, as `Throwable#toString` prints it.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CommandSelectCrash.java:85 */
export const PARSING_CRASH = 'java.lang.IllegalStateException: This is a normal crash when PARSING';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CommandSelectCrash.java:51 */
export class CommandSelectCrash extends UBrexSingleLineCommand2<CrashDiagram> {
  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CommandSelectCrash.java:53-55 */
  constructor() {
    super(CommandSelectCrash.getRegexConcat());
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CommandSelectCrash.java:57-65 */
  static getRegexConcat(): UnicodeBracketedExpression {
    return UBrexConcat.build(
      new UBrexLeaf('crash'),
      UBrexLeaf.spaceOneOrMore(),
      new UBrexLeaf('when'),
      UBrexLeaf.spaceOneOrMore(),
      new UBrexNamed(
        TYPE,
        new UBrexOr(new UBrexLeaf('parsing'), new UBrexLeaf('finalizing'), new UBrexLeaf('drawing')),
      ),
    );
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CommandSelectCrash.java:67-75 */
  protected override explainArg(_location: LineLocation | undefined, arg: RegexResult): string | undefined {
    return `Deliberately crashing PlantUML during the ${arg.get(TYPE, 0)} phase (internal test command)`;
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/crash/CommandSelectCrash.java:77-89 */
  protected override executeArg(
    diagram: CrashDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const typeString = arg.get(TYPE, 0)!;
    const type = valueOf(typeString.toUpperCase());

    diagram.setCrashType(type);

    if (type === CrashType.PARSING) throw new Error(PARSING_CRASH);

    return CommandExecutionResult.ok();
  }
}
