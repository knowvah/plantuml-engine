/**
 * The `<<#color>>` fills of a compound's own diamonds, resolved once per tile the way each upstream builder falls
 * back (`Branch#getColor`, `Colors#mergeWith`, `Stereogroup#getHColor`), so the walkers copy a value and never decide.
 * Absent members take the diamond style's `BackGroundColor` at render time.
 */
import type { ActivityIf, ActivityRepeat, ActivitySwitch, ActivityWhile } from '../ast.js';
import type { DiamondColors } from '../tiles/tile.js';
import type { IfBuilderResult } from './conditional-builder.js';

/** Mutates in place and returns the tile, like `withSwimlane`; nothing to record leaves it untouched. */
export function withDiamondColors<T extends { diamondColors?: DiamondColors }>(tile: T, colors: DiamondColors): T {
  if (colors.open !== undefined || colors.close !== undefined || colors.branches?.some((c) => c !== undefined) === true)
    tile.diamondColors = colors;
  return tile;
}

/** `{ color }` when set: the geo node field `inlineBack` reads. */
export function colorSpread(color: string | undefined): { color?: string } {
  return color === undefined ? {} : { color };
}

/**
 * `FtileFactoryDelegatorIf#createIf`: `backColor` is the `if`'s (`:81-83`), which every long-horizontal diamond falls
 * back to (`FtileIfLongHorizontal.java:178`) and a long-vertical one takes whole (`FtileIfLongVertical.java:148,168`,
 * no `endif` read). The closing diamond is `branch2.getColor() ?? backColor` (`ConditionalBuilder.java:300`), where
 * `branch2` is the `else` branch holding `endif`'s colours (`InstructionIf.java:196`, `Branch.java:204-207`) -- unless
 * `createDown` swapped the branches (`ConditionalBuilder.java:157-173`), when it is the `then` branch, the `if`'s own.
 * @see net/sourceforge/plantuml/activitydiagram3/ftile/vcompact/cond/ConditionalBuilder.java:179-189,300
 */
export function ifDiamondColors(node: ActivityIf, dispatch: IfBuilderResult): DiamondColors {
  const open = node.color;
  if (dispatch.builder === 'long-vertical') return { open };
  if (dispatch.builder === 'long-horizontal')
    return { open, branches: [open, ...node.elseIfBranches.map((branch) => branch.color ?? open)] };
  const swapped = dispatch.builder === 'down' && dispatch.swapped === true;
  return { open, close: swapped ? open : (node.endColor ?? open) };
}

/** @see net/sourceforge/plantuml/activitydiagram3/ftile/vcompact/FtileFactoryDelegatorWhile.java:81-83 */
export function whileDiamondColors(node: ActivityWhile): DiamondColors {
  return own(node.color);
}

/** A diamond tile's own fill, `open` by convention. */
export function own(color: string | undefined): DiamondColors {
  return { open: color };
}

/**
 * `diamondColor1`/`diamondColor2`: the `repeat while` diamond (and the break diamond) falls back to `diamondColor1`
 * only when `repeat while` carries no stereogroup at all.
 * @see net/sourceforge/plantuml/activitydiagram3/ftile/vcompact/FtileFactoryDelegatorRepeat.java:80-100
 */
export function repeatDiamondColors(node: ActivityRepeat): { entry: DiamondColors; condition: DiamondColors } {
  return { entry: own(node.color), condition: own(node.whileStereogroup === true ? node.whileColor : node.color) };
}

/**
 * `colors.mergeWith(endColors)` puts `endswitch`'s over `switch`'s (`InstructionSwitch.java:123-124`); a one-`case`
 * switch's only branch holds `endColors` as its special (`:179-183`), which `getDiamond1` then prefers too
 * (`FtileFactoryDelegatorSwitch.java:137-139`).
 */
export function switchDiamondColors(node: ActivitySwitch): { first: DiamondColors; last: DiamondColors } {
  const last = node.endColor ?? node.color;
  return { first: own(node.cases.length === 1 ? last : node.color), last: own(last) };
}
