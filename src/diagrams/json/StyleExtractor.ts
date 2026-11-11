/**
 * Port of upstream's `StyleExtractor` -- the json family's ONLY directive
 * handling. `@startjson`, `@startyaml` and `@starthcl` have no command table:
 * each factory hands `source.iterator2()` (the block's whole `UmlSource`,
 * `@start`/`@end` included) to this class and parses whatever it leaves in
 * {@link StyleExtractor.list} as payload.
 *
 * The consequences this port used to diverge from, all jar-verified
 * (`tests/fixtures/unwind-U1/`):
 *  - only `title ` is a chrome directive; `caption`/`legend`/`header`/
 *    `footer`/`mainframe`/`sprite` lines are PAYLOAD (a json/yaml block then
 *    fails to parse; hcl folds them into a module name);
 *  - every directive is recognised only while `list.size() <= 1`, i.e. before
 *    the first payload line -- one after it is payload too;
 *  - `skinparam` is read for exactly one fact, `handwritten`; every other key
 *    (and a whole `skinparam X { ... }` block) is dropped.
 *
 * `<style>` blocks are skipped here and NOT collected: this port's
 * preprocessor collector already extracts every `<style>` block for the theme
 * pipeline, which is what `applyStyles` (`StyleExtractor.java:114-138`) feeds.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/jsondiagram/StyleExtractor.java:54-156
 */

import type { UmlSource } from '../../core/block-extractor.js';
import {
  createMindmapSkinParam,
  executeDeclaration,
  positionedDeclarationsOf,
  type PositionedDeclaration,
  type SkinParam as StyleSkinParam,
} from '../../core/style/mindmap-style-builder.js';
import { StyleParsingException } from '../../core/style/parser/StyleParser.js';
import type { StyleBuilder } from '../../core/style/StyleBuilder.js';
import { getMissingRootProperties, loadSkin, NoStyleAvailableException } from '../../core/style/StyleLoader.js';

/** The preprocessor's style sources: `skin`, skinparams, `<style>` blocks (a theme's included). */
type StyleSource = NonNullable<UmlSource['styleSource']>;

/** What upstream's `StyleExtractor` exposes after construction. */
export interface StyleExtractor {
  /** `StyleExtractor#list` -- every non-directive, non-blank line, untrimmed,
   *  in order. Its first entry is the `@start` line and its last the `@end`
   *  line, which each factory skips (`it.next()` / `it.hasNext() == false`). */
  readonly list: readonly string[];
  /** `StyleExtractor#title`: the text after `title `, trimmed, unparsed. */
  readonly title: string | undefined;
  /** `StyleExtractor#handwritten`. */
  readonly handwritten: boolean;
  /** `StyleExtractor#scale`: the whole trimmed `scale ...` line. */
  readonly scale: string | undefined;
  /** `StyleExtractor#newSkin`: the text after `skin `, trimmed. */
  readonly newSkin: string | undefined;
}

interface MutableExtractor {
  list: string[];
  title: string | undefined;
  handwritten: boolean;
  scale: string | undefined;
  newSkin: string | undefined;
}

const STYLE_START = '<style>';
const STYLE_END = '</style>';
const SKINPARAM_PREFIX = 'skinparam ';
const BLOCK_CLOSE = '}';
/** A block's wrapper lines, as the block extractor matches them (any case). */
const RE_START = /^\s*@start/i;
const RE_END = /^\s*@end/i;

/**
 * Advances past a multi-line block the way upstream's two inner loops do:
 * `line` starts at the opener, each turn tests `line` against `close` and
 * otherwise reads the next line, so the closer itself is consumed and an
 * unclosed block swallows the rest of the source.
 * @see StyleExtractor.java:70-75 (`<style>`), :91-97 (`skinparam ... {`)
 * @returns the index of the first line NOT consumed.
 */
function skipBlock(data: readonly string[], opener: number, close: string): number {
  let line = data[opener]!;
  let next = opener + 1;
  while (next < data.length) {
    if (line.trim() === close) break;
    line = data[next]!;
    next++;
  }
  return next;
}

/**
 * The `else if` chain at `StyleExtractor.java:76-97`, minus its shared
 * `list.size() <= 1` guard (the caller's). Returns false when `s` is not a
 * directive, i.e. when it falls through to `list.add` (:98-99).
 */
function applyDirective(s: string, state: MutableExtractor): boolean {
  if (s.startsWith('!assume ') || s.startsWith('!pragma ') || s.startsWith('hide ')) return true;
  if (s.startsWith('scale ')) {
    state.scale = s;
    return true;
  }
  if (s.startsWith('title ')) {
    state.title = s.substring('title '.length).trim();
    return true;
  }
  if (s.startsWith('skin ')) {
    state.newSkin = s.substring('skin '.length).trim();
    return true;
  }
  if (!s.startsWith(SKINPARAM_PREFIX)) return false;
  if (s.includes('handwritten') && s.includes('true')) state.handwritten = true;
  return true;
}

/**
 * `new StyleExtractor(source.iterator2())`.
 * @see StyleExtractor.java:63-103
 */
export function extractStyle(data: readonly string[]): StyleExtractor {
  const state: MutableExtractor = {
    list: [],
    title: undefined,
    handwritten: false,
    scale: undefined,
    newSkin: undefined,
  };
  let i = 0;
  while (i < data.length) {
    const line = data[i]!;
    const s = line.trim();
    if (s.length === 0) i++;
    else if (s === STYLE_START) i = skipBlock(data, i, STYLE_END);
    else if (state.list.length <= 1 && applyDirective(s, state)) {
      i = s.startsWith(SKINPARAM_PREFIX) && s.includes('{') ? skipBlock(data, i, BLOCK_CLOSE) : i + 1;
    } else {
      state.list.push(line);
      i++;
    }
  }
  return state;
}

