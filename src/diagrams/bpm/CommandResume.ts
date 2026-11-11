/**
 * `CommandResume`: `resume id`, continue on a new line under `id`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/CommandResume.java
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
import { BpmEventResume } from './BpmEventResume.js';
/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/CommandResume.java:54-60 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.bpm.CommandResume',
    RegexLeaf.start(),
    new RegexLeaf('resume'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf(1, 'ID', '([%pLN_.@]+)'),
    RegexLeaf.end(),
  );
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/CommandResume.java */
export class CommandResume extends SingleLineCommand2<BpmDiagram> {
  constructor() {
    super(getRegexConcat());
  }

  /** `@Explain`: `null`. */
  protected override explainArg(_location: LineLocation | undefined, _arg: RegexResult): string | undefined {
    return undefined;
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/CommandResume.java:68-72 */
  protected executeArg(
    diagram: BpmDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const event = new BpmEventResume(arg.get('ID', 0)!);
    return diagram.addEvent(event);
  }
}
