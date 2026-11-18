#!/usr/bin/env node
/**
 * Classify every non-SAME row of a recapture-oracles.ts --report by why it may
 * move under seam #5 (decisions.md D7). Seam #5 changes only
 * FileFormat.PNG's bounder, which an SVG render reaches from exactly two
 * places (planning read, 2026-11-17):
 *   - ScientificEquationSafe#getImage's rollback export
 *     (math/ScientificEquationSafe.java:116-129), via AtomMath#calculateDimensionSlow
 *     (klimt/creole/atom/AtomMath.java:63-70);
 *   - WireDiagram#print (wire/WireDiagram.java:131-134).
 *
 * Classes, decided from the COMMITTED (pre-seam) bytes and source:
 *   rollback    the committed svg holds an <image> whose decoded SVG document is
 *               exactly a rollback export: one <g> holding only monospace <text>
 *               (ScientificEquationSafe#getRollback, GraphicStrings.createBlackOnWhiteMonospaced,
 *               exported by TextBlockExporter). A looser "contains monospace" test
 *               matched 72 committed svgs, mostly {{ }} embeds; this one matched
 *               exactly #170's 8 rows at planning (2026-11-17).
 *   wire-print  the source is @startwire with a `print` line
 *   unexpected  anything else: a stop condition unless proven jar noise (D7)
 *
 * Usage:
 *   node plans/png-bounder-seam/measurements/classify-movers.mjs <report.json>... [--json out.json]
 * Several reports (one per --only chunk) are concatenated.
 * Exit 1 iff a CHANGED row is `unexpected` or a row FAILED. `not-a-jar-render` rows are listed only.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const PUML_NAMES = ['in.puml', 'input.puml'];
const IMAGE_HREF = /xlink:href="data:image\/svg\+xml;base64,([^"]+)"/g;
const ROLLBACK_DOCUMENT =
  /^<svg [^>]*>(<\?plantuml [^?]*\?>)?<defs\/><g [^>]*>(<text [^>]*font-family="monospace"[^>]*>[^<]*<\/text>)+<\/g><\/svg>\s*$/;
const PRINT_LINE = /^\s*print\b/m;

/** The source and committed svgs of one report row. */
function sources(row) {
  if (row.kind === 'fixture-svg') {
    const svg = join(REPO, row.target);
    return { puml: svg.replace(/\.svg$/, '.puml'), svgs: [svg] };
  }
  const dir = join(REPO, row.target);
  const puml = PUML_NAMES.map((n) => join(dir, n)).find((p) => existsSync(p));
  const svgs = row.outputs.filter((o) => o.endsWith('.svg')).map((o) => join(dir, o));
  return { puml, svgs };
}

function hasRollbackImage(svgPath) {
  if (!existsSync(svgPath)) return false;
  const text = readFileSync(svgPath, 'utf8');
  for (const m of text.matchAll(IMAGE_HREF)) {
    if (ROLLBACK_DOCUMENT.test(Buffer.from(m[1], 'base64').toString('utf8'))) return true;
  }
  return false;
}

function classify(row) {
  const { puml, svgs } = sources(row);
  const source = puml !== undefined && existsSync(puml) ? readFileSync(puml, 'utf8') : '';
  if (svgs.some(hasRollbackImage)) return 'rollback';
  if (/@startwire/i.test(source) && PRINT_LINE.test(source)) return 'wire-print';
  return 'unexpected';
}

function main() {
  const args = process.argv.slice(2);
  const jsonAt = args.indexOf('--json');
  const outPath = jsonAt === -1 ? undefined : args[jsonAt + 1];
  const reports = jsonAt === -1 ? args : args.filter((_, i) => i !== jsonAt && i !== jsonAt + 1);
  if (reports.length === 0 || (jsonAt !== -1 && outPath === undefined)) {
    console.error('usage: classify-movers.mjs <report.json>... [--json out.json]');
    return 2;
  }
  const rows = reports.flatMap((r) => JSON.parse(readFileSync(r, 'utf8')));
  // `not-a-jar-render` rows are fixture svgs the REFERENCE jar does not reproduce: listed, never written, not movers.
  const notJar = rows.filter((r) => r.status === 'not-a-jar-render').map((r) => r.target);
  const movers = rows.filter((r) => r.status === 'CHANGED' || r.status === 'FAILED');
  const out = movers.map((r) => ({ target: r.target, kind: r.kind, status: r.status, cls: classify(r) }));
  const counts = {};
  for (const r of out) counts[`${r.status}/${r.cls}`] = (counts[`${r.status}/${r.cls}`] ?? 0) + 1;
  for (const r of out) if (r.cls === 'unexpected' || r.status === 'FAILED') console.log(`${r.status} ${r.cls} ${r.target}`);
  for (const t of notJar) console.log(`not-a-jar-render ${t}`);
  console.log(JSON.stringify({ targets: rows.length, movers: out.length, notAJarRender: notJar.length, counts }));
  if (outPath !== undefined) writeFileSync(outPath, `${JSON.stringify(out, null, 2)}\n`);
  const bad = out.some((r) => r.cls === 'unexpected' || r.status === 'FAILED');
  return bad ? 1 : 0;
}

process.exitCode = main();
