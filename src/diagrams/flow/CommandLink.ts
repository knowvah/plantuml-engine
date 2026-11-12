/**
 * `CommandLink`: `[orientation ]id`, a path from the last box's
 * `orientation` side to box `id` (`SOUTH` by default). It does not move the
 * last box.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/flowdiagram/CommandLink.java
 */
import { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../core/command/SingleLineCommand2.js';
import { fromString, TileGeometry } from '../../core/golem/TileGeometry.js';
import type { IRegex } from '../../core/regex/IRegex.js';
import { RegexConcat } from '../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../core/regex/RegexLeaf.js';
import { RegexOptional } from '../../core/regex/RegexOptional.js';
import type { RegexResult } from '../../core/regex/RegexResult.js';
import type { LineLocation } from '../../core/tim/LineLocation.js';
import type { FlowDiagram } from './FlowDiagram.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/flowdiagram/CommandLink.java:56-64 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.flowdiagram.CommandLink',
    RegexLeaf.start(),
    new RegexOptional(new RegexConcat(new RegexLeaf(1, 'ORIENTATION', '([nsew])'), RegexLeaf.spaceOneOrMore())),
    new RegexLeaf(1, 'ID_DEST', '(\\w+)'),
    RegexLeaf.end(),
  );
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/flowdiagram/CommandLink.java:50 */
export class CommandLink extends SingleLineCommand2<FlowDiagram> {
  constructor() {
    super(getRegexConcat());
  }

  /** `@Explain`: `null`. @see CommandLink.java:66-70 */
  protected override explainArg(_location: LineLocation | undefined, _arg: RegexResult): string | undefined {
    return undefined;
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/flowdiagram/CommandLink.java:73-84 */
  protected executeArg(
    system: FlowDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const idDest = arg.get('ID_DEST', 0)!;
    const orientationString = arg.get('ORIENTATION', 0);
    let orientation = TileGeometry.SOUTH;
    if (orientationString !== undefined) orientation = fromString(orientationString);
    system.linkSimple(orientation, idDest);
    return CommandExecutionResult.ok();
  }
}
