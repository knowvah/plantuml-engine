/**
 * rpe T3: measure the svg-utility authored rows that print the version string,
 * through the ratchet's own path (measureAuthoredUtility), to compare against
 * oracle/goldens/svg-utility/authored-baseline.json.
 *
 *   npx jiti plans/rename-plantuml-engine/measurements/measure-version-rows.mts
 */
import { readFileSync } from 'node:fs';
import { measureAuthoredUtility } from '../../../tests/oracle/svg-conformance/render-fixture-utility.js';

const BASELINE = 'oracle/goldens/svg-utility/authored-baseline.json';
const SLUGS = ['cov-about', 'cov-authors', 'cov-version'];
const rows = (JSON.parse(readFileSync(BASELINE, 'utf8')) as { fixtures: { slug: string; weightedScore: number; diffCount: number }[] }).fixtures;
for (const slug of SLUGS) {
  const pinned = rows.find((r) => r.slug === slug)!;
  const m = measureAuthoredUtility(slug) as unknown as Record<string, unknown>;
  console.log(JSON.stringify({ slug, pinned: [pinned.weightedScore, pinned.diffCount], measured: [m.weightedScore, m.diffCount] }));
}
