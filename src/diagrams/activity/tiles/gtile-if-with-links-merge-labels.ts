/**
 * The west/east labels of `FtileIfWithLinks`'s merge rhombus (`diamond2`), split out of `gtile-if-with-links.ts`
 * (500-line cap, aar-T6b).
 */
import type { Theme } from '../../../core/theme.js';
import { CreoleMode } from '../../../core/klimt/creole/CreoleMode.js';
import { measureSide, type LabelDim } from './gtile-diamond-inside.js';
import type { StringBounder, Tile } from './tile.js';

/**
 * `tbout1`/`tbout2` (`ConditionalBuilder.java:292-303`): each branch's `getFtile().getOutLinkRendering().getDisplay()`
 * created at the arrow font, `LEFT`, `SIMPLE_LINE` and set as diamond2's west/east. A trailing arrow with no text has
 * `Display.NULL` (`LinkRendering.java:49-53`), a non-null `out` whose block is an empty padded sheet: `text: ''`,
 * `2 * padding` tall (`SheetBlock1.java:196-199`), never drawn.
 * @see net/sourceforge/plantuml/activitydiagram3/ftile/vcompact/cond/ConditionalBuilder.java:292-303
 */
export interface MergeLabels {
  /** `tbout1`: diamond2's west (`createWithLinks`) or north (`createDown`) block. */
  readonly first: LabelDim;
  /** `tbout2`: diamond2's east block. */
  readonly second: LabelDim;
}

/**
 * `FtileIfWithLinks#getYdeltaForLabels` -> `FtileDiamond#getWestEastLabelHeight`: the taller of diamond2's west and
 * east blocks, 0 when diamond2 is the `FtileEmpty` placeholder (one-sided `if`, `hline`).
 * @see net/sourceforge/plantuml/activitydiagram3/ftile/vcompact/cond/FtileIfWithLinks.java:83-88
 * @see net/sourceforge/plantuml/activitydiagram3/ftile/vertical/FtileDiamond.java:117-121
 */
export function ydeltaForLabels(
  hasTwoBranches: boolean,
  style: 'diamond' | 'hline',
  labels: MergeLabels | undefined,
  padding: number,
): number {
  if (style === 'hline' || !hasTwoBranches) return 0;
  if (labels === undefined) return 2 * padding;
  return Math.max(labels.first.height, labels.second.height);
}

/**
 * {@link MergeLabels} of a built `if`: each branch tile's trailing arrow text (`Tile#outLabel`), measured as `create7`
 * does (arrow font, `LEFT`, `SIMPLE_LINE`), else the `Display.NULL` block.
 * @see net/sourceforge/plantuml/activitydiagram3/ftile/vcompact/cond/ConditionalBuilder.java:292-303
 */
export function mergeLabelsOf(tile1: Tile, tile2: Tile, bounder: StringBounder, theme: Theme): MergeLabels {
  const block = (tile: Tile): LabelDim => {
    const label = tile.outLabel?.label ?? '';
    if (label === '') return { text: '', width: 0, height: 2 * (theme.padding ?? 0) };
    return measureSide(label, bounder, theme, CreoleMode.SIMPLE_LINE);
  };
  return { first: block(tile1), second: block(tile2) };
}
