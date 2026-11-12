// gip T3c D9 evidence for one row/fixture: (2) dot-engine vs real dot on our DOT, (3) real dot at the jar's box
// sizes vs the jar (piece counts, node x), and the residue node / path / dw / dh (max |Δ|, ours vs jar).
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
const R = '/Users/scottseely/git/knowvah/plantuml-ts/';
const gl = await import(R + 'src/core/graph-layout.ts');
const { renderSync } = await import(R + 'src/index.ts');
const { DeterministicMeasurer } = await import(R + 'src/core/measurer-deterministic.ts');
const { javaDoubleToString } = await import(R + 'src/core/java-number-format.ts');
const num = (s: string) => s.match(/-?[\d.]+/g)!.map(Number);
function dotRun(dot: string) {
  const txt = execFileSync('dot', ['-Tdot'], { input: dot, maxBuffer: 1 << 28 }).toString().replace(/\\\n\s*/g, '');
  const nodes = new Map<string, number[]>(); const edges = new Map<string, { pts: number[][]; ep?: number[] }[]>();
  for (const m of txt.matchAll(/^\s*(N\d+)\s*\[([^\]]*)\]/gm)) nodes.set(m[1], [...num(/pos="([^"]*)"/.exec(m[2])![1]), Number(/width=([\d.]+)/.exec(m[2])![1]) * 72, Number(/height=([\d.]+)/.exec(m[2])![1]) * 72]);
  for (const m of txt.matchAll(/^\s*(N\d+) -> (N\d+)\s*\[([^\]]*)\]/gm)) {
    const parts = /pos="([^"]*)"/.exec(m[3])![1].split(' ');
    const ep = parts[0].startsWith('e,') ? num(parts.shift()!) : undefined;
    const k = `${m[1]}>${m[2]}`; edges.set(k, [...(edges.get(k) ?? []), { pts: parts.map(num), ep }]);
  }
  return { nodes, edges };
}
const out: string[] = [];
for (const arg of process.argv.slice(2)) {
  const [name, puml, oracle] = arg.split('=');
  let graph: any;
  gl.setLayoutInputObserver((e: any) => { graph = e.graph; });
  const ours = renderSync(readFileSync(puml, 'utf8'), { measurer: new DeterministicMeasurer() });
  gl.setLayoutInputObserver(undefined);
  const jarSvg = readFileSync(oracle, 'utf8');
  if (graph === undefined || graph.nodes.length === 0) { out.push(`${name}\tno-graph`); continue; }
  const edgeLines = graph.edges.map((e: any) => `${e.from} -> ${e.to} [arrowsize=.7,arrowtail=none,arrowhead=normal];`);
  const ourDot = ['digraph g {', `ranksep=${graph.smetanaRankSep};`, ...graph.nodes.map((n: any) => `${n.id} [shape=box,height=${javaDoubleToString(n.height / 72)},width=${javaDoubleToString(n.width / 72)}];`), ...edgeLines, '}'].join('\n');
  writeFileSync(`/tmp/gip-t3c/dot/${name}.dot`, ourDot);
  const r = gl.layoutGraph(graph, { read: 'exact' });
  // (2) engine vs dot
  const real = dotRun(ourDot);
  let dn = 0, de = 0, cnt = 0; const used = new Map<string, number>();
  for (const n of r.engineNodes!) { const d = real.nodes.get(n.id)!; dn = Math.max(dn, Math.abs(d[0] - n.cx), Math.abs(d[1] - n.cy), Math.abs(d[2] - n.width), Math.abs(d[3] - n.height)); }
  r.engineEdges!.forEach((e: any) => { const ie = graph.edges.find((x: any) => x.id === e.id); const k = `${ie.from}>${ie.to}`; const i = used.get(k) ?? 0; used.set(k, i + 1); const d = real.edges.get(k)![i]!;
    if (d.pts.length !== e.points.length) { cnt++; return; }
    e.points.forEach((p: any, j: number) => { de = Math.max(de, Math.abs(p.x - d.pts[j][0]), Math.abs(p.y - d.pts[j][1])); });
    if (e.epX !== undefined && d.ep) de = Math.max(de, Math.abs(e.epX - d.ep[0]), Math.abs(e.epY - d.ep[1])); });
  // (3) jar sizes
  const rects = (svg: string) => [...svg.matchAll(/<rect x="([^"]*)" y="([^"]*)" width="([^"]*)" height="([^"]*)"/g)].map((m) => m.slice(1, 5).map(Number));
  const curves = (svg: string) => [...svg.matchAll(/<path d="([^"]*)" style="[^"]*dasharray/g)].map((m) => m[1]);
  const our = rects(ours), jar = rects(jarSvg);
  if (our.length !== graph.nodes.length || jar.length !== graph.nodes.length) { out.push(`${name}\tengine=dot nodes ${dn.toFixed(4)} edges ${de.toFixed(4)} countMismatch ${cnt}\tno rects (handwritten)`); continue; }
  const jarDot = ['digraph g {', `ranksep=${graph.smetanaRankSep};`, 'node [label="",fixedsize=true];', ...graph.nodes.map((n: any, i: number) => `${n.id} [shape=box,height=${(jar[i][3] + r.engineNodes![i].height - our[i][3]) / 72},width=${jar[i][2] / 72}];`), ...edgeLines, '}'].join('\n');
  const js = dotRun(jarDot);
  let nsOff = 0; jar.forEach((jr, i) => { const d = js.nodes.get(`N${i}`)!; if (Math.abs(d[0] - d[2] / 2 + 10 - jr[0]) > 1) nsOff++; });
  const jc = curves(jarSvg), oc = curves(ours);
  const pieceUsed = new Map<string, number>();
  let pcOurs = 0, pcJs = 0;
  graph.edges.forEach((e: any, i: number) => { const k = `${e.from}>${e.to}`; const u = pieceUsed.get(k) ?? 0; pieceUsed.set(k, u + 1);
    const jp = (jc[i].match(/C/g) ?? []).length; if ((oc[i].match(/C/g) ?? []).length !== jp) pcOurs++; if ((js.edges.get(k)![u].pts.length - 1) / 3 !== jp) pcJs++; });
  // residue
  let node = 0; our.forEach((o, i) => o.forEach((v, j) => (node = Math.max(node, Math.abs(v - jar[i][j])))));
  const texts = (svg: string) => [...svg.matchAll(/<text x="([^"]*)" y="([^"]*)"/g)].map((m) => [Number(m[1]), Number(m[2])]);
  const ot = texts(ours), jt = texts(jarSvg); ot.forEach((t, i) => t.forEach((v, j) => (node = Math.max(node, Math.abs(v - jt[i][j])))));
  const allPaths = (svg: string) => [...svg.matchAll(/<path d="([^"]*)"/g)].map((m) => num(m[1]));
  const op = allPaths(ours), jp = allPaths(jarSvg); let path = 0, unaligned = 0;
  op.forEach((p, i) => { if (p.length !== jp[i].length) { unaligned++; return; } p.forEach((v, j) => (path = Math.max(path, Math.abs(v - jp[i][j])))); });
  const dim = (svg: string) => num(/viewBox="([^"]*)"/.exec(svg)![1]);
  const [, , ow, oh] = dim(ours), [, , jw, jh] = dim(jarSvg);
  out.push([name, `engine=dot nodes ${dn.toFixed(4)} edges ${de.toFixed(4)} countMismatch ${cnt}`, `jarsize: nodeX≠jar ${nsOff}/${jar.length}, pieces≠jar ${pcJs} (ours ${pcOurs})/${jc.length}`, `residue ${node.toFixed(3)} / ${path.toFixed(3)}${unaligned ? ` (+${unaligned} unaligned paths)` : ''} / ${Math.abs(ow - jw)} / ${Math.abs(oh - jh)}`].join('\t'));
}
console.log(out.join('\n'));
