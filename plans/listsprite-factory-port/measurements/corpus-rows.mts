// The two corpus rows that reach ListSpriteDiagramFactory (PSystemBuilder.java:170), measured the way the
// svg-factories gate measures a FACTORIES_SLUGS row (`measureFactoriesSlug`: survey render options, capture clock).
// Usage: npx jiti plans/listsprite-factory-port/measurements/corpus-rows.mts [cacheRoot]
//   cacheRoot defaults to test-results/dot-cache (the tool appends unknown/<slug>/in.puml + in.svg).
// Prints `slug<TAB>measure-json`. Exit 0 always: read the rows.
import { join } from 'node:path';

import { measureFactoriesSlug } from '../../../tests/oracle/svg-conformance/render-fixture-factories.js';

export const LISTSPRITE_CORPUS_SLUGS: readonly string[] = ['folutu-01-xuzo995', 'nujapi-78-mota753'];

const cacheRoot = process.argv[2] ?? join('test-results', 'dot-cache');
for (const slug of LISTSPRITE_CORPUS_SLUGS) {
  console.log(`${slug}\t${JSON.stringify(measureFactoriesSlug(cacheRoot, slug))}`);
}
