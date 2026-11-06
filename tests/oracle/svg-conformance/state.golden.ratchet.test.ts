/**
 * Offline SVG-conformance RATCHET for state diagrams. G4/S0.
 *
 * Mirrors `object.golden.ratchet.test.ts` (svg-object, mission G3/O0)
 * exactly in procedure — see that file's doc comment for the full
 * rationale (offline, committed goldens; `DeterministicMeasurer` so both
 * sides measure text in the SAME system; a fixture ratchets in only once
 * and then never regresses). ONE structural difference from object: state
 * diagrams DO have a dedicated engine upstream (`statediagram/`) and a
 * dedicated port pipeline, so this suite uses a NEW, state-scoped render
 * helper (`render-fixture-state.ts#renderFixtureState`), not
 * `render-fixture-class.ts`'s reused helper.
 *
 * STARTS EMPTY (unlike object's O0, which seeded 5 fixtures from a
 * same-iteration fix): S0's own baseline survey found 0/271 zero-diff —
 * see `oracle/goldens/svg-state/README.md` "Current state" for the full,
 * jar-verified, four-mechanism attribution (SVG root shell, missing
 * outer/per-entity `<g>` wrapping, arrowhead-drawing mechanism, document-
 * margin/ink-extent) and `plans/g4-state-svg/ledger.md` S0 for the sampled
 * evidence. AC1/AC2/AC3 below degrade gracefully to a documented
 * placeholder assertion when `ratchet.json`/`parity-state.json` are empty
 * (the SAME defensive precedent every other ratchet suite already uses)
 * — this branch IS exercised at S0, unlike object's O0.
 *
 * An `unknown` tree (ubt-T3c, D6 of `plans/unknown-bucket-triage/decisions.md`): an entry MAY carry
 * `tree: 'unknown'`, a corpus row filed under `unknown` that the jar types as STATE; its golden lives at
 * `svg-state/unknown/<slug>/`, renders through the same helper, and its AC3 row is read from
 * `parity-unknown.json` (as `class.golden.ratchet.test.ts` reads its `unknown` tree).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from './compare.js';
import { renderFixtureState } from './render-fixture-state.js';

/** A pin's survey bucket when it is not `state` (ubt-T3c, D6 of `plans/unknown-bucket-triage/decisions.md`):
 *  a corpus row filed under `unknown` that the jar types as STATE and our router sends here. */
type RatchetTree = 'unknown';

interface RatchetFixture {
  slug: string;
  addedAt: string;
  source: string;
  /** Absent: a `state` row at `svg-state/<slug>/`; `'unknown'`: at `svg-state/unknown/<slug>/`. */
  tree?: RatchetTree;
}

interface RatchetManifest {
  fixtures: RatchetFixture[];
}

interface ParityEntry {
  slug: string;
  dotEqual: boolean;
}

interface ParityReport {
  fixtures: ParityEntry[];
}

const GOLDENS_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../../oracle/goldens/svg-state');

const manifest = JSON.parse(readFileSync(join(GOLDENS_ROOT, 'ratchet.json'), 'utf8')) as RatchetManifest;

// Source of DOT-EQUAL truth for eligibility (AC3) — state-scoped, mirrors
// class's/object's own `parity-class.json`/`parity-object.json` (see
// `render-fixture-state.ts`'s doc comment and `oracle/goldens/svg-state/
// README.md`'s "Add rule"). Regenerate via `svg-parity-survey.ts --out
// ... state` before adding new slugs.
const readParity = (file: string): ParityReport =>
  JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), file), 'utf8')) as ParityReport;
const PARITY_BY_TREE: Record<'state' | RatchetTree, ParityReport> = {
  state: readParity('parity-state.json'),
  unknown: readParity('parity-unknown.json'),
};

function findParityEntry(f: RatchetFixture): ParityEntry | undefined {
  return PARITY_BY_TREE[f.tree ?? 'state'].fixtures.find((e) => e.slug === f.slug);
}

function fixtureDir(f: RatchetFixture): string {
  return f.tree === undefined ? join(GOLDENS_ROOT, f.slug) : join(GOLDENS_ROOT, f.tree, f.slug);
}

/** `state/<slug>` or `unknown/<slug>`: the pin's bucket and slug, for messages. */
function labelOf(f: RatchetFixture): string {
  return `${f.tree ?? 'state'}/${f.slug}`;
}

function readGolden(f: RatchetFixture): string {
  return readFileSync(join(fixtureDir(f), 'golden.svg'), 'utf8');
}

function readSource(f: RatchetFixture): string {
  return readFileSync(join(fixtureDir(f), 'in.puml'), 'utf8');
}

function firstDiffPath(diffs: readonly { path: string }[]): string {
  return diffs.length > 0 ? diffs[0]!.path : '(none)';
}

// ---------------------------------------------------------------------------
// AC1 — every locked fixture stays conformant.
// ---------------------------------------------------------------------------

describe.skipIf(manifest.fixtures.length === 0)('svg-state conformance ratchet (AC1)', () => {
  for (const f of manifest.fixtures) {
    it(`${labelOf(f)}: stays zero-diff against the pinned golden`, () => {
      const golden = readGolden(f);
      const markup = readSource(f);
      const ours = renderFixtureState(markup, new DeterministicMeasurer());
      const { pass, diffs } = compareSvg(ours, golden, 'deterministic');
      expect(
        pass,
        `${labelOf(f)}: conformance regression — first diff: ${firstDiffPath(diffs)}` +
          ` — ${JSON.stringify(diffs[0])}`,
      ).toBe(true);
      expect(diffs).toEqual([]);
    });
  }
});

