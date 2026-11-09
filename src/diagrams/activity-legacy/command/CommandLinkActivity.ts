/**
 * `CommandLinkActivity`: the legacy activity link, `(*) --> A`, `A --> ===B===`, `--> "label" as C in "lane"`.
 * It is split by Java method (D11): the entity lookup is `command-link-activity-entity.ts` (`getEntity`,
 * `ubrexGetEntityForIfOnly`), the `explain` text `command-link-activity-explain.ts`; the grammar
 * (`getRegexConcat`) and `executeArg` are here.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram/command/CommandLinkActivity.java:73-310
 */
import { Direction } from '../../../core/abel/Direction.js';
import type { Entity } from '../../../core/abel/Entity.js';
import { Link } from '../../../core/abel/Link.js';
import { LinkArg } from '../../../core/abel/LinkArg.js';
import { ColorType } from '../../../core/abel/ColorType.js';
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../../core/command/SingleLineCommand2.js';
import { LinkDecor } from '../../../core/decoration/LinkDecor.js';
import { LinkType } from '../../../core/decoration/LinkType.js';
import { ColorParser } from '../../../core/klimt/color/ColorParser.js';
import { Display } from '../../../core/klimt/creole/Display.js';
import { LINE_STYLE } from '../../../core/link-style-regex.js';
import type { IRegex } from '../../../core/regex/IRegex.js';
import { RegexConcat } from '../../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../../core/regex/RegexLeaf.js';
import { RegexOptional } from '../../../core/regex/RegexOptional.js';
import { RegexOr } from '../../../core/regex/RegexOr.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import { Stereotype } from '../../../core/stereo/Stereotype.js';
import * as StereotypePattern from '../../../core/stereo/StereotypePattern.js';
import { getArrowDirection, manageArrowForCuca } from '../../../core/string-utils-arrow.js';
import type { LineLocation } from '../../../core/tim/LineLocation.js';
import * as UrlBuilderGrammar from '../../../core/url/UrlBuilder.js';
import { UrlBuilder } from '../../../core/url/UrlBuilder.js';
import { UrlMode } from '../../../core/url/UrlMode.js';
import type { ActivityDiagram } from '../ActivityDiagram.js';
import { getEntity, ubrexGetEntityForIfOnly } from './command-link-activity-entity.js';
import { explainArg, notNull } from './command-link-activity-explain.js';

/** `length = 2` for a link whose direction is `*`. @see CommandLinkActivity.java:276-277 */
const NO_CONSTRAINT_LENGTH = 2;
/** The error `executeArg` answers when an end names no entity. @see CommandLinkActivity.java:250, 263 */
const NO_SUCH_ACTIVITY = 'No such activity';
/** The `topurl` skin parameter. @see CommandLinkActivity.java:292 */
const TOP_URL_KEY = 'topurl';

/** `(?:\[(LINE_STYLE)\])?`, the `[style]` on either side of the direction. @see CommandLinkActivity.java:94, 96 */
const ARROW_STYLE_PATTERN = '(?:\\[(' + LINE_STYLE + ')\\])?';

/**
 * The first end: `(*)`, a code, a `==bar==`, or a `"quoted"` with an optional `as code`.
 * @see CommandLinkActivity.java:82-87
 */
function firstEnd(): IRegex {
  return new RegexOptional(
    new RegexOr(
      'FIRST',
      new RegexLeaf(2, 'STAR', '(\\(\\*(top)?\\))'),
      new RegexLeaf(1, 'CODE', '([%pLN][%pLN_.]*)'),
      new RegexLeaf(1, 'BAR', '(?:==+)[%s]*([%pLN_.]+)[%s]*(?:==+)'),
      new RegexLeaf(2, 'QUOTED', '[%g]([^%g]+)[%g](?:[%s]+as[%s]+([%pLN_.]+))?'),
    ),
  );
}

