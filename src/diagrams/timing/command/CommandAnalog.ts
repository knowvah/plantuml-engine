import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../../core/command/SingleLineCommand2.js';
import type { IRegex } from '../../../core/regex/IRegex.js';
import { RegexConcat } from '../../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../../core/regex/RegexLeaf.js';
import { RegexOptional } from '../../../core/regex/RegexOptional.js';
import { RegexOr } from '../../../core/regex/RegexOr.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import { Stereotype } from '../../../core/stereo/Stereotype.js';
import * as StereotypePattern from '../../../core/stereo/StereotypePattern.js';
import type { LineLocation } from '../../../core/tim/LineLocation.js';
import type { TimingDiagram } from '../TimingDiagram.js';

/** `(-?[0-9]*\.?[0-9]+)`: START and END. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandAnalog.java:74,78 */
const BOUND = String.raw`(-?[0-9]*\.?[0-9]+)`;

/** `between S and E ` / `from S to E `. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandAnalog.java:68-82 */
function bounds(): IRegex {
  return new RegexOptional(
    new RegexConcat(
      new RegexOr(new RegexLeaf('between'), new RegexLeaf('from')),
      RegexLeaf.spaceOneOrMore(),
      new RegexLeaf(1, 'START', BOUND),
      RegexLeaf.spaceOneOrMore(),
      new RegexOr(new RegexLeaf('and'), new RegexLeaf('to')),
      RegexLeaf.spaceOneOrMore(),
      new RegexLeaf(1, 'END', BOUND),
      RegexLeaf.spaceOneOrMore(),
    ),
  );
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandAnalog.java:60-85 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.timingdiagram.command.CommandAnalog',
    RegexLeaf.start(),
    new RegexOptional(new RegexConcat(new RegexLeaf(1, 'COMPACT', '(compact)'), RegexLeaf.spaceOneOrMore())),
    new RegexLeaf('analog'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf(1, 'FULL', '[%g]([^%g]+)[%g]'),
    StereotypePattern.optional('STEREOTYPE'),
    bounds(),
    new RegexLeaf('as'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf(1, 'CODE', '([%pLN_.@]+)'),
    StereotypePattern.optional('STEREOTYPE2'),
    RegexLeaf.end(),
  );
}

/**
 * `analog "Vcc" between -4.5 and 6.5 as VCC`. `explainArg` (`@Explain`) is not ported.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandAnalog.java:54-136
 */
export class CommandAnalog extends SingleLineCommand2<TimingDiagram> {
  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandAnalog.java:56-58 */
  public constructor() {
    super(getRegexConcat());
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandAnalog.java:117-136 */
  protected override executeArg(
    diagram: TimingDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const compact = arg.get('COMPACT', 0);
    const code = arg.get('CODE', 0)!;
    const full = arg.get('FULL', 0)!;
    let stereotype: Stereotype | undefined = undefined;
    if (arg.get('STEREOTYPE', 0) !== undefined) stereotype = Stereotype.build(arg.get('STEREOTYPE', 0));
    else if (arg.get('STEREOTYPE2', 0) !== undefined) stereotype = Stereotype.build(arg.get('STEREOTYPE2', 0));
    const player = diagram.createPlayerAnalog(code, full, compact !== undefined, stereotype);
    const start = arg.get('START', 0);
    const end = arg.get('END', 0);
    if (start !== undefined && end !== undefined) player.setBounds(start, end);
    return CommandExecutionResult.ok();
  }
}
