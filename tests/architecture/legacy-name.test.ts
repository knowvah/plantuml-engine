/**
 * Fitness function for the plantuml-ts → plantuml-engine rename (issue #173,
 * decision D4 of plans/rename-plantuml-engine/decisions.md). The library was
 * renamed on 2026-11-12; agents working from older memories, notes or
 * mission ledgers would otherwise reintroduce the old name, and a one-off
 * `git grep` cannot stop that. This test scans every tracked text file and
 * fails on the legacy name anywhere outside `ALLOWED_PREFIXES`.
 *
 * `ALLOWED_PREFIXES` holds the dated records that stay as written (D2: a
 * rewritten dated record disagrees with what it describes) and the oracle
 * seam patches (D3: they are exports pinned by `oracle/pin.json`).
 *
 * The sweep that emptied the old name from every other file (2026-11-12,
 * plans/rename-plantuml-engine) used a shrinking PENDING list; it closed
 * empty and was removed, so any new match fails outright.
 */
import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const LEGACY = /plantuml-ts|plantuml_ts|PlantumlTs|PlantUmlTs|PLANTUML_TS/;
/** Same window git uses for its binary heuristic (xdiff `FIRST_FEW_BYTES`). */
const BINARY_SNIFF_BYTES = 8 * 1024;
const NUL = 0;

/** Entries ending `/` are directory prefixes; the rest are exact paths. */
const ALLOWED_PREFIXES: readonly string[] = [
  'plans/', // D2: mission briefs and ledgers are dated records
  '.agent-notes/', // D2: dated session observations
  'docs/graphviz-issues/', // D2: dated issue filings (TRACKER.md gets one note)
  'docs/upstream-plantuml-issues/', // D2: dated upstream issue filings
  'oracle/patches/', // D3: exports of the pinned oracle seam commits
  'CHANGELOG.md', // D2: past release entries
  'code-review-tasks.md', // D2: dated code-review record
  'planning/mission-index.md', // D2: dated mission rows
  'planning/next-missions.md', // D2: dated backlog record
  'planning/mission-a2-class/', // D2: completed mission directory
  'planning/mission-a3-class-superset/', // D2: completed mission directory
  'planning/mission-desc-routed/', // D2: completed mission directory
  'planning/mission-render-fidelity/', // D2: completed mission directory
  'oracle/accepted-divergences.json', // D2: retired[] reasons quote 0.1.0 output
  'tests/architecture/legacy-name.test.ts', // self: holds the pattern and lists
];

function isAllowed(path: string): boolean {
  return ALLOWED_PREFIXES.some((entry) => (entry.endsWith('/') ? path.startsWith(entry) : path === entry));
}

function listTrackedFiles(): string[] {
  return execFileSync('git', ['ls-files', '-z'], { cwd: REPO, maxBuffer: 64 * 1024 * 1024 })
    .toString('utf8')
    .split('\0')
    .filter((path) => path !== '');
}

/** 1-based line number of the first legacy-name match, or undefined when the
 *  file is binary (a NUL in the first 8 KiB) or does not match. */
function firstLegacyLine(path: string): number | undefined {
  const bytes = readFileSync(join(REPO, path));
  if (bytes.subarray(0, BINARY_SNIFF_BYTES).includes(NUL)) return undefined;
  const text = bytes.toString('utf8');
  const match = LEGACY.exec(text);
  if (match === null) return undefined;
  return text.slice(0, match.index).split('\n').length;
}

/** Every tracked, non-allowed text file containing the legacy name, mapped to
 *  its first matching line. */
function scanLegacyMatches(): Map<string, number> {
  const matches = new Map<string, number>();
  for (const path of listTrackedFiles()) {
    if (isAllowed(path)) continue;
    const line = firstLegacyLine(path);
    if (line !== undefined) matches.set(path, line);
  }
  return matches;
}

describe('legacy name plantuml-ts (issue #173, D4)', () => {
  it('appears in no tracked file outside ALLOWED_PREFIXES', () => {
    const offenders = [...scanLegacyMatches()].map(([path, line]) => `${path}:${line}`);
    expect(offenders, `legacy name found in:\n${offenders.join('\n')}`).toEqual([]);
  });
});
