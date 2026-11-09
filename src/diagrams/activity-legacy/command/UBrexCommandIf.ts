/**
 * `UBrexCommandIf`: `[source] [-->] if "test" [as code] [then]`, which opens a branch (a diamond) linked from the
 * source, or from the last activity when none is written. The grammar is a `UnicodeBracketedExpression`; the
 * source forms are those of `CommandLinkActivity` (`getEntity`'s `ubrexGetEntityForIfOnly`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram/command/UBrexCommandIf.java:63-222
 */
import { Direction } from '../../../core/abel/Direction.js';
import type { Entity } from '../../../core/abel/Entity.js';
import { Link } from '../../../core/abel/Link.js';
import { LinkArg } from '../../../core/abel/LinkArg.js';
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../../core/command/ParserPass.js';
import { UBrexSingleLineCommand2 } from '../../../core/command/UBrexSingleLineCommand2.js';
import { LinkDecor } from '../../../core/decoration/LinkDecor.js';
import { LinkType } from '../../../core/decoration/LinkType.js';
import { Display } from '../../../core/klimt/creole/Display.js';
import { UBREX_LINE_STYLE } from '../../../core/link-style-regex.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import { getArrowDirection, manageArrowForCuca } from '../../../core/string-utils-arrow.js';
import type { LineLocation } from '../../../core/tim/LineLocation.js';
import { UBrexConcat } from '../../../core/ubrex/builder/UBrexConcat.js';
import { UBrexLeaf } from '../../../core/ubrex/builder/UBrexLeaf.js';
import { UBrexNamed } from '../../../core/ubrex/builder/UBrexNamed.js';
import { UBrexOptional } from '../../../core/ubrex/builder/UBrexOptional.js';
import { UBrexOr } from '../../../core/ubrex/builder/UBrexOr.js';
import type { UnicodeBracketedExpression } from '../../../core/ubrex/UnicodeBracketedExpression.js';
import type { ActivityDiagram } from '../ActivityDiagram.js';
import { describeDirection, notNull } from './command-link-activity-explain.js';
import { ubrexGetEntityForIfOnly } from './command-link-activity-entity.js';

/** @see UBrexCommandIf.java:176 */
const NO_IF_POSSIBLE = 'No if possible at this point';
/** `length = 2` when no arrow is written. @see UBrexCommandIf.java:189 */
const DEFAULT_LENGTH = 2;

/**
 * The optional `-->` before `if`. Both style slots take `[style]` (`ARROW_STYLE1`, `ARROW_STYLE2`).
 * @see UBrexCommandIf.java:72-81
 */
function arrowPart(): UBrexOptional {
  return new UBrexOptional(
    UBrexConcat.build(
      new UBrexNamed('ARROW_BODY1', new UBrexLeaf('〇+「-.」')),
      new UBrexLeaf('〇?〘 [ 〶$ARROW_STYLE1=〘' + UBREX_LINE_STYLE + '〙] 〙'),
      new UBrexNamed('ARROW_DIRECTION', new UBrexLeaf('〇?【 *┇left┇right┇up┇down┇l〇?e┇r〇?i┇u〇?p┇d〇?o】')),
      new UBrexLeaf('〇?〘 [  〶$ARROW_STYLE2=〘' + UBREX_LINE_STYLE + '〙] 〙'),
      new UBrexNamed('ARROW_BODY2', new UBrexLeaf('〇*「-.」')),
      new UBrexLeaf('>'),
    ),
  );
}

/**
 * The four `if` spellings, longest first: quoted with `then`, bare word with `then`, quoted, bare word.
 * @see UBrexCommandIf.java:83-90
 */
