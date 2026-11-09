/**
 * `CommandLinkLongActivity`: a link to an activity whose quoted text spans several lines:
 * `(*) --> "Line one` / `line two` / `line three" as code <<stereo>> in P #color`. The first line carries the source,
 * the arrow and the opening quote; the last line the closing quote and the target's decorations. It is the
 * activity diagram's `CommandMultilines2` (`REMOVE_STARTING_QUOTE`, `Trim.BOTH`).
 *
 * Split by Java method (D11): `executeNow` is `executeNow` here plus helpers named for what they mirror.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram/command/CommandLinkLongActivity.java:79-308
 */
import { ColorType } from '../../../core/abel/ColorType.js';
import { Direction } from '../../../core/abel/Direction.js';
import type { Entity } from '../../../core/abel/Entity.js';
import { GroupType } from '../../../core/abel/GroupType.js';
import { LeafType } from '../../../core/abel/LeafType.js';
import { Link } from '../../../core/abel/Link.js';
import { LinkArg } from '../../../core/abel/LinkArg.js';
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import { CommandMultilines2 } from '../../../core/command/CommandMultilines2.js';
import { MultilinesStrategy } from '../../../core/command/MultilinesStrategy.js';
import type { ParserPass } from '../../../core/command/ParserPass.js';
import { Trim } from '../../../core/command/Trim.js';
import { LinkDecor } from '../../../core/decoration/LinkDecor.js';
import { LinkType } from '../../../core/decoration/LinkType.js';
import { Display } from '../../../core/klimt/creole/Display.js';
import { LINE_STYLE } from '../../../core/link-style-regex.js';
import { Lazy } from '../../../core/Lazy.js';
import { compileInternal } from '../../../core/regex/Pattern2.js';
import type { IRegex } from '../../../core/regex/IRegex.js';
import { RegexConcat } from '../../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../../core/regex/RegexLeaf.js';
import { RegexOptional } from '../../../core/regex/RegexOptional.js';
import { RegexOr } from '../../../core/regex/RegexOr.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import { Stereotype } from '../../../core/stereo/Stereotype.js';
import * as StereotypePattern from '../../../core/stereo/StereotypePattern.js';
import { getArrowDirection, manageArrowForCuca } from '../../../core/string-utils-arrow.js';
import { BackSlash } from '../../../core/text/BackSlash.js';
import type { StringLocated } from '../../../core/tim/StringLocated.js';
import * as UrlBuilderGrammar from '../../../core/url/UrlBuilder.js';
import { UrlBuilder } from '../../../core/url/UrlBuilder.js';
import type { Url } from '../../../core/url/Url.js';
import { UrlMode } from '../../../core/url/UrlMode.js';
import type { BlocLines } from '../../../core/utils/BlocLines.js';
import type { ActivityDiagram } from '../ActivityDiagram.js';
import { getEntity, removeQuotes } from './command-link-activity-entity.js';
import { describeDirection, describeSource, notNull } from './command-link-activity-explain.js';

/** `Jaws.BLOCK_E1_NEWLINE`, the hidden newline between the lines of the description. @see jaws/Jaws.java:47 */
const BLOCK_E1_NEWLINE = BackSlash.hiddenNewLine();
/** The error `executeNow` answers when the source names no entity. @see CommandLinkLongActivity.java:186 */
const NO_SUCH_ENTITY = 'No such entity';
/** The `topurl` skin parameter. @see CommandLinkLongActivity.java:288, 304 */
const TOP_URL_KEY = 'topurl';

/**
 * The closing line: `text"` then `as code`, `<<stereo>>`, `in partition`, `#color`. Groups 1-5.
 * @see CommandLinkLongActivity.java:81
 */
const END = new Lazy<RegExp>(() =>
  compileInternal(
    String.raw`^[%s]*([^%g]*)[%g](?:[%s]+as[%s]+([%pLN][%pLN_.]*))?[%s]*(\<\<.*\>\>)?[%s]*(?:in[%s]+([%g][^%g]+[%g]|\S+))?[%s]*(#\w+)?$`,
  ),
);

