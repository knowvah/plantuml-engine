// Order-insensitive SVG comparison for @startflow (flp D4). The jar draws boxes in HashMap<Tile, ActivityBox>
// iteration order (FlowDiagram.java drawU), which follows Java identity hashes and changes run to run, so a
// positional compareSvg cannot tell a right port from a wrong one. This compares the multiset of `>`-split tag
// strings instead. It is a measurement, never a verdict: the survey's verdict stays compareSvg's.
// Usage: node plans/flow-engine-port/measurements/multiset.mjs <ours.svg> <jar.svg> [<jar.svg> ...]
// Exit 0 when <ours> equals at least one jar file as a multiset; 1 otherwise.
import { readFileSync } from 'node:fs';

const SHOW = 8;
const [ours, ...jars] = process.argv.slice(2);
if (ours === undefined || jars.length === 0) throw new Error('usage: multiset.mjs <ours.svg> <jar.svg> [...]');

/** The tag strings of the drawn body, `<?plantuml ...?>` and the root element dropped (they carry no geometry). */
function tags(path) {
  const svg = readFileSync(path, 'utf8');
  const body = svg.slice(svg.indexOf('<g'));
  return body
    .split('>')
    .map((t) => t.trim())
    .filter((t) => t.length > 0 && !t.startsWith('<?plantuml'));
}

function count(list) {
  const m = new Map();
  for (const t of list) m.set(t, (m.get(t) ?? 0) + 1);
  return m;
}

function minus(a, b) {
  const out = [];
  for (const [t, n] of a) for (let k = 0; k < n - (b.get(t) ?? 0); k++) out.push(t);
  return out;
}

const mine = count(tags(ours));
let anyEqual = false;
for (const jar of jars) {
  const theirs = count(tags(jar));
  const onlyOurs = minus(mine, theirs);
  const onlyJar = minus(theirs, mine);
  const equal = onlyOurs.length === 0 && onlyJar.length === 0;
  anyEqual ||= equal;
  console.log(`${jar} ${equal ? 'multiset-equal' : `differs ours+${onlyOurs.length} jar+${onlyJar.length}`}`);
  for (const t of onlyOurs.slice(0, SHOW)) console.log(`  ours: ${t}`);
  for (const t of onlyJar.slice(0, SHOW)) console.log(`  jar:  ${t}`);
}
process.exit(anyEqual ? 0 : 1);
