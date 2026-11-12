// Experiment only (never ported): re-run real dot on OUR graph with the JAR's box sizes, then compare each edge's
// cubic-piece count with the jar's drawn path. Proves whether a segment-count residue follows from box sizing.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
const R = '/Users/scottseely/git/knowvah/plantuml-ts/';
const gl = await import(R + 'src/core/graph-layout.ts');
const { renderSync } = await import(R + 'src/index.ts');
const { DeterministicMeasurer } = await import(R + 'src/core/measurer-deterministic.ts');
const [puml, oracle, tag] = process.argv.slice(2);
let graph: any;
gl.setLayoutInputObserver((e: any) => { graph = e.graph; });
const ours = renderSync(readFileSync(puml, 'utf8'), { measurer: new DeterministicMeasurer() });
gl.setLayoutInputObserver(undefined);
const eng = gl.layoutGraph(graph, { read: 'exact' }).engineNodes!;
const rects = (svg: string) => [...svg.matchAll(/<rect x="[^"]*" y="[^"]*" width="([^"]*)" height="([^"]*)"/g)].map((m) => [Number(m[1]), Number(m[2])]);
const curves = (svg: string) => [...svg.matchAll(/<path d="([^"]*)" style="[^"]*dasharray/g)].map((m) => (m[1].match(/C/g) ?? []).length);
const our = rects(ours), jar = rects(readFileSync(oracle, 'utf8'));
const lines = ['digraph g {', `ranksep=${graph.smetanaRankSep};`, 'node [label="",fixedsize=true];'];
graph.nodes.forEach((n: any, i: number) => {
  const moveY = eng[i].height - our[i][1];
  lines.push(`${n.id} [shape=box,height=${(jar[i][1] + moveY) / 72},width=${jar[i][0] / 72}];`);
});
for (const e of graph.edges) lines.push(`${e.from} -> ${e.to} [arrowsize=.7,arrowtail=none,arrowhead=normal];`);
lines.push('}');
writeFileSync(`/tmp/gip-t3c/${tag}-jarsize.dot`, lines.join('\n'));
const txt = execFileSync('dot', ['-Tdot', `/tmp/gip-t3c/${tag}-jarsize.dot`], { maxBuffer: 1 << 28 }).toString().replace(/\\\n\s*/g, '');
const byKey = new Map<string, number[]>();
for (const m of txt.matchAll(/^\s*(N\d+) -> (N\d+)\s*\[([^\]]*)\]/gm)) {
  const pts = /pos="([^"]*)"/.exec(m[3])![1].split(' ').filter((p) => !p.startsWith('e,')).length;
  const k = `${m[1]}>${m[2]}`; byKey.set(k, [...(byKey.get(k) ?? []), (pts - 1) / 3]);
}
const dotPieces = graph.edges.map((e: any) => byKey.get(`${e.from}>${e.to}`)!.shift()!);
const jarPieces = curves(readFileSync(oracle, 'utf8')), ourPieces = curves(ours);
let oursOff = 0, dotOff = 0;
jarPieces.forEach((j, i) => { if (ourPieces[i] !== j) oursOff++; if (dotPieces[i] !== j) { dotOff++; const e = graph.edges[i]; console.log(`  edge ${i} ${e.from}->${e.to} jar ${j} ours ${ourPieces[i]} dot@jarsize ${dotPieces[i]}`); } });
console.log(`${tag}: edges ${jarPieces.length}; ours≠jar piece count on ${oursOff}; dot-with-jar-sizes≠jar on ${dotOff}`);
