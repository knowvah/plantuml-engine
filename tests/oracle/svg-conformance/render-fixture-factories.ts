/**
 * Shared low-level render helper for the svg-factories oracle harness
 * (creole-math-factories-port / T4), a copy of `render-fixture-utility.ts`.
 *
 * A THIN wrapper around the production `renderSync` (`src/index.ts`), exactly
 * what the survey calls (`scripts/svg-parity-survey.ts` `surveyRenderOptions`):
 * deterministic measurer, jar-compatible style input, the survey's asset store
 * and `filename`, and the recorded capture clock where a row has one
 * (`oracle/capture-clock.json`).
 *
 * The population is a FIXED list of 41 cached `unknown` rows
 * ({@link FACTORIES_SLUGS}), not a whole cache dir: the Definition, Math,
 * Latex, Creole and Help factories (`PSystemBuilder.java:169-188`) have no
 * cache tree of their own -- the unknown bucket holds them. Every tool and
 * gate in this family reads and writes only these rows.
 *
 * A SECOND, authored root: {@link AUTHORED_FACTORIES_ROOT}, a FLAT committed
 * tree of `<slug>.puml` + `<slug>.svg` pairs (the svg rendered by
 * `scripts/oracle-render.sh`), tracked by `authored-baseline.json`, never by
 * `diff-baseline.json`/`ratchet.json`.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { combineAssetStores, type AssetStore } from '../../../src/core/asset-store.js';
import type { Clock } from '../../../src/core/clock.js';
import { withClock, withJarCompatibleStyleInput } from '../../../src/core/internal-render-options.js';
import type { StringMeasurer } from '../../../src/core/measurer.js';
import type { IncludeStore } from '../../../src/core/tim/IncludeStore.js';
import { fullDescription } from '../../../src/core/version.js';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { buildEmojiAssetsStore } from '../../helpers/emoji-assets-store.js';
import { fixtureIncludeStore } from '../../helpers/fixture-include-store.js';
import { buildSpriteAssetsStore } from '../../helpers/sprite-assets-store.js';
import { buildUtilityAssetsStore } from '../../helpers/utility-assets-store.js';
import { clockForKey, corpusClockKey, fixtureClockKey } from './capture-clock.js';
import { compareSvg, weightedScore } from './compare.js';
import { remoteImageFixtureStore } from './remote-image-fixtures.js';

/**
 * The 41 in-scope `test-results/dot-cache/unknown/<slug>` rows, in the order
 * of `plans/creole-math-factories-port/measurements/factory-rows.mjs` (factory,
 * then slug).
 */
export const FACTORIES_SLUGS: readonly string[] = [
  'banire-12-feze162', // Definition (PSystemBuilder.java:169)
  'firiru-71-viki803',
  'caruta-83-deta919', // Math       (PSystemBuilder.java:172)
  'cukuba-10-cipo394',
  'geravi-79-nafu641',
  'kunuja-48-ropa074',
  'losizo-97-tiki566',
  'renice-72-peda344',
  'savudo-32-lopu722',
  'sozeke-50-rilu829',
  'tijica-43-sesu519',
  'velono-84-vude605',
  'zoziko-62-toko934',
  'fajagi-98-funo863', // Latex      (PSystemBuilder.java:173)
  'seluva-39-xebe172',
  'bibeso-63-kazo655', // Creole     (PSystemBuilder.java:174)
  'cunotu-47-bute165',
  'fisoma-58-kobo261',
  'gapeji-48-keze681',
  'jugepi-77-xude968',
  'kebadi-11-fula439',
  'kurugo-90-pabi007',
  'marese-34-xaro137',
  'mimumu-93-fota059',
  'nurile-03-kumi912',
  'pecafo-64-rili177',
  'pizepu-20-bero680',
  'potezi-53-doku302',
  'raxanu-33-xuzu111',
  'roxita-24-tixu731',
  'rozesu-56-suve592',
  'sukuje-36-libo212',
  'vocalo-20-dixu237',
  'xanuke-94-tope429',
  'xavefa-87-tabi094',
  'ziboza-73-cexo876',
  'cikoge-60-riti614', // Help       (PSystemBuilder.java:188)
  'ficame-31-lece592',
  'kesexi-71-dubu320',
  'mefure-90-gitu244',
  'xasanu-61-guze787',
];

