#!/usr/bin/env node
/**
 * Run scripts/recapture-oracles.ts with PLANTUML_FORK pointing at the /tmp
 * clone, so its --write drift guard (scripts/rebaseline-svg-goldens.ts
 * checkDriftGuard) reads dot-output~5 from the clone that has seam #5, not
 * from ~/git/plantuml, which has only four seam commits until the user
 * applies patch 0005. The allowlist has no env-var prefixes
 * (.claude/memory/autonomous-allowlist-names-one-mission.md).
 *
 * Usage:
 *   node plans/png-bounder-seam/measurements/recapture.mjs [--fork /tmp/plantuml-seam5] -- <recapture-oracles args>
 * Example:
 *   node plans/png-bounder-seam/measurements/recapture.mjs -- --verify --workers 6 \
 *     --jar /tmp/pbs-jar/plantuml-seam5.jar --report /tmp/pbs-T1b/report.json
 * Exit status is recapture-oracles.ts's.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

function main() {
  const argv = process.argv.slice(2);
  const split = argv.indexOf('--');
  const own = split === -1 ? [] : argv.slice(0, split);
  const passThrough = split === -1 ? argv : argv.slice(split + 1);
  let fork = '/tmp/plantuml-seam5';
  if (own[0] === '--fork' && own[1] !== undefined) fork = resolve(own[1]);
  else if (own.length > 0) {
    console.error(`bad argument: ${own.join(' ')}`);
    return 2;
  }
  if (!existsSync(join(fork, '.git'))) {
    console.error(`no clone at ${fork}`);
    return 1;
  }
  const run = spawnSync('npx', ['jiti', join(REPO, 'scripts', 'recapture-oracles.ts'), ...passThrough], {
    cwd: REPO,
    env: { ...process.env, PLANTUML_FORK: fork },
    stdio: 'inherit',
  });
  return run.status ?? 1;
}

process.exitCode = main();
