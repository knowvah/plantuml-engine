/**
 * `CommandGoto`: `goto id`, connect to `id` and continue on a new line under it.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/CommandGoto.java
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
import { BpmEventGoto } from './BpmEventGoto.js';
/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/CommandGoto.java:54-60 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.bpm.CommandGoto',
    RegexLeaf.start(),
    new RegexLeaf('goto'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf(1, 'ID', '([%pLN_.@]+)'),
    RegexLeaf.end(),
  );
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/CommandGoto.java */
export class CommandGoto extends SingleLineCommand2<BpmDiagram> {
  constructor() {
    super(getRegexConcat());
  }

  /** `@Explain`: `null`. */
  protected override explainArg(_location: LineLocation | undefined, _arg: RegexResult): string | undefined {
    return undefined;
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/CommandGoto.java:68-72 */
  protected executeArg(
    diagram: BpmDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const event = new BpmEventGoto(arg.get('ID', 0)!);
    return diagram.addEvent(event);
  }
}
