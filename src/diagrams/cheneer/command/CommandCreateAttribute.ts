/**
 * `CommandCreateAttribute`: `[ "display" as ] CODE [<<stereo>>] [#color] [{]`, an attribute of the entity,
 * relationship or composite attribute on top of the owner stack. Its quark is `owner/CODE` and it is linked to its
 * owner with a length-2 link.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/cheneer/command/CommandCreateAttribute.java:63-148
 */
import type { Entity } from '../../../core/abel/Entity.js';
import { ColorType } from '../../../core/abel/ColorType.js';
import type { Colors } from '../../../core/abel/Colors.js';
import { LeafType } from '../../../core/abel/LeafType.js';
import { LinkArg } from '../../../core/abel/LinkArg.js';
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../../core/command/SingleLineCommand2.js';
import { ColorParser } from '../../../core/klimt/color/ColorParser.js';
import { Display } from '../../../core/klimt/creole/Display.js';
import { javaTrim } from '../../../core/java-number-format.js';
import type { IRegex } from '../../../core/regex/IRegex.js';
import { RegexConcat } from '../../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../../core/regex/RegexLeaf.js';
import { RegexOptional } from '../../../core/regex/RegexOptional.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import { Stereotype } from '../../../core/stereo/Stereotype.js';
import type { LineLocation } from '../../../core/tim/LineLocation.js';
import type { ChenEerDiagram } from '../ChenEerDiagram.js';
import { newLink, plainLinkType } from './chen-command-support.js';

/** The errors `executeArg` answers. @see CommandCreateAttribute.java:104, 125 */
const NO_OWNER = 'Attribute must be inside an entity, relationship or another attribute';
const ALREADY_EXISTS = 'Attribute already exists';
/** The separator between the owner's name and the attribute's id. @see CommandCreateAttribute.java:109 */
const OWNER_SEPARATOR = '/';
/** `LinkArg.build(Display.NULL, 2)`: the attribute is one rank from its owner. @see CommandCreateAttribute.java:137 */
const ATTRIBUTE_LINK_LENGTH = 2;

/** @see CommandCreateAttribute.java:88-90 */
function color(): ColorParser {
  return ColorParser.simpleColor(ColorType.LINE);
}

/** What `decorate` reads about the attribute being created. */
interface AttributeContext {
  readonly diagram: ChenEerDiagram;
  readonly location: LineLocation | undefined;
  readonly owner: Entity;
  readonly stereo: string | undefined;
  readonly colors: Colors;
}

/** Stereotype, colours and the link to the owner of a new attribute leaf. @see CommandCreateAttribute.java:128-140 */
function decorate(entity: Entity, context: AttributeContext): void {
  const { diagram, location, owner, stereo, colors } = context;
  if (stereo !== undefined) {
    entity.setStereotype(Stereotype.build(stereo));
    entity.setStereostyle(stereo);
  }

  entity.setColors(colors);

  const link = newLink(
    diagram,
    location,
    [entity, owner],
    plainLinkType(),
    LinkArg.build(Display.NULL, ATTRIBUTE_LINK_LENGTH),
  );
  link.setColors(colors);
  diagram.addLink(link);
}

/** @see CommandCreateAttribute.java:63 */
export class CommandCreateAttribute extends SingleLineCommand2<ChenEerDiagram> {
  /** @see CommandCreateAttribute.java:65-67 */
  public constructor() {
    super(CommandCreateAttribute.getRegexConcat());
  }

  /** The key is `CommandCreateEntity`'s upstream (java:70). @see CommandCreateAttribute.java:69-86 */
  static getRegexConcat(): IRegex {
    return RegexConcat.build(
      'CommandCreateEntity',
      RegexLeaf.start(),
      RegexLeaf.spaceZeroOrMore(),
      new RegexOptional(
        // Copied from CommandCreatePackageBlock
        new RegexConcat(
          new RegexLeaf(1, 'DISPLAY', '[%g]([^%g]+)[%g]'),
          RegexLeaf.spaceOneOrMore(),
          new RegexLeaf('as'),
          RegexLeaf.spaceOneOrMore(),
        ),
      ),
      new RegexLeaf(1, 'CODE', '([%pLN%s_.:]+)'),
      RegexLeaf.spaceZeroOrMore(),
      new RegexLeaf(1, 'STEREO', '(<<.*>>)?'),
      RegexLeaf.spaceZeroOrMore(),
      color().getRegex(),
      RegexLeaf.spaceZeroOrMore(),
      new RegexLeaf(1, 'COMPOSITE', '(\\{)?'),
      RegexLeaf.end(),
    );
  }

  /** @see CommandCreateAttribute.java:92-97 */
  protected override explainArg(_location: LineLocation | undefined, _arg: RegexResult): string | undefined {
    return undefined;
  }

  /** @see CommandCreateAttribute.java:99-146 */
  protected override executeArg(
    diagram: ChenEerDiagram,
    location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const owner = diagram.peekOwner();
    if (owner === undefined) return CommandExecutionResult.error(NO_OWNER);

    const type = LeafType.CHEN_ATTRIBUTE;
    const idShort = diagram.cleanId(javaTrim(arg.get('CODE', 0) as string)) as string;
    const id = owner.getName() + OWNER_SEPARATOR + idShort;
    const quark = diagram.quarkInContext(true, id);
    const displayText = arg.get('DISPLAY', 0) ?? idShort;

    const stereo = arg.get('STEREO', 0);
    const composite = arg.get('COMPOSITE', 0) !== undefined;

    const colors = color().getColor(arg.getLazzy('COLOR', 0), diagram.getSkinParam().getIHtmlColorSet());

    if (quark.getData() !== undefined) return CommandExecutionResult.error(ALREADY_EXISTS);
    const display = Display.getWithNewlines(diagram.getPragma(), displayText);
    const entity = diagram.reallyCreateLeaf(location, quark, display, type, undefined);

    decorate(entity, { diagram, location, owner, stereo, colors });

    if (composite) diagram.pushOwner(entity);

    return CommandExecutionResult.ok();
  }
}
