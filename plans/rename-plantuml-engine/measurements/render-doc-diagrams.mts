/**
 * rpe T7b: render every ```plantuml block of the given Markdown files through
 * renderSync and report which come back as our error page.
 *
 *   npx jiti plans/rename-plantuml-engine/measurements/render-doc-diagrams.mts <file.md>...
 */
import { readFileSync } from 'node:fs';
import { renderSync } from '../../../src/index.js';
import { fullDescription } from '../../../src/core/version.js';

const BLOCK = /```plantuml\n([\s\S]*?)```/g;
const BANNER = fullDescription().split(' / ')[0]!;
let errors = 0;
for (const file of process.argv.slice(2)) {
  const blocks = [...readFileSync(file, 'utf8').matchAll(BLOCK)].map((m) => m[1]!);
  blocks.forEach((src, i) => {
    const svg = renderSync(src);
    const isError = svg.includes(BANNER);
    if (isError) errors++;
    console.log(`${file}#${i + 1}: ${isError ? 'ERROR PAGE' : 'ok'} (${svg.length} bytes)`);
  });
}
console.log(`error pages: ${errors}`);
