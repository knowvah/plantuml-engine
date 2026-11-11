import { ColorType } from '../../../core/abel/ColorType.js';
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import { SingleLineCommand2 } from '../../../core/command/SingleLineCommand2.js';
import { ColorParser } from '../../../core/klimt/color/ColorParser.js';
import type { IRegex } from '../../../core/regex/IRegex.js';
import { RegexLeaf } from '../../../core/regex/RegexLeaf.js';
import { RegexOr } from '../../../core/regex/RegexOr.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import type { Player } from '../Player.js';
import type { TimeTick } from '../TimeTick.js';
import type { TimingDiagram } from '../TimingDiagram.js';

/**
 * The base of the two `X is state` commands: the seven-way state grammar and what a state change does.
 * `describeState` (`@Explain`, used only by `explainArg`) is not ported.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandChangeState.java:53-111
 */
export abstract class CommandChangeState extends SingleLineCommand2<TimingDiagram> {
  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandChangeState.java:55-57 */
  protected constructor(pattern: IRegex) {
    super(pattern);
  }

  /** `([-%pLN_][-%pLN_.]*)`. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandChangeState.java:59 */
  public static readonly STATE_CODE = '([-%pLN_][-%pLN_.]*)';

  /** `ColorParser.simpleColor(ColorType.BACK)`. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandChangeState.java:61-63 */
  public static color(): ColorParser {
    return ColorParser.simpleColor(ColorType.BACK);
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandChangeState.java:65-71 */
  protected addState(
    diagram: TimingDiagram,
    arg: RegexResult,
    player: Player,
    now: TimeTick | undefined,
  ): CommandExecutionResult {
    const comment = arg.get('COMMENT', 0);
    const colors = CommandChangeState.color().getColor(
      arg.getLazzy('COLOR', 0),
      diagram.getSkinParam().getIHtmlColorSet(),
    );
    player.setState(now, comment, colors, ...this.getStates(arg));
    return CommandExecutionResult.ok();
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandChangeState.java:73-80 */
  private getStates(arg: RegexResult): string[] {
    if (arg.get('STATE7', 0) !== undefined) {
      const state1 = arg.get('STATE7', 0)!;
      const state2 = arg.get('STATE7', 1)!;
      return [state1, state2];
    }
    return [arg.getLazzy('STATE', 0)!];
  }

  /** The seven alternatives, in this order. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandChangeState.java:100-110 */
  public static getStateOrHidden(): IRegex {
    return new RegexOr(
      new RegexLeaf(1, 'STATE1', '[%g]([^%g]*)[%g]'),
      new RegexLeaf(1, 'STATE2', CommandChangeState.STATE_CODE),
      new RegexLeaf(1, 'STATE3', String.raw`(\{hidden\})`),
      new RegexLeaf(1, 'STATE4', String.raw`(\{\.\.\.\})`),
      new RegexLeaf(1, 'STATE5', String.raw`(\{-\})`),
      new RegexLeaf(1, 'STATE6', String.raw`(\{\?\})`),
      new RegexLeaf(
        2,
        'STATE7',
        String.raw`(?:\{` + CommandChangeState.STATE_CODE + ',' + CommandChangeState.STATE_CODE + String.raw`\})`,
      ),
    );
  }
}
