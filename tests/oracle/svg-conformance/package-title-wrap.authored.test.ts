/**
 * Authored package-title-wrap gate (ptw, issue #219, D4): an empty `package` in a description diagram wraps its title
 * at the title style's `MaximumWidth` and its label at the body style's, and draws its name once.
 *
 * An empty description `package` is a leaf with a `USymbol`, so `GeneralImageBuilder.java:206-210` builds an
 * `EntityImageDescription`, whose image is `USymbolFolder.asSmall(name, desc, stereo)`
 * (`svek/image/EntityImageDescription.java:206-210`). Three upstream reads:
 *
 * - M1, the title: `name` is `BodyFactory.create2(…, codeDisplay, …, styleTitle)` (`EntityImageDescription.java:201-202`),
 *   a `BodyEnhanced1` (`cucadiagram/BodyFactory.java:74-77`) whose lines are `MethodsOrFieldsArea`s built with
 *   `style.wrapWidth()` (`cucadiagram/MethodsOrFieldsArea.java:255`, `:264`), the **title** style's `MaximumWidth`.
 * - M2, the label: `desc` is `create3(display, …, style.wrapWidth(), …)` (`EntityImageDescription.java:184-188`),
 *   wrapped at the **body** style's `MaximumWidth`, in the sizer as in the renderer.
 * - M3, the name once: `desc` is empty when `entity.getDisplay().equalsLike(Display.getWithNewlines(pragma,
 *   entity.getName()))` (`EntityImageDescription.java:180-183`; `klimt/creole/Display.java:118-122`), so a `\n` in
 *   the name compares line by line.
 *
 * Rows are the `.puml` files under `tests/fixtures/package-title-wrap/`, each with its jar `.svg` beside it
 * (`scripts/oracle-render.sh`).
 *
 * - A ZERO row has 0 `compareSvg` diffs and a comment sequence equal to the jar's (`svg-comments.ts`).
 * - An OPEN row's diff count and comment mismatch never rise, and its `reason` names #219 (with the task that owns
 *   it), the side-finding issue holding it, or the Smetana ruling (2026-08-09).
 *
 * Rendered as `scripts/svg-parity-survey.ts` renders a row, and as `plans/hidden-note-host/measurements/measure.mts`
 * measured the probes: `renderSync` + `withJarCompatibleStyleInput` + `DeterministicMeasurer` + the survey asset and
 * include stores + `filename: 'in.puml'` + the ELK backend from `prepareElkOnce()`.
 */
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { withJarCompatibleStyleInput } from '../../../src/core/internal-render-options.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import type { ElkBackend } from '../../../src/index.js';
import { combineAssetStores, renderSync } from '../../../src/index.js';
import { CI_RENDER_BUDGET_MS } from '../../helpers/ci-test-budgets.js';
import { buildEmojiAssetsStore } from '../../helpers/emoji-assets-store.js';
import { fixtureIncludeStore } from '../../helpers/fixture-include-store.js';
import { buildSpriteAssetsStore } from '../../helpers/sprite-assets-store.js';
import { buildUtilityAssetsStore } from '../../helpers/utility-assets-store.js';
import { compareSvg } from './compare.js';
import { prepareElkOnce } from './render-fixture-class.js';
import { commentMismatch, firstCommentDiff, svgComments } from './svg-comments.js';

vi.setConfig({ testTimeout: CI_RENDER_BUDGET_MS });

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(HERE, '../../fixtures/package-title-wrap');

/** Rows with 0 diffs and the jar's comments. */
const ZERO: readonly string[] = [
  // 2026-11-23 ptw T1: controls. `skinparam wrapWidth` reaches the label sizer through `opts.wrapWidth`
  // (`FromSkinparamToStyle.java:260`); with `as P` the display differs from the code, and the title `P` is short.
  'ptw-as-label-skinparam',
  // 2026-11-23 ptw T1: control. A non-empty package is a cluster; its title already wraps (`ClusterHeader.java:129`).
  'ptw-control-cluster',
  // 2026-11-23 ptw T1: control. No wrap setting: nothing wraps on either side.
  'ptw-control-nowrap',
  // 2026-11-23 ptw T1: control. An empty `node` group is not drawn by `USymbolFolder`; its label already wraps.
  'ptw-node-group',
  // 2026-11-23 ptw T1: control. Upstream's own `f29aa9bd058` fixture, a class diagram: an empty package there is an
  // `EntityImageEmptyPackage` (`GeneralImageBuilder.java:206-210` without a `USymbol`), already conformant.
  'ptw-upstream-3018',
  // 2026-11-24 ptw T2a (M1): the title is `create2` over `styleTitle`, whose `MethodsOrFieldsArea` lines wrap at
  // `style.wrapWidth()` (`MethodsOrFieldsArea.java:255`, `:264`), in the sizer and the renderer.
  // `package { MaximumWidth }`, `element { MaximumWidth }` and `skinparam wrapWidth` all reach `styleTitle`
  // (`FromSkinparamToStyle.java:260`); `package { title { MaximumWidth } }` wraps only the title. The `ptw-issue` DOT
  // node is the jar's `1.900694 x 0.902778`.
  'ptw-element-style',
  'ptw-fits',
  'ptw-issue',
  'ptw-skinparam',
  'ptw-stereo',
  'ptw-title-only',
  // 2026-11-24 ptw T2b (M2): the folder label sizer reads the body style's wrap first, as the renderer does
  // (`EntityImageDescription.java:184-188`); `skinparam wrapWidth` stays the fallback.
  'ptw-as-label',
  'ptw-folder',
  'ptw-linked',
  // 2026-11-24 ptw T2b push-forward, each with its jar oracle: a body `MinimumWidth` on an `as P` package (already 0);
  // a title `MinimumWidth`, now floored in the sizer as the renderer floors it (`BodyEnhanced1.java:182-184`); a creole
  // `**bold**` title over the wrap width; empty `frame`/`rectangle`/`cloud` groups with a long wrapped title.
  'ptw-cloud',
  'ptw-creole-bold',
  'ptw-frame',
  'ptw-min-width',
  'ptw-min-width-title',
  'ptw-rectangle',
  // 2026-11-24 ptw T2b push-forward: `skinparam packageStyle` gives an empty `package {}` its symbol at parse time,
  // so `GeneralImageBuilder.java:205-207` draws it with `EntityImageDescription` in that symbol (a rectangle, a node),
  // with or without a wrap width (`layout-package-style.ts` restyles empty package groups too).
  'ptw-package-style-rect',
  'ptw-psr-node',
  'ptw-psr-nowrap',
  // 2026-11-24 ptw T2c (M3): the display `equalsLike` `getWithNewlines(code)` (`EntityImageDescription.java:180-183`),
  // so a `\n` in a package's name draws it once, as the title. Push-forward, each with its jar oracle: a non-package
  // leaf whose code holds `\n` now takes the `fcTitle` branch (`:184-186`); a component title style shows it.
  'ptw-ctl-newline',
  'ptw-leaf-newline',
  'ptw-leaf-newline-title-font',
  'ptw-newline',
];

