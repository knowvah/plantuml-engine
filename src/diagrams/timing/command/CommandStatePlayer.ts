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
import type { HColor } from '../../../core/style/Value.js';
import type { TimingDiagram } from '../TimingDiagram.js';

/** `ColorParser.simpleColor(ColorType.BACK)`. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandStatePlayer.java:103-105 */
function color(): ColorParser {
  return ColorParser.simpleColor(ColorType.BACK);
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandStatePlayer.java:82-101 */
function getRegexConcat(keyword: string): IRegex {
  return RegexConcat.build(
    `net.sourceforge.plantuml.timingdiagram.command.CommandStatePlayer${keyword}`,
    RegexLeaf.start(),
    new RegexOptional(new RegexConcat(new RegexLeaf(1, 'COMPACT', '(compact)'), RegexLeaf.spaceOneOrMore())),
    new RegexLeaf(keyword),
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
 * Declares a player whose states are labels: `[compact] robust ["Display" as] CODE [#color]`. Subclasses provide the
 * keyword and create the actual player. `mandatoryFirstTokensFast` is a dispatch shortcut this port does not have.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandStatePlayer.java:59-146
 */
export abstract class CommandStatePlayer extends SingleLineCommand2<TimingDiagram> {
  readonly #keyword: string;

  /** @see CommandStatePlayer.java:73-77 */
  protected constructor(keyword: string) {
    super(getRegexConcat(keyword));
    this.#keyword = keyword;
  }

  /** @see CommandStatePlayer.java:79-80 */
  protected abstract createPlayer(
    diagram: TimingDiagram,
    code: string,
    full: string,
    compact: boolean,
    stereotype: Stereotype | undefined,
    backColor: HColor | undefined,
  ): void;

  /** @see CommandStatePlayer.java:107-126 */
  protected override explainArg(_location: LineLocation | undefined, arg: RegexResult): string {
    const full = arg.get('FULL', 0);
    const stereotype = arg.getLazzy('STEREOTYPE', 0);
    const color = arg.getLazzy('COLOR', 0);

    let sb = 'Creating a ';
    if (arg.get('COMPACT', 0) !== undefined) sb += 'compact ';
    sb += `${this.#keyword} timing player '${arg.get('CODE', 0)!}'`;
    if (full !== undefined) sb += ` displayed as "${full}"`;
    if (stereotype !== undefined) sb += ` stereotyped ${stereotype}`;
    if (color !== undefined) sb += ` with background color ${color}`;
    return sb;
  }

  /** @see CommandStatePlayer.java:128-139 */
  protected override executeArg(
    diagram: TimingDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const full = arg.get('FULL', 0);
    const stereotype = arg.getLazzy('STEREOTYPE', 0);
    const backColor = color()
      .getColor(arg.getLazzy('COLOR', 0), diagram.getSkinParam().getIHtmlColorSet())
      .getColor(ColorType.BACK) as HColor | undefined;

    this.createPlayer(
      diagram,
      arg.get('CODE', 0)!,
      full ?? '',
      arg.get('COMPACT', 0) !== undefined,
      stereotype === undefined ? undefined : Stereotype.build(stereotype),
      backColor,
    );
    return CommandExecutionResult.ok();
  }
}
