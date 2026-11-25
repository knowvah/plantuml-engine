/**
 * Authored state-node-label gate (snl, issue #235): `skinparam stateDiagramEdgeLabelStyle node` and the arrow-style
 * keywords `node` / `nonode` make the jar draw a transition's label as its own `STATE_TRANSITION_LABEL` leaf between
 * the two states, joined by two links (`statediagram/command/CommandLinkStateCommon.java:190-196`, `:323-386`).
 *
 * The leaf id ends in `System.currentTimeMillis()` (`CommandLinkStateCommon.java:388-395`); the comparator rewrites
 * that digit run to one token on both sides (decisions.md D2, `transition-node-id.ts`).
 *
 * Rows are the `.puml` files under `tests/fixtures/state-node-label/`, each with its jar `.svg` beside it
 * (`scripts/oracle-render.sh`).
 *
 * - A ZERO row has 0 `compareSvg` diffs and a comment sequence equal to the jar's (`svg-comments.ts`).
 * - An OPEN row's diff count and comment mismatch never rise, and its `reason` names #235 with the task that owns it,
 *   or the issue filed for it.
 * - A SMETANA row (`!pragma layout smetana`) is held by the dot-engine ruling (2026-08-09, decisions.md D5): its
 *   diff count never rises, and once `elementSet` is set its drawn element set and comments equal the jar's.
 *
 * Rendered as `scripts/svg-parity-survey.ts` renders a row: `renderSync` + `withJarCompatibleStyleInput` +
 * `DeterministicMeasurer` + the survey asset and include stores + `filename: 'in.puml'` + the ELK backend from
 * `prepareElkOnce()`.
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
const FIXTURES = join(HERE, '../../fixtures/state-node-label');

/** Rows with 0 diffs and the jar's comments. */
const ZERO: readonly string[] = [
  // 2026-11-24 snl T1: controls. `remove` of the label's host takes the label and both links (T6's rule keeps them).
  'snl-vega-transition-label-orphaned-by-remove-both-sides',
  'snl-vega-transition-label-orphaned-by-remove-source',
  // 2026-11-24 snl T2: `nonode` is in the shared `LINE_STYLE` key list (`CommandLinkElement.java:82-86`) and is a
  // no-op style, never a colour (`WithLinkType.java:157-161`). State, description, legacy activity and class parse it;
  // sequence refuses it (`CommandArrow.applyStyle` throws on a non-colour, `CommandArrow.java:482-502`), so the jar and
  // the port both route `snl-nonode-sequence` to CLASS.
  'snl-issue-nonode',
  'snl-nonode-activity-legacy',
  'snl-nonode-class',
  'snl-nonode-desc',
  'snl-nonode-plain-state',
  'snl-nonode-sequence',
  // 2026-11-24 snl T3+T4: the leaf and its two links (`CommandLinkStateCommon.java:323-386`) drawn as
  // `EntityImageTransitionLabel` (`:89-138`): no entity group, an unfilled frame rounded 5, the text centred in the
  // arrow font; link 1 `LinkType(NONE, NONE)` (association, no head), link 2 the original decors; `left`/`up` invert
  // both. `snl-stereotype`: the transition's `<<hot>>` never reaches the leaf or the links (`:323-386`).
  'snl-arrow-node',
  'snl-arrow-node-upper',
  'snl-composite',
  'snl-duplicate',
  'snl-issue',
  'snl-left',
  'snl-multiline',
  'snl-self',
  'snl-skinparam-font',
  'snl-skinparam-lower',
  'snl-start-end',
  'snl-stereotype',
  'snl-style-node-first',
  'snl-style-red-dashed-node',
  'snl-unlabelled',
  'snl-up',
  'snl-vega-nonode-override',
  'snl-vega-transition-label',
  'snl-vega-transition-label-arrow-style',
  // 2026-11-24 snl T6 (landed in batch 3): `isOrphanedTransitionLabel` (`CucaDiagram.java:778-831`). A hidden host
  // makes the label REMOVED (`:827`), and a link with a removed end leaves the graph (`Link.java:492-497`,
  // `GraphvizImageBuilder.java:229,239`): `snl-hide-label-host` draws only `A` and writes no link comment.
  // `hide`/`remove <<transition>>` fold the leaf by its own stereotype (`:338`).
  'snl-hide-label-host',
  'snl-vega-transition-label-orphaned-by-hide',
  'snl-vega-transition-label-orphaned-by-remove',
  'snl-vega-transition-label-remove-then-restore',
  'snl-pf-hide-transition-stereo',
  'snl-pf-remove-transition-stereo',
  // 2026-11-24 snl T4/T5 push-forward probes, each with its jar oracle: `-[#red,node]->` under `ArrowColor blue` (the
  // filtered style reaches both links), a quoted state (the id uses `getName()`), a creole label (sanitised id,
  // creole display), concurrent regions (`*start*CONC<n>`), `note on link` (hosted by the second link), and
  // `.transition { FontColor }` (the leaf's `<<transition>>` tier, `EntityImageTransitionLabel.java:67-68`).
  'snl-pf-concurrent',
  'snl-pf-creole',
  'snl-pf-note-on-link',
  'snl-pf-quoted-state',
  'snl-pf-red-arrowcolor',
  'snl-pf-transition-stereo-style',
];

