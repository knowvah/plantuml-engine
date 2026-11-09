/**
 * `UBrexCommandPartition`: `partition Name [#color] [<<stereo>>] [{]`, which opens a `PACKAGE` group around the
 * following activities. `}` or `end partition` closes it (`UBrexCommandEndPartition`); the `{` is optional, so
 * `partition P1` with no brace is a partition too.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram/command/UBrexCommandPartition.java:62-128
 */
import { ColorType } from '../../../core/abel/ColorType.js';
import { GroupType } from '../../../core/abel/GroupType.js';
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ParserPass } from '../../../core/command/ParserPass.js';
import { UBrexSingleLineCommand2 } from '../../../core/command/UBrexSingleLineCommand2.js';
import { UBrexColorParser } from '../../../core/klimt/color/UBrexColorParser.js';
import { Display } from '../../../core/klimt/creole/Display.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import { Stereotype } from '../../../core/stereo/Stereotype.js';
import type { LineLocation } from '../../../core/tim/LineLocation.js';
import { UBrexConcat } from '../../../core/ubrex/builder/UBrexConcat.js';
import { UBrexLeaf } from '../../../core/ubrex/builder/UBrexLeaf.js';
import { UBrexNamed } from '../../../core/ubrex/builder/UBrexNamed.js';
import { UBrexOptional } from '../../../core/ubrex/builder/UBrexOptional.js';
import { UBrexOr } from '../../../core/ubrex/builder/UBrexOr.js';
import type { UnicodeBracketedExpression } from '../../../core/ubrex/UnicodeBracketedExpression.js';
import type { ActivityDiagram } from '../ActivityDiagram.js';

/** `color()`: `UBrexColorParser.simpleColor(ColorType.BACK)`. @see UBrexCommandPartition.java:88-90 */
function color(): UBrexColorParser {
  return UBrexColorParser.simpleColor(ColorType.BACK);
}

/** @see UBrexCommandPartition.java:68-85 */
function getRegexConcat(): UnicodeBracketedExpression {
  return UBrexConcat.build(
    new UBrexLeaf('partition'),
    UBrexLeaf.spaceOneOrMore(),
    new UBrexLeaf('【 〃 〶$NAME=〇+「〤〃」 〃 ┇ 〶$NAME=〇+〴S   】'),
    UBrexLeaf.spaceZeroOrMore(),
    new UBrexOr(
      color().getRegex(),
      new UBrexOptional(new UBrexLeaf('【 # 〇{6}「0〜9a〜fA〜F」┇ 〇?# 〇+〴w 】')), // LEGACYCOLORIGNORED
    ),
    new UBrexOptional(new UBrexNamed('STEREOTYPE', new UBrexLeaf('<<  〄+〴. ->〘 >>〙'))),
    UBrexLeaf.spaceZeroOrMore(),
    new UBrexOptional(new UBrexLeaf('{')),
    UBrexLeaf.end(),
  );
}

/** @see UBrexCommandPartition.java:62 */
export class UBrexCommandPartition extends UBrexSingleLineCommand2<ActivityDiagram> {
  /** @see UBrexCommandPartition.java:64-66 */
  constructor() {
    super(UBrexCommandPartition.getRegexConcat());
  }

  /** @see UBrexCommandPartition.java:68-85 */
  static getRegexConcat(): UnicodeBracketedExpression {
    return getRegexConcat();
  }

  /** `@Explain`. @see UBrexCommandPartition.java:92-109 */
  protected override explainArg(_location: LineLocation | undefined, arg: RegexResult): string {
    // 'partition Name {' opens a container around the following activities (legacy activity diagram syntax),
    // closed by '}' or 'end partition'.
    let sb = "Starting the partition '" + String(arg.get('NAME', 0)) + "'";

    if (arg.get('COLOR', 0) !== undefined) sb += ', background color ' + arg.get('COLOR', 0)!;

    const stereotype = arg.get('STEREOTYPE', 0);
    if (stereotype !== undefined) sb += ', stereotype ' + stereotype;

    return sb;
  }

  /** @see UBrexCommandPartition.java:111-126 */
  protected override executeArg(
    diagram: ActivityDiagram,
    location: LineLocation | undefined,
    arg: RegexResult,
    _currentPass: ParserPass,
  ): CommandExecutionResult {
    const quark = diagram.quarkInContext(true, diagram.cleanId(arg.get('NAME', 0)) as string);

    diagram.gotoGroup(
      location,
      quark,
      Display.getWithNewlines(diagram.getPragma(), quark.getName()),
      GroupType.PACKAGE,
    );
    const p = diagram.getCurrentGroup();

    const colors = color().getColor(arg, diagram.getSkinParam().getIHtmlColorSet());
    if (!colors.isEmpty()) p.setColors(colors);

    p.setStereotype(Stereotype.build(arg.get('STEREOTYPE', 0)));

    return CommandExecutionResult.ok();
  }
}
