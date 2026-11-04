// @vitest-environment node
/**
 * Unit tests for `scripts/capture-missing-oracles.ts` (mission
 * oracle-gap-capture, T2; plans/oracle-gap-capture/decisions.md D2, D4).
 *
 * `execFileSync` is mocked: the jar is never invoked here. The mock plays
 * the jar by writing whatever the case needs into the render dir, and the
 * stage/install functions run against temp roots.
 */
import { describe, it, expect, beforeAll, afterAll, vi, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, isAbsolute, relative } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import type * as ChildProcess from 'node:child_process';

import {
  stageMissingOracles,
  installStage,
  readCaptureReport,
  type CaptureRow,
} from '../../../scripts/capture-missing-oracles.js';

vi.mock('node:child_process', async (importOriginal) => ({
  ...(await importOriginal<typeof ChildProcess>()),
  execFileSync: vi.fn(),
}));

let tmp: string;

beforeAll(() => {
  tmp = mkdtempSync(join(tmpdir(), 'ogc-t2-capture-'));
});

afterAll(() => {
  rmSync(tmp, { recursive: true, force: true });
});

afterEach(() => {
  vi.mocked(execFileSync).mockReset();
});

// Minute 10 is plain (PSystemError.java:221-229); the sleep must never run.
const PLAIN_MINUTE_GUARD = {
  now: () => 10 * 60_000,
  sleep: (): Promise<void> => Promise.reject(new Error('plain minute: sleep must not be called')),
};

const svgOfType = (type: string): string => `<svg data-diagram-type="${type}"><text>x</text></svg>`;
const ERROR_PAGE = '<svg><text>PlantUML version 1.2026.0beta1 [Oracle]</text></svg>';

function writeManifests(dir: string, manifests: Record<string, string[]>): void {
  mkdirSync(dir, { recursive: true });
  for (const [bucket, slugs] of Object.entries(manifests)) {
    writeFileSync(
      join(dir, `${bucket}.json`),
      JSON.stringify(slugs.map((slug) => ({ slug, markup: `@startuml\n${slug}\n@enduml\n` }))),
    );
  }
}

/** Plays the jar: writes the file the slug's case calls for into the `-o` dir. */
function jarFor(outputs: Record<string, Record<string, string>>): void {
  vi.mocked(execFileSync).mockImplementation((_cmd, args) => {
    const outDir = (args as string[])[0]!;
    const slug = readFileSync(join(outDir, 'in.puml'), 'utf-8').split('\n')[1]!;
    for (const [name, body] of Object.entries(outputs[slug] ?? {})) writeFileSync(join(outDir, name), body, 'utf-8');
    writeFileSync(join(outDir, 'svek-0.dot'), 'digraph {}', 'utf-8');
    writeFileSync(join(outDir, 'stray.txt'), '', 'utf-8');
    return '';
  });
}

