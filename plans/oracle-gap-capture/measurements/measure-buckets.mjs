// Survey and census the buckets this mission added rows to, one at a time.
// Usage: node measure-buckets.mjs survey|census [out-dir]   (default: the committed path)
// Node, not bash: the autonomous allowlist permits `node`, and no bash script here.
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const BUCKETS = ['activity', 'class', 'dot', 'hcl', 'object', 'sequence', 'state', 'timing', 'unknown', 'yaml'];
const MAX_OUTPUT_BYTES = 1 << 28;
const [mode, out = 'tests/oracle/svg-conformance'] = process.argv.slice(2);

function run(args) {
  execFileSync('npx', args, { stdio: ['ignore', 'ignore', 'inherit'], maxBuffer: MAX_OUTPUT_BYTES });
}

for (const type of BUCKETS) {
  if (mode === 'survey') {
    run(['jiti', 'scripts/svg-parity-survey.ts', type, '--out', join(out, `parity-${type}.json`)]);
  } else if (mode === 'census') {
    run(['tsx', 'scripts/svg-conformance-census.ts', type, '--json', join(out, `census-${type}.json`)]);
  } else {
    throw new Error('usage: measure-buckets.mjs survey|census [out-dir]');
  }
  console.log(`${mode} ${type}`);
}
