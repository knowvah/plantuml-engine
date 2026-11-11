/**
 * `CommandMerge`: `id:<+>`, a merge diamond in a new column; the regex allows no space before `<+>`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/CommandMerge.java
 */
import type { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../core/command/SingleLineCommand2.js';
import type { IRegex } from '../../core/regex/IRegex.js';
import { RegexConcat } from '../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../core/regex/RegexLeaf.js';
import type { RegexResult } from '../../core/regex/RegexResult.js';
import type { LineLocation } from '../../core/tim/LineLocation.js';
import type { BpmDiagram } from './BpmDiagram.js';
import { BpmElement } from './BpmElement.js';
import { BpmElementType } from './BpmElementType.js';
import { BpmEventAdd } from './BpmEventAdd.js';
/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/CommandMerge.java:54-60 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.bpm.CommandMerge',
    RegexLeaf.start(),
    new RegexLeaf(1, 'ID', '([%pLN_.@]+)'),
    new RegexLeaf(':?'),
    new RegexLeaf('\\<\\+\\>'),
    RegexLeaf.end(),
  );
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/CommandMerge.java */
export class CommandMerge extends SingleLineCommand2<BpmDiagram> {
  constructor() {
    super(getRegexConcat());
  }

  /** `@Explain`: `null`. */
  protected override explainArg(_location: LineLocation | undefined, _arg: RegexResult): string | undefined {
    return undefined;
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/CommandMerge.java:68-72 */
  protected executeArg(
    diagram: BpmDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const event = new BpmEventAdd(new BpmElement(arg.get('ID', 0)!, BpmElementType.MERGE, null));
    return diagram.addEvent(event);
  }
}
