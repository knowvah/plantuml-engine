/**
 * `CommandFactoryNoteOnLink`: `note [position] on link [#color] : text`, and the block form closed by `end note`.
 * It stores a `CucaNote` on the last link (`Link#addNote`); `EntityImageNoteLink` and the DOT builder read it from
 * there. Engine-neutral against `CucaDiagram`, so it lives at its upstream package.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/note/CommandFactoryNoteOnLink.java:70-221
 */
import { ColorType } from '../../abel/ColorType.js';
import type { ISkinParamWithSimple } from '../../abel/ISkinParam.js';
import { CucaNote } from '../../abel/CucaNote.js';
import { fromString, Position } from '../../abel/Position.js';
import type { CucaDiagram } from '../../cucadiagram/CucaDiagram.js';
import { Display } from '../../klimt/creole/Display.js';
import { ColorParser } from '../../klimt/color/ColorParser.js';
import { Lazy } from '../../Lazy.js';
import { compileInternal } from '../../regex/Pattern2.js';
import type { IRegex } from '../../regex/IRegex.js';
import { RegexConcat } from '../../regex/RegexConcat.js';
import { RegexLeaf } from '../../regex/RegexLeaf.js';
import type { RegexResult } from '../../regex/RegexResult.js';
import type { LineLocation } from '../../tim/LineLocation.js';
import { URL_KEY, UrlBuilder } from '../../url/UrlBuilder.js';
import { UrlMode } from '../../url/UrlMode.js';
import type { BlocLines } from '../../utils/BlocLines.js';
import { CommandExecutionResult } from '../CommandExecutionResult.js';
import { CommandMultilines2 } from '../CommandMultilines2.js';
import { MultilinesStrategy } from '../MultilinesStrategy.js';
import type { ParserPass } from '../ParserPass.js';
import { SingleLineCommand2 } from '../SingleLineCommand2.js';
import { Trim } from '../Trim.js';
import type { SingleMultiFactoryCommand } from './SingleMultiFactoryCommand.js';

/**
 * Upstream's `CucaDiagram`, whose `getSkinParam()` is a full `ISkinParam` (an `ISkinSimple`, hence
 * `getIHtmlColorSet`). The port's `ISkinParam` omits that member (ISkinParam.ts, `ISkinParamWithSimple`), so the
 * diagram type this command accepts names it.
 */
export type NoteOnLinkDiagram = Omit<CucaDiagram, 'getSkinParam'> & { getSkinParam(): ISkinParamWithSimple };

/** The `topurl` skin parameter. @see CommandFactoryNoteOnLink.java:185 */
const TOP_URL_KEY = 'topurl';
const NO_LINK_DEFINED = 'No link defined';
const NO_NOTE_DEFINED = 'No note defined';

/** `^end[%s]?note$`: no `[%s]*` prefix, unlike `CommandFactoryNoteActivity`. @see CommandFactoryNoteOnLink.java:100 */
const END = new Lazy<RegExp>(() => compileInternal('^end[%s]?note$'));

/** `ColorParser.simpleColor(ColorType.BACK)`. @see CommandFactoryNoteOnLink.java:96-98 */
function color(): ColorParser {
  return ColorParser.simpleColor(ColorType.BACK);
}

