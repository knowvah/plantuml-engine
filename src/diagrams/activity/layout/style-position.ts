/**
 * Which builder a construct's diamonds read (aar-T6b): `if`, `while` and `repeat` keep the style builder current at
 * their opener (`InstructionIf.java:104`, `ActivityDiagram3.java:398`, `InstructionRepeat.java:105`), where a `switch`, a
 * `fork` and a `split` read the final one (`FtileFactoryDelegatorSwitch.java:115,133`, `ParallelBuilderFork.java:86`).
 * The layout tags the three tiles with their opener's document line; the walk stamps it on every node it pushes inside
 * the tile, and the renderer reads the diamond theme at it (`activity-theme-at.ts`).
 */
import { activityDiamondStyleAt, type ActivityDiamondStyle } from '../../../core/activity-diamond-style.js';
import { documentThemeOf, themeAtPosition } from '../../../core/activity-theme-at.js';
import { withActivityDiamond } from '../activity-diamond-theme.js';
import { activityLineThickness, bucketKey } from '../activity-style-defaults.js';
import type { Theme } from '../../../core/theme.js';
import type { ActivityNodeGeo } from '../activity-geometry.types.js';
import type { Tile } from '../tiles/tile.js';

interface Opener {
  readonly position: number;
  readonly diamondStyle: ActivityDiamondStyle | undefined;
}

const OPENERS = new WeakMap<Tile, Opener>();

/** The tiles whose own nodes read the final builder, whatever tile holds them. */
const FINAL_BUILDER_KINDS: ReadonlySet<string> = new Set(['gtile-fork', 'gtile-split', 'gtile-switch']);

/** `tile` tagged with the document line of its opener and its diamond style (unchanged for an unlocated opener). */
export function withStylePosition<T extends Tile>(
  tile: T,
  position: number | undefined,
  diamondStyle?: ActivityDiamondStyle,
): T {
  if (position !== undefined) OPENERS.set(tile, { position, diamondStyle });
  return tile;
}

/** What the nodes `tile` pushes are stamped with, `inherited` being the enclosing construct's. */
export function stylePositionWithin(tile: Tile, inherited: StampedStyle | undefined): StampedStyle | undefined {
  const own = OPENERS.get(tile);
  if (own !== undefined) return own;
  return FINAL_BUILDER_KINDS.has(tile.kind) ? undefined : inherited;
}

/** The opener facts stamped on a node: `ActivityNodeGeo.position` and `.diamondStyle`. */
export type StampedStyle = Opener;

/** The node kinds a construct's diamond style reaches. */
const OPENER_BUILDER_KINDS: ReadonlySet<string> = new Set([
  'repeat-start',
  'if-split',
  'repeat-cond',
  'while-header',
  'if-merge',
  'if-label',
  'if-own-label',
]);

/**
 * `theme` as the diamonds of the construct opened at `position` read it. The opener's builder gives the colours, font and
 * wrap width (`FtileFactoryDelegatorIf.java:78-80`, `ConditionalBuilder.java:117-125`), but the diamond's stroke
 * (`FtileDiamondInside.java:88`, `FtileDiamondWIP.java:79-80`) and the test label's stencil stroke
 * (`ConditionalBuilder.java:245-246`) are merged from the CURRENT builder at draw time: the final one.
 */
export function themeAtOpener(theme: Theme, position: number | undefined, diamondStyle?: ActivityDiamondStyle): Theme {
  const at = withActivityDiamond(themeAtPosition(theme, position), diamondStyle);
  if (at === theme) return theme;
  const key = bucketKey('diamond');
  const elements = at.colors.elements;
  const diamond = { ...elements?.[key], lineThickness: activityLineThickness(documentThemeOf(theme), 'diamond') };
  return { ...at, colors: { ...at.colors, elements: { ...elements, [key]: diamond } } };
}

/** What an `if`/`while`/`repeat` opened at `position` with stereogroup `labels` builds its diamonds from. */
export function openerOf(
  theme: Theme,
  position: number | undefined,
  labels: readonly string[] = [],
): { readonly theme: Theme; readonly diamondStyle: ActivityDiamondStyle | undefined } {
  const diamondStyle =
    position === undefined && labels.length === 0 ? undefined : activityDiamondStyleAt(theme, labels, position);
  return { theme: themeAtOpener(theme, position, diamondStyle), diamondStyle };
}

/** `theme` as the diamond `node` reads it: the builder current at its construct's opener, else the document's. */
export function openerBuilderTheme(node: ActivityNodeGeo, theme: Theme): Theme {
  return OPENER_BUILDER_KINDS.has(node.kind) ? themeAtOpener(theme, node.position, node.diamondStyle) : theme;
}
