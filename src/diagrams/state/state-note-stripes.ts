/**
 * state-note-stripes.ts — the stripes of a state note whose display holds a `{{ … }}` line (sne T1a, issue #168).
 *
 * `EntityImageNote` builds its body with `BodyFactory.create3` (`EntityImageNote.java:114-118`), a `BodyEnhanced2`
 * whose `getArea` (`BodyEnhanced2.java:84-112`) cuts the display into blocks at each separator line, keeps an embed's
 * lines inside the block it opens in (`addOneSingleLineManageEmbedded2`, `:121-134`), and builds each block with
 * `Display#create9`: `CreoleParser#createSheetSlow` turns the embed into ONE `EmbeddedDiagram` atom stripe
 * (`CreoleParser.java:146-170`), stacked by `SheetBlock1#initMap` (`SheetBlock1.java:115-171`). A block after a
 * separator is decorated (`BodyEnhancedAbstract#decorate`) and the blocks stack in a `TextBlockVertical`.
 *
 * The note's box stays on `buildNoteBody` (jar-exact); this module only places what the box holds, so the renderer
 * can draw the atom as the `<image>` `Opale#drawU` draws at `(marginX1, marginY)` (`Opale.java:127`). A note with no
 * embed line has no stripes (D2): {@link noteStripesOf} returns `undefined` and the note keeps its text path.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/cucadiagram/BodyEnhanced2.java:84-134
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/cucadiagram/BodyEnhancedAbstract.java:66-133
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/shape/TextBlockVertical.java
 */
import { Display } from '../../core/klimt/creole/Display.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import { getEmbeddedType } from '../../core/EmbeddedDiagram.js';
import { BodyEnhancedAbstract } from '../../core/cucadiagram/BodyEnhancedAbstract.js';
import { addOneSingleLineManageEmbedded2 } from '../../core/cucadiagram/BodyEnhanced2.js';
import { parseWithNewlines } from '../../core/klimt/creole/DisplayNewlines.js';
import { Pragma } from '../../core/skin/Pragma.js';
import { splitEdgeLabelEmbeds } from '../../core/svek/edge-label-embed.js';
import { stateCreoleBlock, type StateStyledTextLine } from './state-sizing-creole.js';
import { placeStripes, segmentStripes, type StateLabelStripe, type StripeCreoleCtx } from './state-label-style.js';
import { trin } from '../../core/string-utils-trim.js';

/** A separator's title (`BodyEnhancedAbstract#getTitle`), as the state creole block draws it. */
export interface StateNoteRuleTitle {
  readonly lines: readonly StateStyledTextLine[];
  readonly width: number;
  readonly height: number;
}

/**
 * A block separator's rule: the `TextBlockLineBefore` `decorate` wraps the block in (`BodyEnhancedAbstract#decorate`),
 * drawn at `dy` as `UHorizontalLine.infinite(thickness, 1, 1, separator, title)` across the note's stencil.
 */
export interface StateNoteRule {
  readonly kind: 'rule';
  readonly separator: string;
  readonly title?: StateNoteRuleTitle;
  readonly dx: number;
  readonly dy: number;
}

/** One placed stripe of a note body: a label's text or image stripe, or a separator's rule. */
export type StateNoteStripe = StateLabelStripe | StateNoteRule;

/** A note body's stripes, offsets from the body's top-left (before `marginX1`, `marginY`). */
export interface StateNoteStripes {
  readonly width: number;
  readonly height: number;
  readonly items: readonly StateNoteStripe[];
}

/** `decorate`'s `TextBlockUtils.withMargin(block, marginX, 4)` for an untitled separator, and the `4` bottom margin
 *  of the titled one (`BodyEnhancedAbstract.java` `decorate`). */
const SEPARATOR_MARGIN_Y = 4;
/** `decorate`'s titled `withMargin(block, marginX, 6, dimTitle.getHeight() / 2, 4)`: `marginX2`. */
const TITLED_MARGIN_X2 = 6;
/** `TextBlockLineBefore#calculateDimension`'s `dim.atLeast(dimTitle.getWidth() + 8, …)`. */
const TITLE_WIDTH_PAD = 8;

interface NoteBlock {
  /** `separator`: `0` for the first block, else the separating line's first character. */
  readonly separator: string | undefined;
  /** `getTitle(s)`: `null` for a separator of 4 characters or fewer, else its trimmed inside. */
  readonly title: string | undefined;
  readonly lines: readonly string[];
}

/** `BodyEnhancedAbstract#getTitle` (`s.length() <= 4` → `null`, else `StringUtils.trin(s.substring(2, len - 2))`). */
function separatorTitle(s: string): string | undefined {
  if (s.length <= 4) return undefined;
  return trin(s.slice(2, s.length - 2));
}

