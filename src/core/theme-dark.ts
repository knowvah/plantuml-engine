/**
 * `skinparam mode dark` default-color table (cdd-T33).
 *
 * Upstream mechanism: `SkinParam.isDark` (`skin/SkinParam.java:114-116`,
 * `"dark".equalsIgnoreCase(skinParam.getValue("mode"))`) switches
 * `TitledDiagram#muteColorMapper` (`TitledDiagram.java:291-294`) to
 * `ColorMapper.DARK_MODE` (`klimt/color/ColorMapper.java:68-72`), whose
 * `fromColorSimple` calls `simple.darkSchemeTheme()`
 * (`klimt/color/HColorSimple.java:236-239` — returns the color's baked-in
 * `.dark` field, or itself unchanged if none was ever set via
 * `withDark(...)`). The dark variant is baked in at STYLE-PARSE time
 * (`style/parser/StyleParser.java`'s `@media` token, `:277-283,314-324`),
 * from `resources/skin/plantuml.skin`'s literal
 * `@media (prefers-color-scheme:dark) { ... }` block (`:563-776`).
 *
 * The port's style parser DOES read `@media` (`style/parser/StyleParser.ts`, `style/ValueImpl.ts`'s paired
 * `value1`/`value2`), and sequence takes its dark colours from the builder (`StyleBuilder.ts#setDarkScheme`, smc T2a).
 * The engines that read `theme.colors` take their ELEMENT colours from the builder too
 * (`style-element-scope.ts`, smc D2: every source under `mode dark`, no gate). This table keeps the scalar defaults no
 * element signature reaches, read directly from the block for exactly the defaults `skinparam-theme-builder.ts#buildThemePartial`
 * gates on `SkinparamAccumulator.mode === 'dark'`. An EXPLICIT skinparam or
 * `<style>` value for the SAME field always wins (mirrors
 * `HColorSimple#darkSchemeTheme`: a color with no baked `.dark` variant is
 * untouched by `ColorMapper.DARK_MODE`) — enforced by the `??=` gate at the
 * call site, not by this module.
 */
import { resolveColorToSvgHex } from './klimt/color/HColorSet.js';

export const DARK_MODE_DEFAULTS = {
  /**
   * `document { BackGroundColor #1B1B1B }` — plantuml.skin:572. The root SVG
   * canvas background: `TitledDiagram#calculateBackColor`'s merged
   * `{root, document, <diagramType>}` style signature
   * (`TitledDiagram.java:279-289`) — `document`'s own BackGroundColor
   * overrides `root`'s for this specific (more specific) signature.
   */
  background: '#1B1B1B',
  /**
   * `root { LineColor #e7e7e7 }` — plantuml.skin:567. The general
   * stroke/border default (`theme.colors.border`) — routed through the
   * GENERAL field, not a class-specific one, because light mode has no
   * `theme.colors.graph.classBorder` default either (`classBorder(geo,
   * theme)`, `renderer-classifier-colors.ts`, falls through to
   * `theme.colors.border` by design) — the SAME single root-level LineColor
   * upstream uses for both the classifier box's stroke AND the badge
   * ellipse's stroke (`resolveBadgeBorder`'s own `defaultBorder` param).
   */
  border: '#E7E7E7',
  /**
   * `root { FontColor white }` — plantuml.skin:566. The general text-color
   * default (`theme.colors.text`), consumed directly by non-class engines
   * (e.g. activity's `theme.colors.text` fallback role,
   * `activity-text-style.ts`) sharing this same skinparam pipeline.
   */
  text: '#FFF',
  /**
   * `root { BackGroundColor #313139 }` — plantuml.skin:568. The classifier
   * box fill default (`theme.colors.graph.classBackground`) — class has no
   * OWN dark-mode selector in the `.skin` file, so it inherits `root`'s
   * BackGroundColor, exactly like the light-mode default already does
   * (`defaultTheme.colors.graph.classBackground`).
   */
  classBackground: '#313139',
  /**
   * add2 T3h (family DARK): `activityDiagram { circle { start, stop, end {
   * LineColor #d; BackgroundColor #d } } }` — plantuml.skin:687-692. The
   * activity engine's OWN dark override for its terminal circles (distinct
   * from the light-mode `#2` the same block uses at `:290-295`/`:376-382`,
   * `activity-style-defaults.ts#CIRCLE_INK`) — jar-verified against
   * `levuma-67-cego489`'s own dark-mode SVG (`ellipse` fill/stroke `#DDD`).
   * `resolveColorToSvgHex('#d')` is the SAME 1-digit-shorthand parser
   * `CIRCLE_INK` already uses, not a hand-typed literal.
   */
  activityCircleInk: resolveColorToSvgHex('#d'),
} as const;
