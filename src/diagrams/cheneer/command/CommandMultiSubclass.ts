/**
 * `CommandMultiSubclass`: `SUPER ->- d|o|U { A, B }`, a circle between a superclass and its subclasses. The
 * circle leaf is created before the superclass and the subclasses are checked, so a missing name errors with the
 * circle and the superclass link already added (D7).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/cheneer/command/CommandMultiSubclass.java:64-162
 */
import type { Entity } from '../../../core/abel/Entity.js';
import { ColorType } from '../../../core/abel/ColorType.js';
import type { Colors } from '../../../core/abel/Colors.js';
import { LeafType } from '../../../core/abel/LeafType.js';
import { LinkArg } from '../../../core/abel/LinkArg.js';
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../../core/command/SingleLineCommand2.js';
import { javaTrim } from '../../../core/java-number-format.js';
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
  javaSplitComma,
  NAME_PATTERN,
  newLink,
  NO_SUCH_ENTITY,
  PARTICIPATION_PATTERN,
  plainLinkType,
} from './chen-command-support.js';

/** The `SYMBOL` that makes the circle a union: the superset sign goes on the superclass link. @see java:133 */
const UNION_SYMBOL = 'U';
/** The separators of the centre quark's name. @see CommandMultiSubclass.java:116-117 */
const CENTER_SEPARATOR = '/';
const CENTER_SUFFIX = '/center';
/** `LinkArg.build(Display.NULL, 2)` for the superclass link. @see CommandMultiSubclass.java:137 */
const SUPERCLASS_LINK_LENGTH = 2;
/** `LinkArg.build(Display.NULL, 3)` for each subclass link. @see CommandMultiSubclass.java:154 */
const SUBCLASS_LINK_LENGTH = 3;

/** @see CommandMultiSubclass.java:88-90 */
function color(): ColorParser {
  return ColorParser.simpleColor(ColorType.BACK);
}

/** What the two link-adding steps read about the command being executed. */
interface MultiContext {
  readonly diagram: ChenEerDiagram;
  readonly location: LineLocation | undefined;
  readonly centerEntity: Entity;
  readonly symbol: string;
  readonly colors: Colors;
}

/** The link from the superclass to the circle. @see CommandMultiSubclass.java:129-140 */
function addSuperclassLink(context: MultiContext, superclassEntity: Entity, isDouble: boolean): void {
  const { diagram, location, centerEntity, symbol, colors } = context;
  let linkType = plainLinkType();
  if (isDouble) linkType = linkType.goBold();
  if (symbol === UNION_SYMBOL) linkType = linkType.withMiddleSuperset();
  const link = newLink(
    diagram,
    location,
    [superclassEntity, centerEntity],
    linkType,
    LinkArg.build(Display.NULL, SUPERCLASS_LINK_LENGTH),
  );
  link.setPortMembers(diagram.getPortId(superclassEntity.getName()), diagram.getPortId(centerEntity.getName()));
  link.setColors(colors);
  diagram.addLink(link);
}

/** The links from the circle to each subclass; the first missing name errors. @see CommandMultiSubclass.java:142-158 */
function addSubclassLinks(context: MultiContext, subclassIds: readonly string[]): CommandExecutionResult {
  const { diagram, location, centerEntity, symbol, colors } = context;
  for (const subclass of subclassIds) {
    const subclassEntity = entityNamed(diagram, subclass);
    if (subclassEntity === undefined) return CommandExecutionResult.error(NO_SUCH_ENTITY + subclass);

    let subclassLinkType = plainLinkType();
    if (symbol !== UNION_SYMBOL) subclassLinkType = subclassLinkType.withMiddleSuperset();
    const subclassLink = newLink(
      diagram,
      location,
      [centerEntity, subclassEntity],
      subclassLinkType,
      LinkArg.build(Display.NULL, SUBCLASS_LINK_LENGTH),
    );
    subclassLink.setColors(colors);
    diagram.addLink(subclassLink);
  }
  return CommandExecutionResult.ok();
}

/** @see CommandMultiSubclass.java:64 */
export class CommandMultiSubclass extends SingleLineCommand2<ChenEerDiagram> {
  /** @see CommandMultiSubclass.java:66-68 */
  public constructor() {
    super(CommandMultiSubclass.getRegexConcat());
  }

  /** The key is `CommandCreateEntity`'s upstream (java:71). @see CommandMultiSubclass.java:70-86 */
  static getRegexConcat(): IRegex {
    return RegexConcat.build(
      'CommandCreateEntity',
      RegexLeaf.start(),
      new RegexLeaf(1, 'SUPERCLASS', NAME_PATTERN),
      RegexLeaf.spaceZeroOrMore(),
      new RegexLeaf(1, 'PARTICIPATION', PARTICIPATION_PATTERN),
      new RegexLeaf(1, '(>)'),
      new RegexLeaf(1, 'PARTICIPATION2', PARTICIPATION_PATTERN),
      RegexLeaf.spaceZeroOrMore(),
      new RegexLeaf(1, 'SYMBOL', '([doU])'),
      RegexLeaf.spaceZeroOrMore(),
      new RegexLeaf('\\{'),
      new RegexLeaf(1, 'SUBCLASSES', '(.+)'),
      new RegexLeaf('\\}'),
      RegexLeaf.spaceZeroOrMore(),
      color().getRegex(),
      RegexLeaf.end(),
    );
  }

  /** @see CommandMultiSubclass.java:92-97 */
  protected override explainArg(_location: LineLocation | undefined, _arg: RegexResult): string | undefined {
    return undefined;
  }

  /** @see CommandMultiSubclass.java:99-160 */
  protected override executeArg(
    diagram: ChenEerDiagram,
    location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const superclass = diagram.cleanId(arg.get('SUPERCLASS', 0)) as string;
    const subclasses = arg.get('SUBCLASSES', 0) as string;

    const subclassIds = javaSplitComma(subclasses).map((subclass) => diagram.cleanId(javaTrim(subclass)) as string);

    const isDouble = arg.get('PARTICIPATION', 0) === DOUBLE_PARTICIPATION;
    const symbol = arg.get('SYMBOL', 0) as string;

    const colors = color().getColor(arg.getLazzy('COLOR', 0), diagram.getSkinParam().getIHtmlColorSet());

    const centerQuark = diagram.quarkInContext(
      false,
      superclass + CENTER_SEPARATOR + symbol + subclasses + CENTER_SUFFIX,
    );
    const centerEntity = diagram.reallyCreateLeaf(
      location,
      centerQuark,
      Display.create(symbol),
      LeafType.CHEN_CIRCLE,
      undefined,
    );

    centerEntity.setColors(colors);

    const superclassEntity = entityNamed(diagram, superclass);
    if (superclassEntity === undefined) return CommandExecutionResult.error(NO_SUCH_ENTITY + superclass);

    const context: MultiContext = { diagram, location, centerEntity, symbol, colors };
    addSuperclassLink(context, superclassEntity, isDouble);

    return addSubclassLinks(context, subclassIds);
  }
}
