// Node x positions: real dot on the jar-size DOT vs the jar's drawn rects (x = cx - w/2 + 10 margin).
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const [tag, oracle, ...watch] = process.argv.slice(2);
const txt = execFileSync('dot', ['-Tdot', `/tmp/gip-t3c/${tag}-jarsize.dot`], { maxBuffer: 1 << 28 }).toString().replace(/\\\n\s*/g, '');
const pos = new Map();
for (const m of txt.matchAll(/^\s*(N\d+)\s*\[([^\]]*)\]/gm)) { const p = /pos="([^"]*)"/.exec(m[2])[1].split(',').map(Number); pos.set(m[1], { cx: p[0], w: Number(/width=([\d.]+)/.exec(m[2])[1]) * 72 }); }
const jar = [...readFileSync(oracle, 'utf8').matchAll(/<rect x="([^"]*)" y="[^"]*" width="([^"]*)"/g)].map((m) => Number(m[1]));
let off = 0, max = 0;
jar.forEach((x, i) => { const d = pos.get(`N${i}`); const ours = d.cx - d.w / 2 + 10; const dx = Math.abs(ours - x); if (dx > 1) off++; max = Math.max(max, dx); });
console.log(`${tag}: nodes ${jar.length}, x differs >1px on ${off}, max |dx| ${max.toFixed(2)}`);
for (const n of watch) { const i = Number(n.slice(1)); const d = pos.get(n); console.log(`  ${n} dot@jarsize x ${(d.cx - d.w / 2 + 10).toFixed(2)} jar x ${jar[i]}`); }
