import { ColorType } from '../../../core/abel/ColorType.js';
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../../core/command/SingleLineCommand2.js';
import { ColorParser } from '../../../core/klimt/color/ColorParser.js';
import type { IRegex } from '../../../core/regex/IRegex.js';
import { RegexConcat } from '../../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../../core/regex/RegexLeaf.js';
import { RegexOptional } from '../../../core/regex/RegexOptional.js';
import { RegexOr } from '../../../core/regex/RegexOr.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import { Stereotype } from '../../../core/stereo/Stereotype.js';
import * as StereotypePattern from '../../../core/stereo/StereotypePattern.js';
import type { LineLocation } from '../../../core/tim/LineLocation.js';
import { TimingStyle } from '../TimingStyle.js';
import type { TimingDiagram } from '../TimingDiagram.js';

/** `ColorParser.simpleColor(ColorType.BACK)`. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandRobustConcise.java:85-87 */
function color(): ColorParser {
  return ColorParser.simpleColor(ColorType.BACK);
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandRobustConcise.java:64-83 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.timingdiagram.command.CommandRobustConcise',
    RegexLeaf.start(),
    new RegexOptional(new RegexConcat(new RegexLeaf(1, 'COMPACT', '(compact)'), RegexLeaf.spaceOneOrMore())),
    new RegexLeaf(1, 'TYPE', '(robust|concise|rectangle)'),
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
    RegexLeaf.spaceZeroOrMore(),
    new RegexOr(color().getRegex()),
    RegexLeaf.end(),
  );
}

/**
 * `robust "Web Browser" as WB`, `compact concise WU #pink`, `rectangle R`. `explainArg` (`@Explain`) is not ported.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandRobustConcise.java:58-148
 */
export class CommandRobustConcise extends SingleLineCommand2<TimingDiagram> {
  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandRobustConcise.java:60-62 */
  public constructor() {
    super(getRegexConcat());
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandRobustConcise.java:117-148 */
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
    const type = arg.get('TYPE', 0)!.toUpperCase() as TimingStyle;
    const colors = color().getColor(arg.getLazzy('COLOR', 0), diagram.getSkinParam().getIHtmlColorSet());
    const back = colors.getColor(ColorType.BACK) as Parameters<TimingDiagram['createPlayerRobust']>[4];
    switch (type) {
      case TimingStyle.ROBUST:
        diagram.createPlayerRobust(code, full, compact !== undefined, stereotype, back);
        break;
      case TimingStyle.CONCISE:
        diagram.createPlayerConcise(code, full, compact !== undefined, stereotype, back);
        break;
      case TimingStyle.RECTANGLE:
        diagram.createPlayerRectangle(code, full, compact !== undefined, stereotype, back);
        break;
      default:
        // Unreachable: the TYPE leaf only matches the three styles, and `valueOf` would throw first (java:147).
        return CommandExecutionResult.error(`Unknown timing style: ${String(type)}`);
    }
    return CommandExecutionResult.ok();
  }
}
