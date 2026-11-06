/**
 * ddd-T5e, D8: `usecase/fepuvo-06` is unreadable by `compareSvg` because the jar's own comment holds `--`. Stripped of
 * comments both sides are equal, and our comment carries the same malformed bytes (`Cluster.java:311`,
 * `EntityImageDescription.java:295`): mirroring, named in DIVERGENCES.md.
 */
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';

const STEM = 'tests/fixtures/ddd-T5e/fepuvo-06-rugi981';
const COMMENT = /<!--[\s\S]*?-->/g;
const MALFORMED_MARK = '- -- -';
const strip = (svg: string): string => {
  let stripped = svg;
  let previous: string;
  do {
    previous = stripped;
    stripped = stripped.replace(COMMENT, '');
  } while (stripped !== previous);
  return stripped;
};
const malformed = (svg: string): string[] =>
  (svg.match(COMMENT) ?? []).filter((comment) => comment.includes(MALFORMED_MARK));

const jar = readFileSync(`${STEM}.svg`, 'utf8');
const renderOptions = { jarCompatibleStyleInput: true, measurer: new DeterministicMeasurer() };
const ours = renderSync(readFileSync(`${STEM}.puml`, 'utf8'), renderOptions);

describe('usecase/fepuvo-06 (D8)', () => {
  it('compares clean with the comments stripped', () => {
    expect(compareSvg(strip(ours), strip(jar), 'deterministic').diffs).toEqual([]);
  });

  it('writes the same malformed comments as the jar', () => {
    expect(malformed(jar).length).toBe(2);
    expect(malformed(ours)).toEqual(malformed(jar));
  });
});