/** @see CommandFactoryNoteOnLink.java:78-94 */
function getRegexConcatSingleLine(): IRegex {
  return RegexConcat.build(
    'CommandFactoryNoteOnLinksingle',
    RegexLeaf.start(),
    new RegexLeaf('note'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf(1, 'POSITION', '(right|left|top|bottom)?'),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf(1, '(on|of)'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf('link'),
    RegexLeaf.spaceZeroOrMore(),
    color().getRegex(),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf(':'),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf(1, 'NOTE', '(.*)'),
    RegexLeaf.end(),
  );
}

/** @see CommandFactoryNoteOnLink.java:86-98 */
function getRegexConcatMultiLine(): IRegex {
  return RegexConcat.build(
    'CommandFactoryNoteOnLinkmulti',
    RegexLeaf.start(),
    new RegexLeaf('note'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf(1, 'POSITION', '(right|left|top|bottom)?'),
    RegexLeaf.spaceZeroOrMore(),
    new RegexLeaf(1, '(on|of)'),
    RegexLeaf.spaceOneOrMore(),
    new RegexLeaf('link'),
    RegexLeaf.spaceZeroOrMore(),
    color().getRegex(),
    RegexLeaf.end(),
  );
}

/** `@Explain`: shared by both flavours. @see CommandFactoryNoteOnLink.java:176-192 */
function explainInternal(arg: RegexResult, contentClause: string): string {
  let sb = 'Adding a note';

  const position = arg.get('POSITION', 0);
  if (position !== undefined && position.length > 0) sb += ' on the ' + position;

  sb += ' of the last link' + contentClause;

  const colorText = arg.get('COLOR', 0);
  if (colorText !== undefined) sb += ', background color ' + colorText;
  return sb;
}

/** `executeInternal`. @see CommandFactoryNoteOnLink.java:194-221 */
function executeInternal(diagram: NoteOnLinkDiagram, arg: RegexResult, display: Display): CommandExecutionResult {
  const link = diagram.getLastLink();
  if (link === undefined) return CommandExecutionResult.error(NO_LINK_DEFINED);

  let position: Position = Position.BOTTOM;
  const positionText = arg.get('POSITION', 0);
  if (positionText !== undefined) position = fromString(positionText);

  // Dead upstream: the grammar names no URL group, so `url` is never read (java:203-207). Kept as written.
  if (arg.get(URL_KEY, 0) !== undefined) {
    const urlBuilder = new UrlBuilder(diagram.getSkinParam().getValue(TOP_URL_KEY), UrlMode.STRICT);
    urlBuilder.getUrl(arg.get(URL_KEY, 0)!);
  }
  const colors = color().getColor(arg.getLazzy('COLOR', 0), diagram.getSkinParam().getIHtmlColorSet());
  link.addNote(CucaNote.build(display, position, colors));
  return CommandExecutionResult.ok();
}

/** @see CommandFactoryNoteOnLink.java:70 */
export class CommandFactoryNoteOnLink implements SingleMultiFactoryCommand<NoteOnLinkDiagram> {
  private readonly selectedpass: ParserPass;

  /** @see CommandFactoryNoteOnLink.java:72-74 */
  constructor(selectedpass: ParserPass) {
    this.selectedpass = selectedpass;
  }

  /** @see CommandFactoryNoteOnLink.java:100-139 */
  createMultiLine(_withBracket: boolean): CommandMultilines2<NoteOnLinkDiagram> {
    const selectedpass = this.selectedpass;
    return new (class extends CommandMultilines2<NoteOnLinkDiagram> {
      protected override explainNow(lines: BlocLines): string {
        // Mirror executeNow: the lines between 'note on link' and 'end note' are the text of the note.
        const line0 = this.getStartingPattern().matcher(lines.getFirst()!.getTrimmed().getString());
        if (line0 === undefined) return 'Adding a note on the last link';

        const bodyCount = lines.size() > 2 ? lines.size() - 2 : 0;
        if (bodyCount === 0) return explainInternal(line0, ' (rejected at execution: no note defined)');

        return explainInternal(line0, ` with ${String(bodyCount)} ${bodyCount === 1 ? 'line' : 'lines'} of text`);
      }

      protected override executeNow(
        system: NoteOnLinkDiagram,
        linesIn: BlocLines,
        _currentPass: ParserPass,
      ): CommandExecutionResult {
        const line0 = linesIn.getFirst()!.getTrimmed().getString();
        // `expandsNewline(false)` returns `this` (BlocLines.java:80-82).
        const lines = linesIn.subExtract(1, 1).removeEmptyColumns();
        if (lines.size() > 0) {
          const arg = this.getStartingPattern().matcher(line0)!;
          return executeInternal(system, arg, lines.toDisplay());
        }
        return CommandExecutionResult.error(NO_NOTE_DEFINED);
      }

      override isEligibleFor(pass: ParserPass): boolean {
        return pass === selectedpass;
      }
    })(getRegexConcatMultiLine(), MultilinesStrategy.KEEP_STARTING_QUOTE, Trim.BOTH, END);
  }

  /** @see CommandFactoryNoteOnLink.java:141-165 */
  createSingleLine(): SingleLineCommand2<NoteOnLinkDiagram> {
    const selectedpass = this.selectedpass;
    return new (class extends SingleLineCommand2<NoteOnLinkDiagram> {
      protected override explainArg(_location: LineLocation | undefined, arg: RegexResult): string {
        return explainInternal(arg, ` labelled "${String(arg.get('NOTE', 0))}"`);
      }

      protected override executeArg(
        diagram: NoteOnLinkDiagram,
        _location: LineLocation | undefined,
        arg: RegexResult,
        _currentPass: ParserPass,
      ): CommandExecutionResult {
        const display = Display.getWithNewlines(diagram.getPragma(), arg.get('NOTE', 0) ?? null);
        return executeInternal(diagram, arg, display);
      }

      override isEligibleFor(pass: ParserPass): boolean {
        return pass === selectedpass;
      }
    })(getRegexConcatSingleLine());
  }
}
