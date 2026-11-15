/**
 * Unit tests for `pin-goldens.mts` (dogr-T1, adapted from cogr's class tool).
 * Run with: `npx vitest run --config plans/dot-oracle-gap-rows/tools/vitest.config.mts`.
 */
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, existsSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { pinGoldens, findTwin } from './pin-goldens.mts';

const RATCHET = 'oracle/goldens/svg-dot/ratchet.json';
const ROUTING = 'oracle/goldens/svg-conformance/routing-baseline.json';
const REFUSAL = 'oracle/goldens/svg-conformance/refusal-baseline.json';
const CACHE = 'test-results/dot-cache/dot';
const OPTS = { sourceTag: 'dogr-T1', closeLabel: 'T1', date: '2026-11-14', commit: 'abcd1234' };
const DOT_SRC = '@startdot\ndigraph G { a -> b }\n@enddot\n';

let root: string;
const put = (rel: string, body: string): void => {
  mkdirSync(dirname(join(root, rel)), { recursive: true });
  writeFileSync(join(root, rel), body);
};
const json = (rel: string): any => JSON.parse(readFileSync(join(root, rel), 'utf8'));
const routingTwin = (slug: string, status = 'agree') => ({
  tree: 'dot-cache', type: 'dot', slug, jarType: 'NONE', ourType: 'NONE', status, measuredAt: 'x', measuredAgainstCommit: 'y',
});
const refusalTwin = (slug: string, status = 'ok') => ({
  tree: 'dot-cache', type: 'dot', slug, jarRendered: true, weErrored: false, engine: 'none', status, measuredAt: 'x', measuredAgainstCommit: 'y',
});

function seed(slug: string, routingStatus = 'agree'): void {
  put(RATCHET, JSON.stringify({ fixtures: [{ slug: 'zzz-first', addedAt: '2026-08-08', source: 'D14' }] }));
  put(ROUTING, JSON.stringify({ $comment: 'R.', fixtures: [routingTwin(slug, routingStatus)] }));
  put(REFUSAL, JSON.stringify({ $comment: 'F.', fixtures: [refusalTwin(slug)] }));
  put(`${CACHE}/${slug}/in.svg`, '<svg id="graph0">golden</svg>');
  put(`${CACHE}/${slug}/in.puml`, DOT_SRC);
}

beforeEach(() => { root = mkdtempSync(join(tmpdir(), 'dogr-pin-goldens-')); });
afterEach(() => { rmSync(root, { recursive: true, force: true }); });

describe('pinGoldens', () => {
  test('copies byte-identical files, appends ratchet unsorted, clones one goldens row per baseline', () => {
    seed('aaa-slug');
    expect(pinGoldens({ root, ...OPTS, slugs: ['aaa-slug'] })).toBe(1);
    const g = join(root, 'oracle/goldens/svg-dot/aaa-slug');
    expect(readFileSync(join(g, 'golden.svg'), 'utf8')).toBe('<svg id="graph0">golden</svg>');
    expect(readFileSync(join(g, 'in.puml'), 'utf8')).toBe(DOT_SRC);
    const r = json(RATCHET).fixtures;
    expect(r[0]).toEqual({ slug: 'zzz-first', addedAt: '2026-08-08', source: 'D14' });
    expect(r[1]).toEqual({ slug: 'aaa-slug', addedAt: '2026-11-14', source: 'dogr-T1' });
    expect(json(ROUTING).fixtures.filter((x: any) => x.tree === 'goldens')).toEqual([
      { tree: 'goldens', type: 'svg-dot', slug: 'aaa-slug', jarType: 'NONE', ourType: 'NONE', status: 'agree', measuredAt: '2026-11-14', measuredAgainstCommit: 'abcd1234' },
    ]);
    expect(json(REFUSAL).fixtures.filter((x: any) => x.tree === 'goldens')).toEqual([
      { tree: 'goldens', type: 'svg-dot', slug: 'aaa-slug', jarRendered: true, weErrored: false, engine: 'none', status: 'ok', measuredAt: '2026-11-14', measuredAgainstCommit: 'abcd1234' },
    ]);
    expect(json(ROUTING).$comment).toBe('R. Re-pinned 2026-11-14 at abcd1234 by dot-oracle-gap-rows / T1, ADDITIVE ONLY (1 "svg-dot" golden rows appended, clones of their byte-identical dot-cache twins).');
    expect(readFileSync(join(root, RATCHET), 'utf8').endsWith('}\n')).toBe(true);
  });

  test('an unhealthy twin aborts before any file is written', () => {
    seed('bad-slug', 'jar-error');
    expect(() => pinGoldens({ root, ...OPTS, slugs: ['bad-slug'] })).toThrow('twin status jar-error');
    expect(existsSync(join(root, 'oracle/goldens/svg-dot/bad-slug'))).toBe(false);
    expect(json(RATCHET).fixtures).toHaveLength(1);
    expect(json(ROUTING).$comment).toBe('R.');
  });

  test('an already-ratcheted slug, a duplicate argument, or no slugs is refused', () => {
    seed('zzz-first');
    expect(() => pinGoldens({ root, ...OPTS, slugs: ['zzz-first'] })).toThrow('already in the ratchet');
    expect(() => pinGoldens({ root, ...OPTS, slugs: ['a', 'a'] })).toThrow('duplicate slug');
    expect(() => pinGoldens({ root, ...OPTS, slugs: [] })).toThrow('no slugs');
  });

  test('a missing cache file is refused', () => {
    seed('ccc-slug');
    rmSync(join(root, `${CACHE}/ccc-slug/in.puml`));
    expect(() => pinGoldens({ root, ...OPTS, slugs: ['ccc-slug'] })).toThrow('missing in.puml');
  });
});

