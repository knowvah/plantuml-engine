import type { ParserPass } from './ParserPass.js';
import { CommandExecutionResult } from './CommandExecutionResult.js';
import { UBrexSingleLineCommand2 } from './UBrexSingleLineCommand2.js';
import { Rankdir } from '../klimt/geom/Rankdir.js';
import type { RegexResult } from '../regex/RegexResult.js';
import type { LineLocation } from '../tim/LineLocation.js';
import { UBrexConcat } from '../ubrex/builder/UBrexConcat.js';
import { UBrexLeaf } from '../ubrex/builder/UBrexLeaf.js';
import { UBrexNamed } from '../ubrex/builder/UBrexNamed.js';
import type { UnicodeBracketedExpression } from '../ubrex/UnicodeBracketedExpression.js';

/**
 * The slice of upstream's `TitledDiagram` this command writes through: its `SkinParam#setRankdir`
 * (the cast `(SkinParam) diagram.getSkinParam()` at java:75).
 */
export interface RankdirTarget {
  getSkinParam(): { setRankdir(rankdir: Rankdir): void };
}

/**
 * `left to right direction` / `top to bottom direction`: sets the skin param's rank direction.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/UBrexCommandRankDir.java:51-80
 */
export class UBrexCommandRankDir<S extends RankdirTarget = RankdirTarget> extends UBrexSingleLineCommand2<S> {
  /** @see UBrexCommandRankDir.java:53-55 */
  public constructor() {
    super(UBrexCommandRankDir.getRegexConcat());
  }

  /** @see UBrexCommandRankDir.java:57-63 */
  static getRegexConcat(): UnicodeBracketedExpression {
    return UBrexConcat.build(
      new UBrexNamed('DIRECTION', new UBrexLeaf('【 left∙to∙right ┇ top∙to∙bottom 】')),
      UBrexLeaf.spaceOneOrMore(),
      new UBrexLeaf('direction'),
      UBrexLeaf.end(),
    );
  }

  /** @see UBrexCommandRankDir.java:65-71 */
  protected override explainArg(_location: LineLocation | undefined, arg: RegexResult): string | undefined {
    return 'Setting the layout direction of the diagram to ' + (arg.get('DIRECTION', 0) as string).toLowerCase();
  }

  /**
   * `Rankdir.valueOf(s)` throws `IllegalArgumentException` on a name it does not know; `replace(' ', '_')`
   * replaces every space.
   * @see UBrexCommandRankDir.java:73-79
   */
  protected override executeArg(
    diagram: S,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const s = (arg.get('DIRECTION', 0) as string).toUpperCase().replaceAll(' ', '_');
    if (s !== Rankdir.LEFT_TO_RIGHT && s !== Rankdir.TOP_TO_BOTTOM)
      throw new Error('IllegalArgumentException: No enum constant Rankdir.' + s);
    diagram.getSkinParam().setRankdir(s);
    return CommandExecutionResult.ok();
  }
}
