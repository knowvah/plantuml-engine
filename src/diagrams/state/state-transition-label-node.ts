/**
 * snl T4 (#235, D4): the state side of `EntityImageTransitionLabel` (`core/svek/image/EntityImageTransitionLabel.ts`)
 * for a `'transitionLabel'` leaf. Upstream builds the text block with `display.create(fontConfiguration,
 * HorizontalAlignment.CENTER, skinParam)` (`EntityImageTransitionLabel.java:76-79`) in the font of the merged
 * `ARROW + stateDiagram + <<transition>>` style (`:65-70`), the label's own arrow font: `resolveArrowLabelFont`, the
 * resolver the edge label uses (`GraphvizImageBuilder.java:234-235`). The block is the state creole block, so creole
 * and `\n` lines measure and draw as a state label does; each line is centred in the block.
 *
 * @see ~/git/knowvah/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageTransitionLabel.java
 */
import { resolveArrowLabelFont } from '../../core/arrow-label-font.js';
import type { FontSpec, StringMeasurer } from '../../core/measurer.js';
import type { Theme } from '../../core/theme.js';
import { splitDisplayLines } from '../../core/klimt/creole/DisplayNewlines.js';
import {
  drawTransitionLabel,
  transitionLabelDimension,
  TRANSITION_LABEL_SHAPE,
} from '../../core/svek/image/EntityImageTransitionLabel.js';
import type { DotInputNodeShape } from '../../core/graph-layout.js';
import type { State } from './ast.js';
import { renderStateRuns } from './renderer-box-runs.js';
import { STATE_ARROW_BUCKET, stateBucketColor } from './state-bucket-colors.js';
import { cleanStereotypeToken } from '../../core/style-map-tag-cascade.js';
import type { StateNodeGeo } from './state-geo-types.js';
import { stateCreoleBlock, stateCreoleOpts, type StateCreoleBlock } from './state-sizing-creole.js';

/** The label font: family, size and face of the arrow style (`:65-70`). */
function labelFont(theme: Theme): FontSpec {
  const { color: _color, ...font } = resolveArrowLabelFont(theme);
  return font;
}

/** The label's text block (`:76-79`), centred lines in the arrow font. */
export function transitionLabelBlock(state: State, theme: Theme, measurer: StringMeasurer): StateCreoleBlock {
  return stateCreoleBlock(
    splitDisplayLines(state.display).lines,
    labelFont(theme),
    measurer,
    stateCreoleOpts(theme, false),
  );
}

/** The DOT node: the block plus the margin (`:89-98`), `shape=rect` (`:135-138`). */
export function measureTransitionLabelState(
  state: State,
  theme: Theme,
  measurer: StringMeasurer,
): { width: number; height: number; shape: DotInputNodeShape } {
  return { ...transitionLabelDimension(transitionLabelBlock(state, theme, measurer)), shape: TRANSITION_LABEL_SHAPE };
}

/**
 * The label's FontColor: the leaf's stereotype tier first (`withStereotype(<<transition>>)`, `:67-68`; the state arrow
 * tag cascade, `style-cascade-state.ts`), then the `stateDiagram, arrow` bucket, then the arrow font's colour.
 */
function labelColor(node: StateNodeGeo, theme: Theme, fallback: string): string {
  const tag = node.stereotype === undefined ? undefined : cleanStereotypeToken(node.stereotype);
  const tagColor = tag === undefined ? undefined : theme.colors.graph.stateArrowTagCascade?.[tag]?.fontColor;
  return tagColor ?? stateBucketColor(theme, STATE_ARROW_BUCKET, 'font') ?? fallback;
}

/**
 * `drawU` (`:117-133`): the frame, then each line of the block centred in it, in the arrow style's font colour, the
 * colour the edge label takes too (`state-renderer-transitions.ts#buildInlineLabelMarkup`), with the leaf's
 * `<<transition>>` tier above it.
 */
export function renderTransitionLabel(node: StateNodeGeo, theme: Theme): string {
  const block = node.transitionLabel;
  if (block === undefined) return '';
  const font = resolveArrowLabelFont(theme);
  const style = {
    fontFamily: font.family,
    fill: labelColor(node, theme, font.color),
    ...(font.weight === 'bold' ? { fontWeight: '700' as const } : {}),
  };
  return drawTransitionLabel(node.x, node.y, block, (left, top) => {
    let out = '';
    let lineTop = top;
    for (const line of block.lines) {
      out += renderStateRuns(line.runs, left + (block.width - line.width) / 2, lineTop, line.height, style);
      lineTop += line.height;
    }
    return out;
  });
}
