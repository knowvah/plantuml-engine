/**
 * The formula rollback in every engine. Upstream reaches `ScientificEquationSafe` the same way from each one, a
 * creole `StripeLatex` building an `AtomMath` (`StripeLatex.java:90`), so a `<math>`/`<latex>` JLaTeXMath rejects is
 * its source as monospace text in its own block (ScientificEquationSafe.java:110-128, aa79d2d80ee) in a class
 * member, class name, note and link label; a description element, note and link label; a state's name, description,
 * note and transition label; and a sequence message and notes.
 *
 * `tests/fixtures/rollback-engines/*.puml` are authored probes; each `.svg` is the jar's render
 * (`scripts/oracle-render.sh`, a720bdd). `glb` is not a JLaTeXMath command, so every formula rolls back.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { renderSync } from '../../../../src/index.js';
import { DeterministicMeasurer } from '../../../../src/core/measurer-deterministic.js';
import { compareSvg } from '../../../oracle/svg-conformance/compare.js';

const DIR = new URL('../../../fixtures/rollback-engines/', import.meta.url);

function diffs(name: string): string[] {
  const ours = renderSync(readFileSync(new URL(`${name}.puml`, DIR), 'utf8'), {
    measurer: new DeterministicMeasurer(),
  });
  const jar = readFileSync(new URL(`${name}.svg`, DIR), 'utf8');
  return compareSvg(ours, jar, 'deterministic').diffs.map(
    (d) => `${d.path} ${String(d.actual)} vs ${String(d.expected)}`,
  );
}

describe('the formula rollback in every engine (aa79d2d80ee)', () => {
  it.each([
    'class-member-label',
    'desc-rect-note',
    'desc-usecase-component',
    'desc-link-label',
    'state-label-note',
    'seq-message-note',
  ])('%s is the jar document', (name) => {
    expect(diffs(name)).toEqual([]);
  });
});