if (manifest.fixtures.length === 0) {
  it('has no pinned svg-state goldens yet (skip gracefully, not a failure)', () => {
    expect(manifest.fixtures).toHaveLength(0);
  });
}

// ---------------------------------------------------------------------------
// AC2 — tamper detection: an in-memory golden mutation must be caught, and
// the failure message must name the slug + first diff path.
// ---------------------------------------------------------------------------

describe.skipIf(manifest.fixtures.length === 0)('svg-state conformance ratchet — tamper detection (AC2)', () => {
  it('a mutated golden (in-memory only) produces a failure naming slug + diff path', () => {
    const f = manifest.fixtures[0];
    expect(f, 'expected at least one seeded fixture to exercise tamper detection').toBeDefined();
    const target = f!;

    const golden = readGolden(target);
    const markup = readSource(target);
    const ours = renderFixtureState(markup, new DeterministicMeasurer());

    // Confirm the untampered pair really is zero-diff first, so the
    // tampered-case failure below is attributable to the mutation alone.
    const clean = compareSvg(ours, golden, 'deterministic');
    expect(clean.pass, `state/${target.slug}: expected zero-diff baseline`).toBe(true);

    // Mutate a numeric attribute in-memory — never touches disk.
    const tampered = golden.replace(/rect x="(\d+)"/, (_m, x: string) => `rect x="${Number(x) + 500}"`);
    expect(tampered).not.toBe(golden);

    const { pass, diffs } = compareSvg(ours, tampered, 'deterministic');
    expect(pass).toBe(false);
    expect(diffs.length).toBeGreaterThan(0);

    const message =
      `state/${target.slug}: conformance regression — first diff: ${firstDiffPath(diffs)}` +
      ` — ${JSON.stringify(diffs[0])}`;
    expect(message).toContain(target.slug);
    expect(message).toContain(diffs[0]!.path);
  });
});

if (manifest.fixtures.length === 0) {
  it('has no pinned svg-state golden yet to exercise tamper detection against (AC2, deferred)', () => {
    expect(manifest.fixtures).toHaveLength(0);
  });
}

// ---------------------------------------------------------------------------
// AC3 — DOT-EQUAL eligibility is enforced in the suite, not just documented.
// ---------------------------------------------------------------------------

describe.skipIf(manifest.fixtures.length === 0)('svg-state conformance ratchet — eligibility (AC3)', () => {
  it('every manifest slug has a dotEqual=true parity-state.json entry', () => {
    for (const f of manifest.fixtures) {
      const entry = findParityEntry(f);
      expect(entry, `${labelOf(f)}: no parity entry found`).toBeDefined();
      expect(entry!.dotEqual, `${labelOf(f)}: manifest entry is not DOT-EQUAL — ineligible for the ratchet`).toBe(true);
    }
  });
});

if (manifest.fixtures.length === 0) {
  // S0's own baseline survey (`svg-parity-survey.ts --out ... state`) is a
  // REAL, populated report -- 271/271 fixtures surveyed, 267/271
  // dotEqual=true, 0/271 conformant (see `oracle/goldens/svg-state/
  // README.md` "Current state") -- unlike object's O0 (which never ran an
  // empty-placeholder survey at all, per that file's own doc comment),
  // there is genuinely nothing "unsurveyed" here. The eligibility CHECK
  // itself is still deferred (no manifest slugs to check against), but
  // the data it would check against already exists and is asserted here.
  it('parity-state.json is a real, populated survey with zero currently-eligible slugs (AC3, deferred)', () => {
    // See this file's doc comment + oracle/goldens/svg-state/README.md
    // "Add rule": regenerate via `svg-parity-survey.ts --out ... state`
    // whenever a render-side change might create a new zero-diff candidate.
    expect(PARITY_BY_TREE.state.fixtures.length).toBeGreaterThan(0);
    expect(manifest.fixtures).toHaveLength(0);
  });
}

// ---------------------------------------------------------------------------
// ubt-T3c (D6) -- the `unknown` tree: resolution, and tamper detection on an
// unknown-tree pin (red until the first one is pinned).
// ---------------------------------------------------------------------------

describe('svg-state conformance ratchet -- unknown tree (ubt-T3c)', () => {
  it('an unknown entry resolves under svg-state/unknown/<slug>/, a bare one under svg-state/<slug>/', () => {
    const base = { slug: 'synthetic-slug', addedAt: '2026-11-06', source: 'test' };
    expect(fixtureDir({ ...base, tree: 'unknown' })).toBe(join(GOLDENS_ROOT, 'unknown', 'synthetic-slug'));
    expect(fixtureDir(base)).toBe(join(GOLDENS_ROOT, 'synthetic-slug'));
  });

  it('a mutated unknown-tree golden (in-memory only) fails, naming the tree and slug', () => {
    const f = manifest.fixtures.find((x) => x.tree === 'unknown');
    expect(f, 'expected at least one unknown-tree pin').toBeDefined();
    const golden = readGolden(f!);
    const ours = renderFixtureState(readSource(f!), new DeterministicMeasurer());
    expect(compareSvg(ours, golden, 'deterministic').pass).toBe(true);
    const tampered = golden.replace(/ x="([\d.]+)"/, (_m, x: string) => ` x="${Number(x) + 500}"`);
    expect(tampered).not.toBe(golden);
    const { pass, diffs } = compareSvg(ours, tampered, 'deterministic');
    expect(pass).toBe(false);
    expect(`${labelOf(f!)}: ${diffs[0]!.path}`).toContain(`unknown/${f!.slug}`);
  });
});