/** The arrow: body, `[style]`, direction word, `[style]`, body, `>`. @see CommandLinkActivity.java:92-99 */
function arrow(): IRegex[] {
  return [
    new RegexLeaf(1, 'ARROW_BODY1', '([-.]+)'),
    new RegexLeaf(1, 'ARROW_STYLE1', ARROW_STYLE_PATTERN),
    new RegexLeaf(1, 'ARROW_DIRECTION', '(\\*|left|right|up|down|le?|ri?|up?|do?)?'),
    new RegexLeaf(1, 'ARROW_STYLE2', ARROW_STYLE_PATTERN),
    new RegexLeaf(1, 'ARROW_BODY2', '([-.]*)'),
    new RegexLeaf('\\>'),
  ];
}

/**
 * The second end: `(*)`, `(*top)`, `(*N)`, `{`, a code, a bar, a quoted, or any word run.
 * @see CommandLinkActivity.java:105-111
 */
function secondEnd(): IRegex {
  return new RegexOr(
    'FIRST2',
    new RegexLeaf(2, 'STAR2', '(\\(\\*(top|\\d+)?\\))'),
    new RegexLeaf(1, 'OPENBRACKET2', '(\\{)'),
    new RegexLeaf(1, 'CODE2', '([%pLN][%pLN_.]*)'),
    new RegexLeaf(1, 'BAR2', '(?:==+)[%s]*([%pLN_.]+)[%s]*(?:==+)'),
    new RegexLeaf(2, 'QUOTED2', '[%g]([^%g]+)[%g](?:[%s]+as[%s]+([%pLN][%pLN_.]*))?'),
    new RegexLeaf(1, 'QUOTED_INVISIBLE2', '(\\w.*?)'),
  );
}

/** `in <partition>`. @see CommandLinkActivity.java:113-117 */
function inPartition(): IRegex {
  return new RegexOptional(
    new RegexConcat(
      new RegexLeaf('in'),
      RegexLeaf.spaceOneOrMore(),
      new RegexLeaf(1, 'PARTITION2', '([%g][^%g]+[%g]|\\S+)'),
    ),
  );
}

/** @see CommandLinkActivity.java:79-118 */
function getRegexConcat(): RegexConcat {
  return RegexConcat.build(
    'CommandLinkActivity',
    RegexLeaf.start(),
    firstEnd(),
    StereotypePattern.optional('STEREOTYPE'),
    ColorParser.exp2(),
    RegexLeaf.spaceZeroOrMore(),
    UrlBuilderGrammar.OPTIONAL,
    ...arrow(),
    RegexLeaf.spaceZeroOrMore(),
    new RegexOptional(new RegexLeaf(1, 'BRACKET', '\\[([^\\]*]+[^\\]]*)\\]')),
    RegexLeaf.spaceZeroOrMore(),
    secondEnd(),
    StereotypePattern.optional('STEREOTYPE2'),
    inPartition(),
    RegexLeaf.spaceZeroOrMore(),
    ColorParser.exp3(),
    RegexLeaf.end(),
  );
}

/** `entity.setSpecificColorTOBEREMOVED(BACK, getColor(s))` for `BACKCOLOR`/`BACKCOLOR2`; throws on an unknown colour. */
function applyBackColor(diagram: ActivityDiagram, entity: Entity, s: string | undefined): void {
  if (s !== undefined)
    entity.setSpecificColorTOBEREMOVED(ColorType.BACK, diagram.getSkinParam().getIHtmlColorSet().getColor(s));
}

/** `StringUtils.manageArrowForCuca` of the arrow text, with the `length` rule. @see CommandLinkActivity.java:274-277 */
function arrowLength(arrowBody1: string, arrowDirection: string, arrowBody2: string): number {
  const arrowText = manageArrowForCuca(arrowBody1 + arrowDirection + arrowBody2 + '>');
  return arrowDirection.includes('*') ? NO_CONSTRAINT_LENGTH : arrowText.length - 1;
}

/** An ARROW head, dotted when the body holds a dot. @see CommandLinkActivity.java:278-280 */
function arrowType(bodies: string): LinkType {
  const type = new LinkType(LinkDecor.ARROW, LinkDecor.NONE);
  return bodies.includes('.') ? type.goDotted() : type;
}

