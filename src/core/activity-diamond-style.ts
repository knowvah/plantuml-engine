/**
 * An `if`/`while`/`repeat` diamond's ONE merged style (aar-T6b).
 *
 * `FtileFactoryDelegatorIf#createIf` merges `getDefaultStyleDefinitionDiamond().withTOBECHANGED(stereotype)
 * .getMergedStyle(currentStyleBuilder)` (`FtileFactoryDelegatorIf.java:79-80`), `FtileFactoryDelegatorWhile` and `...Repeat`
 * the same without a stereotype (`:79`, `:95`), each from the builder its instruction kept at its opener
 * (`InstructionIf.java:104`, `ActivityDiagram3.java:398`, `InstructionRepeat.java:105`). `ConditionalBuilder` takes the test
 * label's `FontConfiguration` off it (`ConditionalBuilder.java:117-118`), face and style included, which the flat readers
 * (`activity-text-style.ts`) hold no tier for. The resolver hangs on the theme the way `activity-box-style.ts#boxStyleAt` does.
 */
import type { Theme } from './theme.js';
import type { PreprocessorResult } from './preprocessor.js';
import { builderAtPosition, lastDeclarationPosition } from './activity-box-builder-at.js';
import { builderOf, stereotypeOf } from './activity-box-style.js';
import type { Style } from './style/Style.js';
import type { StyleBuilder } from './style/StyleBuilder.js';
import { StyleSignatureBasic } from './style/StyleSignatureBasic.js';

/** `FtileFactoryDelegator.getDefaultStyleDefinitionDiamond`. @see FtileFactoryDelegator.java:79-81 */
const ACTIVITY_DIAMOND_SIGNATURE = StyleSignatureBasic.of('root', 'element', 'activityDiagram', 'activity', 'diamond');

/** `FtileFactoryDelegator.getDefaultStyleDefinitionArrow`. @see FtileFactoryDelegator.java:83-85 */
const ACTIVITY_ARROW_SIGNATURE = StyleSignatureBasic.of('root', 'element', 'activityDiagram', 'arrow');

/** `StyleSignatureBasic.activityArrow`, the signature of the arrow's `Worm`. @see StyleSignatureBasic.java:275-277 */
const ACTIVITY_ARROW_STROKE_SIGNATURE = StyleSignatureBasic.of(
  'root',
  'element',
  'activityDiagram',
  'activity',
  'arrow',
);

/**
 * A diamond's merged style. `tiers` is false where the style comes from the final builder with no stereotype: the flat
 * tiers already hold its colours, size and face, and only what they have no tier for (the font style) is read off `style`.
 */
export interface ActivityDiamondStyle {
  readonly style: Style;
  readonly tiers: boolean;
  /** The arrow style of the same builder (`FtileFactoryDelegatorIf.java:78`, `FtileFactoryDelegator.java:83-84`). */
  readonly arrow: Style | undefined;
  /** The style the arrow STROKE reads: `activityArrow()` nests `activity` (`Snake.java:139`). */
  readonly arrowStroke: Style | undefined;
}

/** The diamond style of a construct opened at `position` (`undefined`: the document's final builder). */
export type ActivityDiamondStyleResolver = (
  labels: readonly string[],
  position: number | undefined,
) => ActivityDiamondStyle | undefined;

const DIAMOND_STYLE_KEY: unique symbol = Symbol('activity.diamondStyleAt');

type ThemeWithDiamondStyle = Theme & { readonly [DIAMOND_STYLE_KEY]?: ActivityDiamondStyleResolver };

/** `withTOBECHANGED(stereotype).getMergedStyle(builder)` for `labels` (`stereotypeOf`: none is "no change"). */
function diamondStyleFrom(builder: StyleBuilder, labels: readonly string[]): Style | undefined {
  return ACTIVITY_DIAMOND_SIGNATURE.withTOBECHANGED(stereotypeOf(labels)).getMergedStyle(builder);
}

/** `theme` carrying the diamond-style resolver over `pre`'s declarations. */
export function withActivityDiamondStyle(theme: Theme, pre: PreprocessorResult): Theme {
  let final: StyleBuilder | null | undefined;
  const finalBuilder = (): StyleBuilder | null => (final === undefined ? (final = builderOf(pre)) : final);
  // As `activity-box-style.ts#withActivityBoxStyle`: no declaration at or after the opener, so its builder IS the final one.
  const lastDeclaration = lastDeclarationPosition(pre);
  const resolver: ActivityDiamondStyleResolver = (labels, position) => {
    const atFinal = position === undefined || lastDeclaration === undefined || lastDeclaration < position;
    const builder = atFinal ? finalBuilder() : builderAtPosition(pre, position);
    const style = builder === null ? undefined : diamondStyleFrom(builder, labels);
    if (style === undefined || builder === null) return undefined;
    return {
      style,
      tiers: !atFinal || labels.length > 0,
      arrow: ACTIVITY_ARROW_SIGNATURE.getMergedStyle(builder),
      arrowStroke: ACTIVITY_ARROW_STROKE_SIGNATURE.getMergedStyle(builder),
    };
  };
  return { ...theme, [DIAMOND_STYLE_KEY]: resolver } as ThemeWithDiamondStyle;
}

/** The merged diamond style of a construct opened at `position` with stereogroup `labels`, absent on a hand-built theme. */
export function activityDiamondStyleAt(
  theme: Theme,
  labels: readonly string[],
  position: number | undefined,
): ActivityDiamondStyle | undefined {
  return (theme as ThemeWithDiamondStyle)[DIAMOND_STYLE_KEY]?.(labels, position);
}
