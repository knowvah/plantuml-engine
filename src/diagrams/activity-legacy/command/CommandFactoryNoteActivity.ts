/**
 * `CommandFactoryNoteActivity`: `note right: text` and the block `note right` ... `end note` of the legacy
 * activity diagram. It creates a `NOTE` leaf and links it, dashed, to the last consulted activity, or to the
 * `start` node when none has been consulted (`getStart` creates it). It reads `ActivityDiagram#getStart` and
 * `getLastEntityConsulted`, so it lives in the engine (D2).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/note/CommandFactoryNoteActivity.java:73-226
 */
import { ColorType } from '../../../core/abel/ColorType.js';
import type { Entity } from '../../../core/abel/Entity.js';
import { LeafType } from '../../../core/abel/LeafType.js';
import { Link } from '../../../core/abel/Link.js';
import { LinkArg } from '../../../core/abel/LinkArg.js';
import { fromString, Position, withRankdir } from '../../../core/abel/Position.js';
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import { CommandMultilines2 } from '../../../core/command/CommandMultilines2.js';
import { MultilinesStrategy } from '../../../core/command/MultilinesStrategy.js';
import type { SingleMultiFactoryCommand } from '../../../core/command/note/SingleMultiFactoryCommand.js';
import type { ParserPass } from '../../../core/command/ParserPass.js';
import { SingleLineCommand2 } from '../../../core/command/SingleLineCommand2.js';
import { Trim } from '../../../core/command/Trim.js';
import { LinkDecor } from '../../../core/decoration/LinkDecor.js';
import { LinkType } from '../../../core/decoration/LinkType.js';
import { ColorParser } from '../../../core/klimt/color/ColorParser.js';
import { Display } from '../../../core/klimt/creole/Display.js';
import { Lazy } from '../../../core/Lazy.js';
import type { IRegex } from '../../../core/regex/IRegex.js';
import { compileInternal } from '../../../core/regex/Pattern2.js';
import { RegexConcat } from '../../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../../core/regex/RegexLeaf.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import type { LineLocation } from '../../../core/tim/LineLocation.js';
import { UrlBuilder } from '../../../core/url/UrlBuilder.js';
import { UrlMode } from '../../../core/url/UrlMode.js';
import type { BlocLines } from '../../../core/utils/BlocLines.js';
import type { ActivityDiagram } from '../ActivityDiagram.js';

/** The `topurl` skin parameter. @see CommandFactoryNoteActivity.java:130 */
const TOP_URL_KEY = 'topurl';

/** `^[%s]*end[%s]?note$`. @see CommandFactoryNoteActivity.java:101-102 */
const END = new Lazy<RegExp>(() => compileInternal('^[%s]*end[%s]?note$'));