describe('stageMissingOracles', () => {
  it('renders every coverage gap in manifest order, routes by jar type and reports each row', async () => {
    const root = join(tmp, 'stage-basic');
    const data = join(root, 'data');
    const cache = join(root, 'cache');
    const stage = join(root, 'stage');
    writeManifests(data, { sequence: ['seq-act', 'seq-cached'], dot: ['dot-err'], object: ['obj-class'] });
    mkdirSync(join(cache, 'sequence', 'seq-cached'), { recursive: true });
    for (const f of ['.done', 'in.puml', 'in.svg']) writeFileSync(join(cache, 'sequence', 'seq-cached', f), '');
    const reasons = join(root, 'reasons.json');
    writeFileSync(reasons, JSON.stringify({ reasons: {} }));
    jarFor({
      'seq-act': { 'in.svg': svgOfType('ACTIVITY') },
      'dot-err': { 'in.svg': ERROR_PAGE },
      'obj-class': { 'named.svg': svgOfType('CLASS') },
    });

    const rows = await stageMissingOracles(
      { dataDir: data, cacheDir: cache, reasonsPath: reasons, stageDir: stage },
      PLAIN_MINUTE_GUARD,
    );

    expect(rows.map((r) => [r.manifest, r.slug, r.bucket, r.jarType, r.jarErrored, r.kind])).toEqual([
      ['dot', 'dot-err', 'dot', 'NONE', true, 'in-svg'],
      ['object', 'obj-class', 'object', 'CLASS', false, 'renamed'],
      ['sequence', 'seq-act', 'activity', 'ACTIVITY', false, 'in-svg'],
    ]);
    expect(rows.every((r) => r.startedAt === 10 * 60_000)).toBe(true);
    expect(readdirSync(join(stage, 'activity', 'seq-act')).sort()).toEqual([
      '.done',
      'in.puml',
      'in.svg',
      'svek-0.dot',
    ]);
    expect(existsSync(join(stage, 'object', 'obj-class', 'in.svg'))).toBe(true);
    expect(existsSync(join(stage, '.work', 'sequence', 'seq-act'))).toBe(false);
    expect(readCaptureReport(stage).rows).toEqual(rows);
    // the scratch cwd is under the stage, never the repo root
    for (const call of vi.mocked(execFileSync).mock.calls) {
      expect((call[2] as { cwd: string }).cwd.startsWith(join(stage, '.work'))).toBe(true);
    }
  });

  it('hands the jar absolute paths even when --stage is relative (T3 finding: a relative stage + scratch cwd rendered nothing)', async () => {
    const root = join(tmp, 'stage-relative');
    const data = join(root, 'data');
    writeManifests(data, { state: ['s-rel'] });
    const reasons = join(root, 'reasons.json');
    writeFileSync(reasons, JSON.stringify({ reasons: {} }));
    jarFor({ 's-rel': { 'in.svg': svgOfType('STATE') } });
    const stageDir = relative(process.cwd(), join(root, 'stage'));
    expect(isAbsolute(stageDir)).toBe(false);

    const rows = await stageMissingOracles(
      { dataDir: data, cacheDir: join(root, 'cache'), reasonsPath: reasons, stageDir },
      PLAIN_MINUTE_GUARD,
    );

    expect(rows.map((r) => [r.slug, r.bucket, r.kind])).toEqual([['s-rel', 'state', 'in-svg']]);
    const [outDir, puml] = vi.mocked(execFileSync).mock.calls[0]![1] as string[];
    expect(isAbsolute(outDir!)).toBe(true);
    expect(isAbsolute(puml!)).toBe(true);
    expect(existsSync(join(root, 'stage', 'state', 's-rel', 'in.svg'))).toBe(true);
  });

  it('resumes: skips rows the report already holds, keyed by manifest/slug', async () => {
    const root = join(tmp, 'stage-resume');
    const data = join(root, 'data');
    const stage = join(root, 'stage');
    writeManifests(data, { dot: ['shared'], hcl: ['shared'] });
    const reasons = join(root, 'reasons.json');
    writeFileSync(reasons, JSON.stringify({ reasons: {} }));
    mkdirSync(stage, { recursive: true });
    const done: CaptureRow = {
      manifest: 'dot',
      slug: 'shared',
      bucket: 'dot',
      jarType: 'NONE',
      jarErrored: false,
      kind: 'in-svg',
      startedAt: 1,
    };
    writeFileSync(join(stage, 'capture-report.json'), JSON.stringify({ rows: [done] }));
    jarFor({ shared: { 'in.svg': svgOfType('HCL') } });

    const rows = await stageMissingOracles(
      { dataDir: data, cacheDir: join(root, 'cache'), reasonsPath: reasons, stageDir: stage },
      PLAIN_MINUTE_GUARD,
    );

    expect(rows.map((r) => `${r.manifest}/${r.slug}/${r.bucket}`)).toEqual(['dot/shared/dot', 'hcl/shared/hcl']);
    expect(execFileSync).toHaveBeenCalledTimes(1);
  });

  it('keeps a report row but writes no fixture dir when the jar produced nothing, and honours --limit', async () => {
    const root = join(tmp, 'stage-none');
    const data = join(root, 'data');
    const stage = join(root, 'stage');
    writeManifests(data, { class: ['c-none', 'c-ok', 'c-skipped'] });
    const reasons = join(root, 'reasons.json');
    writeFileSync(reasons, JSON.stringify({ reasons: {} }));
    jarFor({ 'c-ok': { 'in.svg': svgOfType('CLASS') } });

    const rows = await stageMissingOracles(
      { dataDir: data, cacheDir: join(root, 'cache'), reasonsPath: reasons, stageDir: stage, limit: 2 },
      PLAIN_MINUTE_GUARD,
    );

    expect(rows.map((r) => [r.slug, r.kind, r.bucket])).toEqual([
      ['c-none', 'none', 'unknown'],
      ['c-ok', 'in-svg', 'class'],
    ]);
    expect(existsSync(join(stage, 'unknown'))).toBe(false);
    expect(existsSync(join(stage, 'class', 'c-ok', '.done'))).toBe(true);
  });
});

describe('installStage', () => {
  function makeStage(name: string): string {
    const stage = join(tmp, name);
    const row: CaptureRow = {
      manifest: 'sequence',
      slug: 'moved',
      bucket: 'activity',
      jarType: 'ACTIVITY',
      jarErrored: false,
      kind: 'in-svg',
      startedAt: 42,
    };
    const skipped: CaptureRow = {
      manifest: 'class',
      slug: 'nothing',
      bucket: 'unknown',
      jarType: 'NONE',
      jarErrored: false,
      kind: 'none',
      startedAt: 43,
    };
    mkdirSync(join(stage, 'activity', 'moved'), { recursive: true });
    for (const f of ['.done', 'in.puml', 'in.svg']) writeFileSync(join(stage, 'activity', 'moved', f), f);
    writeFileSync(join(stage, 'capture-report.json'), JSON.stringify({ rows: [row, skipped] }));
    return stage;
  }

  it('moves each captured row into the cache and records its clock from the report', () => {
    const stage = makeStage('install-ok');
    const cache = join(tmp, 'install-ok-cache');
    const recorded: [string, number][] = [];

    const installed = installStage(stage, cache, (puml, at) => {
      recorded.push([puml, at]);
      return undefined;
    });

    expect(installed).toEqual(['activity/moved']);
    expect(readFileSync(join(cache, 'activity', 'moved', 'in.svg'), 'utf-8')).toBe('in.svg');
    expect(existsSync(join(stage, 'activity', 'moved'))).toBe(false);
    expect(recorded).toEqual([[join(cache, 'activity', 'moved', 'in.puml'), 42]]);
  });

  it('refuses when a target already exists, moving nothing', () => {
    const stage = makeStage('install-refuse');
    const cache = join(tmp, 'install-refuse-cache');
    mkdirSync(join(cache, 'activity', 'moved'), { recursive: true });

    expect(() => installStage(stage, cache, () => undefined)).toThrow(/activity\/moved.*exists/);
    expect(existsSync(join(stage, 'activity', 'moved', 'in.svg'))).toBe(true);
  });

  it('a second install of the same stage refuses', () => {
    const stage = makeStage('install-twice');
    const cache = join(tmp, 'install-twice-cache');
    installStage(stage, cache, () => undefined);

    expect(() => installStage(stage, cache, () => undefined)).toThrow(/activity\/moved.*exists/);
  });
});
