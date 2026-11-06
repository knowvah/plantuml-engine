// smc: measure authored rows (`<engine>__<group>-<case>.puml` + jar `.svg`) through the dss harness.
// Usage: npx jiti plans/style-mode-cascades/measurements/rows.mts <root> [--diffs N] [--json <out>] [prefix ...]
// <root> is `tests/fixtures/diagram-style-scope` or a scratch dir. A prefix keeps rows whose name starts with it.
// Prints `row<TAB>diffCount`, then the first N diffs of every non-zero row. Error-page rows read as their raw
// diff count here; the pin's error-page rule (T1a) is applied by the ratchet, not by this tool.
import { writeFileSync } from 'node:fs';

import {
  firstScopeDiffs,
  listScopeRows,
  measureScopeRow,
  type ScopeRow,
} from '../../../tests/oracle/svg-conformance/diagram-style-scope.js';

const args = process.argv.slice(2);
const root = args.shift();
if (root === undefined) throw new Error('usage: rows.mts <root> [--diffs N] [--json <out>] [prefix ...]');
const take = (flag: string): string | undefined => {
  const i = args.indexOf(flag);
  if (i < 0) return undefined;
  const [value] = args.splice(i, 2).slice(1);
  return value;
};
const diffs = Number(take('--diffs') ?? '0');
const jsonOut = take('--json');
const prefixes = args;

const result: Record<string, ScopeRow> = {};
let open = 0;
for (const row of listScopeRows(root)) {
  if (prefixes.length > 0 && !prefixes.some((p) => row.startsWith(p))) continue;
  const m = measureScopeRow(row, root);
  result[row] = m;
  if (m.diffCount > 0) open++;
  console.log(`${row}\t${String(m.diffCount)}`);
  if (diffs > 0 && m.diffCount > 0) for (const d of firstScopeDiffs(row, diffs, root)) console.log(`    ${d}`);
}
console.log(`rows ${String(Object.keys(result).length)} open ${String(open)}`);
if (jsonOut !== undefined) writeFileSync(jsonOut, `${JSON.stringify({ rows: result }, null, 2)}\n`);
