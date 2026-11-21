/**
 * Authored U+00A0 trim gate (upstream 0c54c010cdf): `StringUtils.trin`/`trim2` treat a non-breaking space as a blank
 * (`StringUtils.java:647-721`), so a command line, a `<style>` line or a skinparam with a leading or trailing U+00A0
 * reads like its trimmed form, while the call sites upstream writes as `String#trim` keep it: a class member
 * (`Member.java:127-128`) and the text `DriverTextSvg` draws (`DriverTextSvg.java:120-122`). Rows are exactly the
 * `.puml` files under `tests/fixtures/nbsp-trim/`, each with its jar `.svg` beside it (`scripts/oracle-render.sh`).
 *
 * Rendered as the survey renders (`scripts/svg-parity-survey.ts`): `renderSync` + `DeterministicMeasurer`.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from './compare.js';

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures/nbsp-trim');

/** Rows at 0 diffs. 2026-11-21: all four, measured against the a720bdd jar. */
const ZERO: readonly string[] = [
  // Members keep the U+00A0 indent (no visibility icon, `--` not a separator); the commands around them trim it.
  'class-commands-members',
  // `== x ==`, `* x`, `# x` captures trim U+00A0 (CreoleStripeSimpleParser.java:125-154); plain text keeps it.
  'creole-stripes',
  'sequence-commands',
  // `<style>` lines are `getTrimmed()` (CharInspectorImpl.java:62-63); 6 diffs before 0c54c010cdf was ported.
  'style-and-skinparam',
];

function rowsOnDisk(): string[] {
  return readdirSync(FIXTURES)
    .filter((f) => f.endsWith('.puml'))
    .map((f) => f.slice(0, -'.puml'.length))
    .sort();
}

function diffCount(row: string): number {
  const jar = readFileSync(join(FIXTURES, `${row}.svg`), 'utf8');
  const ours = renderSync(readFileSync(join(FIXTURES, `${row}.puml`), 'utf8'), {
    measurer: new DeterministicMeasurer(),
  });
  return compareSvg(ours, jar, 'deterministic').diffs.length;
}

describe('nbsp-trim authored fixtures - manifest shape', () => {
  it('rows are exactly the .puml files on disk, each listed once, each with its jar .svg and a U+00A0', () => {
    expect([...ZERO].sort()).toEqual(rowsOnDisk());
    expect(new Set(ZERO).size).toBe(ZERO.length);
    for (const row of ZERO) {
      expect(readFileSync(join(FIXTURES, `${row}.svg`), 'utf8')).toContain('<svg');
      expect(readFileSync(join(FIXTURES, `${row}.puml`), 'utf8')).toContain('\u00A0');
    }
  });
});

describe('nbsp-trim authored fixtures - zero rows', () => {
  for (const row of ZERO) {
    it(`${row}: 0 diffs`, () => {
      expect(diffCount(row)).toBe(0);
    });
  }
});
