/**
 * `skinparam arrowMessageAlignment`, the alignment of every activity arrow label: `AbstractFtile#arrowHorizontalAlignment`
 * reads `getHorizontalAlignment(AlignmentParam.arrowMessageAlignment, null, false, null)` off the flat parameter map.
 *
 * Carried on the theme under a symbol key rather than a `Theme` field, so the public `Theme` type stays as it is
 * (`note-style-facts.ts` does the same); a spread of the theme keeps it.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/AbstractFtile.java:108-110
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/skin/SkinParam.java:671-728
 */
import type { PreprocessorResult } from './preprocessor.js';
import type { Theme } from './theme.js';
import { cleanForKeySlow } from './style/mindmap-style-builder.js';

/** `HorizontalAlignment`, as the activity label placer spells it. */
export type ArrowMessageAlignment = 'LEFT' | 'CENTER' | 'RIGHT';

/** `AlignmentParam.arrowMessageAlignment(HorizontalAlignment.LEFT)`. @see AlignmentParam.java:42 */
export const DEFAULT_ARROW_MESSAGE_ALIGNMENT: ArrowMessageAlignment = 'LEFT';

/** The cleaned key of `AlignmentParam.arrowMessageAlignment.name()`, as `SkinParam#getValue` looks it up. */
const ARROW_MESSAGE_ALIGNMENT_KEY = 'arrowmessagealignment';

const ARROW_MESSAGE_ALIGNMENT_THEME_KEY: unique symbol = Symbol('arrow.messageAlignment');

type ThemeWithArrowAlignment = Theme & { readonly [ARROW_MESSAGE_ALIGNMENT_THEME_KEY]?: ArrowMessageAlignment };

/**
 * `SkinParam#getHorizontalAlignment` with a null arrow direction (`:671-728`): `first` is LEFT (`isReverseDefine`
 * false, `:683-694`); `direction`/`reversedirection` match no direction and fall through to `fromString`, which does not
 * know them (`:719`); a value that is not left/center/right is the param's default.
 */
export function arrowMessageAlignmentOf(skinparam: ReadonlyMap<string, string>): ArrowMessageAlignment {
  let value: string | undefined;
  for (const [key, raw] of skinparam) if (cleanForKeySlow(key).includes(ARROW_MESSAGE_ALIGNMENT_KEY)) value = raw;
  const upper = value?.trim().toUpperCase();
  return upper === 'CENTER' || upper === 'RIGHT' ? upper : DEFAULT_ARROW_MESSAGE_ALIGNMENT;
}

/** `theme` carrying the arrow message alignment of `pre`, unchanged when it is the default LEFT. */
export function withArrowMessageAlignment(theme: Theme, pre: Pick<PreprocessorResult, 'skinparam'>): Theme {
  const alignment = arrowMessageAlignmentOf(pre.skinparam);
  return alignment === DEFAULT_ARROW_MESSAGE_ALIGNMENT
    ? theme
    : ({ ...theme, [ARROW_MESSAGE_ALIGNMENT_THEME_KEY]: alignment } as ThemeWithArrowAlignment);
}

/** The alignment on `theme`, LEFT for a hand-built theme or no `skinparam arrowMessageAlignment`. */
export function arrowMessageAlignmentOfTheme(theme: Theme): ArrowMessageAlignment {
  return (theme as ThemeWithArrowAlignment)[ARROW_MESSAGE_ALIGNMENT_THEME_KEY] ?? DEFAULT_ARROW_MESSAGE_ALIGNMENT;
}
