/**
 * The compression slots an `<<icon>>` box leaves: every shape `FtileBoxEmoji#drawU` draws under the `SlotFinder`
 * (`klimt/compress/SlotFinder.java:84-160`) -- the emoji's SVG ellipses and paths and the name's `UText`s -- not the
 * node's box.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/vertical/FtileBoxEmoji.java:134-153
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/drawing/TextLimitFinder.java:82-90
 */
import type { Theme } from '../../../../core/theme.js';
import type { ActivityNodeGeo } from '../../activity-geometry.types.js';
import { EmojiBoxBlock, emojiBoxBlocks } from '../../activity-box-emoji.js';
import { withActivityBox } from '../../activity-box-theme.js';
import { klimtStringBounder } from '../../activity-creole-sheet.js';
import { activityFontSize } from '../../activity-style-defaults.js';
import { measurerAdapterOf } from '../../tiles/gtile-action.js';
import type { StringBounder } from '../../tiles/tile.js';
import { titleDrawnShapes } from './shapes-of-frame-title.js';
import type { CompressShape } from './shapes-of.js';

export function emojiBoxShapes(node: ActivityNodeGeo, bounder: StringBounder, theme: Theme): CompressShape[] {
  const boxTheme = withActivityBox(theme, node.boxStyle);
  const sb = klimtStringBounder(measurerAdapterOf(bounder), {
    family: boxTheme.fontFamily,
    size: activityFontSize(boxTheme, 'activity'),
  });
  const drawn = titleDrawnShapes(
    new EmojiBoxBlock(emojiBoxBlocks(node.label ?? '', boxTheme)),
    { x: node.x, y: node.y },
    sb,
  );
  const texts = drawn.texts.map((text, i): CompressShape => {
    const dim = sb.calculateDimension(text.getFontConfiguration(), text.getText());
    const at = drawn.textOrigins[i]!;
    return { kind: 'text', x: at.x, y: at.y, width: dim.getWidth(), height: dim.getHeight() };
  });
  return [...drawn.shapes, ...texts];
}