/** The cache type directory every factories row sits in. */
export const FACTORIES_CACHE_TYPE = 'unknown';

/** `renderFixtureFactories`'s options bag -- the two `RenderOptions` fields a fixture caller may pass. */
export interface FactoriesFixtureRenderOptions {
  assetStore?: AssetStore;
  includeStore?: IncludeStore;
  clock?: Clock | undefined;
}

/** The name the survey gives every source; an error page prints it in `[From <name> (line N) ]`. */
const SURVEY_FILENAME = 'in.puml';

/**
 * The recorded capture clock for a factories `slug`, or `undefined` for a source that does not read it. A corpus
 * row is keyed `unknown/<slug>`, an authored fixture `fixtures/factories/<slug>` (capture-clock.ts).
 */
export function factoriesClockFor(slug: string): Clock | undefined {
  return clockForKey(corpusClockKey(FACTORIES_CACHE_TYPE, slug)) ?? clockForKey(fixtureClockKey(`factories/${slug}`));
}

/**
 * The store the survey renders with (`scripts/svg-parity-survey.ts` `SURVEY_ASSET_STORE`):
 * sprites + emoji + the utility pictures (T1i) + the golden-decoded remote image
 * bytes (sdd3-b6 T6g, `remote-image-fixtures.ts`), so a factories or sequence row
 * measures here as it surveys. Keep this in step with the survey's own store.
 */
export function surveyAssetStore(): AssetStore {
  return combineAssetStores(
    buildSpriteAssetsStore(),
    buildEmojiAssetsStore(),
    buildUtilityAssetsStore(),
    remoteImageFixtureStore(),
  );
}

/**
 * Renders a `.puml` fixture through the PRODUCTION `renderSync` entry point
 * with the survey's options: `measurer` and `options` forwarded, jar-compatible
 * style input, the survey's file name, and the recorded clock when given.
 */
export function renderFixtureFactories(
  markup: string,
  measurer: StringMeasurer,
  options?: FactoriesFixtureRenderOptions,
): string {
  const { clock, ...rest } = options ?? {};
  return renderSync(
    markup,
    withClock(withJarCompatibleStyleInput({ measurer, filename: SURVEY_FILENAME, ...rest }), clock),
  );
}

/** `ERROR_SENTINEL`'s fixed marker text (`src/core/dispatcher.ts:369`). */
export const ERROR_SENTINEL_MARKER = 'Error: unknown diagram type';

/** Why a sentinel render is recorded as `error` (dispatcher.ts:361-375). */
export const SENTINEL_REASON = 'renders ERROR_SENTINEL (dispatcher.ts:361-375) -- no plugin registers this factory';

/** Why a PSystemError-banner render is recorded as `error`. */
export const ERROR_PAGE_REASON =
  "renders this port's PSystemError banner page (dispatcher refusal) -- no plugin registers this factory";

export type FactoriesMeasure =
  | { readonly errored: false; readonly weightedScore: number; readonly diffCount: number }
  | { readonly errored: true; readonly reason: string };

/**
 * Renders `markup` with `DeterministicMeasurer` and compares to the jar `golden`.
 * Three distinct error conditions feed `errored: true`: a thrown exception, the
 * dispatcher sentinel, and our own error banner -- comparing either placeholder
 * against a real jar render would pin a baseline over unrelated geometry.
 */
export function measureFactoriesMarkup(markup: string, golden: string, clock?: Clock): FactoriesMeasure {
  try {
    const ours = renderFixtureFactories(markup, new DeterministicMeasurer(), {
      assetStore: surveyAssetStore(),
      includeStore: fixtureIncludeStore(),
      clock,
    });
    if (ours.includes(ERROR_SENTINEL_MARKER)) return { errored: true, reason: SENTINEL_REASON };
    if (ours.includes(`>${fullDescription()}</text>`)) return { errored: true, reason: ERROR_PAGE_REASON };
    const { diffs } = compareSvg(ours, golden, 'deterministic');
    return { errored: false, weightedScore: weightedScore(diffs), diffCount: diffs.length };
  } catch (err) {
    return { errored: true, reason: err instanceof Error ? err.message : String(err) };
  }
}