/** `link.getInv()` for a LEFT or UP arrow. @see CommandLinkActivity.java:284-286 */
function invertWhenBackwards(link: Link, arrow: string): Link {
  const direction = getArrowDirection(arrow);
  return direction === Direction.LEFT || direction === Direction.UP ? link.getInv() : link;
}

/** `link.setUrl(...)` when a `[[url]]` stood before the arrow. @see CommandLinkActivity.java:290-294 */
function applyUrl(diagram: ActivityDiagram, link: Link, arg: RegexResult): void {
  const url = arg.get(UrlBuilderGrammar.URL_KEY, 0);
  if (url !== undefined) {
    const urlBuilder = new UrlBuilder(diagram.getSkinParam().getValue(TOP_URL_KEY), UrlMode.STRICT);
    link.setUrl(urlBuilder.getUrl(url) ?? undefined);
  }
}

/** The link `executeArg` builds between two entities, before `addLink`. @see CommandLinkActivity.java:268-299 */
function buildLink(
  diagram: ActivityDiagram,
  location: LineLocation | undefined,
  arg: RegexResult,
  entity1: Entity,
  entity2: Entity,
): Link {
  const linkLabel = Display.getWithNewlines(diagram.getPragma(), arg.get('BRACKET', 0) ?? null);

  const arrowBody1 = notNull(arg.get('ARROW_BODY1', 0));
  const arrowBody2 = notNull(arg.get('ARROW_BODY2', 0));
  const arrowDirection = notNull(arg.get('ARROW_DIRECTION', 0));
  const length = arrowLength(arrowBody1, arrowDirection, arrowBody2);

  const type = arrowType(arrowBody1 + arrowBody2);

  const linkArg = LinkArg.build(linkLabel, length, diagram.getSkinParam().classAttributeIconSize() > 0);
  const created = new Link(
    location,
    diagram,
    diagram.getSkinParam().getCurrentStyleBuilder(),
    entity1,
    entity2,
    type,
    linkArg,
  );
  if (arrowDirection.includes('*')) created.setConstraint(false);

  const link = invertWhenBackwards(created, arrowBody1 + arrowDirection + arrowBody2 + '>');

  applyUrl(diagram, link, arg);

  link.applyStyle(arg.getLazzy('ARROW_STYLE', 0));
  return link;
}

/** @see CommandLinkActivity.java:73 */
export class CommandLinkActivity extends SingleLineCommand2<ActivityDiagram> {
  /** @see CommandLinkActivity.java:75-77 */
  constructor() {
    super(getRegexConcat());
  }

  /** `@Explain`. @see CommandLinkActivity.java:122-176 */
  protected override explainArg(_location: LineLocation | undefined, arg: RegexResult): string {
    return explainArg(arg);
  }

  /** @see CommandLinkActivity.java:245-310 */
  protected override executeArg(
    diagram: ActivityDiagram,
    location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const entity1 = CommandLinkActivity.getEntity(location, diagram, arg, true);

    if (entity1 === undefined) return CommandExecutionResult.error(NO_SUCH_ACTIVITY);

    const stereotype = arg.get('STEREOTYPE', 0);
    if (stereotype !== undefined) entity1.setStereotype(Stereotype.build(stereotype));

    applyBackColor(diagram, entity1, arg.get('BACKCOLOR', 0));

    const entity2 = CommandLinkActivity.getEntity(location, diagram, arg, false);
    if (entity2 === undefined) return CommandExecutionResult.error(NO_SUCH_ACTIVITY);

    diagram.setLastEntityConsulted(entity2);

    applyBackColor(diagram, entity2, arg.get('BACKCOLOR2', 0));
    const stereotype2 = arg.get('STEREOTYPE2', 0);
    if (stereotype2 !== undefined) entity2.setStereotype(Stereotype.build(stereotype2));

    diagram.addLink(buildLink(diagram, location, arg, entity1, entity2));

    return CommandExecutionResult.ok();
  }

  /** Package-private upstream (`UBrexCommandIf` shares it). @see CommandLinkActivity.java:312 */
  static getEntity = getEntity;

  /** Package-private upstream (`UBrexCommandIf`). @see CommandLinkActivity.java:405 */
  static ubrexGetEntityForIfOnly = ubrexGetEntityForIfOnly;
}
