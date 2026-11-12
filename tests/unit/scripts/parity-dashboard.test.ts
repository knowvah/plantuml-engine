/**
 * Unit tests for the unified parity dashboard (mission
 * parity-dashboard-refresh, T6): the pure matrix/freshness/render core in
 * `parity-dashboard.ts`, the pure summarizers in `parity-dashboard-inputs.ts`
 * / `parity-dashboard-goldens.ts` / `parity-dashboard-matrix.ts`, and the D9
 * drift gate against the committed `docs/parity-report.md`.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildMatrix,
  buildFreshness,
  buildReportModel,
  renderReport,
  loadInputs,
  type RawInputs,
} from '../../../scripts/parity-dashboard.js';
import {
  tallySurvey,
  zeroDiffCount,
  registeredEngineTypes,
  loadSurveyByType,
  jarTagOf,
  unknownShortfallTagsOf,
} from '../../../scripts/parity-dashboard-inputs.js';
import { ratchetPinsOf, diffBaselineStatsOf, groupBaselineByType } from '../../../scripts/parity-dashboard-goldens.js';
import {
  engineCell,
  noEngineColumn,
  surveyColumn,
  layoutEqualColumn,
} from '../../../scripts/parity-dashboard-matrix.js';
import { noteSymbolOf, notesSection, markedType, unknownDetail } from '../../../scripts/parity-dashboard-notes.js';
import type { TypeRow } from '../../../scripts/dot-parity-rows.js';
import type { FixtureRow } from '../../../scripts/svg-parity-survey.js';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const REPORT_PATH = join(REPO, 'docs', 'parity-report.md');

// ---------------------------------------------------------------------------
// Synthetic RawInputs — covers every vocabulary branch buildMatrix/
// buildFreshness must handle, without touching real disk state.
// ---------------------------------------------------------------------------

function dotRow(type: string, over: Partial<TypeRow>): TypeRow {
  return { type, comparable: 0, equal: 0, pct: '—', oracleBlind: 0, note: '—', ...over };
}

function baseInputs(): RawInputs {
  const buckets = ['class', 'component', 'ditaa', 'sequence', 'unknown'];
  return {
    buckets,
    corpusCounts: { class: 768, component: 384, ditaa: 2, sequence: 1271, unknown: 825 },
    registeredEngines: ['class', 'description', 'sequence'],
    oracleCounts: { class: 723, component: 266, sequence: 1141 },
    oracleCoverage: { rows: 3250, oracled: 2130, reasoned: 2 },
    jarUnsupportedCounts: {},
    unknownJarTags: {},
    dotParity: {
      generatedAt: '2026-09-20T14:44:15.369Z',
      measuredAgainstCommit: 'bdd3344e',
      rows: [
        dotRow('class', { comparable: 711, equal: 710, pct: '100%', oracleBlind: 7 }),
        dotRow('component', { comparable: 263, equal: 259, pct: '98%', oracleBlind: 1 }),
        dotRow('ditaa', { note: 'no oracle captured' }),
        dotRow('sequence', { note: 'n/a (no DOT stage)' }),
        dotRow('unknown', { note: 'no oracle captured' }),
      ],
    },
    surveyByType: {
      class: { conformant: 412, structural: 50, diverged: 261, generatedAt: '2026-09-03T18:45:20.062Z' },
    },
    censusByType: {},
    ratchetByType: {
      class: { count: 314, addedAt: '2026-08-17' },
      component: { count: 32, addedAt: '2026-07-15' },
      sequence: { count: 0, addedAt: undefined },
    },
    diffBaselineByType: {
      component: { count: 15, sum: 853, measuredAt: '2026-09-03' },
      sequence: { count: 1124, sum: 1158537, measuredAt: '2026-09-19' },
    },
    routingByType: {
      class: { counts: { agree: 720, 'jar-error': 3 }, total: 723, measuredAt: '2026-08-24' },
      sequence: { counts: { agree: 1124, 'known-misroute': 17 }, total: 1141, measuredAt: '2026-08-26' },
    },
    refusalByType: {
      class: { counts: { ok: 723 }, total: 723, measuredAt: '2026-08-24' },
      sequence: { counts: { ok: 1132, 'known-gap': 9 }, total: 1141, measuredAt: '2026-08-26' },
    },
  };
}

// ---------------------------------------------------------------------------
// buildMatrix
// ---------------------------------------------------------------------------

describe('buildMatrix', () => {
  const rows = buildMatrix(baseInputs());
  const row = (type: string) => rows.find((r) => r.type === type)!;

  it('returns one row per bucket, in bucket order', () => {
    expect(rows.map((r) => r.type)).toEqual(['class', 'component', 'ditaa', 'sequence', 'unknown']);
  });

  it('resolves a real DOT-equal fraction and a full survey/ratchet/routing/refusal row for class', () => {
    expect(row('class')).toEqual({
      type: 'class',
      engine: 'class',
      corpus: 768,
      oracle: '723',
      dot: '710/711 (100%)',
      survey: '412 / 50 / 261',
      layout: 'n/a (no layoutEqual survey yet)',
      census: 'n/a (no census yet)',
      ratchet: '314',
      diffBaseline: 'n/a (no diff-baseline yet)',
      routing: '720/723',
      refusal: '723/723',
    });
  });

  it('maps component to the description engine override and reports its diff-baseline', () => {
    expect(row('component').engine).toBe('description');
    expect(row('component').diffBaseline).toBe('15 · 853');
  });

  it('reports a real zero ratchet count for sequence (empty-by-design, not n/a)', () => {
    expect(row('sequence').ratchet).toBe('0');
    expect(row('sequence').dot).toBe('n/a (no DOT stage (non-svek))');
    expect(row('sequence').diffBaseline).toBe('1124 · 1158537');
    expect(row('sequence').routing).toBe('1124/1141');
    expect(row('sequence').refusal).toBe('1132/1141');
  });

  it('turns every comparison cell of a jar-unsupported type into n/a (plantuml-engine only)', () => {
    const inputs = baseInputs();
    inputs.buckets = [...inputs.buckets, 'chronology'].sort();
    inputs.corpusCounts['chronology'] = 1;
    inputs.registeredEngines = [...inputs.registeredEngines, 'chronology'];
    inputs.oracleCounts['chronology'] = 1;
    inputs.jarUnsupportedCounts['chronology'] = 1;
    inputs.dotParity.rows.push(dotRow('chronology', { note: 'n/a (no DOT stage)' }));
    inputs.surveyByType['chronology'] = { conformant: 0, structural: 0, diverged: 1, generatedAt: '2026-09-20' };
    inputs.routingByType['chronology'] = { counts: { agree: 1 }, total: 1, measuredAt: '2026-09-20' };
    const r = buildMatrix(inputs).find((x) => x.type === 'chronology')!;
    expect(r.engine).toBe('chronology');
    expect(r.corpus).toBe(1);
    for (const cell of [r.oracle, r.dot, r.survey, r.census, r.ratchet, r.diffBaseline, r.routing, r.refusal]) {
      expect(cell).toBe('n/a (plantuml-engine only)');
    }
    const f = buildFreshness(inputs).find((x) => x.type === 'chronology')!;
    expect([f.dot, f.survey, f.routing]).toEqual([undefined, undefined, undefined]);
  });

  it("keeps a no-engine bucket's oracle count but repeats the engine reason in every comparison cell", () => {
    const inputs = baseInputs();
    inputs.oracleCounts['ditaa'] = 2;
    inputs.surveyByType['ditaa'] = { conformant: 0, structural: 0, diverged: 2, generatedAt: '2026-09-20' };
    inputs.routingByType['ditaa'] = { counts: { agree: 2 }, total: 2, measuredAt: '2026-09-20' };
    const r = buildMatrix(inputs).find((x) => x.type === 'ditaa')!;
    expect(r.engine).toBe('n/a (no engine (dropped by ruling 2026-11-04))');
    expect(r.oracle).toBe('2');
    for (const cell of [r.dot, r.survey, r.census, r.ratchet, r.diffBaseline, r.routing, r.refusal]) {
      expect(cell).toBe('n/a (no engine (dropped by ruling 2026-11-04))');
    }
    const f = buildFreshness(inputs).find((x) => x.type === 'ditaa')!;
    expect([f.survey, f.routing]).toEqual([undefined, undefined]);
  });

  it('gives ebnf a D-row "no engine" reason, not a bare n/a', () => {
    expect(engineCell('ebnf', [])).toBe('n/a (no engine (D10 todo))');
  });

  it('says ditaa is dropped, not owed', () => {
    expect(row('ditaa').engine).toBe('n/a (no engine (dropped by ruling 2026-11-04))');
    expect(row('ditaa').oracle).toBe('n/a (no oracle captured)');
  });

  it('gives unknown the accounting-bucket engine reason', () => {
    expect(row('unknown').engine).toBe('n/a (accounting bucket)');
  });

  // D8 (plans/unknown-bucket-routing-repair/decisions.md): once `unknown` has
  // an oracle, a survey summary, and routing/refusal groups, every one of
  // those columns must report real measurements — the accounting-bucket
  // engine cell is the only column the no-engine override is allowed to touch.
  it('reports real oracle/survey/routing/refusal numbers for unknown once its measurements exist', () => {
    const inputs = baseInputs();
    inputs.oracleCounts['unknown'] = 825;
    inputs.surveyByType['unknown'] = { conformant: 700, structural: 50, diverged: 75, generatedAt: '2026-09-20' };
    inputs.routingByType['unknown'] = {
      counts: { agree: 800, 'known-misroute': 25 },
      total: 825,
      measuredAt: '2026-09-20',
    };
    inputs.refusalByType['unknown'] = {
      counts: { ok: 810, 'known-gap': 15 },
      total: 825,
      measuredAt: '2026-09-20',
    };
    const r = buildMatrix(inputs).find((x) => x.type === 'unknown')!;
    expect(r.engine).toBe('n/a (accounting bucket)');
    expect(r.oracle).toBe('825');
    expect(r.survey).toBe('700 / 50 / 75');
    expect(r.routing).toBe('800/825');
    expect(r.refusal).toBe('810/825');
  });

  it('never emits a bare "n/a" cell — every one carries a parenthetical reason', () => {
    for (const r of rows) {
      for (const cell of Object.values(r)) {
        if (typeof cell === 'string' && cell.startsWith('n/a')) expect(cell).toMatch(/^n\/a \(.+\)$/);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// buildFreshness
// ---------------------------------------------------------------------------

describe('buildFreshness', () => {
  const rows = buildFreshness(baseInputs());
  const row = (type: string) => rows.find((r) => r.type === type)!;

  it('carries a date for every source class actually has data for', () => {
    expect(row('class')).toEqual({
      type: 'class',
      dot: '2026-09-20T14:44:15.369Z',
      survey: '2026-09-03T18:45:20.062Z',
      census: undefined,
      ratchet: '2026-08-17',
      diffBaseline: undefined,
      routing: '2026-08-24',
      refusal: '2026-08-24',
    });
  });

  it('leaves every source undefined for a bucket with no data at all (unknown)', () => {
    expect(row('unknown')).toEqual({
      type: 'unknown',
      dot: undefined,
      survey: undefined,
      census: undefined,
      ratchet: undefined,
      diffBaseline: undefined,
      routing: undefined,
      refusal: undefined,
    });
  });

  it('a real zero ratchet count still carries no addedAt (sequence: never pinned, D2 empty-by-design)', () => {
    expect(row('sequence').ratchet).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// renderReport
// ---------------------------------------------------------------------------

describe('renderReport', () => {
  const model = buildReportModel(baseInputs());
  const out = renderReport(model);

  it('opens with the generated-by banner', () => {
    expect(out.startsWith('<!-- GENERATED by scripts/parity-dashboard.ts')).toBe(true);
  });

  it('states the freshest measurement date, derived from an input, not the clock', () => {
    expect(out).toContain('Freshest measurement across every source below: 2026-09-20T14:44:15.369Z.');
  });

  it('states that corpus counts manifest rows and oracle counts cached rows placed by the jar (ogc D2)', () => {
    expect(out).toContain('**corpus** counts manifest rows, which `scripts/classify-corpus.ts` guessed by keyword');
    expect(out).toContain("placed by the jar's own `data-diagram-type`");
  });

  it('prints the oracle coverage line from the inputs, never the clock or the disk', () => {
    expect(out).toContain(
      'Oracle coverage: 2130 of 3250 manifest rows have a jar oracle under some bucket and 2 a recorded reason in ' +
        '`oracle/no-oracle-reasons.json`; `tests/oracle/svg-conformance/oracle-coverage.test.ts` fails on a row with neither.',
    );
  });

  it('renders the matrix header and a class row', () => {
    expect(out).toContain('| type | engine | corpus | oracle | DOT equal |');
    // class carries the openDefect mark here because the synthetic survey (412 / 50 / 261) falls short (ogc-T8).
    expect(out).toContain('| class § | class | 768 | 723 | 710/711 (100%) |');
  });

  it('renders the freshness table', () => {
    expect(out).toContain('## Freshness');
    expect(out).toContain('| class | 2026-09-20T14:44:15.369Z | 2026-09-03T18:45:20.062Z |');
  });

  // AC2: every n/a cell in the MATRIX table carries a parenthetical reason
  // from the fixed D8 vocabulary — a bare "n/a" never appears. Scoped to the
  // table block (not the whole document) so the preamble's own prose
  // ("a bare `n/a` never appears") can't produce a false positive.
  it('AC2: every n/a in the Matrix table matches the D8 vocabulary, no bare n/a', () => {
    const tableBlock = out.slice(out.indexOf('## Matrix'), out.indexOf('## Freshness'));
    const vocab =
      /^n\/a \((no engine \((?:D\d+ todo|dropped by ruling \d{4}-\d{2}-\d{2})\)|no DOT stage \(non-svek\)|no oracle captured|no ratchet yet|no survey yet|no layoutEqual survey yet|no comparable fixture|no census yet|no diff-baseline yet|no data-diagram-type classification|plantuml-engine only|engine, unclassifiable corpus|accounting bucket)\)$/;
    for (const line of tableBlock.split('\n').filter((l) => l.startsWith('| '))) {
      for (const cell of line.split('|').map((c) => c.trim())) {
        if (cell.startsWith('n/a')) expect(cell).toMatch(vocab);
      }
    }
  });

  it('embeds the verbatim DOT-parity section', () => {
    expect(out).toContain('# DOT parity report');
    expect(out).toContain('| class | 711 | 710 | 100% | 7 | — |');
  });

  it('ends with the D7 footnote naming all eleven members', () => {
    expect(out).toContain('## Footnote: upstream types with neither a bucket nor an engine');
    for (const m of [
      'HELP',
      'BPM',
      'JCCKIT',
      'COMPOSITE',
      'CREOLE',
      'MATH',
      'LATEX',
      'DEFINITION',
      'FLOW',
      'SPRITES',
      'CRASH',
    ]) {
      expect(out).toContain(m);
    }
  });

  it("ends with a trailing blank line, matching this codebase's other generated reports (e.g. PARITY-SVG.md)", () => {
    expect(out.endsWith('\n\n')).toBe(true);
    expect(out.endsWith('\n\n\n')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Pure summarizers (parity-dashboard-inputs.ts / -goldens.ts / -matrix.ts)
// ---------------------------------------------------------------------------

describe('tallySurvey', () => {
  it('counts conformant/structural-match/diverged, ignoring other verdicts', () => {
    const rows = [
      { verdict: 'conformant' },
      { verdict: 'conformant' },
      { verdict: 'structural-match' },
      { verdict: 'diverged' },
      { verdict: 'errored' },
    ] as unknown as FixtureRow[];
    expect(tallySurvey(rows)).toEqual({ conformant: 2, structural: 1, diverged: 1, errorPage: 0 });
  });

  it('counts errorPage rows, shown per bucket by surveyColumn', () => {
    const rows = [
      { verdict: 'conformant', errorPage: true },
      { verdict: 'conformant' },
      { verdict: 'diverged' },
    ] as unknown as FixtureRow[];
    const t = tallySurvey(rows);
    expect(t.errorPage).toBe(1);
    expect(surveyColumn({ ...t, generatedAt: 'g' }).cell).toBe('2 / 0 / 1 (1 error)');
    expect(surveyColumn({ conformant: 3, structural: 0, diverged: 1, errorPage: 0, generatedAt: 'g' }).cell).toBe(
      '3 / 0 / 1',
    );
  });
});

describe('layoutEqual column (description-svek-wrappers T5)', () => {
  const measured = { conformant: 1, structural: 0, diverged: 3, layoutEqual: 3, layoutComparable: 4, generatedAt: 'g' };
  const svek = dotRow('component', { comparable: 4, equal: 4, pct: '100%' });

  it('tallySurvey counts true as equal and true|false as comparable, skipping n/a rows', () => {
    const rows = [
      { verdict: 'conformant', layoutEqual: true },
      { verdict: 'diverged', layoutEqual: true },
      { verdict: 'diverged', layoutEqual: false },
      { verdict: 'diverged', layoutEqual: 'n/a' },
    ] as unknown as FixtureRow[];
    const t = tallySurvey(rows);
    expect([t.layoutEqual, t.layoutComparable]).toEqual([2, 3]);
  });

  it('tallySurvey omits both counts for a survey that predates the column', () => {
    const t = tallySurvey([{ verdict: 'conformant' }] as unknown as FixtureRow[]);
    expect('layoutEqual' in t || 'layoutComparable' in t).toBe(false);
  });

  it('shows equal/comparable for a measured svek row', () => {
    expect(layoutEqualColumn(measured, svek).cell).toBe('3/4');
  });

  it('names the reason for a non-svek row, a missing survey, a pre-T2 survey and an all-n/a survey', () => {
    const nonSvek = dotRow('sequence', { note: 'n/a (no DOT stage)' });
    expect(layoutEqualColumn(measured, nonSvek).cell).toBe('n/a (no DOT stage (non-svek))');
    expect(layoutEqualColumn(undefined, svek).cell).toBe('n/a (no survey yet)');
    const preT2 = { conformant: 1, structural: 0, diverged: 3, generatedAt: 'g' };
    expect(layoutEqualColumn(preT2, svek).cell).toBe('n/a (no layoutEqual survey yet)');
    expect(layoutEqualColumn({ ...measured, layoutEqual: 0, layoutComparable: 0 }, svek).cell).toBe(
      'n/a (no comparable fixture)',
    );
  });

  it('buildMatrix puts the cell beside the survey cell', () => {
    const inputs = baseInputs();
    inputs.surveyByType['class'] = { ...measured, generatedAt: '2026-09-03T18:45:20.062Z' };
    expect(buildMatrix(inputs).find((r) => r.type === 'class')!.layout).toBe('3/4');
  });
});

describe('loadSurveyByType precedence', () => {
  const dirs: string[] = [];
  afterEach(() => {
    for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
  });
  const fx = (type: string, verdict: string): object => ({ slug: `${type}-${verdict}`, type, verdict });

  it('lets a per-type parity-<type>.json win over the legacy parity.json rows for that type', () => {
    const dir = mkdtempSync(join(tmpdir(), 'pd-survey-'));
    dirs.push(dir);
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'parity.json'),
      JSON.stringify({
        generatedAt: 'legacy',
        fixtures: [fx('component', 'diverged'), fx('component', 'diverged'), fx('usecase', 'diverged')],
      }),
    );
    writeFileSync(
      join(dir, 'parity-component.json'),
      JSON.stringify({ generatedAt: 'fresh', fixtures: [fx('component', 'conformant'), fx('component', 'diverged')] }),
    );
    const out = loadSurveyByType(dir);
    expect(out['component']).toEqual({ conformant: 1, structural: 0, diverged: 1, errorPage: 0, generatedAt: 'fresh' });
    expect(out['usecase']).toEqual({ conformant: 0, structural: 0, diverged: 1, errorPage: 0, generatedAt: 'legacy' });
  });
});

describe('zeroDiffCount', () => {
  it('counts only ok fixtures in the "0" bucket', () => {
    const fixtures = [
      { slug: 'a', status: 'ok' as const, diffCount: 0, bucket: '0' as const },
      { slug: 'b', status: 'ok' as const, diffCount: 3, bucket: '1-3' as const },
      { slug: 'c', status: 'error' as const, diffCount: null, bucket: null },
    ];
    expect(zeroDiffCount(fixtures)).toBe(1);
  });
});

describe('registeredEngineTypes', () => {
  it('extracts the type from each registry.register(<name>Plugin) call, in order', () => {
    const src =
      'registry.register(sequencePlugin);\nregistry.register(classPlugin);\n// registry.register(fakePlugin) in a comment still matches textually';
    expect(registeredEngineTypes(src)).toEqual(['sequence', 'class', 'fake']);
  });

  it('returns an empty array when the source registers nothing', () => {
    expect(registeredEngineTypes('// no registrations here')).toEqual([]);
  });
});

describe('ratchetPinsOf', () => {
  it('filters by type when any fixture carries a type field (shared family)', () => {
    const fixtures = [
      { type: 'component', addedAt: '2026-07-10' },
      { type: 'usecase', addedAt: '2026-07-31' },
      { type: 'component', addedAt: '2026-07-15' },
    ];
    expect(ratchetPinsOf(fixtures, 'component')).toEqual({ count: 2, addedAt: '2026-07-15' });
  });

  it('uses every fixture when none carries a type field (single-type family)', () => {
    const fixtures = [{ addedAt: '2026-08-17' }, { addedAt: '2026-07-18' }];
    expect(ratchetPinsOf(fixtures, 'class')).toEqual({ count: 2, addedAt: '2026-08-17' });
  });

  it('reports a real zero for an empty family, not undefined count', () => {
    expect(ratchetPinsOf([], 'sequence')).toEqual({ count: 0, addedAt: undefined });
  });
});

describe('diffBaselineStatsOf', () => {
  it('sums weightedScore over status=baseline fixtures of the given type only', () => {
    const fixtures = [
      { type: 'activity', status: 'baseline', weightedScore: 51, measuredAt: '2026-09-10' },
      { type: 'activity', status: 'error', measuredAt: '2026-09-10' },
      { type: 'sequence', status: 'baseline', weightedScore: 999, measuredAt: '2026-09-19' },
    ];
    expect(diffBaselineStatsOf(fixtures, 'activity')).toEqual({ count: 1, sum: 51, measuredAt: '2026-09-10' });
  });

  it('falls back to diffCount when weightedScore is absent (svg-description schema)', () => {
    const fixtures = [{ type: 'component', status: 'baseline', diffCount: 28, measuredAt: '2026-09-03' }];
    expect(diffBaselineStatsOf(fixtures, 'component')).toEqual({ count: 1, sum: 28, measuredAt: '2026-09-03' });
  });
});

describe('groupBaselineByType', () => {
  it('tallies status counts per type, restricted to the dot-cache tree', () => {
    const fixtures = [
      { tree: 'dot-cache', type: 'class', status: 'agree', measuredAt: '2026-08-23' },
      { tree: 'dot-cache', type: 'class', status: 'agree', measuredAt: '2026-08-24' },
      { tree: 'dot-cache', type: 'class', status: 'jar-error', measuredAt: '2026-08-23' },
      { tree: 'goldens', type: 'svg-class', status: 'agree', measuredAt: '2026-09-01' },
    ];
    expect(groupBaselineByType(fixtures)).toEqual({
      class: { counts: { agree: 2, 'jar-error': 1 }, total: 3, measuredAt: '2026-08-24' },
    });
  });
});

describe('engineCell', () => {
  it('maps a bucket sharing its plugin type name straight through', () => {
    expect(engineCell('class', ['class', 'sequence'])).toBe('class');
  });

  it('maps component/usecase/c4 to description and packet to packetdiag', () => {
    expect(engineCell('component', [])).toBe('description');
    expect(engineCell('usecase', [])).toBe('description');
    expect(engineCell('c4', [])).toBe('description');
    expect(engineCell('packet', [])).toBe('packetdiag');
  });

  it('maps object to class (no separate object engine upstream)', () => {
    expect(engineCell('object', [])).toBe('class');
  });

  it('gives unknown the accounting-bucket reason regardless of the registry', () => {
    expect(engineCell('unknown', ['unknown'])).toBe('n/a (accounting bucket)');
  });

  it('throws for a bucket with neither a mapping nor a D-row id', () => {
    expect(() => engineCell('not-a-real-bucket', [])).toThrow(/no engine mapping and no D-row id/);
  });
});

describe('noEngineColumn', () => {
  it('fires for a no engine (Dn todo) cell', () => {
    expect(noEngineColumn('n/a (no engine (dropped by ruling 2026-11-04))')).toEqual({
      cell: 'n/a (no engine (dropped by ruling 2026-11-04))',
      freshness: undefined,
    });
  });

  // D8 (plans/unknown-bucket-routing-repair/decisions.md): the override must
  // never fire for unknown's accounting-bucket engine cell — it is not a
  // no-engine todo, so its comparison columns must fall through to the
  // normal per-column rules instead of repeating the engine reason.
  it('does not fire for the accounting-bucket engine cell', () => {
    expect(noEngineColumn('n/a (accounting bucket)')).toBeUndefined();
  });

  it('does not fire for a resolved engine name', () => {
    expect(noEngineColumn('class')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// D9 drift gate — rebuild from disk twice, assert byte-equality with the
// committed report both times (determinism + no drift).
// ---------------------------------------------------------------------------

describe('D9 drift gate', () => {
  it('renderReport(buildReportModel(loadInputs())) matches the committed docs/parity-report.md, twice', () => {
    const committed = readFileSync(REPORT_PATH, 'utf-8');
    const first = renderReport(buildReportModel(loadInputs()));
    const second = renderReport(buildReportModel(loadInputs()));
    expect(first).toBe(committed);
    expect(second).toBe(committed);
  });
});

describe('matrix notes: why a row falls short', () => {
  it('marks a row with a recorded reason when the survey shows a shortfall', () => {
    expect(noteSymbolOf('json', '14 / 35 / 1')).toBe('†');
    expect(noteSymbolOf('ditaa', 'n/a (no engine (D1 todo))')).toBe('‡');
    expect(noteSymbolOf('state', '99 / 14 / 160 (4 error)')).toBe('§');
    expect(noteSymbolOf('unknown', '557 / 19 / 249 (25 error)')).toBe('¶');
    expect(noteSymbolOf('chronology', 'n/a (plantuml-engine only)')).toBe('‖');
  });

  it('drops the mark once the row is fully conformant, an error suffix included', () => {
    expect(noteSymbolOf('activity', '449 / 0 / 0 (14 error)')).toBeUndefined();
    expect(noteSymbolOf('json', '50 / 0 / 0')).toBeUndefined();
  });

  it('never marks a row with no recorded reason', () => {
    // gantt has no ROW_NOTES entry (ogc-T8: class, activity, sequence and dot gained one on 2026-11-04).
    expect(noteSymbolOf('gantt', '200 / 50 / 15')).toBeUndefined();
  });

  it('puts the mark in the type cell', () => {
    expect(markedType('json', '14 / 35 / 1')).toBe('json †');
    expect(markedType('class', '723 / 0 / 0 (3 error)')).toBe('class');
  });

  it('writes a note only for the rows it marked', () => {
    const notes = notesSection([
      { type: 'json', survey: '14 / 35 / 1' },
      { type: 'class', survey: '723 / 0 / 0' },
      { type: 'activity', survey: '449 / 0 / 0' },
    ]);
    expect(notes).toContain('**†');
    expect(notes).toContain('json');
    expect(notes).not.toContain('**‡');
    expect(notes).not.toContain('activity');
  });

  it('explains the error suffix even when no row is marked', () => {
    expect(notesSection([{ type: 'class', survey: '723 / 0 / 0 (3 error)' }])).toContain('(3 error)');
  });

  it('the committed report: every row short of conformant carries a reason', () => {
    const { matrix } = buildReportModel(loadInputs());
    const unexplained = matrix.filter((r) => {
      const counts = /^\d+ \/ (\d+) \/ (\d+)/.exec(r.survey);
      const short = counts !== null && Number(counts[1]) + Number(counts[2]) > 0;
      return short && noteSymbolOf(r.type, r.survey) === undefined;
    });
    expect(unexplained.map((r) => r.type)).toEqual([]);
  });

  it('places the notes straight after the matrix table, before Freshness', () => {
    const out = renderReport(buildReportModel(baseInputs()));
    const notes = out.indexOf('### Why a row falls short');
    expect(notes).toBeGreaterThan(out.indexOf('## Matrix'));
    expect(notes).toBeLessThan(out.indexOf('## Freshness'));
  });
});

// ---------------------------------------------------------------------------
// The generated `unknown` note (parity-dashboard-repair T3, D4): the shortfall
// sentence is built from the survey rows and each row's cached jar type tag,
// never hand-written, so a re-survey cannot leave it stale.
// ---------------------------------------------------------------------------

const UNSUPPORTED_HEAD =
  '<svg xmlns="http://www.w3.org/2000/svg"><g><text x="5" y="14.333" fill="#000" font-size="12" ' +
  'textLength="248.775" font-weight="700">Diagram not supported by this release of PlantUML</text></g></svg>';

describe('jarTagOf', () => {
  it('returns the data-diagram-type value', () => {
    expect(jarTagOf('<svg xmlns="http://www.w3.org/2000/svg" data-diagram-type="NWDIAG" width="1"><g/>')).toBe(
      'NWDIAG',
    );
  });

  it("returns 'unsupported' for the jar's unsupported-diagram page, never 'none'", () => {
    expect(jarTagOf(UNSUPPORTED_HEAD)).toBe('unsupported');
  });

  it("returns 'none' for an untagged render", () => {
    expect(jarTagOf('<svg xmlns="http://www.w3.org/2000/svg" width="1"><g/></svg>')).toBe('none');
    expect(jarTagOf('<svg data-diagram-type=""><g/></svg>')).toBe('none');
  });
});

describe('unknownShortfallTagsOf', () => {
  const tempDirs: string[] = [];
  afterEach(() => {
    for (const d of tempDirs.splice(0)) rmSync(d, { recursive: true, force: true });
  });
  function writeUnknownRow(cache: string, slug: string, svg: string): void {
    const dir = join(cache, 'unknown', slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'in.svg'), svg);
  }

  it('tallies the jar tag of every unknown row short of conformant; a missing cache entry counts as none', () => {
    const root = mkdtempSync(join(tmpdir(), 'pdg-unknown-'));
    tempDirs.push(root);
    const conformance = join(root, 'svg-conformance');
    const cache = join(root, 'dot-cache');
    mkdirSync(conformance, { recursive: true });
    const row = (slug: string, verdict: string): object => ({ slug, type: 'unknown', verdict, dotEqual: false });
    writeFileSync(
      join(conformance, 'parity-unknown.json'),
      JSON.stringify({
        generatedAt: '2026-11-03T10:01:20.371Z',
        fixtures: [
          row('ok', 'conformant'),
          row('nw', 'diverged'),
          row('nw2', 'structural-match'),
          row('desc', 'diverged'),
          row('declined', 'diverged'),
          row('nocache', 'diverged'),
        ],
      }),
    );
    writeUnknownRow(cache, 'ok', '<svg data-diagram-type="CLASS"/>');
    writeUnknownRow(cache, 'nw', '<svg data-diagram-type="NWDIAG"/>');
    writeUnknownRow(cache, 'nw2', '<svg data-diagram-type="NWDIAG"/>');
    writeUnknownRow(cache, 'desc', '<svg data-diagram-type="DESCRIPTION"/>');
    writeUnknownRow(cache, 'declined', UNSUPPORTED_HEAD);
    expect(unknownShortfallTagsOf(conformance, cache)).toEqual({ NWDIAG: 2, DESCRIPTION: 1, unsupported: 1, none: 1 });
  });

  it('returns an empty tally when no unknown survey exists', () => {
    const root = mkdtempSync(join(tmpdir(), 'pdg-unknown-'));
    tempDirs.push(root);
    expect(unknownShortfallTagsOf(root, join(root, 'dot-cache'))).toEqual({});
  });
});

describe('unknownDetail', () => {
  it('states the four groups exactly, tags lower-cased with counts', () => {
    expect(unknownDetail({ DESCRIPTION: 2, NWDIAG: 3, none: 1, unsupported: 1 }, ['description'])).toBe(
      "Of the 7 fixtures short of conformant, by PlantUML's own type: 2 are types we draw imperfectly " +
        '(description 2); 3 have no engine yet (nwdiag 3); 1 carries no type tag (creole, math, LaTeX and error ' +
        'pages); 1 is a page PlantUML itself declines.',
    );
  });

  it('lists tags count-descending, then by name, and omits an empty group', () => {
    expect(unknownDetail({ TIMING: 2, BPM: 2, NWDIAG: 5, ACTIVITY: 1 }, ['activity'])).toBe(
      "Of the 10 fixtures short of conformant, by PlantUML's own type: 1 is a type we draw imperfectly " +
        '(activity 1); 9 have no engine yet (nwdiag 5, bpm 2, timing 2).',
    );
  });

  it('produces no sentence for an empty tally, and the class text still renders for the row', () => {
    expect(unknownDetail({}, ['description'])).toBeUndefined();
    const notes = notesSection([{ type: 'unknown', survey: '557 / 19 / 249 (25 error)' }]);
    expect(notes).toContain('**¶** **Mixed bucket.**');
    expect(notes).toContain('Applies to unknown.');
    expect(notes).not.toContain('- **unknown:**');
  });

  it('notesSection prints a generated detail as the row sentence', () => {
    const notes = notesSection([{ type: 'unknown', survey: '557 / 19 / 249 (25 error)' }], {
      unknown: 'Of the 268 fixtures short of conformant.',
    });
    expect(notes).toContain('- **unknown:** Of the 268 fixtures short of conformant.');
    expect(notes).not.toContain('Applies to unknown.');
  });

  it('the committed survey: the generated total equals the unknown row’s structural + diverged count', () => {
    const inputs = loadInputs();
    const model = buildReportModel(inputs);
    const row = model.matrix.find((r) => r.type === 'unknown')!;
    const counts = /^\d+ \/ (\d+) \/ (\d+)/.exec(row.survey)!;
    const short = Number(counts[1]) + Number(counts[2]);
    const total = /^Of the (\d+) fixtures/.exec(model.unknownDetail ?? '')!;
    expect(Number(total[1])).toBe(short);
    expect(renderReport(model)).toContain(`- **unknown:** Of the ${short} fixtures`);
  });
});

describe('ratchetPinsOf — a c4 pin inside svg-class (c4dd D6)', () => {
  const fixtures = [
    { addedAt: '2026-01-01' },
    { addedAt: '2026-02-02', tree: 'unknown' },
    { addedAt: '2026-11-05', tree: 'c4' },
  ];

  it('counts it for c4 alone', () => {
    expect(ratchetPinsOf(fixtures, 'c4')).toEqual({ count: 1, addedAt: '2026-11-05' });
  });

  it('leaves it out of the class bucket', () => {
    expect(ratchetPinsOf(fixtures, 'class')).toEqual({ count: 2, addedAt: '2026-02-02' });
  });

  it('a shared family still filters by type', () => {
    const shared = [
      { type: 'c4', addedAt: '2026-11-04' },
      { type: 'component', addedAt: '2026-11-01' },
    ];
    expect(ratchetPinsOf(shared, 'c4')).toEqual({ count: 1, addedAt: '2026-11-04' });
  });
});