/** `(?:\[(LINE_STYLE)\])?`. @see CommandLinkLongActivity.java:101, 103 */
const ARROW_STYLE_PATTERN = '(?:\\[(' + LINE_STYLE + ')\\])?';

/** `StringUtils.getSplit(pattern, line)`: the groups 1..n of the first `find`; Java `null` (no match) throws on use. */
function getSplit(pattern: RegExp, line: string): readonly (string | undefined)[] {
  const m = pattern.exec(line);
  if (m === null) throw new Error('NullPointerException');
  return m.slice(1);
}

/** The first end: `(*)`, a code, a `==bar==`, or a `"quoted"` with an optional `as code`.
 *  @see CommandLinkLongActivity.java:89-96 */
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

/** The arrow: body, `[style]`, direction word, `[style]`, body, `>`. @see CommandLinkLongActivity.java:100-105 */
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

/** @see CommandLinkLongActivity.java:87-114 */
function getRegexConcat(): IRegex {
  return RegexConcat.build(
    'CommandLinkLongActivity',
    RegexLeaf.start(),
    firstEnd(),
    StereotypePattern.optional('STEREOTYPE'),
    new RegexLeaf(1, 'BACKCOLOR', '(#\\w+)?'),
    RegexLeaf.spaceZeroOrMore(),
    UrlBuilderGrammar.OPTIONAL,
    ...arrow(),
    RegexLeaf.spaceZeroOrMore(),
    new RegexOptional(new RegexLeaf(1, 'BRACKET', '\\[([^\\]*]+[^\\]]*)\\]')),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf('[%g]'),
    new RegexLeaf(1, 'DESC', '([^%g]*?)'),
    RegexLeaf.spaceZeroOrMore(),
    RegexLeaf.end(),
  );
}

/** `extractUrlString`. @see CommandLinkLongActivity.java:303-306 */
function extractUrlString(diagram: ActivityDiagram, string: string): Url | undefined {
  const urlBuilder = new UrlBuilder(diagram.getSkinParam().getValue(TOP_URL_KEY), UrlMode.STRICT);
  return urlBuilder.getUrl(string) ?? undefined;
}

/** `extractUrl`. @see CommandLinkLongActivity.java:299-301 */
function extractUrl(diagram: ActivityDiagram, string: StringLocated): Url | undefined {
  return extractUrlString(diagram, string.getString());
}

/** The text the description reads between the quotes, and the URL that stood where its first line would be. */
interface LongDescription {
  readonly displayString: string;
  readonly urlActivity: Url | undefined;
}

/**
 * The first line's text (`DESC`), then the middle lines, then the text before the closing quote.
 * @see CommandLinkLongActivity.java:196-231
 */
function readDescription(
  diagram: ActivityDiagram,
  line0: RegexResult,
  lines: BlocLines,
  lineLast: readonly (string | undefined)[],
): LongDescription {
  let sb = '';
  const desc0 = line0.get('DESC', 0);
  let urlActivity: Url | undefined = undefined;
  if (desc0 !== undefined && desc0.length > 0) {
    urlActivity = extractUrlString(diagram, desc0);
    if (urlActivity === undefined) sb += desc0 + BLOCK_E1_NEWLINE;
  }
  let i = 0;
  for (const cs of lines.subExtract(1, 1)) {
    i++;
    if (i === 1 && urlActivity === undefined) {
      urlActivity = extractUrl(diagram, cs);
      if (urlActivity !== undefined) continue;
    }
    sb += cs.getString();
    if (i < lines.size() - 2) sb += BLOCK_E1_NEWLINE;
  }

  const last0 = lineLast[0];
  if (last0 !== undefined && last0.length > 0) {
    if (sb.length > 0 && !sb.endsWith(BLOCK_E1_NEWLINE)) sb += BLOCK_E1_NEWLINE;

    sb += last0;
  }
  return { displayString: sb, urlActivity };
}

/** The target: inside `in "partition"` when written, an existing entity of that name or a new ACTIVITY leaf.
 *  @see CommandLinkLongActivity.java:233-257 */
