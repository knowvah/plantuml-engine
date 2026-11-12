/**
 * `CommandCreateEntity`: `entity [ "display" as ] CODE [<<stereo>>] [#color] {` and the `relationship` form. It
 * creates (or mutes) a `CHEN_ENTITY`/`CHEN_RELATIONSHIP` leaf and makes it the owner of the attributes that follow.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/cheneer/command/CommandCreateEntity.java:58-141
 */
import type { Entity } from '../../../core/abel/Entity.js';
import { ColorType } from '../../../core/abel/ColorType.js';
import { LeafType } from '../../../core/abel/LeafType.js';
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
import { Stereotype } from '../../../core/stereo/Stereotype.js';
import type { LineLocation } from '../../../core/tim/LineLocation.js';
import type { ChenEerDiagram } from '../ChenEerDiagram.js';

/** The `TYPE` keywords. @see CommandCreateEntity.java:67, 100-107 */
const TYPE_ENTITY = 'entity';
const TYPE_RELATIONSHIP = 'relationship';
/** The error a type change `muteToType` refuses answers. @see CommandCreateEntity.java:126 */
const BAD_NAME = 'Bad name';

/** @see CommandCreateEntity.java:85-87 */
function color(): ColorParser {
  return ColorParser.simpleColor(ColorType.BACK);
}

/** `switch (arg.get("TYPE", 0))`. @see CommandCreateEntity.java:99-109 */
function leafTypeOf(type: string | undefined): LeafType {
  switch (type) {
    case TYPE_ENTITY:
      return LeafType.CHEN_ENTITY;
    case TYPE_RELATIONSHIP:
      return LeafType.CHEN_RELATIONSHIP;
    default:
      throw new Error('IllegalStateException');
  }
}

/** @see CommandCreateEntity.java:58 */
export class CommandCreateEntity extends SingleLineCommand2<ChenEerDiagram> {
  /** @see CommandCreateEntity.java:60-62 */
  public constructor() {
    super(CommandCreateEntity.getRegexConcat());
  }

  /** @see CommandCreateEntity.java:64-83 */
  static getRegexConcat(): IRegex {
    return RegexConcat.build(
      'CommandCreateEntity',
      RegexLeaf.start(),
      new RegexLeaf(1, 'TYPE', `(${TYPE_ENTITY}|${TYPE_RELATIONSHIP})`),
      RegexLeaf.spaceOneOrMore(),
      new RegexOptional(
        // Copied from CommandCreatePackageBlock
        new RegexConcat(
          new RegexLeaf(1, 'DISPLAY', '[%g]([^%g]+)[%g]'),
          RegexLeaf.spaceOneOrMore(),
          new RegexLeaf('as'),
          RegexLeaf.spaceOneOrMore(),
        ),
      ),
      new RegexLeaf(1, 'CODE', '([%pLN_.]+)'),
      RegexLeaf.spaceZeroOrMore(),
      new RegexLeaf(1, 'STEREO', '(<<.+>>)?'),
      RegexLeaf.spaceZeroOrMore(),
      color().getRegex(),
      RegexLeaf.spaceZeroOrMore(),
      new RegexLeaf('\\{'),
      RegexLeaf.end(),
    );
  }

  /** @see CommandCreateEntity.java:89-94 */
  protected override explainArg(_location: LineLocation | undefined, _arg: RegexResult): string | undefined {
    return undefined;
  }

  /**
   * An existing quark keeps its leaf, and `muteToType` may refuse the new type ("Bad name").
   * @see CommandCreateEntity.java:96-139
   */
  protected override executeArg(
    diagram: ChenEerDiagram,
    location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const type = leafTypeOf(arg.get('TYPE', 0));

    const idShort = arg.get('CODE', 0);
    const quark = diagram.quarkInContext(true, diagram.cleanId(idShort) as string);
    const displayText = arg.get('DISPLAY', 0) ?? quark.getName();

    const stereo = arg.get('STEREO', 0);

    let entity: Entity | undefined = quark.getData();

    if (entity === undefined) {
      const display = Display.getWithNewlines(diagram.getPragma(), displayText);
      entity = diagram.reallyCreateLeaf(location, quark, display, type, undefined);
    } else if (!entity.muteToType(type, undefined)) return CommandExecutionResult.error(BAD_NAME);

    if (stereo !== undefined) {
      entity.setStereotype(Stereotype.build(stereo));
      entity.setStereostyle(stereo);
    }

    entity.setColors(color().getColor(arg.getLazzy('COLOR', 0), diagram.getSkinParam().getIHtmlColorSet()));

    diagram.pushOwner(entity);

    return CommandExecutionResult.ok();
  }
}
