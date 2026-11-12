/**
 * Shared render helper for the svg-cheneer oracle harness (ceep T3a), a copy of `render-fixture-regex.ts` (rep D7; itself a copy of `render-fixture-ebnf.ts`, a copy of
 * `render-fixture-nwdiag.ts`).
 *
 * A THIN wrapper around the production `renderSync`: the chen eer engine is
 * reached through dispatch (`registered-plugins.ts`, `PSystemBuilder.java:199`),
 * so the survey and this harness differ only in what a caller injects. Like `render-fixture-files.ts` it renders in jar-compatible
 * style mode, because the survey renders every row that way
 * (`scripts/svg-parity-survey.ts`), and passes the survey's `filename`, which
 * an error page prints.
 *
 * ONE fixture root: the corpus has no `@startchen` row (ceep D6), so every
 * row is AUTHORED under {@link AUTHORED_CHENEER_ROOT}, a FLAT committed tree
 * of `<slug>.puml` + `<slug>.svg` pairs (the svg rendered by
 * `scripts/oracle-render.sh`), tracked by `authored-baseline.json`.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { AssetStore } from '../../../src/core/asset-store.js';
import { withJarCompatibleStyleInput } from '../../../src/core/internal-render-options.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import type { IncludeStore } from '../../../src/core/tim/IncludeStore.js';
import { combineAssetStores, loadElk, renderSync, type ElkBackend } from '../../../src/index.js';
import { buildEmojiAssetsStore } from '../../helpers/emoji-assets-store.js';
import { fixtureIncludeStore } from '../../helpers/fixture-include-store.js';
import { buildSpriteAssetsStore } from '../../helpers/sprite-assets-store.js';
import { buildUtilityAssetsStore } from '../../helpers/utility-assets-store.js';

/** The sprite, Twemoji and utility artwork the survey combines (`SURVEY_ASSET_STORE`). Built once. */
const CHENEER_ASSET_STORE: AssetStore = combineAssetStores(
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
export function renderFixtureCheneer(markup: string, includeStore?: IncludeStore): string {
  return renderSync(
    markup,
    withJarCompatibleStyleInput({
      measurer: new DeterministicMeasurer(),
      assetStore: CHENEER_ASSET_STORE,
      includeStore: includeStore ?? fixtureIncludeStore(),
      filename: SURVEY_FILENAME,
      ...(preparedElk === undefined ? {} : { elk: preparedElk }),
    }),
  );
}

let elkLoad: Promise<ElkBackend> | undefined;
let preparedElk: ElkBackend | undefined;

/**
 * ceep T3d: loads elkjs ONCE per module instance and remembers the backend, so
 * {@link renderFixtureCheneer} passes `{ elk }` as the survey does
 * (`scripts/svg-parity-survey.ts`); `renderSync` refuses `!pragma layout elk`
 * without it. The `render-fixture-class.ts#prepareElkOnce` precedent: callers
 * `await prepareElkOnce()` (a ratchet in `beforeAll`) before rendering.
 */
export function prepareElkOnce(): Promise<ElkBackend> {
  elkLoad ??= loadElk().then((backend) => (preparedElk = backend));
  return elkLoad;
}

/** The committed, flat authored-fixture root (`<slug>.puml` + `<slug>.svg`). */
export const AUTHORED_CHENEER_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures/cheneer');

const PUML_SUFFIX = '.puml';
const SVG_SUFFIX = '.svg';

/** Every authored fixture slug: the `*.puml` basenames under {@link AUTHORED_CHENEER_ROOT}, sorted. */
export function listAuthoredCheneerSlugs(root: string = AUTHORED_CHENEER_ROOT): string[] {
  return readdirSync(root)
    .filter((f) => f.endsWith(PUML_SUFFIX))
    .map((f) => f.slice(0, -PUML_SUFFIX.length))
    .sort();
}

/** One authored fixture's source and jar oracle (`undefined` when the svg is absent). */
export interface AuthoredCheneerFixture {
  readonly markup: string;
  readonly golden: string | undefined;
}

export function readAuthoredCheneerFixture(slug: string, root: string = AUTHORED_CHENEER_ROOT): AuthoredCheneerFixture {
  const svgPath = join(root, slug + SVG_SUFFIX);
  return {
    markup: readFileSync(join(root, slug + PUML_SUFFIX), 'utf8'),
    golden: existsSync(svgPath) ? readFileSync(svgPath, 'utf8') : undefined,
  };
}
