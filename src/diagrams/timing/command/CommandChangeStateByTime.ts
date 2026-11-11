import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../../core/command/ParserPass.js';
import type { IRegex } from '../../../core/regex/IRegex.js';
import { RegexConcat } from '../../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../../core/regex/RegexLeaf.js';
import { RegexOptional } from '../../../core/regex/RegexOptional.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import type { LineLocation } from '../../../core/tim/LineLocation.js';
import type { TimeTick } from '../TimeTick.js';
import type { TimingDiagram } from '../TimingDiagram.js';
import { CommandChangeState } from './CommandChangeState.js';
import { TimeTickBuilder } from './TimeTickBuilder.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandChangeStateByTime.java:58-77 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.timingdiagram.command.CommandChangeStateByTime',
    RegexLeaf.start(),
    RegexLeaf.spaceZeroOrMore(),
    TimeTickBuilder.expressionAtWithoutArobase('TIME'),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf('is'),
    RegexLeaf.spaceZeroOrMore(),
    CommandChangeState.getStateOrHidden(),
    RegexLeaf.spaceZeroOrMore(),
    CommandChangeState.color().getRegex(),
    RegexLeaf.spaceZeroOrMore(),
    new RegexOptional(
      new RegexConcat(
        RegexLeaf.spaceZeroOrMore(),
        new RegexLeaf(':'),
        RegexLeaf.spaceZeroOrMore(),
        new RegexLeaf(1, 'COMMENT', '(.*?)'),
      ),
    ),
    RegexLeaf.spaceZeroOrMore(),
    RegexLeaf.end(),
  );
}

/**
 * `100 is Processing`, `+200 is Idle`: the last player, at the time the line names. `explainArg` (`@Explain`)
 * is not ported.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandChangeStateByTime.java:52-109
 */
export class CommandChangeStateByTime extends CommandChangeState {
  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandChangeStateByTime.java:54-56 */
  public constructor() {
    super(getRegexConcat());
  }

  /**
   * A `null` tick (an unknown code or clock) reaches `diagram.addTime(null, null)`, whose
   * ruler throws `NullPointerException` (D9: ProtectedCommand's page); the port's ruler throws a `TypeError`.
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandChangeStateByTime.java:100-109
   */
  protected override executeArg(
    diagram: TimingDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const player = diagram.getLastPlayer();
    if (player === undefined) return CommandExecutionResult.error('Missing @ line before this');

    const tick = TimeTickBuilder.parseTimeTick('TIME', arg, diagram);
    diagram.addTime(tick as TimeTick, undefined);
    return this.addState(diagram, arg, player, tick);
  }
}
