/**
 * state-embed-draw.ts — the core-drawn pieces of a state label's or note's stripes (sne D3, issue #168).
 *
 * An embed stripe is one `EmbeddedDiagram` atom whose `drawU` draws a `UImageSvg` (`EmbeddedDiagram.java:165-174`);
 * labels (`state-renderer-transitions.ts#buildLabelStripesMarkup`, ele T1c) and notes (`renderer-note.ts`) both draw
 * it through {@link drawEmbedStripe}. A note's block separator is the `UHorizontalLine` a `TextBlockLineBefore` draws
 * (`BodyEnhancedAbstract#decorate`) inside the `UGraphicStencil` `EntityImageNote#drawU` opens over the note
 * (`EntityImageNote.java:207`, stencil `0 .. width` at `:366-372`), drawn by {@link drawNoteRule}.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/EmbeddedDiagram.java:165-213
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/shape/TextBlockLineBefore.java:81-95
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/shape/UHorizontalLine.java:83-166
 */
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import type { Paint } from '../../core/paint.js';
import type { Stencil } from '../../core/klimt/creole/Stencil.js';
import { UGraphicSvg } from '../../core/klimt/drawing/svg/u-graphic-svg.js';
import { basicSvgOption } from '../../core/klimt/drawing/svg/svg-graphics.js';
import { UGraphicStencil } from '../../core/klimt/drawing/UGraphicStencil.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import { UStroke } from '../../core/klimt/UStroke.js';
import { Fore } from '../../core/klimt/Fore.js';
import { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import { UHorizontalLine } from '../../core/klimt/shape/UHorizontalLine.js';
import { extractFlatContent } from '../../core/klimt/document-shell.js';

/** Neither piece draws text through this bounder: the atom's nested document measured itself, and a rule's title is
 *  drawn by the state text emitter (see {@link drawNoteRule}). */
const NO_TEXT_BOUNDER = { calculateDimension: (): { width: number } => ({ width: 0 }) };

/** `TextBlockLineBefore`'s `UHorizontalLine.infinite(defaultThickness, 1, 1, …)`: `skipAtStart` = `skipAtEnd` = 1
 *  (`TextBlockLineBefore.java:84,93`). */
const RULE_SKIP = 1;

function svgOf(draw: (ug: ReturnType<typeof UGraphicSvg.build>) => void): string {
  const ug = UGraphicSvg.build(0, basicSvgOption(), '$version$', NO_TEXT_BOUNDER);
  draw(ug);
  return extractFlatContent(ug.getSvgString()).body;
}

/** An embed stripe's atom drawn at `(x, y)`: `SheetBlock1#drawU`'s translate (`SheetBlock1.java:224-232`), then the
 *  atom's own `drawU`, a `UImageSvg` (`EmbeddedDiagram.java:169-174`). */
export function drawEmbedStripe(block: TextBlock, x: number, y: number): string {
  return svgOf((ug) => block.drawU(ug.apply(new UTranslate(x, y))));
}

/** `TextBlockLineBefore`'s `UHorizontalLine.infinite(defaultThickness, 1, 1, separator, title)`. */
export interface NoteRuleSpec {
  readonly separator: string;
  /** The note style's `LineThickness` (`BodyEnhancedAbstract#getDefaultThickness`), the `__` rule's width. */
  readonly defaultThickness: number;
  /** The title's dimension, when the separator has one: the line splits around it (`UHorizontalLine.java:91-96`). */
  readonly title?: { readonly width: number; readonly height: number };
}

/** A title stand-in that only measures: the line halves read its width (`UHorizontalLine.java:91-96`), and the title
 *  text itself is drawn by the state emitter at {@link noteRuleTitleOrigin}, as every other state note run is. */
function measuringTitle(dim: { readonly width: number; readonly height: number }): TextBlock {
  return { calculateDimension: () => new XDimension2D(dim.width, dim.height), drawU: () => undefined };
}

/** A rule's markup split where its title goes: `drawLineInternal` draws the first half, the title, then the second
 *  half (`UHorizontalLine.java:92-96`). Without a title, `after` is empty. */
export interface NoteRuleMarkup {
  readonly before: string;
  readonly after: string;
}

/** Each `drawHLine` call draws the same number of `ULine`s (one, two for `=`; `UHorizontalLine.java:140-145`), so a
 *  titled rule's lines split evenly into its two halves. */
const LINE_ELEMENT = /<line\b[^>]*\/>/g;

/**
 * A note's separator rule. `note` is the note's box; `y` the rule's offset from the note's top. The stencil spans the
 * note (`EntityImageNote#getStartingX/getEndingX`, `:366-372`) and keeps only the vertical part of later translates
 * (`AbstractUGraphicHorizontalLine.java:74-75`), so the line runs from `note.x + RULE_SKIP` to
 * `note.x + width - RULE_SKIP`. `UStroke.simple()` is the stencil's default stroke (`EntityImageNote.java:207`).
 */
export function drawNoteRule(
  rule: NoteRuleSpec,
  note: { readonly x: number; readonly y: number; readonly width: number },
  y: number,
  color: Paint,
): NoteRuleMarkup {
  const stencil: Stencil = { getStartingX: () => 0, getEndingX: () => note.width };
  const title = rule.title === undefined ? null : measuringTitle(rule.title);
  const body = svgOf((ug) => {
    const onNote = UGraphicStencil.create(
      ug.apply(new UTranslate(note.x, note.y)).apply(new Fore(color)),
      stencil,
      UStroke.simple(),
    );
    UHorizontalLine.infinite(rule.defaultThickness, RULE_SKIP, RULE_SKIP, rule.separator, title).drawMe(
      onNote.apply(new UTranslate(0, y)),
    );
  });
  if (title === null) return { before: body, after: '' };
  const lines = body.match(LINE_ELEMENT) ?? [];
  const half = lines.length / 2;
  return { before: lines.slice(0, half).join(''), after: lines.slice(half).join('') };
}

/** `UHorizontalLine#drawTitleInternal` (`UHorizontalLine.java:154-166`): the title's top-left, centred between the
 *  skipped stencil ends and raised by half its height plus 0.5. */
export function noteRuleTitleOrigin(
  title: { readonly width: number; readonly height: number },
  note: { readonly x: number; readonly y: number; readonly width: number },
  y: number,
): { x: number; y: number } {
  const startingX = note.x + RULE_SKIP;
  const endingX = note.x + note.width - RULE_SKIP;
  return { x: startingX + (endingX - startingX - title.width) / 2, y: note.y + y - title.height / 2 - 0.5 };
}
