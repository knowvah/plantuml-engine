#!/usr/bin/env node
/**
 * Render .puml files through the seam-5 jar with the exact flags
 * scripts/oracle-render.sh uses (PLANTUML_DETERMINISTIC_TEXT, PLANTUML_DUMP_DOT,
 * Batik on the classpath, -tsvg, 25 s budget), and keep the output. Exists
 * because oracle-render.sh is hard-wired to oracle/dist (which must keep the
 * reference jar until T2a, recapture-reference-jar-order) and
 * recapture-oracles.ts --verify deletes its scratch renders. Unlike
 * oracle-render.sh it does NOT record oracle/capture-clock.json: these are
 * scratch renders, never committed oracles.
 *
 * Usage:
 *   node plans/png-bounder-seam/measurements/render-seam5.mjs <absolute-out-dir> <puml...> [--jar path]
 * Default jar: /tmp/pbs-jar/plantuml-seam5.jar. Exit status is java's (124 on timeout).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const BATIK = join(REPO, 'oracle', 'dist', 'batik');
/** scripts/oracle-render.sh TIMEOUT_SECONDS. */
const TIMEOUT_MS = 25_000;
const TIMEOUT_EXIT = 124;

function main() {
  const args = process.argv.slice(2);
  const jarAt = args.indexOf('--jar');
  const jar = resolve(jarAt === -1 ? '/tmp/pbs-jar/plantuml-seam5.jar' : args[jarAt + 1]);
  const rest = jarAt === -1 ? args : args.filter((_, i) => i !== jarAt && i !== jarAt + 1);
  const [out, ...pumls] = rest;
  if (out === undefined || !isAbsolute(out) || pumls.length === 0) {
    console.error('usage: render-seam5.mjs <absolute-out-dir> <puml...> [--jar path]');
    return 2;
  }
  if (!existsSync(jar)) {
    console.error(`jar not found: ${jar}`);
    return 1;
  }
  mkdirSync(out, { recursive: true });
  const batik = existsSync(BATIK) && readdirSync(BATIK).some((f) => f.endsWith('.jar'));
  const cp = batik ? `${jar}:${BATIK}/*` : jar;
  if (!batik) console.error('warn: Batik absent -- <latex>/<math> render as rollbacks');
  const run = spawnSync(
    'java',
    [
      '-DPLANTUML_DETERMINISTIC_TEXT=true',
      `-DPLANTUML_DUMP_DOT=${out}`,
      '-cp',
      cp,
      'net.sourceforge.plantuml.Run',
      '-tsvg',
      '-o',
      out,
      ...pumls.map((p) => resolve(p)),
    ],
    { stdio: 'inherit', timeout: TIMEOUT_MS },
  );
  if (run.error?.code === 'ETIMEDOUT') return TIMEOUT_EXIT;
  return run.status ?? 1;
}

process.exitCode = main();
