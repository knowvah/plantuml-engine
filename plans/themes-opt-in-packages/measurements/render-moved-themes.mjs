/**
 * T0/T3 conformance hash: renders every corpus/fixture `.puml` that uses a
 * theme #180 moves out of core, plus the two help-theme fixtures, through the
 * fixture include store, and prints `<sha256>  <path>` sorted by path.
 *
 * Imports nothing the mission creates, so it runs unchanged on both trees.
 * Run from the repo root: `npx jiti plans/themes-opt-in-packages/measurements/render-moved-themes.mjs`.
 */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { renderPagesSync } from '../../../src/index.js';
import { fixtureIncludeStore } from '../../../tests/helpers/fixture-include-store.js';

const ROOT = process.cwd();
const MOVED = /!theme\s+(amiga|blueprint|crt-amber|crt-green|mimeograph|plain|mono|carbon-gray|sunlust)\b/;
const EXTRA = ['tests/fixtures/factories/cov-help-theme.puml', 'tests/fixtures/factories/cov-help-two.puml'];

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith('.puml')) out.push(p);
  }
}

const files = [];
walk(join(ROOT, 'tests/corpus'), files);
walk(join(ROOT, 'tests/fixtures'), files);
const selected = new Set(
  files.filter((f) => MOVED.test(readFileSync(f, 'utf8'))).map((f) => relative(ROOT, f)),
);
for (const e of EXTRA) selected.add(e);

const lines = [];
for (const rel of [...selected].sort()) {
  const source = readFileSync(join(ROOT, rel), 'utf8');
  let body;
  try {
    body = renderPagesSync(source, { includeStore: fixtureIncludeStore() }).join('\n<!--page-->\n');
  } catch (e) {
    body = `THROW ${e.message}`;
  }
  lines.push(`${createHash('sha256').update(body).digest('hex')}  ${rel}`);
}
process.stdout.write(lines.join('\n') + '\n');