/**
 * The payload lines a factory reads: `list` minus its first entry (`it.next()`)
 * and its last (the loop breaks when `it.hasNext() == false`).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/jsondiagram/JsonDiagramFactory.java:76-81
 */
export function payloadOf(extractor: StyleExtractor): readonly string[] {
  return extractor.list.slice(1, -1);
}

/**
 * The lines upstream's `StyleExtractor` iterates: `UmlSource#iterator2()`, the
 * block's preprocessed source with `@start`/`@end` (`UmlSource.seedSourceLines`,
 * populated by `index.ts#umlSourceOfBlock`). A hand-built `UmlSource` carries
 * only the interior `lines`, so the missing wrapper lines are restored --
 * without them {@link payloadOf} would drop real payload.
 */
export function upstreamSourceLines(
  source: { readonly lines: readonly string[]; readonly seedSourceLines?: readonly string[] },
  type: string,
): readonly string[] {
  if (source.seedSourceLines !== undefined) return source.seedSourceLines;
  // Blank lines never reach `list` (StyleExtractor.java:67-68), so the
  // wrapper test reads the first/last NON-blank line.
  const nonBlank = source.lines.filter((l) => l.trim() !== '');
  const head = RE_START.test(nonBlank[0] ?? '') ? [] : [`@start${type}`];
  const tail = RE_END.test(nonBlank[nonBlank.length - 1] ?? '') ? [] : [`@end${type}`];
  return [...head, ...source.lines, ...tail];
}

/** `skin <name>` names `<name>.skin`. @see StyleExtractor.java:116 */
const SKIN_EXTENSION = '.skin';

/**
 * The error `applyStyles` raises for the `skin` line before it touches a `<style>` block: a sheet that does not
 * load is "Cannot find style", one without every mandatory root property is "Incomplete style".
 * @see StyleExtractor.java:115-129
 */
export function skinErrorOf(skin: string | undefined): StyleParsingException | undefined {
  if (skin === undefined) return undefined;
  let loaded: StyleBuilder;
  try {
    loaded = loadSkin(skin + SKIN_EXTENSION);
  } catch (e) {
    if (e instanceof NoStyleAvailableException) return new StyleParsingException(`Cannot find style ${skin}`);
    if (e instanceof StyleParsingException) return e;
    throw e;
  }
  const missing = getMissingRootProperties(loaded);
  if (missing.length === 0) return undefined;
  return new StyleParsingException(`Incomplete style ${skin}: root does not define [${missing.join(', ')}]`);
}

/**
 * Executes `declarations` in source order; answers the first style error. The caller then discards the
 * builder: the jar collects every `<style>` line (a theme's included) into ONE `BlocLines` and parses it in
 * one `StyleParser#parse`, so a parse error throws before `muteStyle` and NO block applies.
 * @see StyleExtractor.java:132-136
 */
export function applyDeclarations(
  style: StyleSkinParam,
  declarations: readonly PositionedDeclaration[],
  styleSource: StyleSource,
): StyleParsingException | undefined {
  for (const declaration of declarations) {
    try {
      executeDeclaration(style, declaration, styleSource.skinparam);
    } catch (e) {
      if (!(e instanceof StyleParsingException)) throw e;
      return e;
    }
  }
  return undefined;
}

/** A hand-built source's style sources: no skin, no skinparam, no style. */
const EMPTY_STYLE_SOURCE: StyleSource = { skinparam: new Map<string, string>(), styles: [] };

/** What {@link applyStyles} leaves: the builder-holding style skin param, and the error it raised. */
export interface AppliedStyles {
  readonly style: StyleSkinParam;
  readonly styleError: StyleParsingException | undefined;
}

/**
 * `StyleExtractor#applyStyles` on a fresh default-skin builder: the `skin` line first (an unloadable or incomplete
 * sheet throws before any `<style>` block, and the skin is not set), then every `<style>` block of the source — a
 * theme's included — parsed as ONE `BlocLines`, so one bad block mutes none. No `skinparam` is ever applied: the
 * extractor collects only `<style>` lines (`:69-75`). The caller decides what to do with the error (`PSystemRegex`
 * prints it and carries on, `PSystemRegex.java:87-91`). The json family keeps its own mode-aware cut
 * (`json-skin-param.ts#buildStyle`) on the same two helpers.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/jsondiagram/StyleExtractor.java:113-138
 */
export function applyStyles(source: Pick<UmlSource, 'styleSource' | 'stylePositions'>): AppliedStyles {
  const styleSource = source.styleSource ?? EMPTY_STYLE_SOURCE;
  const skinError = skinErrorOf(styleSource.skin);
  if (skinError !== undefined) return { style: createMindmapSkinParam({}), styleError: skinError };
  const blocks = positionedDeclarationsOf(styleSource, source.stylePositions ?? []).filter(
    (declaration) => 'style' in declaration,
  );
  const style = createMindmapSkinParam(styleSource);
  const styleError = applyDeclarations(style, blocks, styleSource);
  if (styleError === undefined) return { style, styleError };
  // StyleExtractor.java:132-135: `muteStyle(new StyleParser(...).parse(all <style> lines))`: all or nothing.
  return { style: createMindmapSkinParam(styleSource), styleError };
}