interface OpenRow {
  readonly maxDiffs: number;
  readonly maxComments: number;
  readonly reason: string;
}

/** Row -> the diffs and comment mismatch it may not exceed, and the task or issue that holds it. */
const OPEN: Readonly<Record<string, OpenRow>> = {
  // 2026-11-24 snl T5: `stateDiagram { arrow { FontStyle bold } }` never reaches the label font: the port's arrow-font
  // cascade queries `classdiagram` for every engine (`style-cascade-class-snames.ts:13`), and a state-scoped field
  // would change the published Theme type. Held on #292 (needs a ruling); the edge label shows the same gap.
  'snl-style-statediagram-arrow': {
    maxDiffs: 1,
    maxComments: 0,
    reason: '#292: stateDiagram arrow FontStyle never reaches the label',
  },
  // 2026-11-24 snl T7: the state engine has no ELK path, so `!pragma layout elk` draws the dot layout (offset 5, ELK's
  // tighter ranks; the jar's ELK SVG writes no link comments). Large and separable (D6): #293.
  'snl-elk': { maxDiffs: 25, maxComments: 2, reason: '#293: state ignores !pragma layout elk' },
};

interface SmetanaRow extends OpenRow {
  /** True once the port draws the jar's element set (D5); the geometry stays held by the ruling. */
  readonly elementSet: boolean;
}