describe('findTwin', () => {
  test('refuses an existing svg-dot goldens row and a missing twin', () => {
    const b = { $comment: '', fixtures: [{ ...routingTwin('s'), tree: 'goldens', type: 'svg-dot' }] };
    expect(() => findTwin(b, 's', 'agree', 'f')).toThrow('already has a goldens row');
    expect(() => findTwin({ $comment: '', fixtures: [] }, 's', 'agree', 'f')).toThrow('0 dot-cache twins');
  });

  test('ignores twins of another cache type and goldens rows of another golden type', () => {
    const b = {
      $comment: '',
      fixtures: [
        { ...routingTwin('s'), type: 'class' },
        { ...routingTwin('s'), tree: 'goldens', type: 'svg-class' },
        routingTwin('s'),
      ],
    };
    expect(findTwin(b, 's', 'agree', 'f').type).toBe('dot');
  });
});

// dogr-T1b (D3): jar error-page rows.
const STOCK = 'oracle/goldens/stock-error-pages.json';
const JAR_ERROR = { line: 2, message: 'Syntax Error? (Assumed diagram type: dot)' };
const MEASURED = { weightedScore: 9.5, diffCount: 10 };
const measure = (): typeof MEASURED => MEASURED;

function seedJarError(slug: string, golden = '<svg><text>Syntax Error? (Assumed diagram type: dot)</text></svg>'): void {
  put(RATCHET, JSON.stringify({ fixtures: [{ slug: 'zzz-first', addedAt: '2026-08-08', source: 'D14' }] }));
  put(ROUTING, JSON.stringify({ $comment: 'R.', fixtures: [{ ...routingTwin(slug, 'jar-error'), jarErrored: true }] }));
  put(REFUSAL, JSON.stringify({ $comment: 'F.', fixtures: [{ ...refusalTwin(slug), jarRendered: false, weErrored: true, engine: 'dot' }] }));
  put(STOCK, JSON.stringify({ errors: { [`dot/${slug}`]: JAR_ERROR, 'class/other': { line: 1, message: 'x' } } }));
  put(`${CACHE}/${slug}/in.svg`, golden);
  put(`${CACHE}/${slug}/in.puml`, '@startdot\ntitle T\ndigraph G { a }\n@enddot\n');
}

