import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../../core/command/SingleLineCommand2.js';
import { BigDecimal } from '../../../core/decimal/BigDecimal.js';
import type { IRegex } from '../../../core/regex/IRegex.js';
import { RegexConcat } from '../../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../../core/regex/RegexLeaf.js';
import { RegexOptional } from '../../../core/regex/RegexOptional.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import { Stereotype } from '../../../core/stereo/Stereotype.js';
import * as StereotypePattern from '../../../core/stereo/StereotypePattern.js';
import type { LineLocation } from '../../../core/tim/LineLocation.js';
import type { TimingDiagram } from '../TimingDiagram.js';

/** `([0-9]+(?:\.[0-9]+)?)`: the PERIOD, PULSE and OFFSET number. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandClock.java:79,84,90 */
const DECIMAL_NUMBER = String.raw`([0-9]+(?:\.[0-9]+)?)`;

/** `\s+pulse\s+N` and `\s+offset\s+N`: one optional keyword and number. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandClock.java:80-91 */
function optionalKeywordNumber(keyword: string, name: string): RegexOptional {
  return new RegexOptional(
    new RegexConcat(
      RegexLeaf.spaceOneOrMore(),
      new RegexLeaf(keyword),
      RegexLeaf.spaceOneOrMore(),
      new RegexLeaf(1, name, DECIMAL_NUMBER),
    ),
  );
}

/** `"full" as `. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandClock.java:68-73 */
function optionalFull(): RegexOptional {
  return new RegexOptional(
    new RegexConcat(
      new RegexLeaf(1, 'FULL', '[%g]([^%g]+)[%g]'),
      RegexLeaf.spaceOneOrMore(),
      new RegexLeaf('as'),
      RegexLeaf.spaceOneOrMore(),
    ),
  );
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandClock.java:60-96 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.timingdiagram.command.CommandClock',
    RegexLeaf.start(),
    new RegexOptional(new RegexConcat(new RegexLeaf(1, 'COMPACT', '(compact)'), RegexLeaf.spaceOneOrMore())),
    new RegexLeaf(0, 'TYPE', 'clock'),
    RegexLeaf.spaceOneOrMore(),
    optionalFull(),
    new RegexLeaf(1, 'CODE', '([%pLN_.@]+)'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf('with'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf('period'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf(1, 'PERIOD', DECIMAL_NUMBER),
    optionalKeywordNumber('pulse', 'PULSE'),
    optionalKeywordNumber('offset', 'OFFSET'),
    RegexLeaf.spaceZeroOrMore(),
    StereotypePattern.optional('STEREO'),
    RegexLeaf.spaceZeroOrMore(),
    RegexLeaf.end(),
  );
}

/**
 * `clock "clk" as C with period 50 pulse 15 offset 5`. `explainArg` (`@Explain`) is not ported.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandClock.java:54-151
 */
export class CommandClock extends SingleLineCommand2<TimingDiagram> {
  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandClock.java:56-58 */
  public constructor() {
    super(getRegexConcat());
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandClock.java:129-145 */
  protected override executeArg(
    diagram: TimingDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const compact = arg.get('COMPACT', 0);
    const code = arg.get('CODE', 0)!;
    const period = new BigDecimal(arg.get('PERIOD', 0)!);
    const pulse = this.getBigDecimal(arg.get('PULSE', 0));
    const offset = this.getBigDecimal(arg.get('OFFSET', 0));
    const full = arg.get('FULL', 0) ?? '';
    const stereotype = Stereotype.build(arg.get('STEREO', 0));
    diagram.createPlayerClock({ code, full, period, pulse, offset, compact: compact !== undefined, stereotype });
    return CommandExecutionResult.ok();
  }

  /** `ZERO` when absent. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandClock.java:147-151 */
  private getBigDecimal(value: string | undefined): BigDecimal {
    if (value === undefined) return BigDecimal.ZERO;
    return new BigDecimal(value);
  }
}
