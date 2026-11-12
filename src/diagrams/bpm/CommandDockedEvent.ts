/**
 * `CommandDockedEvent`: `:label;`, a docked event box in a new column.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/CommandDockedEvent.java
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
/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/CommandDockedEvent.java:54-60 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.bpm.CommandDockedEvent',
    RegexLeaf.start(),
    new RegexLeaf(':'),
    new RegexLeaf(1, 'LABEL', '(.*)'),
    new RegexLeaf(0, 'STYLE', ';'),
    RegexLeaf.end(),
  );
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/CommandDockedEvent.java */
export class CommandDockedEvent extends SingleLineCommand2<BpmDiagram> {
  constructor() {
    super(getRegexConcat());
  }

  /** `@Explain`: `null`. */
  protected override explainArg(_location: LineLocation | undefined, _arg: RegexResult): string | undefined {
    return undefined;
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/CommandDockedEvent.java:68-75 */
  protected executeArg(
    diagram: BpmDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const label = arg.get('LABEL', 0)!;
    const element = new BpmElement(null, BpmElementType.DOCKED_EVENT, label);
    const event = new BpmEventAdd(element);
    return diagram.addEvent(event);
  }
}
