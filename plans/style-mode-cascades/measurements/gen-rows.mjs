// smc T0: writes the authored rows of #120 as `<engine>__<group>-<case>.puml`.
// Usage: node plans/style-mode-cascades/measurements/gen-rows.mjs <out-dir>
// Then render oracles: scripts/oracle-render.sh <out-dir> <out-dir>/*.puml
// Groups: `mode-*` (skinparam mode dark, monochrome, reversecolor), `malformed-*` (a key with no value, and a stray `}`, which parses),
// `casc-<prop>-<order>` (FontSize, LineThickness, RoundCorner, Shadowing x skin rose / skinparam after / theme).
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = process.argv[2];
if (out === undefined) throw new Error('usage: gen-rows.mjs <out-dir>');
mkdirSync(out, { recursive: true });

const BODY = {
  activity: { sel: 'activity', key: 'activity', body: 'start\n:a;\nnote right: n\nstop' },
  class: { sel: 'class', key: 'class', body: 'class A\nnote right of A: n' },
  component: { sel: 'component', key: 'component', body: '[C]\ndatabase D\nnote left of C: n' },
  object: { sel: 'object', key: 'object', body: 'object O\nnote right of O: n' },
  sequence: { sel: 'participant', key: 'participant', body: 'participant A\nA -> B\nnote right: n' },
  state: { sel: 'state', key: 'state', body: 'state S\nS --> T\nnote right of S: n' },
  usecase: { sel: 'usecase', key: 'usecase', body: 'actor U\nU --> (x)\nnote right of U: n' },
};

const rows = {};
const row = (engine, name, lines) => {
  rows[`${engine}__${name}`] = ['@startuml', ...lines, BODY[engine].body, '@enduml'].join('\n');
};

for (const engine of Object.keys(BODY)) {
  row(engine, 'mode-dark', ['skinparam mode dark']);
  row(engine, 'mode-dark-style', ['skinparam mode dark', '<style>', 'note { FontSize 12 }', '</style>']);
  row(engine, 'mode-mono-style', ['skinparam monochrome true', '<style>', `${BODY[engine].sel} { BackgroundColor #FF0000 }`, '</style>']);
  row(engine, 'mode-monorev', ['skinparam monochrome reverse']);
  row(engine, 'mode-revdark', ['skinparam reversecolor dark']);
  row(engine, 'mode-revrbg', ['skinparam reversecolor RBG']);
  // A key with no value throws `StyleParsingException("parsing")` (StyleParser.java:141); a stray `}` alone parses.
  row(engine, 'malformed-novalue', ['<style>', 'document {', '  BackgroundColor', '}', '}', '</style>']);
  row(engine, 'malformed-straybrace', ['<style>', 'document {', '  BackgroundColor #AAAAAA', '}', '}', '</style>']);
}

// Style value, skinparam key and value per property. The `after` order declares the skinparam after `<style>`.
const PROPS = {
  fontsize: { style: 'FontSize 18', skin: (k) => `skinparam ${k}FontSize 16` },
  thickness: { style: 'LineThickness 3', skin: (k) => `skinparam ${k}BorderThickness 2` },
  roundcorner: { style: 'RoundCorner 20', skin: () => 'skinparam roundCorner 8' },
  shadow: { style: 'Shadowing 4', skin: () => 'skinparam shadowing false' },
};
const CASCADE_ENGINES = ['activity', 'class', 'component', 'sequence', 'state'];

for (const engine of CASCADE_ENGINES) {
  const { sel, key } = BODY[engine];
  // Controls: the scenario with no property, so a property row's own diffs separate from the scenario's.
  const control = ['<style>', 'note { FontSize 12 }', '</style>'];
  row(engine, 'casc-control-plain', control);
  row(engine, 'casc-control-rose', ['skin rose', ...control]);
  row(engine, 'casc-control-theme', ['!theme cerulean', ...control]);
  for (const [prop, p] of Object.entries(PROPS)) {
    const style = ['<style>', `${sel} { ${p.style} }`, 'note { FontSize 12 }', '</style>'];
    row(engine, `casc-${prop}-rose`, ['skin rose', ...style]);
    row(engine, `casc-${prop}-theme`, ['!theme cerulean', ...style]);
    rows[`${engine}__casc-${prop}-after`] = ['@startuml', ...style, BODY[engine].body, p.skin(key), '@enduml'].join(
      '\n',
    );
  }
}

for (const [name, text] of Object.entries(rows)) writeFileSync(join(out, `${name}.puml`), `${text}\n`);
console.log(`rows ${Object.keys(rows).length}`);
