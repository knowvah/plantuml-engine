/**
 * Shared render helper for the svg-flow oracle harness (flp D7), a copy of
 * `render-fixture-bpm.ts`.
 *
 * A THIN wrapper around the production `renderSync`: the flow engine is
 * reached through dispatch (`registered-plugins.ts`, `PSystemBuilder.java:185`),
 * so the survey and this harness differ only in what a caller injects. Like `render-fixture-files.ts` it renders in jar-compatible
 * style mode, because the survey renders every row that way
 * (`scripts/svg-parity-survey.ts`), and passes the survey's `filename`, which
 * an error page prints.
 *
 * TWO fixture roots:
 *   - the CACHED corpus, `test-results/dot-cache/unknown/<slug>/{in.puml,in.svg}`
 *     for the `@startflow` row, pinned under
 *     `oracle/goldens/svg-flow/unknown/<slug>/` (`ratchet.json`);
 *   - the AUTHORED root, {@link AUTHORED_FLOW_ROOT}, a FLAT committed
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
const FLOW_ASSET_STORE: AssetStore = combineAssetStores(
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
export function renderFixtureFlow(markup: string, includeStore?: IncludeStore): string {
  return renderSync(
    markup,
    withJarCompatibleStyleInput({
      measurer: new DeterministicMeasurer(),
      assetStore: FLOW_ASSET_STORE,
      includeStore: includeStore ?? fixtureIncludeStore(),
      filename: SURVEY_FILENAME,
    }),
  );
}

/** The committed, flat authored-fixture root (`<slug>.puml` + `<slug>.svg`). */
export const AUTHORED_FLOW_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures/flow');

const PUML_SUFFIX = '.puml';
const SVG_SUFFIX = '.svg';

/** Every authored fixture slug: the `*.puml` basenames under {@link AUTHORED_FLOW_ROOT}, sorted. */
export function listAuthoredFlowSlugs(root: string = AUTHORED_FLOW_ROOT): string[] {
  return readdirSync(root)
    .filter((f) => f.endsWith(PUML_SUFFIX))
    .map((f) => f.slice(0, -PUML_SUFFIX.length))
    .sort();
}

/** One authored fixture's source and jar oracle (`undefined` when the svg is absent). */
export interface AuthoredFlowFixture {
  readonly markup: string;
  readonly golden: string | undefined;
}

export function readAuthoredFlowFixture(slug: string, root: string = AUTHORED_FLOW_ROOT): AuthoredFlowFixture {
  const svgPath = join(root, slug + SVG_SUFFIX);
  return {
    markup: readFileSync(join(root, slug + PUML_SUFFIX), 'utf8'),
    golden: existsSync(svgPath) ? readFileSync(svgPath, 'utf8') : undefined,
  };
}

/**
 * A `CommandLineSimple` line, which adds one box: `[nsew ]id "label"`, the
 * label in `%g` quotes (`CommandLineSimple.java:56-66`; `%g` is `"`, `\u201c`, `\u201d`
 * and Jaws' invisible quote, `Pattern2.java:59`). Case-insensitive, as
 * `Pattern2.java:114` compiles every command regex.
 */
const BOX_LINE = /^\s*(?:[nsew]\s+)?\w+\s+["\u201c\u201d\ue121].*["\u201c\u201d\ue121]\s*$/i;

/**
 * The boxes a source draws, counted from its lines (flp D6: a fixture is
 * classified by box count, never by observed jar stability). Two or more
 * boxes make the jar's output follow identity-hash order (flp D4).
 */
export function countFlowBoxes(markup: string): number {
  return markup.split('\n').filter((line) => BOX_LINE.test(line)).length;
}

/**
 * The jar oracles recorded for an authored fixture: `<slug>.svg`, then each
 * distinct layout `jar-variants.mjs` found as `<slug>.v2.svg`, `<slug>.v3.svg`, ...
 */
export function readAuthoredFlowVariants(slug: string, root: string = AUTHORED_FLOW_ROOT): string[] {
  const out = [readFileSync(join(root, slug + SVG_SUFFIX), 'utf8')];
  for (let n = 2; existsSync(join(root, `${slug}.v${n}${SVG_SUFFIX}`)); n++)
    out.push(readFileSync(join(root, `${slug}.v${n}${SVG_SUFFIX}`), 'utf8'));
  return out;
}
