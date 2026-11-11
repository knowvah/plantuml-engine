import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../../core/command/SingleLineCommand2.js';
import { HColorSet } from '../../../core/klimt/color/HColorSet.js';
import { LINE_STYLE } from '../../../core/link-style-regex.js';
import type { IRegex } from '../../../core/regex/IRegex.js';
import { RegexConcat } from '../../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../../core/regex/RegexLeaf.js';
import { RegexOptional } from '../../../core/regex/RegexOptional.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import type { LineLocation } from '../../../core/tim/LineLocation.js';
import type { ArrowConfiguration } from '../../sequence/sequence-arrowhead.js';
import type { TimingDiagram } from '../TimingDiagram.js';
import { PLAYER_CODE } from './player-code.js';
import { TimeTickBuilder } from './TimeTickBuilder.js';

/** `CommandArrow.getColorOrStylePattern()`, copied (D2). @see sequencediagram/command/CommandArrow.java:84-86 */
const COLOR_OR_STYLE_PATTERN = `(?:\\[(${LINE_STYLE})\\])?`;

/** `ArrowConfiguration.withDirectionBoth()`: both dressings a NORMAL head. @see skin/ArrowConfiguration.java:96-105 */
const DIRECTION_BOTH: ArrowConfiguration = {
  dressing1: { head: 'NORMAL', part: 'FULL' },
  dressing2: { head: 'NORMAL', part: 'FULL' },
  decoration1: 'NONE',
  decoration2: 'NONE',
  dashed: false,
};

/**
 * `CommandArrow.applyStyle`: `dashed`/`dotted` dot the body, `bold` is an empty branch upstream, `hidden` hides
 * it, any other token is a colour that `HColorSet#getColor` throws `NoSuchColorException` on (the base class turns
 * that into `badColor()`). `StringTokenizer` drops empty tokens.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/sequencediagram/command/CommandArrow.java:482-502
 */
function applyStyle(arrowStyle: string | undefined, configIn: ArrowConfiguration): ArrowConfiguration {
  if (arrowStyle === undefined) return configIn;
  let config = configIn;
  for (const s of arrowStyle.split(',').filter((t) => t.length > 0)) {
    const lower = s.toLowerCase();
    if (lower === 'dashed' || lower === 'dotted') config = { ...config, dashed: true };
    else if (lower === 'bold') continue;
    else if (lower === 'hidden') config = { ...config, hidden: true };
    else config = { ...config, color: HColorSet.instance().getColor(s) };
  }
  return config;
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandConstraint.java:58-80 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.timingdiagram.command.CommandConstraint',
    RegexLeaf.start(),
    new RegexLeaf(2, 'PART1', `(${PLAYER_CODE})?`),
    TimeTickBuilder.expressionAtWithArobase('TIME1'),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf('\\<'),
    new RegexLeaf(1, '(-+)'),
    new RegexLeaf(1, 'ARROW_STYLE1', COLOR_OR_STYLE_PATTERN),
    new RegexLeaf(1, '(-*)'),
    new RegexLeaf('\\>'),
    RegexLeaf.spaceZeroOrMore(),
    TimeTickBuilder.expressionAtWithArobase('TIME2'),
    RegexLeaf.spaceZeroOrMore(),
    new RegexOptional(
      new RegexConcat(new RegexLeaf(':'), RegexLeaf.spaceZeroOrMore(), new RegexLeaf(1, 'MESSAGE', '(.*)')),
    ),
    RegexLeaf.spaceZeroOrMore(),
    RegexLeaf.end(),
  );
}

/**
 * `@200 <-> @350 : label`: a time constraint on a player. `explainArg` (`@Explain`) is not ported. The style is
 * read as `ARROW_STYLE`, which `getLazzy`'s prefix match finds in `ARROW_STYLE1`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandConstraint.java:54-145
 */
export class CommandConstraint extends SingleLineCommand2<TimingDiagram> {
  /** @see CommandConstraint.java:56-58 */
  public constructor() {
    super(getRegexConcat());
  }

  /** @see CommandConstraint.java:99-144 */
  protected override executeArg(
    diagram: TimingDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const part1 = arg.get('PART1', 0);
    let player1;
    if (part1 === undefined) {
      player1 = diagram.getLastPlayer();
      if (player1 === undefined) return CommandExecutionResult.error('You have to provide a participant');
    } else {
      player1 = diagram.getPlayer(part1);
      if (player1 === undefined) return CommandExecutionResult.error(`No such participant ${part1}`);
    }
    const tick1 = TimeTickBuilder.parseTimeTick('TIME1', arg, diagram);
    if (tick1 === undefined) return CommandExecutionResult.error('Unknown time label');

    const restore = diagram.getNow();
    diagram.updateNow(tick1);
    const tick2 = TimeTickBuilder.parseTimeTick('TIME2', arg, diagram);
    diagram.updateNow(restore);
    if (tick2 === undefined) return CommandExecutionResult.error('Unknown time label');

    const config = applyStyle(arg.getLazzy('ARROW_STYLE', 0), DIRECTION_BOTH);

    player1.createConstraint(tick1, tick2, arg.get('MESSAGE', 0) ?? null, config);
    return CommandExecutionResult.ok();
  }
}
