/**
 * `CommandEndGroup`: the `}` that closes an entity, relationship or attribute body. It pops the owner pushed by
 * `CommandCreateEntity`/`CommandCreateAttribute`; a `}` with nothing open is "Unbalanced brackets".
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/cheneer/command/CommandEndGroup.java:49-76
 */
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../../core/command/SingleLineCommand2.js';
import type { IRegex } from '../../../core/regex/IRegex.js';
import { RegexConcat } from '../../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../../core/regex/RegexLeaf.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import type { LineLocation } from '../../../core/tim/LineLocation.js';
import type { ChenEerDiagram } from '../ChenEerDiagram.js';

/** The error `executeArg` answers for a `}` with no open owner. @see CommandEndGroup.java:71 */
export const UNBALANCED_BRACKETS = 'Unbalanced brackets';

/** @see CommandEndGroup.java:49 */
export class CommandEndGroup extends SingleLineCommand2<ChenEerDiagram> {
  /** @see CommandEndGroup.java:51-53 */
  public constructor() {
    super(CommandEndGroup.getRegexConcat());
  }

  /** @see CommandEndGroup.java:55-60 */
  protected static getRegexConcat(): IRegex {
    return RegexConcat.build('CommandEndGroup', RegexLeaf.start(), new RegexLeaf('\\}'), RegexLeaf.end());
  }

  /** @see CommandEndGroup.java:62-65 */
  protected override explainArg(_location: LineLocation | undefined, _arg: RegexResult): string | undefined {
    return undefined;
  }

  /** @see CommandEndGroup.java:68-75 */
  protected override executeArg(
    diagram: ChenEerDiagram,
    _location: LineLocation | undefined,
    _arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    if (!diagram.popOwner()) return CommandExecutionResult.error(UNBALANCED_BRACKETS);
    return CommandExecutionResult.ok();
  }
}
