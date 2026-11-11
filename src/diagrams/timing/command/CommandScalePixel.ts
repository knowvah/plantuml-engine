import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../../core/command/SingleLineCommand2.js';
import type { IRegex } from '../../../core/regex/IRegex.js';
import { RegexConcat } from '../../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../../core/regex/RegexLeaf.js';
import { RegexOptional } from '../../../core/regex/RegexOptional.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import type { LineLocation } from '../../../core/tim/LineLocation.js';
import type { TimingDiagram } from '../TimingDiagram.js';

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 3600 * 24;
/** `3600L * 8766L; // 24 * 365.25 = 8766`. @see CommandScalePixel.java:140 */
const SECONDS_PER_YEAR = 3600 * 8766;

/** `Long.parseLong` on `\d+`: past `long` is a `NumberFormatException`, which `ProtectedCommand` reports. */
function parseLong(text: string): bigint {
  const value = BigInt(text);
  if (value > 9_223_372_036_854_775_807n) {
    throw new Error(`java.lang.NumberFormatException: For input string: "${text}"`);
  }
  return value;
}

/** `Long` multiplication wraps at 64 bits. */
function wrapLong(n: bigint): bigint {
  return BigInt.asIntN(64, n);
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandScalePixel.java:130-150 */
function getUnitFactor(unit: string | undefined): number {
  switch (unit) {
    case undefined:
    case 's':
      return 1;
    case 'm':
      return SECONDS_PER_MINUTE;
    case 'h':
      return SECONDS_PER_HOUR;
    case 'D':
    case 'd':
      return SECONDS_PER_DAY;
    case 'Y':
    case 'y':
      return SECONDS_PER_YEAR;
    default:
      return 1;
  }
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandScalePixel.java:58-77 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.timingdiagram.command.CommandScalePixel',
    RegexLeaf.start(),
    new RegexLeaf('scale'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf(1, 'TICK', '(\\d+)'),
    new RegexOptional(
      new RegexConcat(new RegexOptional(RegexLeaf.spaceOne()), new RegexLeaf(1, 'UNIT', '([smhdDyY])')),
    ),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf('as'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf(1, 'PIXEL', '(\\d+)'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf('pixels?'),
    RegexLeaf.spaceZeroOrMore(),
    RegexLeaf.end(),
  );
}

/**
 * `scale 50 as 100 pixels`, `scale 1h as 30 pixels`. `explainArg` (`@Explain`) is not ported.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandScalePixel.java:54-151
 */
export class CommandScalePixel extends SingleLineCommand2<TimingDiagram> {
  /** @see CommandScalePixel.java:56-58 */
  public constructor() {
    super(getRegexConcat());
  }

  /** `tick` and `pixel` are `long`; `scaleInPixels(long, long)` is a `number` here. @see CommandScalePixel.java:117-128 */
  protected override executeArg(
    diagram: TimingDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const tick = wrapLong(parseLong(arg.get('TICK', 0)!) * BigInt(getUnitFactor(arg.get('UNIT', 0))));
    const pixel = parseLong(arg.get('PIXEL', 0)!);
    if (tick <= 0n || pixel <= 0n) return CommandExecutionResult.error('Bad value');

    diagram.scaleInPixels(Number(tick), Number(pixel));
    return CommandExecutionResult.ok();
  }
}
