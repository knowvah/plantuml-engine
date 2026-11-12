/**
 * `CommandAssociate`: `NAME1 -[CARDINALITY]- NAME2 [#color]`, a length-3 link between two existing leaves; `=` on
 * the first participation draws it bold.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/cheneer/command/CommandAssociate.java:60-125
 */
import { ColorType } from '../../../core/abel/ColorType.js';
import { LinkArg } from '../../../core/abel/LinkArg.js';
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
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
import type { ChenEerDiagram } from '../ChenEerDiagram.js';
import {
  DOUBLE_PARTICIPATION,
  entityNamed,
  NAME_PATTERN,
  newLink,
  NO_SUCH_ENTITY,
  PARTICIPATION_PATTERN,
  plainLinkType,
} from './chen-command-support.js';

/** `LinkArg.build(…, 3)`: an association spans two ranks. @see CommandAssociate.java:117 */
const ASSOCIATE_LINK_LENGTH = 3;

/** @see CommandAssociate.java:81-83 */
function color(): ColorParser {
  return ColorParser.simpleColor(ColorType.LINE);
}

/** @see CommandAssociate.java:60 */
export class CommandAssociate extends SingleLineCommand2<ChenEerDiagram> {
  /** @see CommandAssociate.java:62-64 */
  public constructor() {
    super(CommandAssociate.getRegexConcat());
  }

  /** The key is `CommandCreateEntity`'s upstream (java:67). @see CommandAssociate.java:66-79 */
  static getRegexConcat(): IRegex {
    return RegexConcat.build(
      'CommandCreateEntity',
      RegexLeaf.start(),
      new RegexLeaf(1, 'NAME1', NAME_PATTERN),
      RegexLeaf.spaceZeroOrMore(),
      new RegexLeaf(1, 'PARTICIPATION', PARTICIPATION_PATTERN),
      new RegexOptional(new RegexLeaf(1, 'CARDINALITY', '([%pLN]+|\\([%pLN]+,[%s]*[%pLN]+\\))')),
      new RegexLeaf(1, 'PARTICIPATION2', PARTICIPATION_PATTERN),
      RegexLeaf.spaceZeroOrMore(),
      new RegexLeaf(1, 'NAME2', NAME_PATTERN),
      RegexLeaf.spaceZeroOrMore(),
      color().getRegex(),
      RegexLeaf.end(),
    );
  }

  /** @see CommandAssociate.java:85-90 */
  protected override explainArg(_location: LineLocation | undefined, _arg: RegexResult): string | undefined {
    return undefined;
  }

  /** @see CommandAssociate.java:92-123 */
  protected override executeArg(
    diagram: ChenEerDiagram,
    location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const name1 = diagram.cleanId(arg.get('NAME1', 0)) as string;
    const name2 = diagram.cleanId(arg.get('NAME2', 0)) as string;
    const isDouble = arg.get('PARTICIPATION', 0) === DOUBLE_PARTICIPATION;
    const cardinality = arg.get('CARDINALITY', 0);

    const entity1 = entityNamed(diagram, name1);
    if (entity1 === undefined) return CommandExecutionResult.error(NO_SUCH_ENTITY + name1);

    const entity2 = entityNamed(diagram, name2);
    if (entity2 === undefined) return CommandExecutionResult.error(NO_SUCH_ENTITY + name2);

    let linkType = plainLinkType();
    if (isDouble) linkType = linkType.goBold();
    const link = newLink(
      diagram,
      location,
      [entity1, entity2],
      linkType,
      LinkArg.build(Display.getWithNewlines(diagram.getPragma(), cardinality ?? null), ASSOCIATE_LINK_LENGTH),
    );
    link.setPortMembers(diagram.getPortId(entity1.getName()), diagram.getPortId(entity2.getName()));
    link.setColors(color().getColor(arg.getLazzy('COLOR', 0), diagram.getSkinParam().getIHtmlColorSet()));
    diagram.addLink(link);

    return CommandExecutionResult.ok();
  }
}
