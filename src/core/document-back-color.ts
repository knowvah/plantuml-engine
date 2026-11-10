/**
 * The document background through the style engine (dss T1a, D1, D3, D4, D6):
 * upstream's one read, `TitledDiagram#calculateBackColor`, over the ported
 * `StyleBuilder`:
 *
 *   StyleSignatureBasic.of(SName.root, SName.document, getDiagramType().getStyleName())
 *     .getMergedStyle(getSkinParam().getCurrentStyleBuilder())
 *
 * The result is the `(background, backgroundGradient)` pair `theme.colors`
 * already carries (D2), computed as `skinparam backgroundColor`'s handler
 * computes it.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/TitledDiagram.java:280-289
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/core/DiagramType.java:234-296
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/style/StyleStorage.java:102-116
 */
import type { DiagramType } from './block-extractor.js';
import type { Gradient } from './paint.js';
import type { PreprocessorResult } from './preprocessor.js';
import { resolveColorPaint } from './skinparam-key-handlers.js';
import { resolveColor } from './skinparam-key-normalize.js';
import { defaultTheme } from './theme.js';
import { HColorSet } from './klimt/color/HColorSet.js';
import { buildMindmapStyleBuilder, type MindmapStyleSource } from './style/mindmap-style-builder.js';
import { StyleParsingException } from './style/parser/StyleParser.js';
import type { SName } from './style/SName.js';
import type { StyleBuilder } from './style/StyleBuilder.js';
import { StyleSignatureBasic } from './style/StyleSignatureBasic.js';
import type { Value } from './style/Value.js';

/**
 * `getStyleName`'s branches for the engines this port routes
 * (`block-extractor.ts#DiagramType`). `EBNF` (java:280-281) and `REGEX`
 * (java:283-284) have no member in that union.
 */
const STYLE_NAMES: Readonly<Partial<Record<DiagramType, SName>>> = {
  sequence: 'sequenceDiagram', // java:235-236
  state: 'stateDiagram', // java:238-239
  class: 'classDiagram', // java:241-242
  object: 'objectDiagram', // java:244-245
  activity: 'activityDiagram', // java:247-248
  description: 'componentDiagram', // java:250-251
  mindmap: 'mindmapDiagram', // java:253-254
  wbs: 'wbsDiagram', // java:256-257
  gantt: 'ganttDiagram', // java:259-260
  salt: 'saltDiagram', // java:262-263
  yaml: 'yamlDiagram', // java:265-266
  hcl: 'yamlDiagram', // java:268-269
  json: 'jsonDiagram', // java:271-272
  timing: 'timingDiagram', // java:274-275
  nwdiag: 'nwdiagDiagram', // java:277-278
  chronology: 'ganttDiagram', // java:286-287
  chart: 'chartDiagram', // java:289-290
  packetdiag: 'packetdiagDiagram', // java:292-293
};

/** `return SName.activityDiagram;`: every type without a branch (files, board, dot, unknown). @see DiagramType.java:295 */
const STYLE_NAME_OTHERWISE: SName = 'activityDiagram';

/** `SkinParam#isDark`'s key and value. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/skin/SkinParam.java:114-116 */
const MODE_KEY = 'mode';
const MODE_DARK = 'dark';

/** `ValueImpl#asColor`'s two `equalsIgnoreCase` spellings of `HColors.transparent()`. @see ValueImpl.java:94-98 */
const TRANSPARENT_SPELLINGS: ReadonlySet<string> = new Set(['none', 'transparent']);

/** `HColors.transparent()`: `calculateBackColor`'s answer to a null colour. @see TitledDiagram.java:285-286 */
const TRANSPARENT = 'transparent';

/** The default skin alone: no `skin` line, no declaration. */
const NO_DECLARATIONS: MindmapStyleSource = { skinparam: new Map(), styles: [] };

/**
 * The pair `theme.colors` carries: `background` flattened, `backgroundGradient` only for a gradient.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/TitledDiagram.java:280-289
 */
export interface DocumentBackColor {
  readonly background: string;
  readonly backgroundGradient?: Gradient;
}

/**
 * `DiagramType#getStyleName`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/core/DiagramType.java:234-296
 */
export function styleNameOf(diagramType: DiagramType): SName {
  return STYLE_NAMES[diagramType] ?? STYLE_NAME_OTHERWISE;
}

/**
 * `SkinParam#getCurrentStyleBuilder` for `pre` (D1a): only the skinparams this
 * diagram executed itself, those on the declaration counter. An inherited one
 * (`withPrevious`, `nested-previous.ts`) sits in `params` through
 * `copyAllFrom`, `this.params.putAll(previous.values())`, which never reaches
 * `FromSkinparamToStyle`. A result with no order (a hand-built literal) keeps
 * `buildMindmapStyleBuilder`'s own reading.
 *
 * @throws StyleParsingException from a `<style>` block upstream rejects.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/TitledDiagram.java:109-110
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/skin/SkinParam.java:217-218
 */
export function currentStyleBuilderOf(pre: MindmapStyleSource): StyleBuilder {
  const order = pre.declarationOrder;
  if (order === undefined) return buildMindmapStyleBuilder(pre);
  const skinparam = new Map([...pre.skinparam].filter(([key]) => order.skinparam.has(key)));
  return buildMindmapStyleBuilder({ ...pre, skinparam });
}

