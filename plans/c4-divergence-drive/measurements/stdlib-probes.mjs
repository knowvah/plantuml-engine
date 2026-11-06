// Write one `!include <bundle/file>` probe per sprite-bearing stdlib file sampled, then run the jar's -preproc over them.
// Samples the first and the middle sprite-bearing file of each bundle, so the set is the same on every run.
// Usage: node plans/c4-divergence-drive/measurements/stdlib-probes.mjs <out-dir>
// Then: npx jiti plans/c4-divergence-drive/measurements/seed-probe.mts <out-dir>
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const STDLIB = 'assets/stdlib';
const JAR = resolve('oracle/dist/plantuml-oracle.jar');
const EXAMPLES = '_examples_';
const SPRITE_LINE = /^\s*sprite\s/m;
const PUML_SUFFIX = '.puml';

const [outDir] = process.argv.slice(2);
if (outDir === undefined) throw new Error('usage: stdlib-probes.mjs <out-dir>');
mkdirSync(outDir, { recursive: true });

function pumlFiles(dir) {
  return readdirSync(dir)
    .sort()
    .flatMap((name) => {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) return name === EXAMPLES ? [] : pumlFiles(path);
      return name.endsWith(PUML_SUFFIX) ? [path] : [];
    });
}

const probes = [];
for (const bundle of readdirSync(STDLIB).sort()) {
  const dir = join(STDLIB, bundle);
  if (!statSync(dir).isDirectory()) continue;
  const withSprites = pumlFiles(dir).filter((f) => SPRITE_LINE.test(readFileSync(f, 'utf8')));
  if (withSprites.length === 0) continue;
  const middle = withSprites[Math.floor(withSprites.length / 2)];
  for (const file of new Set([withSprites[0], middle])) {
    const target = relative(STDLIB, file).slice(0, -PUML_SUFFIX.length);
    const name = `${target.replace(/\W/g, '_')}${PUML_SUFFIX}`;
    writeFileSync(join(outDir, name), `@startuml\n!include <${target}>\n@enduml\n`);
    probes.push(name);
  }
}
try {
  execFileSync('java', ['-Djava.awt.headless=true', '-DPLANTUML_DETERMINISTIC_TEXT=true', '-jar', JAR, '-preproc', ...probes], {
    cwd: outDir,
    stdio: 'pipe',
  });
} catch (err) {
  // The jar exits non-zero when a probe has no diagram body; the .preproc files are still written.
  console.log(`jar exit ${err.status}`);
}
console.log(`probes ${probes.length}`);
