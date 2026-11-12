/**
 * `CommandLineSimple`: `[orientation ]id "label"`, a new box `orientation`
 * of the last one (`SOUTH` by default). The regex needs one or more spaces
 * before the label (`cov-no-space` is a syntax error), and `(.*)` is greedy,
 * so inner quotes stay in the label (`cov-label-quotes`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/flowdiagram/CommandLineSimple.java
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

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/flowdiagram/CommandLineSimple.java:56-66 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.flowdiagram.CommandLineSimple',
    RegexLeaf.start(),
    new RegexOptional(new RegexConcat(new RegexLeaf(1, 'ORIENTATION', '([nsew])'), RegexLeaf.spaceOneOrMore())),
    new RegexLeaf(1, 'ID_DEST', '(\\w+)'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf(1, 'LABEL', '[%g](.*)[%g]'),
    RegexLeaf.end(),
  );
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/flowdiagram/CommandLineSimple.java:50 */
export class CommandLineSimple extends SingleLineCommand2<FlowDiagram> {
  constructor() {
    super(getRegexConcat());
  }

  /** `@Explain`: `null`. @see CommandLineSimple.java:68-72 */
  protected override explainArg(_location: LineLocation | undefined, _arg: RegexResult): string | undefined {
    return undefined;
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/flowdiagram/CommandLineSimple.java:76-88 */
  protected executeArg(
    diagram: FlowDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const idDest = arg.get('ID_DEST', 0)!;
    const label = arg.get('LABEL', 0)!;
    const orientationString = arg.get('ORIENTATION', 0);
    let orientation = TileGeometry.SOUTH;
    if (orientationString !== undefined) orientation = fromString(orientationString);
    diagram.lineSimple(orientation, idDest, label);
    return CommandExecutionResult.ok();
  }
}