/** `BodyEnhanced2#getArea`'s loop (`BodyEnhanced2.java:84-109`), on the note's display lines. */
function noteBlocks(lines: readonly string[]): NoteBlock[] {
  const blocks: NoteBlock[] = [];
  let separator: string | undefined;
  let title: string | undefined;
  let display = Display.empty();
  let i = 0;
  while (i < lines.length) {
    const s = lines[i]!;
    i++;
    if (getEmbeddedType(s) !== null) {
      const consumed = addOneSingleLineManageEmbedded2(lines, i, display.add(s));
      display = consumed.display;
      i = consumed.index;
    } else if (BodyEnhancedAbstract.isBlockSeparator(s)) {
      blocks.push({ separator, title, lines: display.asList().map(String) });
      separator = s.charAt(0);
      title = separatorTitle(s);
      display = Display.empty();
    } else {
      display = display.add(s);
    }
  }
  blocks.push({ separator, title, lines: display.asList().map(String) });
  return blocks;
}

/** What the note's creole needs: its font, the measurer, and the creole options `buildRenderLines` passes. */
export type NoteStripeCtx = StripeCreoleCtx;

/** `EntityImageNote.java:111`: the body's alignment is the note style's, `root { HorizontalAlignment left }`
 *  (`plantuml.skin:11`); `TextBlockVertical(blocks, align)` and each block's sheet take the same one. */
const BODY_ALIGN = HorizontalAlignment.LEFT;

/** One block placed at its own top: its stripes (offsets from the block's top), its rule, and its dimension. */
interface PlacedBlock {
  readonly items: readonly StateNoteStripe[];
  readonly width: number;
  readonly height: number;
}

function shift(items: readonly StateNoteStripe[], dy: number): StateNoteStripe[] {
  return items.map((s) => ({ ...s, dy: s.dy + dy }));
}

function ruleTitle(title: string, ctx: NoteStripeCtx): StateNoteRuleTitle {
  // `Display.getWithNewlines(pragma, s).create(titleConfig, LEFT, …)`: the note's own font.
  const lines = parseWithNewlines(Pragma.createEmpty(), title)!.lines;
  const block = stateCreoleBlock(lines, ctx.font, ctx.measurer, ctx.creole);
  return { lines: block.lines, width: block.width, height: block.height };
}

/** `BodyEnhancedAbstract#decorate`: no separator → `withMargin(block, 0, 0)`; untitled → a rule over
 *  `withMargin(block, 0, 4)`; titled → `withMargin(TextBlockLineBefore(withMargin(block, 0, 6, h/2, 4), …), 0, 0, h/2,
 *  0)`, the rule at the inner block's top. `getMarginX()` is 0 (`BodyEnhanced2.java:73-75`). */
function decorate(block: PlacedBlock, nb: NoteBlock, ctx: NoteStripeCtx): PlacedBlock {
  if (nb.separator === undefined) return block;
  if (nb.title === undefined) {
    const rule: StateNoteRule = { kind: 'rule', separator: nb.separator, dx: 0, dy: 0 };
    return {
      items: [rule, ...shift(block.items, SEPARATOR_MARGIN_Y)],
      width: block.width,
      height: block.height + 2 * SEPARATOR_MARGIN_Y,
    };
  }
  const title = ruleTitle(nb.title, ctx);
  const half = title.height / 2;
  const rule: StateNoteRule = { kind: 'rule', separator: nb.separator, title, dx: 0, dy: half };
  const innerHeight = block.height + half + SEPARATOR_MARGIN_Y;
  return {
    items: [...shift(block.items, 2 * half), rule],
    width: Math.max(block.width + TITLED_MARGIN_X2, title.width + TITLE_WIDTH_PAD),
    height: half + Math.max(innerHeight, title.height),
  };
}

/**
 * The note body's stripes when one of its lines opens an embed, else `undefined` (D2). Each block's lines run through
 * {@link segmentStripes} (text through the state creole block, an embed as its atom), the block is decorated, and the
 * blocks stack as `TextBlockVertical(blocks, align)` does: one under the other, LEFT-aligned.
 */
export function noteStripesOf(lines: readonly string[], ctx: NoteStripeCtx): StateNoteStripes | undefined {
  if (splitEdgeLabelEmbeds(lines) === undefined) return undefined;
  const items: StateNoteStripe[] = [];
  let width = 0;
  let y = 0;
  for (const nb of noteBlocks(lines)) {
    const segments = splitEdgeLabelEmbeds(nb.lines) ?? [{ kind: 'text' as const, lines: nb.lines }];
    const block = decorate(placeStripes(segmentStripes(segments, ctx), BODY_ALIGN), nb, ctx);
    items.push(...shift(block.items, y));
    width = Math.max(width, block.width);
    y += block.height;
  }
  return { width, height: y, items };
}
