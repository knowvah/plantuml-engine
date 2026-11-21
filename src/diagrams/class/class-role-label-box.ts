/**
 * The DOT box reserved for one end's quantifier-or-role, split out of
 * `class-layout-edge-labels.ts` (500-line cap).
 */
import type { StringMeasurer } from '../../core/measurer.js';
import {
  computeQuantifierBox,
  CLASS_ATTRIBUTE_ICON_SIZE_DEFAULT,
  type QuantifierBox,
} from '../../core/edge-label-box.js';
import { createRoleBlock } from '../../core/svek/RoleLabels.js';

/**
 * The box graphviz reserves for one end's quantifier-or-role. A role standing
 * in for the quantifier (`isRole`) is reserved as its MERGED block
 * (`appendTable(startTailRoleText.calculateDimension(...))`,
 * `SvekEdge.java:477-481`): the visibility icon block `RoleLabels#create`
 * merges LEFT of the text adds its width and maxes its height
 * (`XDimension2D#mergeLR`), on the text with the character stripped.
 * @see svek/RoleLabels.java#create (upstream a5731db447f)
 */
export function reservedLabelBox(
  text: string,
  isRole: boolean,
  font: { family: string; size: number },
  ctx: { measurer: StringMeasurer; classAttributeIconSize: number | undefined },
): QuantifierBox {
  if (!isRole) return computeQuantifierBox(text, font, ctx.measurer);
  const block = createRoleBlock(text, ctx.classAttributeIconSize ?? CLASS_ATTRIBUTE_ICON_SIZE_DEFAULT);
  const box = computeQuantifierBox(block.text, font, ctx.measurer);
  if (block.icon === undefined) return box;
  return {
    ...box,
    reservedWidth: box.reservedWidth + block.icon.width,
    reservedHeight: Math.max(box.reservedHeight, block.icon.height),
  };
}
