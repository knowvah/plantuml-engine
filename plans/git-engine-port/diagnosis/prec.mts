// dot-engine vs real dot, each value checked against the half-unit of its own last printed digit.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const R = '/Users/scottseely/git/knowvah/plantuml-ts/';
const gl = await import(R + 'src/core/graph-layout.ts');
const { renderSync } = await import(R + 'src/index.ts');
const { DeterministicMeasurer } = await import(R + 'src/core/measurer-deterministic.ts');
const [puml, dotFile] = process.argv.slice(2);
let graph: any;
gl.setLayoutInputObserver((e: any) => { graph = e.graph; });
renderSync(readFileSync(puml, 'utf8'), { measurer: new DeterministicMeasurer() });
gl.setLayoutInputObserver(undefined);
const r = gl.layoutGraph(graph, { read: 'exact' });
const txt = execFileSync('dot', ['-Tdot', dotFile], { maxBuffer: 1 << 28 }).toString().replace(/\\\n\s*/g, '');
const half = (s: string) => { const d = s.includes('.') ? s.split('.')[1].length : 0; return 0.5 * 10 ** -d + 1e-9; };
let bad = 0, checked = 0, worstRatio = 0;
const chk = (ours: number, s: string) => { checked++; const d = Math.abs(ours - Number(s)); worstRatio = Math.max(worstRatio, d / half(s)); if (d > half(s)) bad++; };
for (const m of txt.matchAll(/^\s*(N\d+)\s*\[([^\]]*)\]/gm)) {
  const n = r.engineNodes!.find((x: any) => x.id === m[1])!; const [x, y] = /pos="([^"]*)"/.exec(m[2])![1].split(',');
  chk(n.cx, x!); chk(n.cy, y!);
}
const used = new Map<string, number>();
const byKey = new Map<string, string[][]>();
for (const m of txt.matchAll(/^\s*(N\d+) -> (N\d+)\s*\[([^\]]*)\]/gm)) { const k = `${m[1]}>${m[2]}`; byKey.set(k, [...(byKey.get(k) ?? []), /pos="([^"]*)"/.exec(m[3])![1].split(' ')]); }
for (const e of r.engineEdges!) { const ie = graph.edges.find((x: any) => x.id === e.id); const k = `${ie.from}>${ie.to}`; const i = used.get(k) ?? 0; used.set(k, i + 1);
  const parts = [...byKey.get(k)![i]!]; const ep = parts[0]!.startsWith('e,') ? parts.shift()!.slice(2).split(',') : undefined;
  e.points.forEach((p: any, j: number) => { const [x, y] = parts[j]!.split(','); chk(p.x, x!); chk(p.y, y!); });
  if (ep && e.epX !== undefined) { chk(e.epX, ep[0]!); chk(e.epY!, ep[1]!); } }
console.log(`checked ${checked} values, outside own print precision: ${bad}, worst |Δ|/halfUnit ${worstRatio.toFixed(3)}`);