function createTarget(
  diagram: ActivityDiagram,
  lines: BlocLines,
  lineLast: readonly (string | undefined)[],
  displayString: string,
): Entity {
  const idShort = lineLast[1] === undefined ? displayString : lineLast[1];

  let partition: string | undefined = undefined;
  if (lineLast[3] !== undefined) partition = removeQuotes(lineLast[3]);

  if (partition !== undefined) {
    const idNewLong = diagram.quarkInContext(true, diagram.cleanId(partition) as string);
    diagram.gotoGroup(
      lines.getLocation(),
      idNewLong,
      Display.getWithNewlines(diagram.getPragma(), partition),
      GroupType.PACKAGE,
    );
  }
  const ident = diagram.quarkInContext(true, diagram.cleanId(idShort) as string);

  let entity2 = ident.getData();
  if (entity2 === undefined)
    entity2 = diagram.reallyCreateLeaf(
      lines.getLocation(),
      ident,
      Display.getWithNewlines(diagram.getPragma(), displayString),
      LeafType.ACTIVITY,
      undefined,
    );

  diagram.setLastEntityConsulted(entity2);

  if (partition !== undefined) diagram.endGroup();
  return entity2;
}

/** `link.setUrl(...)` when a `[[url]]` stood before the arrow. @see CommandLinkLongActivity.java:287-291 */
function applyLinkUrl(diagram: ActivityDiagram, link: Link, line0: RegexResult): void {
  const urlKey = line0.get(UrlBuilderGrammar.URL_KEY, 0);
  if (urlKey === undefined) return;

  const urlBuilder = new UrlBuilder(diagram.getSkinParam().getValue(TOP_URL_KEY), UrlMode.STRICT);
  link.setUrl(urlBuilder.getUrl(urlKey) ?? undefined);
}

/** The link `executeNow` ends with. @see CommandLinkLongActivity.java:259-297 */
function buildLongLink(
  diagram: ActivityDiagram,
  lines: BlocLines,
  line0: RegexResult,
  entity1: Entity,
  entity2: Entity,
): Link {
  const arrowBody1 = notNull(line0.get('ARROW_BODY1', 0));
  const arrowBody2 = notNull(line0.get('ARROW_BODY2', 0));
  const arrowDirection = notNull(line0.get('ARROW_DIRECTION', 0));
  const arrowText = arrowBody1 + arrowDirection + arrowBody2 + '>';

  const arrow = manageArrowForCuca(arrowText);

  const linkLabel = Display.getWithNewlines(diagram.getPragma(), line0.get('BRACKET', 0) ?? null);

  let type = new LinkType(LinkDecor.ARROW, LinkDecor.NONE);
  if (arrow.includes('.')) type = type.goDotted();

  const linkArg = LinkArg.build(linkLabel, arrow.length - 1, diagram.getSkinParam().classAttributeIconSize() > 0);
  const style = diagram.getSkinParam().getCurrentStyleBuilder();
  let link = new Link(lines.getLocation(), diagram, style, entity1, entity2, type, linkArg);
  const direction = getArrowDirection(arrowText);
  if (direction === Direction.LEFT || direction === Direction.UP) link = link.getInv();

  applyLinkUrl(diagram, link, line0);

  link.applyStyle(line0.getLazzy('ARROW_STYLE', 0));
  return link;
}

/** The `, with style`, `, dotted`, `, oriented` clauses. @see CommandLinkLongActivity.java:144-160 */
function describeLongArrow(line0: RegexResult): string {
  let sb = '';
  const bracket = line0.get('BRACKET', 0);
  if (bracket !== undefined) sb += ', labelled "' + bracket + '"';

  const bodies = notNull(line0.get('ARROW_BODY1', 0)) + notNull(line0.get('ARROW_BODY2', 0));
  if (bodies.includes('.')) sb += ', dotted';

  const direction = line0.get('ARROW_DIRECTION', 0);
  if (direction !== undefined && direction.length > 0 && direction !== '*')
    sb += ', oriented ' + describeDirection(direction);

  const style = line0.getLazzy('ARROW_STYLE', 0);
  if (style !== undefined) sb += ", with style '" + style + "'";

  if (line0.get(UrlBuilderGrammar.URL_KEY, 0) !== undefined) sb += ', with a URL link';
  return sb;
}

