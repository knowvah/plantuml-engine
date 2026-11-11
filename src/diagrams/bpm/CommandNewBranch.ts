/**
 * `CommandNewBranch`: `new branch`, open a branch at an entry merge.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/CommandNewBranch.java
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

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/CommandNewBranch.java:54-61 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.bpm.CommandNewBranch',
    RegexLeaf.start(),
    new RegexLeaf('new'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf('branch'),
    RegexLeaf.end(),
  );
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/CommandNewBranch.java */
export class CommandNewBranch extends SingleLineCommand2<BpmDiagram> {
  constructor() {
    super(getRegexConcat());
  }

  /** `@Explain`: `null`. */
  protected override explainArg(_location: LineLocation | undefined, _arg: RegexResult): string | undefined {
    return undefined;
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/CommandNewBranch.java:69-72 */
  protected executeArg(
    diagram: BpmDiagram,
    _location: LineLocation | undefined,
    _arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    return diagram.newBranch();
  }
}
