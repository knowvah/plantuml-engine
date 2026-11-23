/**
 * aae T4 (issue #188): a switch case's leading `-> label;` replaces the case text. `FtileSwitchWithManyLinks.java:91-92`
 * labels the diamond-to-case connection with `branch.getTextBlockPositive()`, i.e. `Branch#getDisplayPositive`
 * (`activitydiagram3/Branch.java:231-238`): the first tile's in-link display, when set, wins over `labelPositive`.
 * Jar oracles: `tests/fixtures/aae-switch-case/` (text) and `tests/fixtures/edge-label-embed/act3-switch-in` (embed).
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures');

function rowDiffs(dir: string, row: string): string[] {
  const jar = readFileSync(join(FIXTURES, dir, `${row}.svg`), 'utf8');
  const ours = renderSync(readFileSync(join(FIXTURES, dir, `${row}.puml`), 'utf8'), {
    measurer: new DeterministicMeasurer(),
  });
  return compareSvg(ours, jar, 'deterministic').diffs.map(
    (d) => `${d.path} ${String(d.actual)} vs ${String(d.expected)}`,
  );
}

describe('aae T4: a switch case relabelled by its leading arrow label', () => {
  it('draws `hello` where the case text `a` was, as the jar does', () => {
    const svg = renderSync(readFileSync(join(FIXTURES, 'aae-switch-case/switch-case-arrow-label.puml'), 'utf8'), {
      measurer: new DeterministicMeasurer(),
    });
    expect(svg).toMatch(/<text x="29" y="98.056"[^>]*>hello</);
    expect(svg).not.toMatch(/>a</);
  });

  it('the text row renders equal to the jar', () => {
    expect(rowDiffs('aae-switch-case', 'switch-case-arrow-label')).toEqual([]);
  });

  it('the embed row renders equal to the jar', () => {
    expect(rowDiffs('edge-label-embed', 'act3-switch-in')).toEqual([]);
  });
});

describe('aae T4: an arrow label in a branch with no instruction never relabels it', () => {
  // `InstructionIf.java:165-167,183,196`: still pending at `else`/`elseif`/`endif`, it becomes the branch's special.
  it('the empty-then if row renders equal to the jar (`y` kept, `lbl` drawn once)', () => {
    expect(rowDiffs('aae-switch-case', 'if-empty-branch-arrow-label')).toEqual([]);
  });
});
