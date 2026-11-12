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
 * `PENDING` is the mission's work queue: files not yet swept. Each sweep task
 * removes its lines; a stale entry fails, so the list can only shrink.
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

/** Tracked files still awaiting the rename sweep (sorted, one per line). */
const PENDING: readonly string[] = [
  'CLAUDE.md',
  'README.md',
  'RELEASING.md',
  'assets/emoji/LICENSES.md',
  'assets/sprites/LICENSES.md',
  'docs-site/guide/api.md',
  'docs-site/guide/getting-started.md',
  'docs-site/guide/image-providers.md',
  'docs-site/guide/styling-data-diagrams.md',
  'docs-site/guide/why-no-smetana.md',
  'docs-site/index.md',
  'docs/architecture/architecture.md',
  'docs/architecture/components.md',
  'docs/architecture/data-flow.md',
  'docs/architecture/inventory.md',
  'docs/architecture/overview.md',
  'docs/architecture/tech-health.md',
  'docs/catalog.md',
  'docs/parity-report.md',
  'docs/stdlib-remote.md',
  'docs/svg-conformance.md',
  'oracle/GAP.md',
  'oracle/README.md',
  'packages/all/README.md',
  'packages/all/index.js',
  'packages/emoji/LICENSES.md',
  'packages/emoji/README.md',
  'packages/emoji/index.js',
  'packages/sprites-archimate/LICENSES.md',
  'packages/sprites-archimate/README.md',
  'packages/sprites-archimate/index.js',
  'packages/stdlib-all/LICENSES.md',
  'packages/stdlib-all/README.md',
  'packages/stdlib-aws/LICENSES.md',
  'packages/stdlib-aws/README.md',
  'packages/stdlib-tupadr3/LICENSES.md',
  'packages/stdlib-tupadr3/README.md',
  'packages/stdlib/LICENSE',
  'packages/stdlib/LICENSES.md',
  'packages/stdlib/README.md',
  'planning/adr/ADR-001-text-measurement.md',
  'planning/adr/ADR-002-mit-with-epl-dependency.md',
  'planning/conformance.md',
  'planning/roadmap.md',
  'scripts/build-stdlib-packages.ts',
  'scripts/build-stdlib-packages/build-lock.ts',
  'scripts/measure-lock-contention.ts',
  'scripts/oracle-corpus.ts',
  'scripts/oracle-gap.ts',
  'scripts/parity-dashboard-inputs.ts',
  'scripts/parity-dashboard-matrix.ts',
  'scripts/parity-dashboard.ts',
  'scripts/stdlib-assets-store.ts',
  'scripts/svg-parity-dashboard.ts',
  'scripts/svg-parity-survey.ts',
  'scripts/vendor-sprites.ts',
  'scripts/verify-deterministic-measurer.ts',
  'src/core/BlockUmlBuilder.ts',
  'src/core/dot-engine-measurer.ts',
  'src/core/dot-engine-messages.ts',
  'src/core/graph-layout.ts',
  'src/core/include-resolver.ts',
  'src/core/measurer.ts',
  'src/core/skinparam.ts',
  'src/core/sprite-split-stdlib.ts',
  'src/core/svg.ts',
  'src/core/theme.ts',
  'src/core/tim/IncludeStore.ts',
  'src/core/tim/StdlibRemote.ts',
  'src/core/tim/TContext.ts',
  'src/core/tim/TContextOptions.ts',
  'src/image-providers/browser.ts',
  'src/image-providers/network.ts',
  'tests/helpers/coverage-reports-directory.test.ts',
  'tests/helpers/coverage-reports-directory.ts',
  'tests/oracle/class-dot-parity.test.ts',
  'tests/oracle/description-parity.ratchet.test.ts',
  'tests/oracle/svek-dot.ts',
  'tests/oracle/svg-conformance/PARITY-SVG.md',
  'tests/unit/build-stdlib-lock.test.ts',
  'tests/unit/class/class-arrow-length.test.ts',
  'tests/unit/class/class-nested-generics.test.ts',
  'tests/unit/core/graph-layout-svek-read.test.ts',
  'tests/unit/core/klimt/sprite/PSystemListArchimateSpritesFactory.test.ts',
  'tests/unit/core/tim/TContext.test.ts',
  'tests/unit/core/utils/SignatureUtils.test.ts',
  'tests/unit/image-providers/browser.test.ts',
  'tests/unit/image-providers/network.test.ts',
  'tests/unit/include-resolver-node.test.ts',
  'tests/unit/preprocessor.test.ts',
  'tests/unit/scripts/parity-dashboard-jar-unsupported.test.ts',
  'tests/unit/scripts/parity-dashboard.test.ts',
  'tests/unit/sequence/group-routing.test.ts',
  'tests/unit/stdlib-assets-store.test.ts',
  'tests/unit/stdlib-resolution.test.ts',
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
  const matches = scanLegacyMatches();
  const pending = new Set(PENDING);

  it('appears in no tracked file outside ALLOWED_PREFIXES and PENDING', () => {
    const offenders = [...matches].filter(([path]) => !pending.has(path)).map(([path, line]) => `${path}:${line}`);
    expect(offenders, `legacy name found in:\n${offenders.join('\n')}`).toEqual([]);
  });

  it('has no stale PENDING entry', () => {
    const stale = PENDING.filter((path) => !matches.has(path)).map((path) => `stale PENDING entry: ${path}`);
    expect(stale, stale.join('\n')).toEqual([]);
  });

  it('lists no PENDING entry under ALLOWED_PREFIXES', () => {
    expect(PENDING.filter(isAllowed)).toEqual([]);
  });

  it('keeps PENDING sorted so each sweep task removes clean lines', () => {
    expect([...PENDING]).toEqual([...PENDING].sort());
  });
});