/** `.value(PName.BackGroundColor)` of the merged `{root, document, <diagram>}` style. @see TitledDiagram.java:281-284 */
function backColorValue(builder: StyleBuilder, diagramType: DiagramType): Value | undefined {
  const signature = StyleSignatureBasic.of('root', 'document', styleNameOf(diagramType));
  return signature.getMergedStyle(builder)?.value('BackGroundColor');
}

/** `SkinParam#getValue`'s lowercased key for `FromSkinparamToStyle.java:157`. */
const DEFAULT_FONT_COLOR_KEY = 'defaultfontcolor';

/**
 * The document's one builder, under D3's gate: `undefined` for empty `styles` and no `skin` (D3, D3b), and for a
 * `<style>` the parser rejects (D6, `CommandStyleMultilinesCSS.java:92-93`). Nothing else is caught.
 */
export function documentStyleBuilder(pre: PreprocessorResult): StyleBuilder | undefined {
  if (pre.styles.length === 0 && pre.skin === undefined) return undefined;
  try {
    return currentStyleBuilderOf(pre);
  } catch (e) {
    if (e instanceof StyleParsingException) return undefined;
    throw e;
  }
}

/**
 * The builder for a document D3's gate leaves out that still sets `skinparam defaultFontColor`: it converts to
 * `root { FontColor }` (`FromSkinparamToStyle.java:157`), which every element's signature merges
 * (`StyleSignatureBasic.java:194-220`), and most text readers have no flat tier for it. `undefined` otherwise.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/style/FromSkinparamToStyle.java:157
 */
export function defaultFontStyleBuilder(pre: PreprocessorResult): StyleBuilder | undefined {
  const gated = pre.styles.length === 0 && pre.skin === undefined;
  return gated && pre.skinparam.has(DEFAULT_FONT_COLOR_KEY) ? currentStyleBuilderOf(pre) : undefined;
}

/**
 * The value is the default skin's own, untouched: `Value#toString` is
 * `value1/value2 (priority)` (`DarkString.java:86-88`), so an explicit `white`
 * is not it. It has no dark twin and a later priority, and `DarkString#mergeWith`
 * keeps it over the skin's `white/#1B1B1B` (`DarkString.java:50-72`; jar:
 * `skinparam mode dark` + `document { BackgroundColor white }` draws `#FFFFFF`).
 */
function isDefaultSkinValue(value: Value | undefined, diagramType: DiagramType): boolean {
  const defaultValue = backColorValue(buildMindmapStyleBuilder(NO_DECLARATIONS), diagramType);
  return value?.toString() === defaultValue?.toString();
}

/** `SkinParam#isDark`, inherited params included (`getValue` reads `params`). @see SkinParam.java:114-116 */
export function isDark(pre: PreprocessorResult): boolean {
  return pre.skinparam.get(MODE_KEY)?.toLowerCase() === MODE_DARK;
}

/**
 * `applyNormalKey`'s `resolveColor` + `resolveColorPaint` as the `backgroundcolor`
 * handler stores them (`skinparam-key-handlers-table-a.ts`), with `ValueImpl#asColor`'s
 * case-insensitive transparent (java:94-98) lowered to the keyword `svgRoot` tests.
 */
function pairOf(raw: string): DocumentBackColor {
  const lower = raw.toLowerCase();
  const value = TRANSPARENT_SPELLINGS.has(lower) ? lower : raw;
  const paint = resolveColorPaint(value);
  return typeof paint === 'string'
    ? { background: resolveColor(value) }
    : { background: resolveColor(value), backgroundGradient: paint };
}

/**
 * `TitledDiagram#calculateBackColor` under D3's gate. `undefined` keeps the
 * theme as the flat path left it:
 *
 *  - a source with empty `styles` and no `skin` (D3, D3b): every such source is
 *    byte-identical;
 *  - a `<style>` block the parser rejects (D6);
 *  - `skinparam mode dark` when the builder returns the default skin's value,
 *    which keeps `theme-dark`'s colour (D3): the port renders the value1 side
 *    only, `ColorMapper.DARK_MODE` being `theme-dark.ts`'s table;
 *  - `callerNamedTheme` (`options.theme` is a string, Stage 1) in that same case.
 *    The jar has no such option; there the named theme stands where the skin
 *    would, and a value the document declares still beats it.
 *
 * Otherwise the builder is authoritative, even when the value equals the
 * default (`*__order-skin-then-white`). No declaration reaching the signature
 * is still an answer, one a flat value must not outlive (a bare top-level
 * `backgroundcolor` in `<style>`; jar `#FFFFFF`): the default skin's
 * `document { BackGroundColor white }` (`plantuml.skin:21-22`), in the spelling
 * `defaultTheme` carries.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/TitledDiagram.java:280-289
 */
export function documentBackColor(
  pre: PreprocessorResult,
  diagramType: DiagramType,
  callerNamedTheme = false,
  builder: StyleBuilder | undefined = documentStyleBuilder(pre),
): DocumentBackColor | undefined {
  if (builder === undefined) return undefined;
  const value = backColorValue(builder, diagramType);
  // smc T1c (D4): `style.value(BackGroundColor).asColor(set)` runs whatever the mode, and throws
  // `IllegalArgumentException` on a dark-only value (`value1` null, `ValueImpl.java:100-101`); the crash page follows.
  if (value?.asString() === null) value.asColor(HColorSet.instance());
  if (!isDefaultSkinValue(value, diagramType)) return pairOf(value?.asString() ?? TRANSPARENT);
  return callerNamedTheme || isDark(pre) ? undefined : { background: defaultTheme.colors.background };
}
