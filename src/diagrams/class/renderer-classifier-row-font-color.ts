/**
 * `classifierCascadeFontColor` and its own cascade/tier helpers -- split out
 * of `renderer-classifier-rows.ts` purely to keep that file under this
 * project's 500-line cap (T26; mirrors that file's own pre-existing
 * `renderer-classifier-header-split.ts`/`renderer-classifier-colors.ts`
 * split precedent). Pure move, zero behavior change.
 */
import type { ClassifierGeo } from './layout.js';
import type { Theme } from '../../core/theme.js';
import { CLASS_STEREOTYPE_BUCKET, OBJECT_STEREOTYPE_BUCKET } from '../../core/legacy-stereotype-font.js';
import { isObjectKind } from './object-kind-style.js';
import { resolveClassTagCascadeEntry } from '../../core/style-cascade-class.js';
import {
  resolveElementFont,
  resolveElementHeaderFont,
  resolveClassFontColorByStereo,
  classifierFill,
} from './renderer-classifier-colors.js';
import { CLASS_BUCKET, CLASS_HEADER_BUCKET } from './renderer-classifier-scoped-colors.js';
import { resolveClassHeaderFill } from './renderer-classifier-header-split.js';
import { resolveColorToSvgHex } from '../../core/klimt/color/HColorSet.js';

/** The terminal `classCascade(Header)FontColor ?? classCascadeFontColor ??
 *  '#000000'` tier, shared verbatim by both the object/map/json and class
 *  branches below -- factored out so neither branch re-states it (keeps
 *  both, and their caller, under the per-function CCN cap). */
function terminalCascadeFontColor(theme: Theme, isHeader: boolean): string {
  return (
    (isHeader
      ? (theme.colors.graph.classCascadeHeaderFontColor ?? theme.colors.graph.classCascadeFontColor)
      : theme.colors.graph.classCascadeFontColor) ?? '#000000'
  );
}

/**
 * dss T3b: the terminal text colour of an `object`/`map`/`json` row. Their signature holds neither `classDiagram` nor
 * `class_` (`EntityImageObject.java:123-124`), so `classCascade(Header)FontColor` must not reach it; the skin
 * default is the root `FontColor` (`theme.colors.text`, which `root`/`element` declarations and `skinparam
 * defaultFontColor` set).
 */
function objectDefaultFontColor(theme: Theme): string {
  return theme.colors.text;
}

/**
 * dss T3b: whether `row` is a stereotype label. A class's are the header rows before its name row, which its caller
 * flags; an `object`/`map`/`json` header is not split by `headerRowCount`, so its label rows carry the flag
 * themselves (`class-object-map-header.ts#buildStereoHeaderRows`).
 */
export function isStereotypeLabelRow(row: { readonly stereotypeLabel?: true }, flagged: boolean): boolean {
  return flagged || row.stereotypeLabel === true;
}

/**
 * dss T3b: a stereotype LABEL row is drawn with `FontConfiguration.create(skinParam, FontParam.CLASS_STEREOTYPE |
 * OBJECT_STEREOTYPE, stereotype)` (`EntityImageClassHeader.java:131`, `EntityImageObject.java:105-106`), the legacy
 * skinparam chain with no style behind it, so no `<style>` cascade tints it (jar: `class__kinds-font-*`, label
 * `#000`). `legacy-stereotype-font.ts` resolves that chain into the two buckets; absent, the `FontParam` default.
 */
function stereotypeLabelFontColor(geo: ClassifierGeo, theme: Theme): string {
  const bucket = isObjectKind(geo.kind) ? OBJECT_STEREOTYPE_BUCKET : CLASS_STEREOTYPE_BUCKET;
  const font = theme.colors.elements?.[bucket]?.font;
  return typeof font === 'string' ? font : DEFAULT_STEREOTYPE_FONT_COLOR;
}

/** `FontParam.CLASS_STEREOTYPE` / `OBJECT_STEREOTYPE`'s `defaultColor`, black (`klimt/font/FontParam.java:45,59,61`, `FontParamConstant.COLOR`). */
const DEFAULT_STEREOTYPE_FONT_COLOR = '#000000';