/** The source and target decorations. @see CommandLinkLongActivity.java:162-175 */
function describeDecorations(line0: RegexResult, lineLast: readonly (string | undefined)[]): string {
  let sb = '';
  // The stereotypes and colors written next to an endpoint are applied to that endpoint, not to the link.
  if (line0.get('STEREOTYPE', 0) !== undefined)
    sb += ', setting the stereotype of the source to ' + line0.get('STEREOTYPE', 0)!;

  if (line0.get('BACKCOLOR', 0) !== undefined)
    sb += ', setting the background color of the source to ' + line0.get('BACKCOLOR', 0)!;

  if (lineLast[2] !== undefined) sb += ', setting the stereotype of the target to ' + lineLast[2];

  if (lineLast[4] !== undefined) sb += ', setting the background color of the target to ' + lineLast[4];
  return sb;
}

/** @see CommandLinkLongActivity.java:79 */
export class CommandLinkLongActivity extends CommandMultilines2<ActivityDiagram> {
  /** @see CommandLinkLongActivity.java:83-85 */
  constructor() {
    super(CommandLinkLongActivity.getRegexConcat(), MultilinesStrategy.REMOVE_STARTING_QUOTE, Trim.BOTH, END);
  }

  /** @see CommandLinkLongActivity.java:87-114 */
  static getRegexConcat(): IRegex {
    return getRegexConcat();
  }

  /** `@Explain`. @see CommandLinkLongActivity.java:116-176 */
  protected override explainNow(linesIn: BlocLines): string {
    // Mirror executeNow: the first line carries the source, the arrow and the beginning of the quoted
    // description; the description ends on the last line, optionally followed by 'as code', a stereotype, an 'in'
    // partition and a color, all applied to the target activity.
    const lines = linesIn.trim();
    const line0 = this.getStartingPattern().matcher(lines.getFirst()!.getTrimmed().getString());
    if (line0 === undefined) return 'Drawing a link to a multiline activity';

    let sb =
      'Drawing a link from ' +
      describeSource(line0) +
      ' to a multiline activity (block of ' +
      String(lines.size()) +
      (lines.size() === 1 ? ' line)' : ' lines)');

    const lineLast = getSplit(this.getEndPattern(), lines.getLast().getString());
    if (lineLast[1] !== undefined) sb += ", with code '" + lineLast[1] + "'";

    if (lineLast[3] !== undefined) sb += ", placed in the partition '" + removeQuotes(lineLast[3])! + "'";

    return sb + describeLongArrow(line0) + describeDecorations(line0, lineLast);
  }

  /** @see CommandLinkLongActivity.java:178-297 */
  protected override executeNow(
    diagram: ActivityDiagram,
    linesIn: BlocLines,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const lines = linesIn.trim();
    const line0 = this.getStartingPattern().matcher(lines.getFirst()!.getTrimmed().getString())!;

    const entity1 = getEntity(lines.getLocation(), diagram, line0, true);
    if (entity1 === undefined) return CommandExecutionResult.error(NO_SUCH_ENTITY);

    if (line0.get('STEREOTYPE', 0) !== undefined) entity1.setStereotype(Stereotype.build(line0.get('STEREOTYPE', 0)));

    const stringColor = line0.get('BACKCOLOR', 0);
    if (stringColor !== undefined)
      entity1.setSpecificColorTOBEREMOVED(
        ColorType.BACK,
        diagram.getSkinParam().getIHtmlColorSet().getColor(stringColor),
      );

    const lineLast = getSplit(this.getEndPattern(), lines.getLast().getString());
    const { displayString, urlActivity } = readDescription(diagram, line0, lines, lineLast);

    const entity2 = createTarget(diagram, lines, lineLast, displayString);

    if (urlActivity !== undefined) entity2.addUrl(urlActivity);

    if (lineLast[2] !== undefined) entity2.setStereotype(Stereotype.build(lineLast[2]));

    if (lineLast[4] !== undefined)
      entity2.setSpecificColorTOBEREMOVED(
        ColorType.BACK,
        diagram.getSkinParam().getIHtmlColorSet().getColor(lineLast[4]),
      );

    diagram.addLink(buildLongLink(diagram, lines, line0, entity1, entity2));

    return CommandExecutionResult.ok();
  }
}
