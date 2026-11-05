/**
 * Which `LayoutServices` a render hands to `SyncPlugin.layoutSync` (cdd8 D2b).
 *
 * Upstream picks the ELK maker per diagram (`net/atmp/CucaDiagram.java:478-479`:
 * `isUseElk()` -> `CucaDiagramFileMakerElk`) and, without ELK on the
 * classpath, reports `InstallationRequirement.ELK_LIBRARY_REQUIRED`
 * (`CucaDiagram.java:950-952`). Here the plugin answers `requiresElk(ast)`;
 * `render()` then supplies `options.elk` or loads elkjs, and `renderSync`,
 * which cannot await the load, needs `options.elk`.
 */
import type { DiagramPlugin } from '../dispatcher.js';
import { currentStyleBuilderOf } from '../document-back-color.js';
import type { MindmapStyleSource } from '../style/mindmap-style-builder.js';
import { StyleParsingException } from '../style/parser/StyleParser.js';
import type { StyleBuilder } from '../style/StyleBuilder.js';
import type { RenderOptions } from '../render-options.js';
import type { LayoutServices } from './elk-backend.js';
import { loadElk } from './load-elk.js';

/** Worded after `renderPagesSync`'s `!include` message (`src/index.ts`). */
export const ELK_RENDER_SYNC_UNSUPPORTED =
  '!pragma layout elk is not supported in renderSync without options.elk — ' +
  'use render(), or pass options.elk (await loadElk())';

/** `SkinParam#isDark`'s key and value (`SkinParam.java:114-116`). */
const MODE_KEY = 'mode';
const MODE_DARK = 'dark';

/** `TitledDiagram#isSkinParamUsed`: `CommandSkinParam.java:102`, `CommandSkinParamMultilines.java:100`. */
function isSkinParamUsed(source: MindmapStyleSource): boolean {
  return (source.declarationOrder?.skinparam ?? source.skinparam).size > 0;
}

/** See `LayoutServices.styleBuilder`. */
function styleBuilderThunk(
  source: MindmapStyleSource | undefined,
): ((generation?: number, positional?: boolean) => StyleBuilder | undefined) | undefined {
  if (source === undefined) return undefined;
  // `skinparam mode dark`: the port's style parser has no `@media` dark side (`theme-dark.ts`), so a merged style would
  // answer the light colours. The flat reads keep `theme-dark`'s table.
  if (source.skinparam.get(MODE_KEY)?.toLowerCase() === MODE_DARK) return undefined;
  const built = new Map<number, StyleBuilder | undefined>();
  const skinParamUsed = isSkinParamUsed(source);
  return (generation, positional) => {
    const last = generation === undefined || (skinParamUsed && positional !== true);
    const count = last ? source.styles.length : generation;
    if (!built.has(count)) built.set(count, tryBuild({ ...source, styles: source.styles.slice(0, count) }));
    return built.get(count);
  };
}

function tryBuild(source: MindmapStyleSource): StyleBuilder | undefined {
  try {
    return currentStyleBuilderOf(source);
  } catch (e) {
    if (e instanceof StyleParsingException) return undefined;
    throw e;
  }
}

function requiresElk(plugin: DiagramPlugin, ast: unknown): boolean {
  return 'layoutSync' in plugin && plugin.requiresElk?.(ast) === true;
}

/** `renderSync`'s services: the caller's backend, which an ELK diagram cannot do without. */
export function layoutServicesSync(
  plugin: DiagramPlugin,
  ast: unknown,
  options?: RenderOptions,
  styleSource?: MindmapStyleSource,
): LayoutServices {
  if (options?.elk === undefined && requiresElk(plugin, ast)) throw new Error(ELK_RENDER_SYNC_UNSUPPORTED);
  return { elk: options?.elk, styleBuilder: styleBuilderThunk(styleSource) };
}

/** `render()`'s services: the caller's backend, else elkjs loaded only for a diagram that requires ELK. */
export async function layoutServices(
  plugin: DiagramPlugin,
  ast: unknown,
  options?: RenderOptions,
  styleSource?: MindmapStyleSource,
): Promise<LayoutServices> {
  const styleBuilder = styleBuilderThunk(styleSource);
  if (options?.elk !== undefined || !requiresElk(plugin, ast)) return { elk: options?.elk, styleBuilder };
  return { elk: await loadElk(), styleBuilder };
}
