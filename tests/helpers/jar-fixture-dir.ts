/**
 * One directory of authored `.puml` fixtures, each with its jar oracle at `oracle/<name>.svg`
 * (from `scripts/oracle-render.sh`), measured the way the conformance survey measures them.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';

import { DeterministicMeasurer } from '../../src/core/measurer-deterministic.js';
import { renderSync } from '../../src/index.js';
import type { RenderOptions } from '../../src/core/render-options.js';
import { compareSvg, type Diff } from '../oracle/svg-conformance/compare.js';

const PUML_SUFFIX = '.puml';
const TOLERANCE_CLASS = 'deterministic';

/** Every fixture of `dir` with an oracle. */
export function jarFixtureNames(dir: string): string[] {
  return readdirSync(dir)
    .filter((file) => file.endsWith(PUML_SUFFIX))
    .map((file) => file.slice(0, -PUML_SUFFIX.length))
    .filter((name) => existsSync(`${dir}/oracle/${name}.svg`));
}

/** Our render of `<dir>/<name>.puml`. */
export function renderJarFixture(dir: string, name: string, options: RenderOptions = {}): string {
  return renderSync(readFileSync(`${dir}/${name}${PUML_SUFFIX}`, 'utf8'), {
    measurer: new DeterministicMeasurer(),
    ...options,
  });
}

/** `compareSvg` of our render against the fixture's oracle. */
export function jarFixtureDiffs(dir: string, name: string, options: RenderOptions = {}): readonly Diff[] {
  const oracle = readFileSync(`${dir}/oracle/${name}.svg`, 'utf8');
  return compareSvg(renderJarFixture(dir, name, options), oracle, TOLERANCE_CLASS).diffs;
}
