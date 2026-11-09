/**
 * Renders a legacy activity source through the PRODUCTION `renderSync` (`activityLegacyPlugin` is registered at
 * `PSystemBuilder.java:137`, laep T3a) with the options the survey uses, and compares with `compareSvg` as the
 * conformance harness does.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderSync } from '../../src/index.js';
import { DeterministicMeasurer } from '../../src/core/measurer-deterministic.js';
import { compareSvg } from '../oracle/svg-conformance/compare.js';

const CACHE = join(import.meta.dirname, '../../test-results/dot-cache');
const PROBES = join(import.meta.dirname, '../../plans/legacy-activity-engine-port/probes');

type Options = NonNullable<Parameters<typeof renderSync>[1]>;
const OPTIONS = {
  jarCompatibleStyleInput: true,
  measurer: new DeterministicMeasurer(),
  filename: 'in.puml',
} as Options;

/** The SVG our engine draws for `puml`. */
export function renderLegacy(puml: string): string {
  return renderSync(puml, OPTIONS);
}

/** The diffs of a cached row's render against its jar oracle (`in.svg`). */
export function rowDiffs(bucket: string, slug: string): { path: string; actual: unknown; expected: unknown }[] {
  const dir = join(CACHE, bucket, slug);
  const svg = renderLegacy(readFileSync(join(dir, 'in.puml'), 'utf8'));
  return compareSvg(svg, readFileSync(join(dir, 'in.svg'), 'utf8'), 'deterministic').diffs;
}

/** A planning probe's source. */
export function probeSource(slug: string): string {
  return readFileSync(join(PROBES, `${slug}.puml`), 'utf8');
}
