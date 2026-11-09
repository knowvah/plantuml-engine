/**
 * `FtileBoxEmoji`: the box `:<:emoji:> text; <<icon>>` draws instead of `FtileBox` -- no outline, the emoji block and
 * the name block side by side, `MARGIN` apart.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/vertical/FtileBoxEmoji.java:62-176
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/vcompact/VCompactFactory.java:140-141
 */
import type { Theme } from '../../core/theme.js';
import { createEmojiCommand } from '../../core/klimt/creole/command/CommandCreoleEmoji.js';
import { CreoleMode } from '../../core/klimt/creole/CreoleMode.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { activityFontSize } from './activity-style-defaults.js';
import { activityFontConfiguration, drawActionTextBlock, klimtStringBounder } from './activity-creole-sheet.js';
import { activityDisplayBlock } from './activity-text-sheet.js';
import { activityMeasurer } from './activity-string-bounder.js';

/** `FtileBoxEmoji.MARGIN` (java:62). */
const MARGIN = 5;

/** `Stereotype#isIcon` (`Stereotype.java:235-237`): the stereogroup's label is exactly `<<icon>>`. */
export function isIconStereotype(labels: readonly string[] | undefined): boolean {
  return labels !== undefined && labels.length === 1 && labels[0]!.toLowerCase() === 'icon';
}

/** The `emoji` and `name` blocks (java:107-125); `name` is `undefined` for `TextBlockUtils.EMPTY_TEXT_BLOCK`. */
export interface EmojiBoxBlocks {
  readonly emoji: TextBlock;
  readonly name: TextBlock | undefined;
}

/** `FtileBoxEmoji#eventuallyHackSize` (java:128-132). */
function eventuallyHackSize(part1: string, size: string): string {
  return part1.includes('*') ? part1 : part1.replace(':>', `:*${size}>`);
}

/** `label.create(fc, HorizontalAlignment.LEFT, skinParam)` (java:109,120-121). */
function block(text: string, theme: Theme, fontSize: number): TextBlock {
  return activityDisplayBlock(text, theme, {
    fontConfiguration: activityFontConfiguration(theme, fontSize, 'activity'),
    horizontalAlignment: HorizontalAlignment.LEFT,
    creoleMode: CreoleMode.FULL,
  });
}

/** The `FtileBoxEmoji` constructor (java:100-126); `theme` is the box's own (`withActivityBox`). */
export function emojiBoxBlocks(label: string, theme: Theme): EmojiBoxBlocks {
  const fontSize = activityFontSize(theme, 'activity');
  const s = label.split('\n')[0]!; // `label.get(0).toString()` (java:111)
  // `commandCreoleEmoji.matchingSize(s, 0)` (java:112); `executeAndAdvance(.., null)` returns the same length (java:117).
  const position = createEmojiCommand().matchingSize(s, 0);
  if (position === 0) return { emoji: block(label, theme, fontSize), name: undefined };
  return {
    emoji: block(eventuallyHackSize(s.substring(0, position), '2'), theme, fontSize),
    name: block(s.substring(position), theme, fontSize),
  };
}

/** `FtileGeometry(width, height, left, inY, outY)` of `calculateDimensionFtile` (java:158-171). */
export interface EmojiBoxGeometry {
  readonly width: number;
  readonly height: number;
  readonly left: number;
  readonly inY: number;
  readonly outY: number;
}

export function emojiBoxGeometry(blocks: EmojiBoxBlocks, stringBounder: StringBounder): EmojiBoxGeometry {
  const dimEmoji = blocks.emoji.calculateDimension(stringBounder);
  const dimName = blocks.name?.calculateDimension(stringBounder);
  const nameWidth = dimName?.getWidth() ?? 0;
  const nameHeight = dimName?.getHeight() ?? 0;
  const width = dimEmoji.getWidth() + MARGIN + nameWidth;
  const height = Math.max(dimEmoji.getHeight(), nameHeight);
  const deltaY = (dimEmoji.getHeight() - nameHeight) / 2;
  const left = dimEmoji.getWidth() / 2;
  return deltaY > 0
    ? { width, height, left, inY: 0, outY: dimEmoji.getHeight() }
    : { width, height, left, inY: -deltaY, outY: dimEmoji.getHeight() - deltaY };
}

/** The klimt `StringBounder` the box is measured and drawn with. */
export function emojiBoxBounder(theme: Theme): StringBounder {
  return klimtStringBounder(activityMeasurer(theme), {
    family: theme.fontFamily,
    size: activityFontSize(theme, 'activity'),
  });
}

/** `FtileBoxEmoji#drawU` (java:134-153): the box as a drawable, so a `LimitFinder` can read its ink. */
export class EmojiBoxBlock implements TextBlock {
  constructor(private readonly blocks: EmojiBoxBlocks) {}

  calculateDimension(stringBounder: StringBounder): XDimension2D {
    const { width, height } = emojiBoxGeometry(this.blocks, stringBounder);
    return new XDimension2D(width, height);
  }

  drawU(ug: UGraphic): void {
    const { emoji, name } = this.blocks;
    if (name === undefined) {
      emoji.drawU(ug);
      return;
    }
    const dimEmoji = emoji.calculateDimension(ug.getStringBounder());
    const dimName = name.calculateDimension(ug.getStringBounder());
    const deltaX = dimEmoji.getWidth() + MARGIN;
    const deltaY = (dimEmoji.getHeight() - dimName.getHeight()) / 2;
    if (deltaY > 0) {
      emoji.drawU(ug);
      name.drawU(ug.apply(new UTranslate(deltaX, deltaY)));
    } else {
      emoji.drawU(ug.apply(new UTranslate(0, -deltaY)));
      name.drawU(ug.apply(new UTranslate(deltaX, 0)));
    }
  }
}

/** `tb.drawU(ug.apply(translate(x, y)))` on the box -- the rendered markup. */
export function drawEmojiBox(
  blocks: EmojiBoxBlocks,
  at: { readonly x: number; readonly y: number },
  theme: Theme,
): string {
  const font = { family: theme.fontFamily, size: activityFontSize(theme, 'activity') };
  return drawActionTextBlock(new EmojiBoxBlock(blocks), at.x, at.y, { theme, font, changes: [] });
}