function ifPart(): UBrexOr {
  return new UBrexOr(
    new UBrexLeaf('if 〇*〴s 〴g  〶$IF1=〇*〴G 〴g 〇*〴s 〇?〘as 〇+〴s 〶$ASIF1=〇+「〴an_.」 〇+〴s 〙〘then〙'),
    new UBrexLeaf('if 〇+〴s 〶$IF2=〇l+〴. 〘then〙 '),
    new UBrexLeaf('if 〇*〴s 〴g  〶$IF1=〇*〴G 〴g 〇*〴s 〇?〘as 〇+〴s 〶$ASIF1=〇+「〴an_.」 〇+〴s 〙'),
    new UBrexLeaf('if 〇+〴s 〶$IF2=〇+〴.'),
  );
}

/** @see UBrexCommandIf.java:70-91 */
function simplePart(): UBrexConcat {
  return UBrexConcat.build(
    UBrexLeaf.spaceZeroOrMore(),
    arrowPart(), // "02onStart()" --> if "" then
    UBrexLeaf.spaceZeroOrMore(),
    new UBrexOptional(new UBrexLeaf('[ 〶$BRACKET=〘〇+「〤]*」  〇*「〤]」〙 ]')),
    UBrexLeaf.spaceZeroOrMore(),
    ifPart(),
  );
}

/** @see UBrexCommandIf.java:69-99 */
function getRegexConcat(): UnicodeBracketedExpression {
  const simple = simplePart();
  return UBrexConcat.build(
    new UBrexOr(
      simple,
      UBrexConcat.build(new UBrexNamed('STAR', new UBrexLeaf('(* 〇?〘top〙)')), simple),
      UBrexConcat.build(new UBrexNamed('BAR', new UBrexLeaf('=〇+= 〇*〴s 〇+「〴an_.」〇*〴s =〇+=')), simple),
      UBrexConcat.build(
        new UBrexLeaf('〴g 〶$QUOTED1=〇*〴G 〴g 〇?〘〇+〴s as 〇+〴s 〶$QUOTED2=〇+「〴an_.」 〙 '),
        simple,
      ),
      UBrexConcat.build(new UBrexNamed('CODE', new UBrexLeaf('〇+「〴an_.」')), simple),
    ),
    UBrexLeaf.end(),
  );
}

/** `describeSource`. @see UBrexCommandIf.java:139-156 */
function describeSource(arg: RegexResult): string {
  if (arg.get('STAR', 0) !== undefined) return 'the start node';

  if (arg.get('BAR', 0) !== undefined) return "the synchronization bar '" + arg.get('BAR', 0)! + "'";

  if (arg.get('QUOTED1', 0) !== undefined) {
    if (arg.get('QUOTED2', 0) !== undefined)
      return "'" + arg.get('QUOTED2', 0)! + '\' displayed as "' + arg.get('QUOTED1', 0)! + '"';
    return '"' + arg.get('QUOTED1', 0)! + '"';
  }

  if (arg.get('CODE', 0) !== undefined) return "'" + arg.get('CODE', 0)! + "'";

  return 'the last activity';
}

/** The `testing "..."` clause of `explainArg`. @see UBrexCommandIf.java:101-137 */
function describeTest(arg: RegexResult): string {
  if (arg.get('IF2', 0) !== undefined) return ', testing "' + arg.get('IF2', 0)! + '"';

  let sb = '';
  const if1 = arg.get('IF1', 0);
  if (if1 !== undefined && if1.length > 0) sb += ', testing "' + if1 + '"';
  if (arg.get('ASIF1', 0) !== undefined) sb += " (code '" + arg.get('ASIF1', 0)! + "')";
  return sb;
}

/** `arrowLength`: `manageArrowForCuca(body1 + direction + body2 + ">").length() - 1`. @see UBrexCommandIf.java:189-202 */
function arrowLength(arg: RegexResult): number {
  if (arg.get('ARROW_BODY1', 0) === undefined) return DEFAULT_LENGTH;

  const arrowBody1 = notNull(arg.get('ARROW_BODY1', 0));
  const arrowBody2 = notNull(arg.get('ARROW_BODY2', 0));
  const arrowDirection = notNull(arg.get('ARROW_DIRECTION', 0));

  const arrow = manageArrowForCuca(arrowBody1 + arrowDirection + arrowBody2 + '>');
  return arrow.length - 1;
}