/** G3/O4: the object/map/json branch of {@link classifierCascadeFontColor}
 *  -- own `theme.colors.elements[kind].font` bucket FIRST (`<style>
 *  objectDiagram { object { FontColor ... } } }`/bare `object { FontColor
 *  ... }`, the OBJECT-specific override -- `EntityImageObject`/`Map`/
 *  `Json#getStyleSignature` has NO `classDiagram`/`class` token, so a
 *  class-only `.tagname` cascade must never apply), `<style> <sname> {
 *  header { FontColor } } }` winning over the bare bucket's own FontColor
 *  ONLY for the NAME row (`isHeader && !isStereoLabelRow` --
 *  `resolveElementHeaderFont`'s own doc comment; the stereo label row's
 *  FontConfiguration is independent upstream, `EntityImageObject.java`'s
 *  own ctor). Falls through to {@link terminalCascadeFontColor} ONLY as a
 *  root/element-level default -- see {@link classifierCascadeFontColor}'s
 *  own doc comment for the shared-prefix caveat this preserves. */
function objectFamilyCascadeFontColor(
  geo: ClassifierGeo,
  theme: Theme,
  isHeader: boolean,
  isStereoLabelRow: boolean,
): string {
  const nameRow = isHeader && !isStereoLabelRow;
  const scoped = (nameRow ? geo.objectStyle?.header.font : undefined) ?? geo.objectStyle?.box.font;
  return (
    (scoped !== undefined ? resolveColorToSvgHex(scoped) : undefined) ??
    (nameRow ? resolveElementHeaderFont(theme, geo.kind) : undefined) ??
    resolveElementFont(theme, geo.kind) ??
    objectDefaultFontColor(theme)
  );
}

/**
 * G2 N37: the `.tagname` sub-selector cascade wins over the plain ancestor
 * cascade for BOTH the name row AND member rows uniformly -- but NEVER a
 * stereotype label row (`isStereoLabelRow`'s own doc comment on
 * `renderRowText`'s own parameter). Split out purely to keep {@link
 * classCascadeFontColorTiers}'s own CCN under this project's complexity
 * cap (T26); pure move, no behavior change.
 */
function tagCascadeFontColor(geo: ClassifierGeo, theme: Theme, isStereoLabelRow: boolean): string | undefined {
  return isStereoLabelRow
    ? undefined
    : resolveClassTagCascadeEntry(theme, geo.stereotypeLabels, geo.styleGeneration)?.fontColor;
}

/**
 * cdd2-T8 (S-13/S-3): the two NAME-ROW-ONLY tiers -- `classFontColor
 * <<stereo>>` then `automatic` -- both gated identically (`isHeader &&
 * !isStereoLabelRow`, mirroring `classFontColor`'s own header-only
 * skinparam bridge, `skinparam-theme-builder.ts:111`'s
 * `classCascadeHeaderFontColor` mapping: never a member row or a
 * stereotype label row). Split out purely to keep {@link
 * classCascadeFontColorTiers}'s own CCN under this project's complexity
 * cap (T26); pure move, no behavior change.
 */
function headerOnlyCascadeFontColorTiers(
  geo: ClassifierGeo,
  theme: Theme,
  isHeader: boolean,
  isStereoLabelRow: boolean,
): string | undefined {
  if (!isHeader || isStereoLabelRow) return undefined;
  return resolveClassFontColorByStereo(theme, geo.stereotypeLabels) ?? resolveAutomaticFontColor(geo, theme);
}

/**
 * The `.tagname` cascade -> `classFontColor<<stereo>>` -> `automatic` tier
 * chain {@link classifierCascadeFontColor}'s CLASS branch falls through --
 * split out purely to keep that function's own CCN under this project's
 * complexity cap (T26). Pure move of the pre-existing three-tier chain; no
 * behavior change.
 */
function classCascadeFontColorTiers(
  geo: ClassifierGeo,
  theme: Theme,
  isHeader: boolean,
  isStereoLabelRow: boolean,
): string | undefined {
  return (
    tagCascadeFontColor(geo, theme, isStereoLabelRow) ??
    headerOnlyCascadeFontColorTiers(geo, theme, isHeader, isStereoLabelRow)
  );
}

/**
 * The cascade/default fallback chain `renderRowText` falls to when the
 * classifier has no inline `#text:color` override -- split out purely to
 * keep that already-near-cap function's own CCN from growing (cdd-T19,
 * A3 M1 text half added one more tier above this one). Pure move of the
 * PRE-EXISTING ternary; no behavior change.
 */
