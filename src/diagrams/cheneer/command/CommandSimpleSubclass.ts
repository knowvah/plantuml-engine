/**
 * `CommandSimpleSubclass`: `NAME1 -<- NAME2` / `NAME1 ->- NAME2`, a length-3 link whose middle decor is the
 * subset (`<`) or superset (`>`) sign; `=` on the first participation draws it bold.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/cheneer/command/CommandSimpleSubclass.java:59-128
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

/** The `DIRECTION` that makes the first entity the superclass. @see CommandSimpleSubclass.java:94 */
const SUPERSET_DIRECTION = '>';
/** `LinkArg.build(Display.NULL, 3)`. @see CommandSimpleSubclass.java:120 */
const SUBCLASS_LINK_LENGTH = 3;

/** @see CommandSimpleSubclass.java:79-81 */
function color(): ColorParser {
  return ColorParser.simpleColor(ColorType.LINE);
}

/** @see CommandSimpleSubclass.java:59 */
export class CommandSimpleSubclass extends SingleLineCommand2<ChenEerDiagram> {
  /** @see CommandSimpleSubclass.java:61-63 */
  public constructor() {
    super(CommandSimpleSubclass.getRegexConcat());
  }

  /** The key is `CommandCreateEntity`'s upstream (java:66). @see CommandSimpleSubclass.java:65-77 */
  static getRegexConcat(): IRegex {
    return RegexConcat.build(
      'CommandCreateEntity',
      RegexLeaf.start(),
      new RegexLeaf(1, 'NAME1', NAME_PATTERN),
      RegexLeaf.spaceZeroOrMore(),
      new RegexLeaf(1, 'PARTICIPATION', PARTICIPATION_PATTERN),
      new RegexLeaf(1, 'DIRECTION', '([<>])'),
      new RegexLeaf(1, 'PARTICIPATION2', PARTICIPATION_PATTERN),
      RegexLeaf.spaceZeroOrMore(),
      new RegexLeaf(1, 'NAME2', NAME_PATTERN),
      RegexLeaf.spaceZeroOrMore(),
      color().getRegex(),
      RegexLeaf.end(),
    );
  }

  /** @see CommandSimpleSubclass.java:83-88 */
  protected override explainArg(_location: LineLocation | undefined, _arg: RegexResult): string | undefined {
    return undefined;
  }

  /** @see CommandSimpleSubclass.java:90-126 */
  protected override executeArg(
    diagram: ChenEerDiagram,
    location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const name1 = diagram.cleanId(arg.get('NAME1', 0)) as string;
    const name2 = diagram.cleanId(arg.get('NAME2', 0)) as string;
    const isDouble = arg.get('PARTICIPATION', 0) === DOUBLE_PARTICIPATION;
    const isSuperset = arg.get('DIRECTION', 0) === SUPERSET_DIRECTION;

    const entity1 = entityNamed(diagram, name1);
    if (entity1 === undefined) return CommandExecutionResult.error(NO_SUCH_ENTITY + name1);

    const entity2 = entityNamed(diagram, name2);
    if (entity2 === undefined) return CommandExecutionResult.error(NO_SUCH_ENTITY + name2);

    let linkType = plainLinkType();
    if (isDouble) linkType = linkType.goBold();
    linkType = isSuperset ? linkType.withMiddleSuperset() : linkType.withMiddleSubset();
    const link = newLink(
      diagram,
      location,
      [entity1, entity2],
      linkType,
      LinkArg.build(Display.NULL, SUBCLASS_LINK_LENGTH),
    );
    link.setPortMembers(diagram.getPortId(entity1.getName()), diagram.getPortId(entity2.getName()));
    link.setColors(color().getColor(arg.getLazzy('COLOR', 0), diagram.getSkinParam().getIHtmlColorSet()));
    diagram.addLink(link);

    return CommandExecutionResult.ok();
  }
}