/**
 * The link from the source to the new branch: the condition is its second quantifier, the bracket its label.
 * @see UBrexCommandIf.java:204-218
 */
function buildIfLink(
  diagram: ActivityDiagram,
  location: LineLocation | undefined,
  arg: RegexResult,
  entity1: Entity,
  ifLabel: string | undefined,
): Link {
  const length = arrowLength(arg);

  const branch = diagram.getCurrentContext()!.getBranch();

  const label = Display.getWithNewlines(diagram.getPragma(), arg.get('BRACKET', 0) ?? null);
  const linkArg = LinkArg.build(label, length);
  let link = new Link(
    location,
    diagram,
    diagram.getSkinParam().getCurrentStyleBuilder(),
    entity1,
    branch,
    new LinkType(LinkDecor.ARROW, LinkDecor.NONE),
    linkArg.withQuantifier(undefined, ifLabel).withDistanceAngle(diagram.getLabeldistance(), diagram.getLabelangle()),
  );
  // "ARROW" is no name of this grammar (it names ARROW_BODY1, ARROW_DIRECTION, ...): the jar never enters this
  // branch, which is the leftover of CommandLinkActivity's regex (java:209-216). Kept (D9).
  if (arg.get('ARROW', 0) !== undefined) {
    const direction = getArrowDirection(arg.get('ARROW', 0)!);
    if (direction === Direction.LEFT || direction === Direction.UP) link = link.getInv();
  }
  return link;
}

/** @see UBrexCommandIf.java:63 */
export class UBrexCommandIf extends UBrexSingleLineCommand2<ActivityDiagram> {
  /** @see UBrexCommandIf.java:65-67 */
  constructor() {
    super(UBrexCommandIf.getRegexConcat());
  }

  /** @see UBrexCommandIf.java:69-99 */
  static getRegexConcat(): UnicodeBracketedExpression {
    return getRegexConcat();
  }

  /** `@Explain`. @see UBrexCommandIf.java:101-137 */
  protected override explainArg(_location: LineLocation | undefined, arg: RegexResult): string {
    // Legacy activity diagram syntax: 'Source --> if "test" then' opens a branch (a diamond) linked from the
    // given source, or from the last activity when no source is written.
    let sb = "Starting an 'if'" + describeTest(arg) + ', linked from ' + describeSource(arg);

    const bracket = arg.get('BRACKET', 0);
    if (bracket !== undefined) sb += ', arrow labelled "' + bracket + '"';

    const direction = arg.get('ARROW_DIRECTION', 0);
    if (direction !== undefined && direction.length > 0) sb += ', oriented ' + describeDirection(direction);

    const style = arg.getLazzy('ARROW_STYLE', 0);
    if (style !== undefined) sb += ", with style '" + style + "'";

    return sb;
  }

  /** @see UBrexCommandIf.java:171-220 */
  protected override executeArg(
    diagram: ActivityDiagram,
    location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const entity1 = ubrexGetEntityForIfOnly(location, diagram, arg);
    if (entity1 === undefined) return CommandExecutionResult.error(NO_IF_POSSIBLE);

    let ifCode: string | undefined;
    let ifLabel: string | undefined;
    if (arg.get('IF2', 0) === undefined) {
      ifCode = arg.get('ASIF1', 0);
      ifLabel = arg.get('IF1', 0);
    } else {
      ifCode = undefined;
      ifLabel = arg.get('IF2', 0);
    }
    diagram.startIf(location, ifCode);

    const link = buildIfLink(diagram, location, arg, entity1, ifLabel);
    link.applyStyle(arg.getLazzy('ARROW_STYLE', 0));
    diagram.addLink(link);

    return CommandExecutionResult.ok();
  }
}
