/**
 * ddd batch 4: authored fixtures for branches the corpus reaches through other paths: sprites (T4d), note style and
 * colours (T4e), guillemet (T4b), a lone leaf and creole rules (T4a, T4g), magnetic ends (T3b), raw colour specs (T2e).
 * Each `oracle/<name>.svg` is the jar's, from `scripts/oracle-render.sh`.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';

const DIR = 'tests/fixtures/ddd-T4x';
const TOLERANCE_CLASS = 'deterministic';
const render = (source: string): string => renderSync(source, { measurer: new DeterministicMeasurer() });
const pumlOf = (name: string): string => readFileSync(`${DIR}/${name}.puml`, 'utf8');
const names = readdirSync(DIR)
  .filter((file) => file.endsWith('.puml'))
  .map((file) => file.replace(/\.puml$/, ''))
  .filter((name) => existsSync(`${DIR}/oracle/${name}.svg`));

describe('authored description fixtures against the jar', () => {
  it('collects every fixture with an oracle', () => {
    expect(names.length).toBe(32);
  });

  it.each(names)('%s', (name) => {
    const result = compareSvg(render(pumlOf(name)), readFileSync(`${DIR}/oracle/${name}.svg`, 'utf8'), TOLERANCE_CLASS);
    expect(result.diffs).toEqual([]);
  });

  it('a floating note takes one colour: the attribute form is the jar error page', () => {
    const svg = render(pumlOf('floating-note-attribute-colour-error'));
    expect(svg).toContain('No such color');
    expect(svg).toContain('(line 3');
  });
});
