// smc T1a: does the STOCK jar (unaltered upstream at oracle/pin.json#upstreamSha) error on these rows?
// Usage: node plans/style-mode-cascades/measurements/stock-check.mjs <file.puml> [more.puml ...]
// Runs the cached stock jar the way scripts/stock-jar-verify.sh does: no -D flags, -tsvg -stdrpt:1, 60 s timeout.
// Prints `<row>\texit=<n>\t<status>\t<label or first stderr line>`; exit 200 with status=ERROR, or a crash
// (`java.lang.` on stderr), is a stock error per docs/svg-conformance.md "Error pages".
// `java` is not on the autonomous allowlist; `node` is, so this script spawns it.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';

const STOCK_DIR = 'oracle/dist/stock';
const TIMEOUT_MS = 60_000;
const pin = JSON.parse(readFileSync('oracle/pin.json', 'utf8'));
const jar = join(STOCK_DIR, `plantuml-stock-${pin.upstreamSha}.jar`);
if (!readdirSync(STOCK_DIR).includes(basename(jar))) throw new Error(`no stock jar for ${pin.upstreamSha}: run scripts/stock-jar-verify.sh`);

const files = process.argv.slice(2);
if (files.length === 0) throw new Error('usage: stock-check.mjs <file.puml> [...]');
const out = mkdtempSync(join(tmpdir(), 'smc-stock-'));
for (const file of files) {
  const r = spawnSync(
    'java',
    ['-Djava.awt.headless=true', '-cp', jar, 'net.sourceforge.plantuml.Run', '-tsvg', '-stdrpt:1', '-o', out, file],
    { encoding: 'utf8', timeout: TIMEOUT_MS },
  );
  const err = r.stderr ?? '';
  const status = /status=(\w+)/.exec(err)?.[1] ?? (err.includes('java.lang.') ? 'CRASH' : 'OK');
  const label = /label=(.*)/.exec(err)?.[1] ?? err.split('\n')[0] ?? '';
  console.log(`${basename(file, '.puml')}\texit=${String(r.status)}\t${status}\t${label}`);
}
