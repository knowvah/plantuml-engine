/**
 * Unit tests for `pin-goldens.mts` (hyogr-T1, adapted from dogr's dot tool).
 * Run with: `npx vitest run --config plans/hcl-yaml-oracle-gap-rows/tools/vitest.config.mts`.
 */
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, existsSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { pinGoldens, findTwin } from './pin-goldens.mts';

const RATCHET = 'oracle/goldens/svg-hcl/ratchet.json';
const ROUTING = 'oracle/goldens/svg-conformance/routing-baseline.json';
const REFUSAL = 'oracle/goldens/svg-conformance/refusal-baseline.json';
const CACHE = 'test-results/dot-cache/hcl';
const OPTS = { sourceTag: 'hyogr-T1', closeLabel: 'T1', date: '2026-11-14', commit: 'abcd1234' };
const HCL_SRC = '@starthcl\nname = "x"\n@endhcl\n';

let root: string;
const put = (rel: string, body: string): void => {
  mkdirSync(dirname(join(root, rel)), { recursive: true });
  writeFileSync(join(root, rel), body);
};
const json = (rel: string): any => JSON.parse(readFileSync(join(root, rel), 'utf8'));
const routingTwin = (slug: string, status = 'agree') => ({
  tree: 'dot-cache', type: 'hcl', slug, jarType: 'HCL', ourType: 'HCL', status, measuredAt: 'x', measuredAgainstCommit: 'y',
});
const refusalTwin = (slug: string, status = 'ok') => ({
  tree: 'dot-cache', type: 'hcl', slug, jarRendered: true, weErrored: false, engine: 'hcl', status, measuredAt: 'x', measuredAgainstCommit: 'y',
});

function seed(slug: string, routingStatus = 'agree'): void {
  put(RATCHET, JSON.stringify({ fixtures: [{ slug: 'zzz-first', addedAt: '2026-08-08', source: 'D14' }] }));
  put(ROUTING, JSON.stringify({ $comment: 'R.', fixtures: [routingTwin(slug, routingStatus)] }));
  put(REFUSAL, JSON.stringify({ $comment: 'F.', fixtures: [refusalTwin(slug)] }));
  put(`${CACHE}/${slug}/in.svg`, '<svg>golden</svg>');
  put(`${CACHE}/${slug}/in.puml`, HCL_SRC);
}

beforeEach(() => { root = mkdtempSync(join(tmpdir(), 'hyogr-pin-goldens-')); });
afterEach(() => { rmSync(root, { recursive: true, force: true }); });

describe('pinGoldens', () => {
  test('copies byte-identical files, appends ratchet unsorted, clones one goldens row per baseline', () => {
    seed('aaa-slug');
    expect(pinGoldens({ root, ...OPTS, slugs: ['aaa-slug'] })).toBe(1);
    const g = join(root, 'oracle/goldens/svg-hcl/aaa-slug');
    expect(readFileSync(join(g, 'golden.svg'), 'utf8')).toBe('<svg>golden</svg>');
    expect(readFileSync(join(g, 'in.puml'), 'utf8')).toBe(HCL_SRC);
    const r = json(RATCHET).fixtures;
    expect(r[0]).toEqual({ slug: 'zzz-first', addedAt: '2026-08-08', source: 'D14' });
    expect(r[1]).toEqual({ slug: 'aaa-slug', addedAt: '2026-11-14', source: 'hyogr-T1' });
    expect(json(ROUTING).fixtures.filter((x: any) => x.tree === 'goldens')).toEqual([
      { tree: 'goldens', type: 'svg-hcl', slug: 'aaa-slug', jarType: 'HCL', ourType: 'HCL', status: 'agree', measuredAt: '2026-11-14', measuredAgainstCommit: 'abcd1234' },
    ]);
    expect(json(REFUSAL).fixtures.filter((x: any) => x.tree === 'goldens')).toEqual([
      { tree: 'goldens', type: 'svg-hcl', slug: 'aaa-slug', jarRendered: true, weErrored: false, engine: 'hcl', status: 'ok', measuredAt: '2026-11-14', measuredAgainstCommit: 'abcd1234' },
    ]);
    expect(json(ROUTING).$comment).toBe('R. Re-pinned 2026-11-14 at abcd1234 by hcl-yaml-oracle-gap-rows / T1, ADDITIVE ONLY (1 "svg-hcl" golden rows appended, clones of their byte-identical dot-cache twins).');
    expect(readFileSync(join(root, RATCHET), 'utf8').endsWith('}\n')).toBe(true);
  });

  test('an unhealthy twin aborts before any file is written', () => {
    seed('bad-slug', 'disagree');
    expect(() => pinGoldens({ root, ...OPTS, slugs: ['bad-slug'] })).toThrow('twin status disagree');
    expect(existsSync(join(root, 'oracle/goldens/svg-hcl/bad-slug'))).toBe(false);
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
  test('refuses an existing svg-hcl goldens row and a missing twin', () => {
    const b = { $comment: '', fixtures: [{ ...routingTwin('s'), tree: 'goldens', type: 'svg-hcl' }] };
    expect(() => findTwin(b, 's', 'agree', 'f')).toThrow('already has a goldens row');
    expect(() => findTwin({ $comment: '', fixtures: [] }, 's', 'agree', 'f')).toThrow('0 dot-cache twins');
  });

  test('ignores twins of another cache type and goldens rows of another golden type', () => {
    const b = {
      $comment: '',
      fixtures: [
        { ...routingTwin('s'), type: 'unknown' },
        { ...routingTwin('s'), tree: 'goldens', type: 'svg-dot' },
        routingTwin('s'),
      ],
    };
    expect(findTwin(b, 's', 'agree', 'f').type).toBe('hcl');
  });
});

describe('acceptance on a temp copy of the real files', () => {
  const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
  // A synthetic slug appended to a TEMP COPY of the real ratchet/baseline
  // files exercises the live schema without depending on the corpus staying
  // unpinned (cdd5-T2's lesson: a real slug goes stale once pinned).
  const slug = 'hyogr-t1-synthetic-acceptance-slug';

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
    put(`${CACHE}/${slug}/in.puml`, HCL_SRC);

    const before = json(RATCHET).fixtures;
    const goldensBefore = [ROUTING, REFUSAL].map((f) => json(f).fixtures.filter((x: any) => x.tree === 'goldens').length);
    pinGoldens({ root, ...OPTS, slugs: [slug] });
    expect(readFileSync(join(root, 'oracle/goldens/svg-hcl', slug, 'golden.svg'), 'utf8')).toBe('<svg>synthetic</svg>');
    const after = json(RATCHET).fixtures;
    expect(after.slice(0, -1)).toEqual(before);
    expect(after.at(-1)).toEqual({ slug, addedAt: '2026-11-14', source: 'hyogr-T1' });
    [ROUTING, REFUSAL].forEach((f, i) => {
      expect(json(f).fixtures.filter((x: any) => x.tree === 'goldens').length).toBe(goldensBefore[i]! + 1);
    });
  });
});