export function classifierCascadeFontColor(
  geo: ClassifierGeo,
  theme: Theme,
  isHeader: boolean,
  isStereoLabelRow: boolean,
): string {
  if (isStereoLabelRow) return stereotypeLabelFontColor(geo, theme);
  if (geo.kind === 'object' || geo.kind === 'map' || geo.kind === 'json') {
    return objectFamilyCascadeFontColor(geo, theme, isHeader, isStereoLabelRow);
  }
  return (
    classCascadeFontColorTiers(geo, theme, isHeader, isStereoLabelRow) ??
    classScopedFontColor(theme, isHeader) ??
    terminalCascadeFontColor(theme, isHeader)
  );
}

/**
 * dss T3b (D2): the style engine's merged `FontColor` for the class signature, `elements['class']` for a member row
 * and `elements['class.header']` for the name row (`EntityImageClassHeader.java:79-80`; a header bucket the engine
 * left out had no declaration of its own, so it reads the class's). It follows the declaration order the flat
 * `classCascade*FontColor` cannot see: `skinparam classFontColor` after `root { FontColor }` is the skinparam's
 * (`class__x-theme-gradient`, jar `#F8F9FA`).
 */
function classScopedFontColor(theme: Theme, isHeader: boolean): string | undefined {
  const elements = theme.colors.elements;
  const font = (isHeader ? elements?.[CLASS_HEADER_BUCKET]?.font : undefined) ?? elements?.[CLASS_BUCKET]?.font;
  return typeof font === 'string' ? resolveColorToSvgHex(font) : undefined;
}

/**
 * cdd2-T8 (S-13): `HColorSimple#opposite` (`klimt/color/HColorSimple.java
 * :211-214`) -- the YIQ-luma contrast test `HColorAutomagic
 * #getAppropriateColor` delegates to for `skinparam classFontColor
 * automatic`. `getGrayScaleInternal`: `(r*299 + g*587 + b*114) / 1000`; a
 * luma `< 128` is dark (white text wins), `>= 128` is light (black text
 * wins) -- a THIRD local copy of the same 2-line formula `core/klimt/color
 * /HColorSet.ts#isDarkResolved` and `core/tim/builtin/color-utils.ts#isDark`
 * already each carry independently (that file's own doc comment names this
 * as the established "no cross-module-boundary import for a 2-line pure
 * function" precedent -- `core/klimt/color/` isn't in this task's write-set).
 * `hex` is always `#RRGGBB`/`#RGB` (this module's own inputs are always
 * `resolveColorToSvgHex`'s output shape), so no `#RRGGBBAA`/named-colour
 * parsing is needed here.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/color/HColorSimple.java:211-214
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/color/ColorUtils.java:55-58
 */
function isDarkHex(hex: string): boolean {
  const full = hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex;
  const r = Number.parseInt(full.slice(1, 3), 16);
  const g = Number.parseInt(full.slice(3, 5), 16);
  const b = Number.parseInt(full.slice(5, 7), 16);
  return Math.trunc((r * 299 + g * 587 + b * 114) / 1000) < 128;
}

/**
 * cdd2-T8 (S-13): `skinparam classFontColor automatic` -- resolves a
 * contrast colour against the NAME row's own local background (the header
 * fill if header-split applies, else the plain body fill -- the SAME
 * background `renderer-classifier-header-split.ts#resolveClassHeaderFill`/
 * `renderer-classifier-colors.ts#classifierFill` already compute for the
 * box's OWN paint, reused here rather than re-derived). `undefined` when
 * `classFontColorAutomatic` is unset (the common case -- falls through to
 * {@link terminalCascadeFontColor}'s existing chain) OR the resolved
 * background is a gradient `Paint` (no corpus fixture combines `automatic`
 * with a gradient header/body; `HColorGradient` has no `opposite()`
 * override upstream reachable from this path either). Only ever called for
 * the NAME row (`isHeader && !isStereoLabelRow`, mirroring `classFontColor`'s
 * own header-only skinparam bridge -- see this file's `stereoFontColor`
 * sibling for the identical gating precedent).
 */
function resolveAutomaticFontColor(geo: ClassifierGeo, theme: Theme): string | undefined {
  if (theme.colors.graph.classFontColorAutomatic !== true) return undefined;
  const bodyFill = classifierFill(geo, theme);
  const headerFill = resolveClassHeaderFill(geo, bodyFill, theme) ?? bodyFill;
  if (typeof headerFill !== 'string') return undefined;
  return isDarkHex(headerFill) ? '#FFFFFF' : '#000000';
}
