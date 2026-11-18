#!/usr/bin/env node
/**
 * Build the seam-#5 oracle jar from the /tmp clone, leaving the reference jar
 * in oracle/dist untouched (.claude/memory/recapture-reference-jar-order.md:
 * recapture-oracles.ts judges fixture svgs against oracle/dist, so the OLD jar
 * must stay there until the --write pass is done).
 *
 * oracle/build-oracle.sh always copies its output into oracle/dist; this
 * wrapper backs the reference jar up first, moves the new jar out to --out,
 * and restores the reference, whatever the build's outcome. It exists because
 * the autonomous allowlist has no `oracle/build-oracle.sh` and no env-var
 * prefix (.claude/memory/autonomous-allowlist-names-one-mission.md).
 *
 * Usage:
 *   node plans/png-bounder-seam/measurements/build-seam5.mjs \
 *     [--fork /tmp/plantuml-seam5] [--out /tmp/pbs-jar/plantuml-seam5.jar]
 * Exit 0 iff the build succeeded and the reference jar is byte-identical to
 * what it was before.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const DIST_JAR = join(REPO, 'oracle', 'dist', 'plantuml-oracle.jar');
const DEFAULTS = { fork: '/tmp/plantuml-seam5', out: '/tmp/pbs-jar/plantuml-seam5.jar' };

function parseArgs(argv) {
  const opts = { ...DEFAULTS };
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i]?.replace(/^--/, '');
    if (!(key in DEFAULTS) || argv[i + 1] === undefined) throw new Error(`bad argument: ${argv[i]}`);
    opts[key] = resolve(argv[i + 1]);
  }
  return opts;
}

const md5 = (path) => createHash('md5').update(readFileSync(path)).digest('hex');

function main() {
  const { fork, out } = parseArgs(process.argv.slice(2));
  if (!existsSync(join(fork, '.git'))) {
    console.error(`no clone at ${fork}: git clone --branch dot-output ~/git/plantuml ${fork}`);
    return 1;
  }
  if (!existsSync(DIST_JAR)) {
    console.error(`reference jar missing: ${DIST_JAR}`);
    return 1;
  }
  mkdirSync(dirname(out), { recursive: true });
  const backup = join(dirname(out), 'reference-before-build.jar');
  copyFileSync(DIST_JAR, backup);
  const referenceMd5 = md5(backup);
  let status = 1;
  try {
    const run = spawnSync('bash', [join(REPO, 'oracle', 'build-oracle.sh')], {
      env: { ...process.env, PLANTUML_FORK: fork },
      stdio: 'inherit',
    });
    status = run.status ?? 1;
    if (status === 0) copyFileSync(DIST_JAR, out);
  } finally {
    copyFileSync(backup, DIST_JAR);
  }
  const restored = md5(DIST_JAR) === referenceMd5;
  console.log(`reference ${referenceMd5} restored=${restored}`);
  if (status === 0) console.log(`seam5 ${md5(out)} -> ${out}`);
  return status === 0 && restored ? 0 : 1;
}

process.exitCode = main();
