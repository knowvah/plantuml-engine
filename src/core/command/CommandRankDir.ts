import type { ParserPass } from './ParserPass.js';
import { CommandExecutionResult } from './CommandExecutionResult.js';
import { SingleLineCommand2 } from './SingleLineCommand2.js';
import { Rankdir } from '../klimt/geom/Rankdir.js';
import type { IRegex } from '../regex/IRegex.js';
import { RegexConcat } from '../regex/RegexConcat.js';
import { RegexLeaf } from '../regex/RegexLeaf.js';
import type { RegexResult } from '../regex/RegexResult.js';
import type { LineLocation } from '../tim/LineLocation.js';
import type { RankdirTarget } from './UBrexCommandRankDir.js';

/**
 * `left to right direction` / `top to bottom direction`, the REGEX form (`UBrexCommandRankDir` is its
 * Unicode-bracketed sibling). `ChenEerDiagramFactory` registers this one (`ChenEerDiagramFactory.java:60`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/CommandRankDir.java:51-83
 */
export class CommandRankDir<S extends RankdirTarget = RankdirTarget> extends SingleLineCommand2<S> {
  /** @see CommandRankDir.java:53-55 */
  public constructor() {
    super(CommandRankDir.getRegexConcat());
  }

  /** @see CommandRankDir.java:57-64 */
  static getRegexConcat(): IRegex {
    return RegexConcat.build(
      'CommandRankDir',
      RegexLeaf.start(),
      new RegexLeaf(1, 'DIRECTION', '(left[%s]to[%s]right|top[%s]to[%s]bottom)'),
      RegexLeaf.spaceOneOrMore(),
      new RegexLeaf('direction'),
      RegexLeaf.end(),
    );
  }

  /** @see CommandRankDir.java:66-72 */
  protected override explainArg(_location: LineLocation | undefined, arg: RegexResult): string | undefined {
    return 'Setting the layout direction of the diagram to ' + (arg.get('DIRECTION', 0) as string).toLowerCase();
  }

  /**
   * `Rankdir.valueOf(s)` throws `IllegalArgumentException` on a name it does not know (a tab inside the match);
   * `replace(' ', '_')` replaces every space.
   * @see CommandRankDir.java:74-80
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