describe('pinGoldens jarError (D3)', () => {
  test('copies the stock record and the measured score, and clones the jar-error / weErrored twins as they are', () => {
    seedJarError('err-slug');
    expect(pinGoldens({ root, ...OPTS, sourceTag: 'dogr-T1b', closeLabel: 'T1b', slugs: ['err-slug'], jarError: { measure } })).toBe(1);
    expect(json(RATCHET).fixtures[1]).toEqual({
      slug: 'err-slug', addedAt: '2026-11-14', source: 'dogr-T1b', jarError: JAR_ERROR, ...MEASURED,
    });
    expect(json(ROUTING).fixtures.filter((x: any) => x.tree === 'goldens')).toEqual([
      { tree: 'goldens', type: 'svg-dot', slug: 'err-slug', jarType: 'NONE', ourType: 'NONE', status: 'jar-error', measuredAt: '2026-11-14', measuredAgainstCommit: 'abcd1234', jarErrored: true },
    ]);
    expect(json(REFUSAL).fixtures.filter((x: any) => x.tree === 'goldens')).toEqual([
      { tree: 'goldens', type: 'svg-dot', slug: 'err-slug', jarRendered: false, weErrored: true, engine: 'dot', status: 'ok', measuredAt: '2026-11-14', measuredAgainstCommit: 'abcd1234' },
    ]);
  });

  test('refuses a row whose golden is a graphviz document, before any write', () => {
    seedJarError('gv-slug', '<svg><g id="graph0"></g></svg>');
    expect(() => pinGoldens({ root, ...OPTS, slugs: ['gv-slug'], jarError: { measure } })).toThrow('graphviz document');
    expect(existsSync(join(root, 'oracle/goldens/svg-dot/gv-slug'))).toBe(false);
    expect(json(RATCHET).fixtures).toHaveLength(1);
  });

  test('refuses a row with no stock-error-pages record', () => {
    seedJarError('nostock-slug');
    put(STOCK, JSON.stringify({ errors: {} }));
    expect(() => pinGoldens({ root, ...OPTS, slugs: ['nostock-slug'], jarError: { measure } })).toThrow('no dot/nostock-slug record');
  });

  test('refuses a refusal twin where we did not error', () => {
    seedJarError('drew-slug');
    put(REFUSAL, JSON.stringify({ $comment: 'F.', fixtures: [{ ...refusalTwin('drew-slug'), weErrored: false }] }));
    expect(() => pinGoldens({ root, ...OPTS, slugs: ['drew-slug'], jarError: { measure } })).toThrow('weErrored');
    expect(json(RATCHET).fixtures).toHaveLength(1);
  });

  test('refuses a zero score: a zero-diff row belongs on the plain path', () => {
    seedJarError('zero-slug');
    const zero = (): typeof MEASURED => ({ weightedScore: 0, diffCount: 0 });
    expect(() => pinGoldens({ root, ...OPTS, slugs: ['zero-slug'], jarError: { measure: zero } })).toThrow('zero-diff');
  });

  test('the plain path still refuses a jar-error twin', () => {
    seedJarError('plain-slug');
    expect(() => pinGoldens({ root, ...OPTS, slugs: ['plain-slug'] })).toThrow('twin status jar-error');
  });
});

describe('acceptance on a temp copy of the real files', () => {
  const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
  // A synthetic slug appended to a TEMP COPY of the real ratchet/baseline
  // files exercises the live schema without depending on the corpus staying
  // unpinned (cdd5-T2's lesson: a real slug goes stale once pinned).
  const slug = 'dogr-t1-synthetic-acceptance-slug';

  test('a synthetic slug appended to a copy of the real baselines pins cleanly', () => {
    for (const rel of [RATCHET, ROUTING, REFUSAL]) {
      mkdirSync(dirname(join(root, rel)), { recursive: true });
      copyFileSync(join(repo, rel), join(root, rel));
    }
    const routing = json(ROUTING);
    routing.fixtures.push(routingTwin(slug));
    writeFileSync(join(root, ROUTING), JSON.stringify(routing));
    const refusal = json(REFUSAL);
    refusal.fixtures.push(refusalTwin(slug));
    writeFileSync(join(root, REFUSAL), JSON.stringify(refusal));
    put(`${CACHE}/${slug}/in.svg`, '<svg>synthetic</svg>');
    put(`${CACHE}/${slug}/in.puml`, DOT_SRC);

    const before = json(RATCHET).fixtures;
    const goldensBefore = [ROUTING, REFUSAL].map((f) => json(f).fixtures.filter((x: any) => x.tree === 'goldens').length);
    pinGoldens({ root, ...OPTS, slugs: [slug] });
    expect(readFileSync(join(root, 'oracle/goldens/svg-dot', slug, 'golden.svg'), 'utf8')).toBe('<svg>synthetic</svg>');
    const after = json(RATCHET).fixtures;
    expect(after.slice(0, -1)).toEqual(before);
    expect(after.at(-1)).toEqual({ slug, addedAt: '2026-11-14', source: 'dogr-T1' });
    [ROUTING, REFUSAL].forEach((f, i) => {
      expect(json(f).fixtures.filter((x: any) => x.tree === 'goldens').length).toBe(goldensBefore[i]! + 1);
    });
  });
});
