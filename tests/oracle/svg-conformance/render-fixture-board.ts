/**
 * Shared low-level render helper for the svg-board oracle harness (bep D5).
 *
 * A THIN wrapper around the production `renderSync`, as `render-fixture-wbs.ts` is:
 * it is what the survey itself calls, so this harness and the survey can diverge
 * on nothing but which measurer and stores a caller injects.
 *
 * TWO fixture roots:
 *   - the CACHED corpus, `test-results/dot-cache/board/<slug>/{in.puml,in.svg}`
 *     (the 4 rows; `ratchet.json`);
 *   - the AUTHORED root, {@link AUTHORED_BOARD_ROOT}, a FLAT committed tree of
 *     `<slug>.puml` + `<slug>.svg` pairs (the svg rendered by
 *     `scripts/oracle-render.sh`), tracked by `authored-baseline.json`.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { StringMeasurer } from '../../../src/core/measurer.js';
import type { AssetStore } from '../../../src/core/asset-store.js';
import type { IncludeStore } from '../../../src/core/tim/IncludeStore.js';
import { combineAssetStores, renderSync } from '../../../src/index.js';
import { buildEmojiAssetsStore } from '../../helpers/emoji-assets-store.js';
import { buildSpriteAssetsStore } from '../../helpers/sprite-assets-store.js';
import { buildUtilityAssetsStore } from '../../helpers/utility-assets-store.js';
import { fixtureIncludeStore } from '../../helpers/fixture-include-store.js';

/**
 * The sprite, Twemoji and utility artwork the jar reads off its classpath, as
 * the survey's `SURVEY_ASSET_STORE` combines them (`render-fixture-gantt.ts`'s
 * pattern): a `<:emoji:>` label measures and draws only with it. Built once.
 */
const BOARD_ASSET_STORE: AssetStore = combineAssetStores(
  buildSpriteAssetsStore(),
  buildEmojiAssetsStore(),
  buildUtilityAssetsStore(),
);

/**
 * `renderFixtureBoard`'s options bag -- the two `RenderOptions` fields
 * (`src/core/render-options.ts`) a fixture caller may pass, same restriction
 * `render-fixture-wbs.ts`'s `WbsFixtureRenderOptions` applies.
 */
export interface BoardFixtureRenderOptions {
  assetStore?: AssetStore;
  includeStore?: IncludeStore;
}

/**
 * Renders a `.puml` fixture through the PRODUCTION `renderSync` entry point,
 * with `measurer` and `options` forwarded verbatim -- see this file's doc
 * comment for why no dedicated per-engine pipeline exists to call instead.
 */
export function renderFixtureBoard(
  markup: string,
  measurer: StringMeasurer,
  options?: BoardFixtureRenderOptions,
): string {
  return renderSync(markup, { measurer, assetStore: BOARD_ASSET_STORE, ...options });
}

/** The committed, flat authored-fixture root (`<slug>.puml` + `<slug>.svg`). */
export const AUTHORED_BOARD_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures/board');

const PUML_SUFFIX = '.puml';
const SVG_SUFFIX = '.svg';

/** Every authored fixture slug: the `*.puml` basenames under {@link AUTHORED_BOARD_ROOT}, sorted. */
export function listAuthoredBoardSlugs(root: string = AUTHORED_BOARD_ROOT): string[] {
  return readdirSync(root)
    .filter((f) => f.endsWith(PUML_SUFFIX))
    .map((f) => f.slice(0, -PUML_SUFFIX.length))
    .sort();
}

/** One authored fixture's source and jar oracle (`undefined` when the svg is absent). */
export interface AuthoredBoardFixture {
  readonly markup: string;
  readonly golden: string | undefined;
}

export function readAuthoredBoardFixture(slug: string, root: string = AUTHORED_BOARD_ROOT): AuthoredBoardFixture {
  const svgPath = join(root, slug + SVG_SUFFIX);
  return {
    markup: readFileSync(join(root, slug + PUML_SUFFIX), 'utf8'),
    golden: existsSync(svgPath) ? readFileSync(svgPath, 'utf8') : undefined,
  };
}

/**
 * The include store for the authored root: a relative `!include` target is
 * read from the fixture's own directory -- where the jar resolves it, since
 * `oracle-render.sh` hands it the fixture's path -- and everything else
 * (the `<bundle/thing>` stdlib form) falls through to the shared
 * {@link fixtureIncludeStore}, so both roots resolve stdlib includes through
 * the one seam (`render-fixture-wbs.ts#authoredWbsIncludeStore`).
 */
export function authoredBoardIncludeStore(root: string = AUTHORED_BOARD_ROOT): IncludeStore {
  const shared = fixtureIncludeStore();
  const local = (path: string): string | undefined => {
    const file = join(root, path);
    return existsSync(file) ? readFileSync(file, 'utf8') : undefined;
  };
  return {
    get: (path: string): string | undefined => local(path) ?? shared.get(path),
    has: (path: string): boolean => local(path) !== undefined || shared.has(path),
    getPumlResource: (fullname: string): string | undefined => shared.getPumlResource?.(fullname),
  };
}