/** @see CommandFactoryNoteActivity.java:75-84 */
function getRegexConcatMultiLine(): IRegex {
  return RegexConcat.build(
    'CommandFactoryNoteActivitymulti',
    RegexLeaf.start(),
    new RegexLeaf('note'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf(1, 'POSITION', '(right|left|top|bottom)'),
    RegexLeaf.spaceZeroOrMore(),
    ColorParser.exp1(),
    RegexLeaf.spaceZeroOrMore(),
    RegexLeaf.end(),
  );
}

/** @see CommandFactoryNoteActivity.java:86-99 */
function getRegexConcatSingleLine(): IRegex {
  return RegexConcat.build(
    'CommandFactoryNoteActivitysingle',
    RegexLeaf.start(),
    new RegexLeaf('note'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf(1, 'POSITION', '(right|left|top|bottom)'),
    RegexLeaf.spaceZeroOrMore(),
    ColorParser.exp1(),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf(':'),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf(1, 'NOTE', '(.*)'),
    RegexLeaf.end(),
  );
}

/** `@Explain`: shared by both flavours. @see CommandFactoryNoteActivity.java:164-175 */
function explainInternal(arg: RegexResult, contentClause: string): string {
  let sb = `Adding a note on the ${String(arg.get('POSITION', 0))} of the last activity${contentClause}`;

  const colorText = arg.get('COLOR', 0);
  if (colorText !== undefined) sb += ', background color ' + colorText;
  return sb;
}

/** The dashed link between the note and `activity`, by position. @see CommandFactoryNoteActivity.java:186-216 */
function buildNoteLink(
  location: LineLocation | undefined,
  diagram: ActivityDiagram,
  position: Position,
  activity: Entity,
  note: Entity,
): Link {
  const type = new LinkType(LinkDecor.NONE, LinkDecor.NONE).goDashed();
  const style = diagram.getSkinParam().getCurrentStyleBuilder();

  if (position === Position.RIGHT)
    return new Link(location, diagram, style, activity, note, type, LinkArg.noDisplay(1));
  if (position === Position.LEFT) return new Link(location, diagram, style, note, activity, type, LinkArg.noDisplay(1));
  if (position === Position.BOTTOM)
    return new Link(location, diagram, style, activity, note, type, LinkArg.noDisplay(2));
  if (position === Position.TOP) return new Link(location, diagram, style, note, activity, type, LinkArg.noDisplay(2));
  throw new Error('IllegalArgumentException');
}

/** `executeInternal`. @see CommandFactoryNoteActivity.java:177-226 */
function executeInternal(
  location: LineLocation | undefined,
  diagram: ActivityDiagram,
  arg: RegexResult,
  note: Entity,
): CommandExecutionResult {
  const s = arg.get('COLOR', 0);
  note.setSpecificColorTOBEREMOVED(
    ColorType.BACK,
    s === undefined ? undefined : diagram.getSkinParam().getIHtmlColorSet().getColor(s),
  );

  let activity = diagram.getLastEntityConsulted();
  // The `start` node is created here, after the note entity: lap-lone-note draws ent0002 (note), ent0003 (start).
  // `if (activity == null) activity = diagram.getStart(location);` (CommandFactoryNoteActivity.java:198-199)
  if (activity === undefined) activity = diagram.getStart(location);

  const position = withRankdir(fromString(arg.get('POSITION', 0)!), diagram.getSkinParam().getRankdir());

  diagram.addLink(buildNoteLink(location, diagram, position, activity, note));
  return CommandExecutionResult.ok();
}

/** @see CommandFactoryNoteActivity.java:73 */
export class CommandFactoryNoteActivity implements SingleMultiFactoryCommand<ActivityDiagram> {
  /** @see CommandFactoryNoteActivity.java:104-145 */
  createMultiLine(_withBracket: boolean): CommandMultilines2<ActivityDiagram> {
    return new (class extends CommandMultilines2<ActivityDiagram> {
      protected override explainNow(lines: BlocLines): string {
        // Mirror executeNow: the lines between 'note <position>' and 'end note' are the text of the note.
        const arg = this.getStartingPattern().matcher(lines.getFirst()!.getTrimmed().getString());
        if (arg === undefined) return 'Adding a note';

        const bodyCount = lines.size() > 2 ? lines.size() - 2 : 0;
        return explainInternal(arg, ` with ${String(bodyCount)} ${bodyCount === 1 ? 'line' : 'lines'} of text`);
      }

      protected override executeNow(
        diagram: ActivityDiagram,
        linesIn: BlocLines,
        _currentPass: ParserPass,
      ): CommandExecutionResult {
        const arg = this.getStartingPattern().matcher(linesIn.getFirst()!.getTrimmed().getString())!;
        // `expandsNewline(false)` returns `this` (BlocLines.java:80-82).
        const lines = linesIn.subExtract(1, 1).removeEmptyColumns();

        let strings = lines.toDisplay();

        let url = null;
        if (strings.size() > 0) {
          const urlBuilder = new UrlBuilder(diagram.getSkinParam().getValue(TOP_URL_KEY), UrlMode.STRICT);
          url = urlBuilder.getUrl(String(strings.get(0)));
        }
        if (url !== null) strings = strings.subList(1, strings.size());

        const codeString = diagram.getUniqueSequence('GMN');
        const quark = diagram.quarkInContext(true, codeString);
        const note = diagram.reallyCreateLeaf(lines.getLocation(), quark, strings, LeafType.NOTE, undefined);
        if (url !== null) note.addUrl(url);

        return executeInternal(lines.getLocation(), diagram, arg, note);
      }
    })(getRegexConcatMultiLine(), MultilinesStrategy.KEEP_STARTING_QUOTE, Trim.BOTH, END);
  }

  /** @see CommandFactoryNoteActivity.java:147-162 */
  createSingleLine(): SingleLineCommand2<ActivityDiagram> {
    return new (class extends SingleLineCommand2<ActivityDiagram> {
      protected override explainArg(_location: LineLocation | undefined, arg: RegexResult): string {
        // 'note left : text' (legacy activity diagram syntax).
        return explainInternal(arg, ` labelled "${String(arg.get('NOTE', 0))}"`);
      }

      protected override executeArg(
        diagram: ActivityDiagram,
        location: LineLocation | undefined,
        arg: RegexResult,
        _currentPass: ParserPass,
      ): CommandExecutionResult {
        const tmp = diagram.getUniqueSequence('GN');
        const quark = diagram.quarkInContext(true, diagram.cleanId(tmp)!);

        const note = diagram.createNote(
          location,
          quark,
          tmp,
          Display.getWithNewlines(diagram.getPragma(), arg.get('NOTE', 0) ?? null),
        );
        return executeInternal(location, diagram, arg, note);
      }
    })(getRegexConcatSingleLine());
  }
}
