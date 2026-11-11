import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../../core/command/SingleLineCommand2.js';
import type { IRegex } from '../../../core/regex/IRegex.js';
import { RegexConcat } from '../../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../../core/regex/RegexLeaf.js';
import { RegexOptional } from '../../../core/regex/RegexOptional.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import { Stereotype } from '../../../core/stereo/Stereotype.js';
import * as StereotypePattern from '../../../core/stereo/StereotypePattern.js';
import type { LineLocation } from '../../../core/tim/LineLocation.js';
import type { TimingDiagram } from '../TimingDiagram.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandBinary.java:58-75 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.timingdiagram.command.CommandBinary',
    RegexLeaf.start(),
    new RegexOptional(new RegexConcat(new RegexLeaf(1, 'COMPACT', '(compact)'), RegexLeaf.spaceOneOrMore())),
    new RegexLeaf('binary'),
    RegexLeaf.spaceOneOrMore(),
    new RegexOptional(
      new RegexConcat(
        new RegexLeaf(1, 'FULL', '[%g]([^%g]+)[%g]'),
        StereotypePattern.optional('STEREOTYPE'),
        new RegexLeaf('as'),
        RegexLeaf.spaceOneOrMore(),
      ),
    ),
    new RegexLeaf(1, 'CODE', '([%pLN_.@]+)'),
    StereotypePattern.optional('STEREOTYPE2'),
    RegexLeaf.end(),
  );
}

/**
 * `binary "Enable" as EN`, `compact binary EN`. `explainArg` (`@Explain`) is not ported.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandBinary.java:52-118
 */
export class CommandBinary extends SingleLineCommand2<TimingDiagram> {
  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandBinary.java:54-56 */
  public constructor() {
    super(getRegexConcat());
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandBinary.java:102-118 */
  protected override executeArg(
    diagram: TimingDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const compact = arg.get('COMPACT', 0);
    const code = arg.get('CODE', 0)!;
    const full = arg.get('FULL', 0) ?? '';
    let stereotype: Stereotype | undefined = undefined;
    if (arg.get('STEREOTYPE', 0) !== undefined) stereotype = Stereotype.build(arg.get('STEREOTYPE', 0));
    else if (arg.get('STEREOTYPE2', 0) !== undefined) stereotype = Stereotype.build(arg.get('STEREOTYPE2', 0));
    diagram.createPlayerBinary(code, full, compact !== undefined, stereotype);
    return CommandExecutionResult.ok();
  }
}
