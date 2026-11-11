import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../../core/command/SingleLineCommand2.js';
import { LINE_STYLE } from '../../../core/link-style-regex.js';
import type { IRegex } from '../../../core/regex/IRegex.js';
import { RegexConcat } from '../../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../../core/regex/RegexLeaf.js';
import { RegexOptional } from '../../../core/regex/RegexOptional.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import type { LineLocation } from '../../../core/tim/LineLocation.js';
import type { TimingDiagram } from '../TimingDiagram.js';
import { PLAYER_CODE } from './player-code.js';
import { TimeTickBuilder } from './TimeTickBuilder.js';

/** `public static final String PLAYER_CODE`, kept in `player-code.ts` so its five siblings need not import this class.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandTimeMessage.java:56 */
export { PLAYER_CODE };

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandTimeMessage.java:62-83 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.timingdiagram.command.CommandTimeMessage',
    RegexLeaf.start(),
    new RegexLeaf(1, 'PART1', PLAYER_CODE),
    TimeTickBuilder.optionalExpressionAtWithArobase('TIME1'),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf(1, 'ARROW_BODY', '(-+)'),
    new RegexLeaf(1, 'ARROW_STYLE', `(?:\\[(${LINE_STYLE})\\])?`),
    new RegexLeaf(0, 'ARROW_HEAD', '\\>'),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf(1, 'PART2', PLAYER_CODE),
    TimeTickBuilder.optionalExpressionAtWithArobase('TIME2'),
    RegexLeaf.spaceZeroOrMore(),
    new RegexOptional(
      new RegexConcat(new RegexLeaf(':'), RegexLeaf.spaceZeroOrMore(), new RegexLeaf(1, 'MESSAGE', '(.*)')),
    ),
    RegexLeaf.spaceZeroOrMore(),
    RegexLeaf.end(),
  );
}

/**
 * `A@0 -> B@10 : label`. `explainArg` (`@Explain`) is not ported.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandTimeMessage.java:52-147
 */
export class CommandTimeMessage extends SingleLineCommand2<TimingDiagram> {
  /** @see CommandTimeMessage.java:58-60 */
  public constructor() {
    super(getRegexConcat());
  }

  /** @see CommandTimeMessage.java:118-135 */
  protected override executeArg(
    diagram: TimingDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const code1 = arg.get('PART1', 0)!;
    const player1 = diagram.getPlayer(code1);
    if (player1 === undefined) return CommandExecutionResult.error(`No such element: ${code1}`);
    const code2 = arg.get('PART2', 0)!;
    const player2 = diagram.getPlayer(code2);
    if (player2 === undefined) return CommandExecutionResult.error(`No such element: ${code2}`);

    const tick1 = TimeTickBuilder.parseTimeTick('TIME1', arg, diagram);
    const tick2 = TimeTickBuilder.parseTimeTick('TIME2', arg, diagram);
    // `createTimeMessage` takes a `TimeTick` that Java lets be `null` (the message then draws nothing, D7).
    const result = diagram.createTimeMessage(player1, tick1!, player2, tick2!, arg.get('MESSAGE', 0) ?? null);
    result.applyStyle(arg.getLazzy('ARROW_STYLE', 0));
    return CommandExecutionResult.ok();
  }
}
