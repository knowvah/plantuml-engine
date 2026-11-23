/**
 * dhk measurer. Renders `@startdot` rows through the RATCHET path of
 * `tests/oracle/svg-conformance/dot.golden.ratchet.test.ts` -- `renderSync`
 * under `SecurityProfile.INSECURE`, then `compareSvg(ours, jar, 'deterministic')`
 * -- against INSECURE jar oracles in `<oracle-dir>/<slug>.svg`.
 *
 *   npx tsx plans/dot-host-font-kerning/measurements/measure-accepted.mts <oracle-dir> <src-dir> [slug...]
 *
 * `<src-dir>/<slug>.puml` is the source. Default slugs: the two #186 rows.
 * Prints one line per row: `slug diffs=N score=S rx-ours=[..] rx-jar=[..] first=<path>`.
 *
 * Why not `plans/dot-oracle-gap-rows/measurements/measure-rows.mts`: it renders
 * under the default LEGACY profile and reads `test-results/dot-cache/dot/`, which
 * the a720bdd re-pin (cfb9ecd55, 2026-11-21) recaptured under LEGACY. Both sides
 * are then `PSystemDot`'s suppression page (`PSystemDot.java:77-84`), so it
 * reports 0 diffs for every drawn row and calls each one a jar error page.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderSync } from '../../../src/index.js';
import { SecurityProfile } from '../../../src/core/security/SecurityProfile.js';
import { compareSvg, weightedScore } from '../../../tests/oracle/svg-conformance/compare.js';

const DEFAULT_SLUGS = ['quoted-labels', 'skinparam-font-color'];
const GRAPHVIZ_DOCUMENT_MARK = 'id="graph0"';

const [oracleDir, srcDir, ...given] = process.argv.slice(2);
if (oracleDir === undefined || srcDir === undefined) {
  console.error('usage: measure-accepted.mts <oracle-dir> <src-dir> [slug...]');
  process.exit(2);
}
const slugs = given.length > 0 ? given : DEFAULT_SLUGS;
const rxOf = (svg: string): string[] => [...svg.matchAll(/rx="([\d.]+)"/g)].map((m) => m[1]!);

for (const slug of slugs) {
  const jar = readFileSync(join(oracleDir, `${slug}.svg`), 'utf8');
  if (!jar.includes(GRAPHVIZ_DOCUMENT_MARK)) {
    console.log(`${slug} ORACLE-NOT-GRAPHVIZ (LEGACY capture or error page; re-render under INSECURE, one file per run)`);
    continue;
  }
  const ours = renderSync(readFileSync(join(srcDir, `${slug}.puml`), 'utf8'), {
    securityProfile: SecurityProfile.INSECURE,
  });
  const { diffs } = compareSvg(ours, jar, 'deterministic');
  console.log(
    `${slug} diffs=${diffs.length} score=${weightedScore(diffs)} rx-ours=[${rxOf(ours).join(',')}]` +
      ` rx-jar=[${rxOf(jar).join(',')}] first=${diffs[0]?.path ?? '(none)'}`,
  );
}
