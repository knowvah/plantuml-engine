/**
 * The skin default fill of an `object`/`map`/`json` box under `skinparam mode dark` (dss T3b, D8).
 *
 * Their signature `{root, element, objectDiagram, <kind>}` (`EntityImageObject.java:123-124`) takes `root`'s
 * `BackGroundColor`, which `plantuml.skin:568` darkens to `#313139`. The flat theme seeds that value into
 * `graph.classBackground` unless `skinparam classBackgroundColor` is set, and a class-signed value must not reach an
 * object (`renderer-classifier-scoped-colors.ts#objectDefaultBackground`), so the dark default is kept apart here,
 * in a `theme.colors.elements` bucket (D2a's device, no new field).
 *
 * @see ~/git/plantuml/src/main/resources/skin/plantuml.skin:568
 */
import type { ElementColors } from './theme.js';
import { DARK_MODE_DEFAULTS } from './theme-dark.js';

/** The bucket {@link objectSkinDefaults} writes. */
export const OBJECT_SKIN_DEFAULT_BUCKET = 'object.default';

/** `SkinParam#isDark`. @see SkinParam.java:114-116 */
const MODE_KEY = 'mode';
const MODE_DARK = 'dark';

export function objectSkinDefaults(
  skinparam: ReadonlyMap<string, string>,
): Partial<Record<string, Pick<ElementColors, 'background'>>> {
  if (skinparam.get(MODE_KEY)?.toLowerCase() !== MODE_DARK) return {};
  return { [OBJECT_SKIN_DEFAULT_BUCKET]: { background: DARK_MODE_DEFAULTS.classBackground } };
}