interface OpenRow {
  readonly maxDiffs: number;
  readonly maxComments: number;
  readonly reason: string;
}

/** Row -> the diffs and comment mismatch it may not exceed, and the issue that holds it. */
const OPEN: Readonly<Record<string, OpenRow>> = {
  // 2026-11-24 ptw T2b: the inner empty package's DOT node is the jar's (`1.880035 x 0.902778`); it is emitted before
  // the cluster's leaf `n`, where upstream emits leaves first (`GraphvizImageBuilder.java:440-442`), also with no
  // wrap setting: #278.
  'ptw-nested': { maxDiffs: 39, maxComments: 0, reason: "#278: an empty sub-package precedes its cluster's leaves" },
  // 2026-11-24 ptw T2b push-forward side findings, each reproduced with no wrap setting.
  'ptw-elk': { maxDiffs: 39, maxComments: 0, reason: '#279: ELK lays out an empty package unlike the jar' },
  'ptw-psr-leaf': {
    maxDiffs: 1,
    maxComments: 0,
    reason: '#280: a package element under packageStyle rect is not bold',
  },
};

const assetStore = combineAssetStores(buildSpriteAssetsStore(), buildEmojiAssetsStore(), buildUtilityAssetsStore());
let elk: ElkBackend | undefined;

beforeAll(async () => {
  elk = await prepareElkOnce();
});

function rowsOnDisk(): string[] {
  return readdirSync(FIXTURES)
    .filter((f) => f.endsWith('.puml'))
    .map((f) => f.slice(0, -'.puml'.length))
    .sort();
}

function measure(row: string): { diffs: number; comments: number; firstDiff: string } {
  const ours = renderSync(
    readFileSync(join(FIXTURES, `${row}.puml`), 'utf8'),
    withJarCompatibleStyleInput({
      measurer: new DeterministicMeasurer(),
      assetStore,
      includeStore: fixtureIncludeStore(),
      filename: 'in.puml',
      elk,
    }),
  );
  const jar = readFileSync(join(FIXTURES, `${row}.svg`), 'utf8');
  const { diffs } = compareSvg(ours, jar, 'svg');
  const oursComments = svgComments(ours);
  const jarComments = svgComments(jar);
  return {
    diffs: diffs.length,
    comments: commentMismatch(oursComments, jarComments),
    firstDiff: `${JSON.stringify(diffs[0] ?? null)} | ${firstCommentDiff(oursComments, jarComments)}`,
  };
}

describe('package-title-wrap authored fixtures — manifest shape', () => {
  it('rows are exactly the .puml files on disk, each listed once, each with its jar .svg', () => {
    const listed = [...ZERO, ...Object.keys(OPEN)].sort();
    expect(listed).toEqual(rowsOnDisk());
    expect(new Set(listed).size).toBe(listed.length);
    for (const row of listed) expect(existsSync(join(FIXTURES, `${row}.svg`)), `${row}: no jar .svg`).toBe(true);
  });

  it('every open row names its issue or the Smetana ruling', () => {
    expect(Object.entries(OPEN).filter(([, v]) => !/#\d+|ruling 2026-08-09/.test(v.reason))).toEqual([]);
  });
});

describe('package-title-wrap authored fixtures — zero rows', () => {
  for (const row of ZERO) {
    it(`${row}: 0 diffs and the jar's comments`, () => {
      const { diffs, comments, firstDiff } = measure(row);
      expect({ diffs, comments }, `${row}: ${firstDiff}`).toEqual({ diffs: 0, comments: 0 });
    });
  }
});

describe('package-title-wrap authored fixtures — open rows never rise', () => {
  for (const [row, { maxDiffs, maxComments, reason }] of Object.entries(OPEN)) {
    it(`${row}: diffs <= ${String(maxDiffs)}, comments <= ${String(maxComments)} (${reason})`, () => {
      const { diffs, comments, firstDiff } = measure(row);
      expect(diffs + comments, `${row}: now 0 diffs and the jar's comments — move it to ZERO`).toBeGreaterThan(0);
      expect(diffs, `${row}: ${firstDiff}`).toBeLessThanOrEqual(maxDiffs);
      expect(comments, `${row}: ${firstDiff}`).toBeLessThanOrEqual(maxComments);
    });
  }
});
