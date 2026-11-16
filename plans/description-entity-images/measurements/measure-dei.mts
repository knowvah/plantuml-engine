// The three #147 `unknown` rows and every authored `dei-*` fixture, through the survey's own render call
// (`renderFixtureSurveyStyle`, so verdicts agree with `svg:survey`) and `DeterministicMeasurer`.
// Usage: npx tsx plans/description-entity-images/measurements/measure-dei.mts [out.json]
// Prints `slug verdict diffs firstDiff` per row and `rows N zero Z error E`; with an argument, writes the rows as JSON.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from '../../../tests/oracle/svg-conformance/compare.js';
import { renderFixtureSurveyStyle } from '../../../tests/oracle/svg-conformance/render-fixture.js';

const UNKNOWN_ROWS = ['gacoxo-93-guti295', 'liripi-72-kefa167', 'rukitu-26-seme622'];
const UNKNOWN_DIR = 'test-results/dot-cache/unknown';
const AUTHORED_DIR = 'oracle/goldens/svg-description/component';
const AUTHORED_PREFIX = 'dei-';
const FIELD_LIMIT = 160;

interface Source {
  slug: string;
  puml: string;
  golden: string;
}

interface Row {
  slug: string;
  verdict: 'conformant' | 'diverged';
  diffs: number;
  firstDiff: string;
  errorPage: boolean;
  diffList: { p: string; a: string; e: string }[];
}

function sources(): Source[] {
  const out: Source[] = UNKNOWN_ROWS.map((slug) => ({
    slug: `unknown/${slug}`,
    puml: join(UNKNOWN_DIR, slug, 'in.puml'),
    golden: join(UNKNOWN_DIR, slug, 'in.svg'),
  }));
  for (const slug of readdirSync(AUTHORED_DIR).sort()) {
    if (!slug.startsWith(AUTHORED_PREFIX)) continue;
    const dir = join(AUTHORED_DIR, slug);
    if (!existsSync(join(dir, 'golden.svg'))) continue;
    out.push({ slug: `component/${slug}`, puml: join(dir, 'in.puml'), golden: join(dir, 'golden.svg') });
  }
  return out;
}

function measure(src: Source, measurer: DeterministicMeasurer): Row {
  const { svg, errorPage } = renderFixtureSurveyStyle(readFileSync(src.puml, 'utf8'), measurer);
  const { diffs } = compareSvg(svg, readFileSync(src.golden, 'utf8'), 'deterministic');
  const diffList = diffs.map((d) => ({
    p: d.path,
    a: String(d.actual).slice(0, FIELD_LIMIT),
    e: String(d.expected).slice(0, FIELD_LIMIT),
  }));
  return {
    slug: src.slug,
    verdict: diffs.length === 0 ? 'conformant' : 'diverged',
    diffs: diffs.length,
    firstDiff: diffList[0]?.p ?? '-',
    errorPage,
    diffList,
  };
}

const outPath = process.argv[2];
const measurer = new DeterministicMeasurer();
const rows = sources().map((s) => measure(s, measurer));
for (const r of rows) console.log(`${r.slug} ${r.verdict} ${r.diffs} ${r.firstDiff}`);
const zero = rows.filter((r) => r.diffs === 0).length;
const errors = rows.filter((r) => r.errorPage).length;
console.log(`rows ${rows.length} zero ${zero} error ${errors}`);
if (outPath !== undefined) writeFileSync(outPath, JSON.stringify(rows, null, 1));
