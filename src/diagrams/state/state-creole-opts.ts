/**
 * stdd T3d: the creole options a state text block is measured and drawn with, split out of
 * `state-sizing-creole.ts` (500-line cap). `stateCreoleOpts` is what every state text path hands to
 * `stateCreoleBlock`; `stateHyperlinkStyle` is the hyperlink half of `FontConfiguration.create`.
 */
import type { Theme } from '../../core/theme.js';
import type { SpriteRegistry } from '../../core/sprite-registry.js';
import type { CreoleHyperlinkStyle } from '../../core/svek/image/creole-text-lines.js';

/** `FontConfiguration.create`'s fixed tab size (`FontConfiguration.java:229-231`). */
export const DEFAULT_TAB_SIZE = 8;

export interface StateCreoleOpts {
  readonly wrapWidth?: number;
  readonly tabSize?: number;
  /** stdd T3d -- `creole-text-lines.ts#CreoleHyperlinkStyle`, from {@link stateHyperlinkStyle}. */
  readonly hyperlink?: CreoleHyperlinkStyle;
  /** unwind2-S11: `SkinParam#getSprite`'s map (`Theme#sprites`), so a
   *  `<$sprite>` atom is drawn (`creole-run-sprite.ts`). */
  readonly spriteRegistry?: SpriteRegistry;
}

/**
 * `skinparam tabSize` does NOT apply to state text: `Style#getFontConfiguration`
 * (`Style.java:259-268`) -> `FontConfiguration.create(..)` fixes tabSize 8
 * (`FontConfiguration.java:229-231`); jar-verified `lokija-02-dipe348`.
 * `skinparam wrapWidth` applies ONLY where upstream threads
 * `getStyleState().wrapWidth()` into the text block — the leaf
 * `EntityImageState`/`EntityImageStateEmptyDescription` name and fields
 * (`create8`, `EntityImageStateCommon.java:80-81`,
 * `EntityImageState.java:98-99`). A composite's own title and attribute
 * block go through `Display.create` (`InnerStateAutonom.java:97`,
 * `Entity.java:631`), which is `create7`/`create0` with
 * `LineBreakStrategy.NONE` (`Display.java:614-623`) — no wrap.
 */
/**
 * stdd T3d: a state text's hyperlink fields. The NAME is `Style#getFontConfiguration` (`Style.java:259-267`):
 * the `{root, element, stateDiagram, state, name}` style's `HyperLinkColor` and `HyperlinkUnderlineThickness`
 * (`EntityImageStateCommon.java:72-74`, `InnerStateAutonom.java:91`, `ClusterHeader.java:156-157`). The
 * DESCRIPTION is `FontConfiguration.create(skinParam, style)` (`Entity.java:623`, `FontConfiguration.java:
 * 213-219`): the `description` style's colour, but the legacy `skinParam.useUnderlineForHyperlink()`
 * (`SkinParam.java:1057-1061`) for the stroke. `skinparam hyperlinkColor` is `root { HyperLinkColor }`
 * (`FromSkinparamToStyle.java`, `skinparam-key-handlers-table-c.ts`) and `skinparam hyperlinkUnderline false` is
 * `element { HyperlinkUnderlineThickness 0 }` (`FromSkinparamToStyle.java:251,314-318`).
 */
export function stateHyperlinkStyle(theme: Theme, zone: 'name' | 'description'): CreoleHyperlinkStyle {
  const legacyThickness = theme.hyperlinkUnderline === false ? 0 : DEFAULT_HYPERLINK_UNDERLINE_THICKNESS;
  const graph = theme.colors.graph;
  const color =
    (zone === 'name' ? graph.stateNameHyperlinkColor : graph.stateDescriptionHyperlinkColor) ??
    theme.colors.elements?.['root']?.hyperlinkColor;
  const underlineThickness =
    zone === 'name' ? (graph.stateNameHyperlinkUnderlineThickness ?? legacyThickness) : legacyThickness;
  return { ...(color !== undefined ? { color } : {}), underlineThickness };
}

/** `root { HyperLinkUnderlineThickness 1 }` (`plantuml.skin:8`), `UStroke.simple()` (`SkinParam.java:1059`). */
const DEFAULT_HYPERLINK_UNDERLINE_THICKNESS = 1;

export function stateCreoleOpts(theme: Theme, wrap: boolean, zone: 'name' | 'description' = 'name'): StateCreoleOpts {
  return {
    hyperlink: stateHyperlinkStyle(theme, zone),
    ...(wrap && theme.wrapWidth !== undefined ? { wrapWidth: theme.wrapWidth } : {}),
    tabSize: DEFAULT_TAB_SIZE,
    ...(theme.sprites !== undefined ? { spriteRegistry: theme.sprites } : {}),
  };
}
