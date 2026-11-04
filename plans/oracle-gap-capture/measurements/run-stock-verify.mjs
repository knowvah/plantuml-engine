// Re-run the stock-jar record. Node, not bash: the autonomous allowlist has no entry for the script.
// Usage: node run-stock-verify.mjs [draws-out-file]
// Reuses the cached oracle/dist/stock jar, so it never touches ~/git/plantuml. Exit 1 if the jar is absent.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const STOCK_DIR = 'oracle/dist/stock';
const SCRIPT = 'scripts/stock-jar-verify.sh';
const pin = JSON.parse(readFileSync('oracle/pin.json', 'utf8'));
const jar = join(STOCK_DIR, `plantuml-stock-${pin.upstreamSha}.jar`);
if (!existsSync(jar)) {
  console.error(`missing ${jar}: building it would write outside this mission's reach, so stop and report`);
  process.exit(1);
}
const draws = process.argv[2];
execFileSync('bash', [SCRIPT, ...(draws === undefined ? [] : ['--draws-out', draws])], { stdio: 'inherit' });
