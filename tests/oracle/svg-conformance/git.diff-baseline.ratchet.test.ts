/**
 * The svg-git rows that are not zero-diff (gip D8), a copy of
 * `bpm.diff-baseline.ratchet.test.ts` extended with the structural tier.
 *
 * Two manifests, both under `oracle/goldens/svg-git/`:
 *   - `diff-baseline.json`: the cached rows the jar draws that read `diverged`
 *     because some curves have a different cubic-piece count (lagapi-44,
 *     figagi-40: U-NS routing, `DIVERGENCES.md` git table). Goldens beside
 *     `ratchet.json`'s, at `unknown/<slug>/`.
 *   - `authored-baseline.json`: one row per `tests/fixtures/git/<slug>.puml`
 *     (+ the jar's `<slug>.svg`). A jar error page where we also error is
 *     conformant by the 2026-10-10 ruling (`jarError`); a row the jar draws
 *     carries the survey verdict it holds and its `reason`.
 *
 * Every non-error row is held at its survey verdict (`diffVerdict`) and its
 * `maxDelta` ceiling, which may only fall, plus a weighted score that never
 * rises. A row whose verdict IMPROVES fails with a message to re-pin it.
 *
 * Re-measure: `npx jiti plans/git-engine-port/measurements/build-authored-baseline.mts <commit> [--write]` and
 * `build-diff-baseline.mts <commit> [--write]`.
 */
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { diffVerdict } from '../../../scripts/svg-parity-survey.js';
import { compareSvg, weightedScore } from './compare.js';
import { listAuthoredGitSlugs, readAuthoredGitFixture, renderFixtureGit } from './render-fixture-git.js';

type Verdict = 'conformant' | 'structural-match' | 'diverged';

interface BaselineFixture {
  readonly type: string;
  readonly slug: string;
  readonly status: 'baseline';
  readonly weightedScore: number;
  readonly diffCount: number;
  readonly verdict?: Verdict;
  readonly maxDelta?: number;
  readonly reason?: string;
  readonly jarError?: { readonly line: number | null; readonly message: string };
  readonly measuredAt: string;
  readonly measuredAgainstCommit: string;
}

const HERE = dirname(fileURLToPath(import.meta.url));
const GOLDENS_DIR = join(HERE, '../../../oracle/goldens/svg-git');
const CACHE_DIR = join(HERE, '../../../test-results/dot-cache');
/** The `@startgit` rows at gip's start (`measurements/planning-rows.json`), all in `unknown`. */
const GIT_ROW_COUNT = 4;
/** Better verdicts first: a row may move left, never right. */
const VERDICT_ORDER: readonly Verdict[] = ['conformant', 'structural-match', 'diverged'];
/** Where every drawn non-conformant row's mechanism is named. */
const DIVERGENCE_TABLE = 'DIVERGENCES.md';

const readJson = <T>(name: string): T => JSON.parse(readFileSync(join(GOLDENS_DIR, name), 'utf8')) as T;
const authored = readJson<{ readonly fixtures: readonly BaselineFixture[] }>('authored-baseline.json');
const diffBaseline = readJson<{ readonly fixtures: readonly BaselineFixture[] }>('diff-baseline.json');
const ratchet = readJson<{ readonly fixtures: readonly { readonly slug: string; readonly type: string }[] }>(
  'ratchet.json',
);

/** The root `<svg>`'s `data-diagram-type`; absent on both engines' error pages. */
function diagramTypeOf(svg: string): string | undefined {
  const root = /^<svg[^>]*>/.exec(svg)?.[0] ?? '';
  return /\sdata-diagram-type="([^"]*)"/.exec(root)?.[1];
}

/** `f` still holds its verdict (no better, no worse) and its `maxDelta` ceiling. */
function expectHeld(f: BaselineFixture, ours: string, golden: string): void {
  const v = diffVerdict(ours, golden);
  const now = VERDICT_ORDER.indexOf(v.verdict as Verdict);
  const pinned = VERDICT_ORDER.indexOf(f.verdict!);
  expect(now, `${f.slug}: verdict ${v.verdict} is worse than the pinned ${f.verdict}`).toBeLessThanOrEqual(pinned);
  expect(now, `${f.slug}: verdict improved to ${v.verdict}: re-pin it from a fresh measurement`).toBe(pinned);
  expect(v.maxDelta ?? 0, `${f.slug}: maxDelta rose above its ceiling`).toBeLessThanOrEqual(f.maxDelta!);
  const { diffs } = compareSvg(ours, golden, 'deterministic');
  expect(weightedScore(diffs), `${f.slug}: score rose. Re-pin only from a fresh measurement.`).toBeLessThanOrEqual(
    f.weightedScore,
  );
}

