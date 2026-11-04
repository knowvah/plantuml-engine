/**
 * stdd T5a: a composite title's placement by the `state.name` style's `HorizontalAlignment`
 * (`ClusterHeader.java:181-183`, `InnerStateAutonom.java:91`, `HorizontalAlignment.java:79-90`), split
 * out of `renderer-composite-box.ts` (500-line cap).
 */
import type { StateNodeGeo, StateTextLine } from './state-geo-types.js';
import type { Theme } from '../../core/theme.js';
import { ENTITY_IMAGE_MARGIN as MARGIN } from '../../core/svek/IEntityImage.js';

/** The creole block's width: the widest line (`XDimension2D#mergeTB`). */
export function textBlockWidth(lines: readonly StateTextLine[]): number {
  let out = 0;
  for (const ln of lines) if (ln.width > out) out = ln.width;
  return out;
}

/** `state.name { HorizontalAlignment }` (`plantuml.skin:284` center), a skin's root included. */
export function stateNameAlignment(theme: Theme): 'left' | 'center' | 'right' {
  return theme.colors.graph.stateNameHorizontalAlignment ?? 'center';
}

/** `HorizontalAlignment#draw` (`HorizontalAlignment.java:79-90`) over the cluster's width with `xpadding = MARGIN`. */
export function clusterTitleBlockX(node: StateNodeGeo, blockWidth: number, align: 'left' | 'center' | 'right'): number {
  if (align === 'left') return MARGIN;
  if (align === 'right') return node.width - blockWidth - MARGIN;
  return (node.width - blockWidth) / 2;
}

/** Each line inside the block, by the `name` style's alignment (`SheetBlock1`'s per-stripe placement). */
export function titleLineX(
  node: StateNodeGeo,
  lines: readonly StateTextLine[],
  blockX: number,
  theme: Theme,
): (ln: StateTextLine) => number {
  const align = stateNameAlignment(theme);
  const blockWidth = textBlockWidth(lines);
  return (ln) => {
    if (align === 'left') return node.x + blockX;
    if (align === 'right') return node.x + blockX + blockWidth - ln.width;
    return node.x + blockX + (blockWidth - ln.width) / 2;
  };
}
