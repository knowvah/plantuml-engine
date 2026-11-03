/**
 * The class and object colour tiers that read the style engine's merged values (dss T3b, D2): the buckets
 * `style-element-scope.ts` writes into `theme.colors.elements`. Split out of `renderer-classifier-colors.ts`
 * (500-line cap), which re-imports them.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageClass.java:162-163
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageClassHeader.java:79-80
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageObject.java:123-124
 */
import type { Theme } from '../../core/theme.js';
import { resolveColorToSvgHex } from '../../core/klimt/color/HColorSet.js';
import { isTransparentColor } from '../../core/paint.js';
import type { Paint } from '../../core/paint.js';
import { PAINT_NONE } from '../../core/svg.js';
import { defaultTheme } from '../../core/theme.js';
import { OBJECT_SKIN_DEFAULT_BUCKET } from '../../core/object-skin-default.js';

/**
 * dss T3b: the terminal fill of an `object`/`map`/`json` box. Their signature is `{root, element, objectDiagram,
 * <kind>}` (`EntityImageObject.java:123-124`, `EntityImageMap.java:137-138`, `EntityImageJson.java:139-140`), which
 * holds neither `classDiagram` nor `class_`, so `classCascadeBackground` (built from `CLASS_SNAMES`) must not reach
 * it: `classDiagram { BackgroundColor }` leaves an object `#F1F1F1` (jar, `object__cascade-bg-diag`). The
 * `objectDiagram`/`element`/`root` declarations arrive through the kind's `elements` bucket (`style-element-scope.ts`
 * `classRows`), read first by the caller; this is the skin default below it.
 */
export function objectDefaultBackground(theme: Theme): Paint {
  // `classBackground` is the skin default, or what `skinparam classBackgroundColor` (`classBackgroundExplicit`) or a
  // `class { BackgroundColor }` style (the `class` bucket) wrote: both are `class_`-signed, so an object keeps the
  // skin default instead (jar: `ob-skin-classbg`, `ob-style-class`, object `#F1F1F1`). Dark mode's seed is neither.
  const classOnly =
    theme.colors.graph.classBackgroundExplicit === true || theme.colors.elements?.['class']?.background !== undefined;
  if (!classOnly) return theme.colors.graph.classBackground;
  return theme.colors.elements?.[OBJECT_SKIN_DEFAULT_BUCKET]?.background ?? defaultTheme.colors.graph.classBackground;
}

/** The class box's own bucket (`EntityImageClass.java:162-163`, `{root,element,classDiagram,class_}`). */
export const CLASS_BUCKET = 'class';
/** The class header's bucket (`EntityImageClassHeader.java:79-80`, the class signature plus `header`). */
export const CLASS_HEADER_BUCKET = 'class.header';

/**
 * dss T3b: a bucket colour as a drawn `Paint`. A solid value goes through `HColorSet` like every other tier here;
 * `transparent` is the jar's `fill="none"` (`HColors.transparent()`), not the `#00000000` the flat cascades resolve
 * it to (`class__d3-theme-only`'s `root { BackgroundColor transparent }`); a gradient is already a `Paint`.
 */
function scopedPaint(value: Paint): Paint {
  if (typeof value !== 'string') return value;
  return isTransparentColor(value) ? PAINT_NONE : resolveColorToSvgHex(value);
}

/**
 * dss T3b (D2): the merged `LineColor`/`BackGroundColor`/`FontColor` the style engine resolved for a class box,
 * `theme.colors.elements['class']` (`style-element-scope.ts#classRows`). It is the value of every declaration in
 * declaration order, so `skinparam classBorderColor` after a `root { LineColor }` beats it as the jar does, which
 * the flat `classCascade*` fields (one StyleMap, skinparam apart) cannot say. They stay below as the fallback for a
 * source the gate does not open, and for a value equal to the skin default.
 */
export function classScopedColor(theme: Theme, bucket: string, role: 'background' | 'border'): Paint | undefined {
  const value = theme.colors.elements?.[bucket]?.[role];
  return value === undefined ? undefined : scopedPaint(value);
}

/** {@link classScopedColor} for the class header's background (`EntityImageClass#getStyleHeader`). */
export function classHeaderScopedBackground(theme: Theme): Paint | undefined {
  return classScopedColor(theme, CLASS_HEADER_BUCKET, 'background');
}