/** `!pragma layout smetana` rows: geometry held by the dot-engine ruling (2026-08-09, decisions.md D5). */
const SMETANA: Readonly<Record<string, SmetanaRow>> = {
  // 2026-11-24 snl T3+T6: the element set is the jar's (the label leaf is removed with `Faulted`, D5). The label image
  // matches (T4); what is left is Smetana's geometry, and the jar's Smetana SVG writes no link comments. Ruling.
  'snl-vega-smetana-hide': {
    maxDiffs: 35,
    maxComments: 2,
    elementSet: true,
    reason: 'ruling 2026-08-09: Smetana geometry only (dot-engine, not Smetana)',
  },
  // 2026-11-24 snl T4 push-forward: the issue repro under `!pragma layout smetana`, same element set, geometry held.
  'snl-pf-smetana-issue': {
    maxDiffs: 33,
    maxComments: 2,
    elementSet: true,
    reason: 'ruling 2026-08-09: Smetana geometry only (dot-engine, not Smetana)',
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

function render(row: string): { ours: string; jar: string } {
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
  return { ours, jar: readFileSync(join(FIXTURES, `${row}.svg`), 'utf8') };
}

function measure(row: string): { diffs: number; comments: number; firstDiff: string } {
  const { ours, jar } = render(row);
  const { diffs } = compareSvg(ours, jar, 'svg');
  const oursComments = svgComments(ours);
  const jarComments = svgComments(jar);
  return {
    diffs: diffs.length,
    comments: commentMismatch(oursComments, jarComments),
    firstDiff: `${JSON.stringify(diffs[0] ?? null)} | ${firstCommentDiff(oursComments, jarComments)}`,
  };
}

/** The drawn element set: every `<g class=... id=...>` and every `<text>` body, sorted. */
function elementSet(svg: string): string[] {
  const groups = [...svg.matchAll(/<g class="([^"]+)"[^>]*? id="([^"]+)"/g)].map((m) => `g:${m[1]!}:${m[2]!}`);
  const texts = [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => `text:${m[1]!}`);
  return [...groups, ...texts].sort();
}

describe('state-node-label authored fixtures — manifest shape', () => {
  it('rows are exactly the .puml files on disk, each listed once, each with its jar .svg', () => {
    const listed = [...ZERO, ...Object.keys(OPEN), ...Object.keys(SMETANA)].sort();
    expect(listed).toEqual(rowsOnDisk());
    expect(new Set(listed).size).toBe(listed.length);
    for (const row of listed) expect(existsSync(join(FIXTURES, `${row}.svg`)), `${row}: no jar .svg`).toBe(true);
  });

  it('every open row names its issue or the Smetana ruling', () => {
    const rows = [...Object.entries(OPEN), ...Object.entries(SMETANA)];
    expect(rows.filter(([, v]) => !/#\d+|ruling 2026-08-09/.test(v.reason))).toEqual([]);
  });

  it('elementSet lists groups and texts, sorted', () => {
    const svg = '<g class="link" data-x="1" id="lnk4"><text x="1">go</text></g><g class="entity" id="ent0001"/>';
    expect(elementSet(svg)).toEqual(['g:entity:ent0001', 'g:link:lnk4', 'text:go']);
  });
});

describe('state-node-label authored fixtures — zero rows', () => {
  for (const row of ZERO) {
    it(`${row}: 0 diffs and the jar's comments`, () => {
      const { diffs, comments, firstDiff } = measure(row);
      expect({ diffs, comments }, `${row}: ${firstDiff}`).toEqual({ diffs: 0, comments: 0 });
    });
  }
});

describe('state-node-label authored fixtures — open rows never rise', () => {
  for (const [row, { maxDiffs, maxComments, reason }] of Object.entries(OPEN)) {
    it(`${row}: diffs <= ${String(maxDiffs)}, comments <= ${String(maxComments)} (${reason})`, () => {
      const { diffs, comments, firstDiff } = measure(row);
      expect(diffs + comments, `${row}: now 0 diffs and the jar's comments — move it to ZERO`).toBeGreaterThan(0);
      expect(diffs, `${row}: ${firstDiff}`).toBeLessThanOrEqual(maxDiffs);
      expect(comments, `${row}: ${firstDiff}`).toBeLessThanOrEqual(maxComments);
    });
  }
});

describe('state-node-label authored fixtures — Smetana rows (ruling 2026-08-09)', () => {
  for (const [row, { maxDiffs, maxComments, elementSet: sameSet, reason }] of Object.entries(SMETANA)) {
    it(`${row}: diffs <= ${String(maxDiffs)}, comments <= ${String(maxComments)} (${reason})`, () => {
      const { diffs, comments, firstDiff } = measure(row);
      expect(diffs, `${row}: ${firstDiff}`).toBeLessThanOrEqual(maxDiffs);
      expect(comments, `${row}: ${firstDiff}`).toBeLessThanOrEqual(maxComments);
      const { ours, jar } = render(row);
      if (sameSet) expect(elementSet(ours)).toEqual(elementSet(jar));
      else expect(elementSet(ours)).not.toEqual(elementSet(jar));
    });
  }
});
