// The mission's scope: component and usecase rows, plus unknown rows the jar draws as DESCRIPTION.
// A row's jar type comes from the routing baseline, never from its corpus directory (routing gate D6).
import { readFileSync } from 'node:fs';

const ROUTING = 'oracle/goldens/svg-conformance/routing-baseline.json';
const CACHE_TREE = 'dot-cache';
const JAR_DESCRIPTION = 'DESCRIPTION';
export const BUCKETS = ['component', 'usecase', 'unknown'];

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

/** `<bucket>/<slug>` of every unknown row the jar draws as DESCRIPTION. */
export function unknownDescriptionKeys() {
  const rows = readJson(ROUTING).fixtures.filter((r) => r.tree === CACHE_TREE && r.type === 'unknown');
  return new Set(rows.filter((r) => r.jarType === JAR_DESCRIPTION).map((r) => `unknown/${r.slug}`));
}

/** Rows of one survey file that are in scope, keyed `<bucket>/<slug>`. */
export function inScope(bucket, surveyRows, unknownKeys = unknownDescriptionKeys()) {
  return surveyRows
    .map((r) => ({ ...r, key: `${bucket}/${r.slug}` }))
    .filter((r) => bucket !== 'unknown' || unknownKeys.has(r.key));
}
