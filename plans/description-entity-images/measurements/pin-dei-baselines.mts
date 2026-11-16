// Upserts the routing/refusal baseline rows of the #147 fixtures: the eight authored `dei-*` fixtures in both
// walks the gates take (`dot-cache:component/<slug>` and `goldens:svg-description/component/<slug>`), and the three
// `unknown` rows. ORCHESTRATOR-ONLY (`scripts/pin-corpus-tree.ts`'s rule). Measures through the gates' own seams
// (`scripts/pin-corpus-tree-measure.ts`: renderSync + DeterministicMeasurer + fixtureIncludeStore, jar-compatible
// style input). A fixture that measures clean is pinned `ok`/`agree`; one that still refuses keeps the mechanism
// named below, which cites the upstream command this mission ports.
// Usage: npx tsx plans/description-entity-images/measurements/pin-dei-baselines.mts [--dry]
import { existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

import { renderSync } from '../../../src/index.js';
import { withJarCompatibleStyleInput } from '../../../src/core/internal-render-options.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { fixtureIncludeStore } from '../../../tests/helpers/fixture-include-store.js';
import {
  diagramTypeOf,
  engineOf,
  isJarErrorPage,
  readHead,
  weErroredIn,
} from '../../../scripts/pin-corpus-tree-measure.js';

const ROUTING = 'oracle/goldens/svg-conformance/routing-baseline.json';
const REFUSAL = 'oracle/goldens/svg-conformance/refusal-baseline.json';
const HEAD_BYTES = 4096;
const AUTHORED = 'oracle/goldens/svg-description/component';

/** Why each still-refusing fixture refuses: the keyword description has no command for until this mission. */
const REASONS: Record<string, string> = {
  json:
    'description has no json command yet: upstream registers CommandCreateJson and CommandCreateJsonSingleLine in ' +
    'DescriptionDiagramFactory.java:130-131 and draws the leaf with EntityImageJson (GeneralImageBuilder.java:186-187); ' +
    'ported by #147 batch 2.',
  map:
    'description has no map command yet: upstream registers CommandCreateMap in DescriptionDiagramFactory.java:129 ' +
    'and draws the leaf with EntityImageMap (GeneralImageBuilder.java:183-184); ported by #147 batch 3.',
  domain:
    'description has no domain/requirement command yet: upstream registers CommandCreateDomain in ' +
    'DescriptionDiagramFactory.java:137 and dispatches its images in GeneralImageBuilder.java:235-255; ported by #147 ' +
    'batch 4.',
};

interface Target {
  tree: 'dot-cache' | 'goldens';
  type: string;
  slug: string;
  puml: string;
  golden: string;
  reason: string;
}

function reasonFor(slug: string): string {
  if (slug.includes('json') || slug.startsWith('gacoxo')) return REASONS['json']!;
  if (slug.includes('map') || slug.startsWith('liripi')) return REASONS['map']!;
  return REASONS['domain']!;
}

function targets(): Target[] {
  const out: Target[] = [];
  for (const slug of readdirSync(AUTHORED).filter((s) => s.startsWith('dei-')).sort()) {
    const reason = reasonFor(slug);
    const cache = join('test-results/dot-cache/component', slug);
    out.push({ tree: 'dot-cache', type: 'component', slug, puml: join(cache, 'in.puml'), golden: join(cache, 'in.svg'), reason });
    const dir = join(AUTHORED, slug);
    out.push({
      tree: 'goldens',
      type: 'svg-description',
      slug: `component/${slug}`,
      puml: join(dir, 'in.puml'),
      golden: join(dir, 'golden.svg'),
      reason,
    });
  }
  for (const slug of ['gacoxo-93-guti295', 'liripi-72-kefa167', 'rukitu-26-seme622']) {
    const cache = join('test-results/dot-cache/unknown', slug);
    out.push({ tree: 'dot-cache', type: 'unknown', slug, puml: join(cache, 'in.puml'), golden: join(cache, 'in.svg'), reason: reasonFor(slug) });
    // Pinned at T5 as description goldens: the goldens walk then sees `svg-description/unknown/<slug>` too.
    const golden = join('oracle/goldens/svg-description/unknown', slug);
    if (existsSync(golden)) {
      out.push({ tree: 'goldens', type: 'svg-description', slug: `unknown/${slug}`, puml: join(golden, 'in.puml'), golden: join(golden, 'golden.svg'), reason: reasonFor(slug) });
    }
  }
  return out;
}

type Row = Record<string, unknown> & { tree: string; type: string; slug: string };
type Baseline = { $comment: string; fixtures: Row[] };

function upsert(file: Baseline, row: Row): 'added' | 'changed' | 'same' {
  const i = file.fixtures.findIndex((r) => r.tree === row.tree && r.type === row.type && r.slug === row.slug);
  if (i === -1) {
    file.fixtures.push(row);
    return 'added';
  }
  const old = file.fixtures[i]!;
  const key = (r: Row): string => JSON.stringify({ ...r, measuredAt: 0, measuredAgainstCommit: 0 });
  if (old['status'] === row['status'] && old['weErrored'] === row['weErrored'] && old['ourType'] === row['ourType']) {
    return 'same';
  }
  if (key(old) === key(row)) return 'same';
  file.fixtures[i] = row;
  return 'changed';
}

const dry = process.argv.includes('--dry');
const today = execFileSync('date', ['+%Y-%m-%d']).toString().trim();
const commit = execFileSync('git', ['rev-parse', '--short=9', 'HEAD']).toString().trim();
const routing = JSON.parse(readFileSync(ROUTING, 'utf8')) as Baseline;
const refusal = JSON.parse(readFileSync(REFUSAL, 'utf8')) as Baseline;
const store = fixtureIncludeStore();
for (const t of targets()) {
  const ours = renderSync(
    readFileSync(t.puml, 'utf8'),
    withJarCompatibleStyleInput({ includeStore: store, measurer: new DeterministicMeasurer() }),
  );
  const head = readHead(t.golden);
  const jarErrored = isJarErrorPage(head);
  const weErrored = weErroredIn(ours);
  const jarType = diagramTypeOf(head);
  const ourType = diagramTypeOf(ours.slice(0, HEAD_BYTES));
  const stamp = { measuredAt: today, measuredAgainstCommit: commit };
  const ids = { tree: t.tree, type: t.type, slug: t.slug };
  const routeStatus = jarErrored ? 'jar-error' : jarType === ourType ? 'agree' : 'known-misroute';
  const refuseStatus = !jarErrored && weErrored ? 'known-gap' : 'ok';
  const routeRow: Row = { ...ids, jarType, ourType, status: routeStatus, ...stamp };
  if (routeStatus === 'known-misroute') routeRow['reason'] = t.reason;
  const refuseRow: Row = { ...ids, jarRendered: !jarErrored, weErrored, engine: engineOf(ours, weErrored), status: refuseStatus, ...stamp };
  if (refuseStatus === 'known-gap') refuseRow['reason'] = t.reason;
  const a = upsert(routing, routeRow);
  const b = upsert(refusal, refuseRow);
  console.log(`${t.tree}:${t.type}/${t.slug} routing ${routeStatus} (${a}) refusal ${refuseStatus} (${b})`);
}
if (!dry) {
  writeFileSync(ROUTING, `${JSON.stringify(routing, null, 2)}\n`);
  writeFileSync(REFUSAL, `${JSON.stringify(refusal, null, 2)}\n`);
}
