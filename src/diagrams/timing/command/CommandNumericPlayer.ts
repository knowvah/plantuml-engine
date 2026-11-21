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
import type { AbstractNumericPlayer } from '../AbstractNumericPlayer.js';
import type { TimingDiagram } from '../TimingDiagram.js';

/** `(-?[0-9]*\.?[0-9]+)`: START and END. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandNumericPlayer.java:153,157 */
const BOUND = String.raw`(-?[0-9]*\.?[0-9]+)`;

/** `between 0 and 3` / `from 0 to 3`. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandNumericPlayer.java:149-158 */
function bounds(index: number): IRegex {
  return new RegexConcat(
    new RegexOr(new RegexLeaf('between'), new RegexLeaf('from')),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf(1, `START${String(index)}`, BOUND),
    RegexLeaf.spaceOneOrMore(),
    new RegexOr(new RegexLeaf('and'), new RegexLeaf('to')),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf(1, `END${String(index)}`, BOUND),
  );
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandNumericPlayer.java:142-147 */
function optionalBounds(index: number): IRegex {
  return new RegexOptional(new RegexConcat(RegexLeaf.spaceOneOrMore(), bounds(index)));
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandNumericPlayer.java:138-140 */
function code(name: string): IRegex {
  return new RegexLeaf(1, name, '([%pLN_.@]+)');
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandNumericPlayer.java:131-136 */
function asCode(name: string): IRegex {
  return new RegexConcat(new RegexLeaf('as'), RegexLeaf.spaceOneOrMore(), code(name));
}

/** `... as CODE [between 0 and 3]`. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandNumericPlayer.java:104-111 */
function asCodeThenBounds(): IRegex {
  return new RegexConcat(
    asCode('CODE1'),
    StereotypePattern.optional('STEREOTYPE2'),
    optionalBounds(1),
    StereotypePattern.optional('STEREOTYPE3'),
  );
}

/** `... between 0 and 3 as CODE`. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandNumericPlayer.java:113-120 */
function boundsThenAsCode(): IRegex {
  return new RegexConcat(
    bounds(2),
    RegexLeaf.spaceOneOrMore(),
    asCode('CODE2'),
    StereotypePattern.optional('STEREOTYPE4'),
  );
}

/** `"Display" ...`. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandNumericPlayer.java:95-102 */
function quotedDisplay(): IRegex {
  return new RegexConcat(
    new RegexLeaf(1, 'FULL', '[%g]([^%g]+)[%g]'),
    StereotypePattern.optional('STEREOTYPE1'),
    RegexLeaf.spaceOneOrMore(),
    new RegexOr(asCodeThenBounds(), boundsThenAsCode()),
  );
}

/** `CODE [between 0 and 3]`. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandNumericPlayer.java:122-129 */
function codeOnly(): IRegex {
  return new RegexConcat(
    code('CODE3'),
    StereotypePattern.optional('STEREOTYPE5'),
    optionalBounds(3),
    StereotypePattern.optional('STEREOTYPE6'),
  );
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandNumericPlayer.java:83-93 */
function getRegexConcat(keyword: string): IRegex {
  return RegexConcat.build(
    `net.sourceforge.plantuml.timingdiagram.command.CommandNumericPlayer${keyword}`,
    RegexLeaf.start(),
    new RegexOptional(new RegexConcat(new RegexLeaf(1, 'COMPACT', '(compact)'), RegexLeaf.spaceOneOrMore())),
    new RegexLeaf(keyword),
    RegexLeaf.spaceOneOrMore(),
    new RegexOr(quotedDisplay(), codeOnly()),
    RegexLeaf.end(),
  );
}

/**
 * Declares a player whose states are numbers, in three forms, each optionally `compact` and stereotyped:
 * `analog "Display" as CODE [between 0 and 3]`, `analog "Display" between 0 and 3 as CODE`, `analog CODE [between 0
 * and 3]`. Subclasses provide the keyword and create the actual player. `mandatoryFirstTokensFast` is a dispatch
 * shortcut this port does not have.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandNumericPlayer.java:57-207
 */
export abstract class CommandNumericPlayer extends SingleLineCommand2<TimingDiagram> {
  readonly #keyword: string;

  /** @see CommandNumericPlayer.java:74-78 */
  protected constructor(keyword: string) {
    super(getRegexConcat(keyword));
    this.#keyword = keyword;
  }

  /** @see CommandNumericPlayer.java:80-81 */
  protected abstract createPlayer(
    diagram: TimingDiagram,
    code: string,
    full: string,
    compact: boolean,
    stereotype: Stereotype | undefined,
  ): AbstractNumericPlayer;

  /** @see CommandNumericPlayer.java:160-182 */
  protected override explainArg(_location: LineLocation | undefined, arg: RegexResult): string {
    const full = arg.get('FULL', 0);
    const stereotype = arg.getLazzy('STEREOTYPE', 0);
    const start = arg.getLazzy('START', 0);
    const end = arg.getLazzy('END', 0);

    let sb = arg.get('COMPACT', 0) !== undefined ? 'Creating a compact ' : 'Creating an ';
    sb += `${this.#keyword} timing player '${arg.getLazzy('CODE', 0)!}'`;
    if (full !== undefined) sb += ` displayed as "${full}"`;
    if (stereotype !== undefined) sb += ` stereotyped ${stereotype}`;
    // Bounds are only applied when both START and END are present
    if (start !== undefined && end !== undefined) sb += ` with bounds from ${start} to ${end}`;
    return sb;
  }

  /** @see CommandNumericPlayer.java:184-200 */
  protected override executeArg(
    diagram: TimingDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const code = arg.getLazzy('CODE', 0)!;
    const full = arg.get('FULL', 0);
    const stereotype = arg.getLazzy('STEREOTYPE', 0);

    const player = this.createPlayer(
      diagram,
      code,
      full ?? '',
      arg.get('COMPACT', 0) !== undefined,
      stereotype === undefined ? undefined : Stereotype.build(stereotype),
    );

    const start = arg.getLazzy('START', 0);
    const end = arg.getLazzy('END', 0);
    if (start !== undefined && end !== undefined) player.setBounds(start, end);

    return CommandExecutionResult.ok();
  }
}