/** Measures one cached row: `<cacheRoot>/unknown/<slug>/{in.puml,in.svg}`. */
export function measureFactoriesSlug(cacheRoot: string, slug: string): FactoriesMeasure {
  const dir = `${cacheRoot}/${FACTORIES_CACHE_TYPE}/${slug}`;
  return measureFactoriesMarkup(
    readFileSync(`${dir}/in.puml`, 'utf8'),
    readFileSync(`${dir}/in.svg`, 'utf8'),
    factoriesClockFor(slug),
  );
}

/** The committed, flat authored-fixture root (`<slug>.puml` + `<slug>.svg`). */
export const AUTHORED_FACTORIES_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures/factories');

const PUML_SUFFIX = '.puml';
const SVG_SUFFIX = '.svg';

/** Every authored fixture slug: the `*.puml` basenames under {@link AUTHORED_FACTORIES_ROOT}, sorted. */
export function listAuthoredFactoriesSlugs(root: string = AUTHORED_FACTORIES_ROOT): string[] {
  return readdirSync(root)
    .filter((f) => f.endsWith(PUML_SUFFIX))
    .map((f) => f.slice(0, -PUML_SUFFIX.length))
    .sort();
}

/** One authored fixture's source and jar oracle (`undefined` when the svg is absent). */
export interface AuthoredFactoriesFixture {
  readonly markup: string;
  readonly golden: string | undefined;
}

export function readAuthoredFactoriesFixture(
  slug: string,
  root: string = AUTHORED_FACTORIES_ROOT,
): AuthoredFactoriesFixture {
  const svgPath = join(root, slug + SVG_SUFFIX);
  return {
    markup: readFileSync(join(root, slug + PUML_SUFFIX), 'utf8'),
    golden: existsSync(svgPath) ? readFileSync(svgPath, 'utf8') : undefined,
  };
}

/** Renders an authored fixture exactly as {@link measureFactoriesMarkup} does (survey asset store, delta 3). */
export function renderAuthoredFactories(markup: string, slug?: string): string {
  return renderFixtureFactories(markup, new DeterministicMeasurer(), {
    assetStore: surveyAssetStore(),
    includeStore: fixtureIncludeStore(),
    clock: slug === undefined ? undefined : factoriesClockFor(slug),
  });
}

/** True when `ours` is this port's error banner page or the dispatcher sentinel. */
export function isOurErrorPage(ours: string): boolean {
  return ours.includes(ERROR_SENTINEL_MARKER) || ours.includes(`>${fullDescription()}</text>`);
}

export type AuthoredFactoriesMeasure =
  | {
      readonly errored: false;
      readonly weightedScore: number;
      readonly diffCount: number;
      readonly structural: number;
      readonly weErrored: boolean;
    }
  | { readonly errored: true; readonly reason: string };

/**
 * Measures one authored row against the jar oracle beside it. Unlike
 * {@link measureFactoriesMarkup}, an error page on our side is still COMPARED
 * (wep T5-cov's shape): the 2026-10-10 rule makes "jar errors + we error"
 * conformant, so an authored error row is gated on its residual, and
 * `weErrored` feeds the error-parity test.
 */
export function measureAuthoredFactories(
  slug: string,
  root: string = AUTHORED_FACTORIES_ROOT,
): AuthoredFactoriesMeasure {
  const { markup, golden } = readAuthoredFactoriesFixture(slug, root);
  if (golden === undefined) return { errored: true, reason: `${slug}.svg is missing` };
  try {
    const ours = renderAuthoredFactories(markup, slug);
    const { diffs } = compareSvg(ours, golden, 'deterministic');
    const structural = diffs.filter((d) => d.delta === undefined).length;
    return {
      errored: false,
      weightedScore: weightedScore(diffs),
      diffCount: diffs.length,
      structural,
      weErrored: isOurErrorPage(ours),
    };
  } catch (err) {
    return { errored: true, reason: err instanceof Error ? err.message : String(err) };
  }
}