describe('svg-git cached rows', () => {
  it(`the ${GIT_ROW_COUNT} git rows are pinned once each, in the ratchet or the diff baseline`, () => {
    const slugs = [...ratchet.fixtures, ...diffBaseline.fixtures].map((f) => f.slug);
    expect(slugs).toHaveLength(GIT_ROW_COUNT);
    expect(new Set(slugs).size).toBe(GIT_ROW_COUNT);
  });

  it.skipIf(!existsSync(join(CACHE_DIR, 'unknown')))('each pinned row is in the unknown cache', () => {
    const dir = join(CACHE_DIR, 'unknown');
    const cached = new Set(readdirSync(dir).filter((f) => statSync(join(dir, f)).isDirectory()));
    const pinned = [...ratchet.fixtures, ...diffBaseline.fixtures];
    expect(pinned.filter((f) => !cached.has(f.slug)).map((f) => f.slug)).toEqual([]);
  });

  for (const f of diffBaseline.fixtures) {
    it(`${f.type}/${f.slug}: holds ${String(f.verdict)} with maxDelta <= ${String(f.maxDelta)}`, () => {
      expect(f.reason, f.slug).toContain(DIVERGENCE_TABLE);
      const dir = join(GOLDENS_DIR, f.type, f.slug);
      const ours = renderFixtureGit(readFileSync(join(dir, 'in.puml'), 'utf8'));
      expectHeld(f, ours, readFileSync(join(dir, 'golden.svg'), 'utf8'));
    });
  }
});

describe('svg-git authored fixtures — manifest shape', () => {
  it('authored rows are exactly one per tests/fixtures/git/*.puml on disk, each with its jar .svg', () => {
    const onDisk = listAuthoredGitSlugs();
    expect(authored.fixtures.map((f) => f.slug).sort()).toEqual(onDisk);
    expect(onDisk.filter((slug) => readAuthoredGitFixture(slug).golden === undefined)).toEqual([]);
  });

  it('authored slugs are disjoint from the pinned corpus rows', () => {
    const taken = new Set([...ratchet.fixtures, ...diffBaseline.fixtures].map((f) => f.slug));
    expect(authored.fixtures.filter((f) => taken.has(f.slug)).map((f) => f.slug)).toEqual([]);
  });

  it('every row the jar draws carries its verdict; a non-conformant one names its divergence', () => {
    const drawn = authored.fixtures.filter((f) => f.jarError === undefined);
    expect(drawn.filter((f) => f.verdict === undefined || f.maxDelta === undefined).map((f) => f.slug)).toEqual([]);
    const open = drawn.filter((f) => f.verdict !== 'conformant');
    expect(open.filter((f) => !(f.reason ?? '').includes(DIVERGENCE_TABLE)).map((f) => f.slug)).toEqual([]);
  });

  it("every jarError row has stock-error-pages.json's { line, message } shape and its message in the oracle", () => {
    const rows = authored.fixtures.filter((f) => f.jarError !== undefined);
    expect(rows.length).toBeGreaterThan(0);
    for (const f of rows) {
      expect(Object.keys(f.jarError!).sort(), f.slug).toEqual(['line', 'message']);
      expect(f.jarError!.line === null || Number.isInteger(f.jarError!.line), f.slug).toBe(true);
      const golden = readAuthoredGitFixture(f.slug).golden ?? '';
      expect(golden.replaceAll('&lt;', '<'), f.slug).toContain(f.jarError!.message);
    }
  });
});

describe('svg-git authored fixtures — verdict, ceiling and score never regress', () => {
  for (const f of authored.fixtures.filter((row) => row.jarError === undefined)) {
    it(`authored/${f.slug}: holds ${String(f.verdict)} with maxDelta <= ${String(f.maxDelta)}`, () => {
      const { markup, golden } = readAuthoredGitFixture(f.slug);
      expectHeld(f, renderFixtureGit(markup), golden!);
    });
  }
});

describe('svg-git authored fixtures — error parity (2026-10-10 error-page rule)', () => {
  for (const f of authored.fixtures) {
    const name = f.jarError === undefined ? 'jar draws and we draw the same type' : 'jar errors and we error';
    it(`authored/${f.slug}: ${name}`, () => {
      const { markup, golden } = readAuthoredGitFixture(f.slug);
      const jarType = diagramTypeOf(golden ?? '');
      expect(jarType === undefined, `${f.slug}: jarError row <=> jar error page`).toBe(f.jarError !== undefined);
      expect(diagramTypeOf(renderFixtureGit(markup)), f.slug).toBe(jarType);
    });
  }
});
