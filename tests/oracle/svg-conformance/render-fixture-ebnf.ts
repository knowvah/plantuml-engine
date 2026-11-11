/**
 * Shared render helper for the svg-ebnf oracle harness (eep D9), a copy of `render-fixture-nwdiag.ts` (itself
 * `render-fixture-activity-legacy.ts`).
 *
 * A THIN wrapper around the production `renderSync`: the EBNF engine is
 * reached through dispatch (`registered-plugins.ts`, `PSystemBuilder.java:196`),
 * so the survey and this harness differ only in what a caller injects. Like `render-fixture-files.ts` it renders in jar-compatible
 * style mode, because the survey renders every row that way
 * (`scripts/svg-parity-survey.ts`), and passes the survey's `filename`, which
 * an error page prints.
 *
 * TWO fixture roots:
 *   - the CACHED corpus, `test-results/dot-cache/ebnf/<slug>/{in.puml,in.svg}`
 *     for the 44 `@startebnf` rows, pinned flat under
 *     `oracle/goldens/svg-ebnf/<slug>/` (`ratchet.json`, eep D9);
 *   - the AUTHORED root, {@link AUTHORED_EBNF_ROOT}, a FLAT committed
 *     tree of `<slug>.puml` + `<slug>.svg` pairs (the svg rendered by
 *     `scripts/oracle-render.sh`), tracked by `authored-baseline.json`.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { AssetStore } from '../../../src/core/asset-store.js';
import { withJarCompatibleStyleInput } from '../../../src/core/internal-render-options.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import type { IncludeStore } from '../../../src/core/tim/IncludeStore.js';
import { combineAssetStores, renderSync } from '../../../src/index.js';
import { buildEmojiAssetsStore } from '../../helpers/emoji-assets-store.js';
import { fixtureIncludeStore } from '../../helpers/fixture-include-store.js';
import { buildSpriteAssetsStore } from '../../helpers/sprite-assets-store.js';
import { buildUtilityAssetsStore } from '../../helpers/utility-assets-store.js';

/** The sprite, Twemoji and utility artwork the survey combines (`SURVEY_ASSET_STORE`). Built once. */
const EBNF_ASSET_STORE: AssetStore = combineAssetStores(
  buildSpriteAssetsStore(),
  buildEmojiAssetsStore(),
  buildUtilityAssetsStore(),
);

/** The name the survey gives every source; an error page prints it in `[From <name> (line N) ]`. */
const SURVEY_FILENAME = 'in.puml';

/**
 * Renders a `.puml` source through the PRODUCTION `renderSync` with the
 * survey's options: deterministic measurer, jar-compatible style input, the
 * survey's asset store and file name, and `includeStore` (the shared fixture
 * store when absent).
 */
export function renderFixtureEbnf(markup: string, includeStore?: IncludeStore): string {
  return renderSync(
    markup,
    withJarCompatibleStyleInput({
      measurer: new DeterministicMeasurer(),
      assetStore: EBNF_ASSET_STORE,
      includeStore: includeStore ?? fixtureIncludeStore(),
      filename: SURVEY_FILENAME,
    }),
  );
}

/** The committed, flat authored-fixture root (`<slug>.puml` + `<slug>.svg`). */
export const AUTHORED_EBNF_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures/ebnf');

const PUML_SUFFIX = '.puml';
const SVG_SUFFIX = '.svg';

/** Every authored fixture slug: the `*.puml` basenames under {@link AUTHORED_EBNF_ROOT}, sorted. */
export function listAuthoredEbnfSlugs(root: string = AUTHORED_EBNF_ROOT): string[] {
  return readdirSync(root)
    .filter((f) => f.endsWith(PUML_SUFFIX))
    .map((f) => f.slice(0, -PUML_SUFFIX.length))
    .sort();
}

/** One authored fixture's source and jar oracle (`undefined` when the svg is absent). */
export interface AuthoredEbnfFixture {
  readonly markup: string;
  readonly golden: string | undefined;
}

export function readAuthoredEbnfFixture(slug: string, root: string = AUTHORED_EBNF_ROOT): AuthoredEbnfFixture {
  const svgPath = join(root, slug + SVG_SUFFIX);
  return {
    markup: readFileSync(join(root, slug + PUML_SUFFIX), 'utf8'),
    golden: existsSync(svgPath) ? readFileSync(svgPath, 'utf8') : undefined,
  };
}
