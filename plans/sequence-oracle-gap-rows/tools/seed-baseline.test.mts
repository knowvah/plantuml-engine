/**
 * Unit tests for `seed-baseline.mts` (sogr T1, D2). Run with the
 * mission-local config:
 * `npx vitest run --config plans/sequence-oracle-gap-rows/tools/vitest.config.mts`.
 *
 * Every fixture is SYNTHETIC, written to a temp root — never the committed
 * corpus. The zero-diff case caches our own render as the golden; the
 * non-zero case pairs it with an unrelated `<svg/>`; the error case feeds a
 * source the sequence engine refuses.
 */
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import {
  renderFixtureSequence,
  sequenceFixtureOptions,
} from '../../../tests/oracle/svg-conformance/render-fixture-sequence.js';
import { seedBaseline, measureSlug } from './seed-baseline.mts';

const DIFF_BASELINE = 'oracle/goldens/svg-sequence/diff-baseline.json';
const MARKUP = '@startuml\nAlice -> Bob : hello\n@enduml\n';
const REFUSED = '@startuml\npartition p\nend\n@enduml\n';
const DATE = '2026-11-13';
const COMMIT = 'abcd1234';
const EXISTING = {
  type: 'sequence',
  slug: 'mmm-existing',
  status: 'pinned',
  weightedScore: 0,
  diffCount: 3,
  measuredAt: '2026-10-01',
  measuredAgainstCommit: '0cf15e23',
};

let root: string;
const put = (rel: string, body: string): void => {
  mkdirSync(dirname(join(root, rel)), { recursive: true });
  writeFileSync(join(root, rel), body);
};
const raw = (): string => readFileSync(join(root, DIFF_BASELINE), 'utf8');
const json = (): { $comment: string; fixtures: Record<string, unknown>[] } => JSON.parse(raw());
const ours = (): string => renderFixtureSequence(MARKUP, new DeterministicMeasurer(), sequenceFixtureOptions());
const cache = (slug: string, puml: string, svg: string): void => {
  put(`test-results/dot-cache/sequence/${slug}/in.puml`, puml);
  put(`test-results/dot-cache/sequence/${slug}/in.svg`, svg);
};
const run = (slugs: string[]): number => seedBaseline({ root, slugs, date: DATE, commit: COMMIT });

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'sogr-seed-'));
  put(DIFF_BASELINE, `${JSON.stringify({ $comment: 'c.', fixtures: [EXISTING] }, null, 2)}\n`);
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

describe('measureSlug', () => {
  test('a zero-diff render scores 0 with 0 diffs', () => {
    cache('aaa-zero', MARKUP, ours());
    expect(measureSlug(root, 'aaa-zero')).toEqual({ errored: false, weightedScore: 0, diffCount: 0 });
  });

  test('a refused render reports the engine message', () => {
    cache('aaa-err', REFUSED, '<svg/>');
    const m = measureSlug(root, 'aaa-err');
    expect(m.errored).toBe(true);
    expect(m.errored && m.message).toContain('Syntax Error?');
  });
});

describe('seedBaseline', () => {
  test('appends baseline rows in sorted slug order, keeping existing rows and formatting', () => {
    cache('zzz-diff', MARKUP, '<svg width="1" height="1"></svg>');
    cache('aaa-zero', MARKUP, ours());
    expect(run(['zzz-diff', 'aaa-zero'])).toBe(2);
    const d = json();
    expect(d.$comment).toBe('c.');
    expect(d.fixtures.map((f) => f.slug)).toEqual(['aaa-zero', 'mmm-existing', 'zzz-diff']);
    expect(d.fixtures[0]).toEqual({
      type: 'sequence',
      slug: 'aaa-zero',
      status: 'baseline',
      weightedScore: 0,
      diffCount: 0,
      measuredAt: DATE,
      measuredAgainstCommit: COMMIT,
    });
    expect(d.fixtures[1]).toEqual(EXISTING);
    expect(d.fixtures[2]!.status).toBe('baseline');
    expect(d.fixtures[2]!.weightedScore as number).toBeGreaterThan(0);
    expect(d.fixtures[2]!.diffCount as number).toBeGreaterThan(0);
    expect(raw()).toBe(`${JSON.stringify(d, null, 2)}\n`);
  });

  test('a refused render is seeded as "error" with null scores and a reason', () => {
    cache('aaa-err', REFUSED, '<svg/>');
    run(['aaa-err']);
    const row = json().fixtures[0]!;
    expect(row).toMatchObject({
      type: 'sequence',
      slug: 'aaa-err',
      status: 'error',
      weightedScore: null,
      diffCount: null,
      measuredAt: DATE,
      measuredAgainstCommit: COMMIT,
    });
    expect(Object.keys(row).at(-1)).toBe('reason');
    expect(row.reason).toContain('Syntax Error?');
  });

  test.each([
    ['an already-seeded slug', ['mmm-existing'], /already has a diff-baseline row/],
    ['a slug with no cache dir', ['nope'], /missing in\.puml/],
    ['a duplicate argument', ['aaa-zero', 'aaa-zero'], /duplicate slug/],
    ['no slugs', [], /no slugs/],
  ])('refuses %s and writes nothing', (_name, slugs, message) => {
    cache('aaa-zero', MARKUP, ours());
    const before = raw();
    expect(() => run(slugs)).toThrow(message);
    expect(raw()).toBe(before);
  });

  test('one bad slug aborts the whole run', () => {
    cache('aaa-zero', MARKUP, ours());
    const before = raw();
    expect(() => run(['aaa-zero', 'mmm-existing'])).toThrow(/mmm-existing/);
    expect(raw()).toBe(before);
  });
});
