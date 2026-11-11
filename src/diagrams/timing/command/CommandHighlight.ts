import { ColorType } from '../../../core/abel/ColorType.js';
import type { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../../core/command/SingleLineCommand2.js';
import { ColorParser } from '../../../core/klimt/color/ColorParser.js';
import { Display } from '../../../core/klimt/creole/Display.js';
import type { IRegex } from '../../../core/regex/IRegex.js';
import { RegexConcat } from '../../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../../core/regex/RegexLeaf.js';
import { RegexOptional } from '../../../core/regex/RegexOptional.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import type { LineLocation } from '../../../core/tim/LineLocation.js';
import type { TimingDiagram } from '../TimingDiagram.js';
import { TimeTickBuilder } from './TimeTickBuilder.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandHighlight.java:58-60 */
function color(): ColorParser {
  return ColorParser.simpleColor(ColorType.BACK);
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandHighlight.java:62-82 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'net.sourceforge.plantuml.timingdiagram.command.CommandHighlight',
    RegexLeaf.start(),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf('highlight'),
    RegexLeaf.spaceOneOrMore(),
    TimeTickBuilder.expressionAtWithoutArobase('FROM'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf('to'),
    RegexLeaf.spaceOneOrMore(),
    TimeTickBuilder.expressionAtWithoutArobase('TO'),
    RegexLeaf.spaceZeroOrMore(),
    color().getRegex(),
    RegexLeaf.spaceZeroOrMore(),
    new RegexOptional(
      new RegexConcat(new RegexLeaf(':'), RegexLeaf.spaceZeroOrMore(), new RegexLeaf(1, 'CAPTION', '(.*)')),
    ),
    RegexLeaf.end(),
  );
}

/**
 * `highlight 100 to 200 #pink : caption`. `explainArg` (`@Explain`) is not ported.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/CommandHighlight.java:54-124
 */
export class CommandHighlight extends SingleLineCommand2<TimingDiagram> {
  /** @see CommandHighlight.java:56-58 */
  public constructor() {
    super(getRegexConcat());
  }

  /**
   * A tick that does not resolve is Java's `null`, which `Highlight` keeps (D7).
   * @see CommandHighlight.java:110-122
   */
  protected override executeArg(
    diagram: TimingDiagram,
    _location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const tickFrom = TimeTickBuilder.parseTimeTick('FROM', arg, diagram);
    const tickTo = TimeTickBuilder.parseTimeTick('TO', arg, diagram);
    const display = Display.getWithNewlines(diagram.getPragma(), arg.get('CAPTION', 0) ?? null);
    const colors = color().getColor(arg.getLazzy('COLOR', 0), diagram.getSkinParam().getIHtmlColorSet());
    return diagram.highlight(tickFrom!, tickTo!, display, colors);
  }
}
