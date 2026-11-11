/**
 * Shared render helper for the svg-timing oracle harness (tep T4a), a copy of `render-fixture-timing.ts`.
 *
 * A THIN wrapper around the production `renderSync`: the timing engine is
 * reached through dispatch (`registered-plugins.ts`, `PSystemBuilder.java:187`),
 * so the survey and this harness differ only in what a caller injects. Like `render-fixture-files.ts` it renders in jar-compatible
 * style mode, because the survey renders every row that way
 * (`scripts/svg-parity-survey.ts`), and passes the survey's `filename`, which
 * an error page prints.
 *
 * TWO fixture roots:
 *   - the CACHED corpus, `test-results/dot-cache/timing/<slug>/{in.puml,in.svg}`
 *     the `@startuml` timing rows;
 *   - the AUTHORED root, {@link AUTHORED_TIMING_ROOT}, a FLAT committed
 *     tree of `<slug>.puml` + `<slug>.svg` pairs (the svg rendered by
 *     `scripts/oracle-render.sh`), tracked by `authored-baseline.json`.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Clock } from '../../../src/core/clock.js';
import type { AssetStore } from '../../../src/core/asset-store.js';
import { withClock, withJarCompatibleStyleInput } from '../../../src/core/internal-render-options.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import type { IncludeStore } from '../../../src/core/tim/IncludeStore.js';
import { combineAssetStores, renderSync } from '../../../src/index.js';
import { clockForKey, corpusClockKey, fixtureClockKey } from './capture-clock.js';
import { buildEmojiAssetsStore } from '../../helpers/emoji-assets-store.js';
import { fixtureIncludeStore } from '../../helpers/fixture-include-store.js';
import { buildSpriteAssetsStore } from '../../helpers/sprite-assets-store.js';
import { buildUtilityAssetsStore } from '../../helpers/utility-assets-store.js';

/** The sprite, Twemoji and utility artwork the survey combines (`SURVEY_ASSET_STORE`). Built once. */
const TIMING_ASSET_STORE: AssetStore = combineAssetStores(
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
export function renderFixtureTiming(markup: string, includeStore?: IncludeStore, clock?: Clock): string {
  const options = withJarCompatibleStyleInput({
    measurer: new DeterministicMeasurer(),
    assetStore: TIMING_ASSET_STORE,
    includeStore: includeStore ?? fixtureIncludeStore(),
    filename: SURVEY_FILENAME,
  });
  return renderSync(markup, withClock(options, clock));
}

/**
 * The recorded capture clock for a timing `slug` (D4: `use date format` formats in the jar host's zone), or
 * `undefined` for a source that does not read it. A corpus row is keyed `timing/<slug>`, an authored fixture
 * `fixtures/timing/<slug>` (capture-clock.ts).
 */
export function timingClockFor(slug: string): Clock | undefined {
  return clockForKey(corpusClockKey('timing', slug)) ?? clockForKey(fixtureClockKey(`timing/${slug}`));
}

/** The committed, flat authored-fixture root (`<slug>.puml` + `<slug>.svg`). */
export const AUTHORED_TIMING_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures/timing');

const PUML_SUFFIX = '.puml';
const SVG_SUFFIX = '.svg';

/** Every authored fixture slug: the `*.puml` basenames under {@link AUTHORED_TIMING_ROOT}, sorted. */
export function listAuthoredTimingSlugs(root: string = AUTHORED_TIMING_ROOT): string[] {
  return readdirSync(root)
    .filter((f) => f.endsWith(PUML_SUFFIX))
    .map((f) => f.slice(0, -PUML_SUFFIX.length))
    .sort();
}

/** One authored fixture's source and jar oracle (`undefined` when the svg is absent). */
export interface AuthoredTimingFixture {
  readonly markup: string;
  readonly golden: string | undefined;
}

export function readAuthoredTimingFixture(slug: string, root: string = AUTHORED_TIMING_ROOT): AuthoredTimingFixture {
  const svgPath = join(root, slug + SVG_SUFFIX);
  return {
    markup: readFileSync(join(root, slug + PUML_SUFFIX), 'utf8'),
    golden: existsSync(svgPath) ? readFileSync(svgPath, 'utf8') : undefined,
  };
}
