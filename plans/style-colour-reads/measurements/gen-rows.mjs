// scr T0: writes the authored rows of #122 as `<engine>__<group>-<case>.puml`.
// Usage: node plans/style-colour-reads/measurements/gen-rows.mjs <out-dir>
// Then render oracles: scripts/oracle-render.sh <out-dir> <out-dir>/*.puml
// Groups (decisions.md D1): `kgn-*` kermor group note (#122 item 17), `head-*` arrow HeadColor (item 19),
// `noteskin-*` and `deffont` skinparam note colours (item 20), `nested-*` (item 20b, a guard), `stereo-*` map/object
// stereotype offset (item 22), `hex-*`, `ctitle-*`, `stlabel-*`, `parse-*`, `transparent-font*` (the open notes in
// `.agent-notes/dss-T3a.md`, `dss-T3b.md`, `dss-T3d.md`).
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = process.argv[2];
mkdirSync(out, { recursive: true });
const rows = {};
const row = (name, lines) => {
  rows[name] = ['@startuml', ...lines, '@enduml'].join('\n');
};
const style = (...l) => ['<style>', ...l, '</style>'];

// 17: kermor group note (Cluster#getCucaNote -> EntityImageNoteLink, NOTE = {root,element,sequenceDiagram,note}).
const KGN = ['!pragma kermor on', 'component C {', '  [x]', '}', 'note top of C : n'];
row('component__kgn-plain', KGN);
row('component__kgn-style-note', [...style('note { BackgroundColor #AAAAAA', 'LineColor #FF0000', 'FontColor #0000FF }'), ...KGN]);
row('component__kgn-style-comp', [...style('componentDiagram { note { BackgroundColor #AAAAAA } }'), ...KGN]);
row('component__kgn-style-seq', [...style('sequenceDiagram { note { BackgroundColor #AAAAAA } }'), ...KGN]);
row('component__kgn-skinparam', ['skinparam noteBackgroundColor #BBBBBB', 'skinparam noteBorderColor #FF0000', ...KGN]);
row('component__kgn-bottom-colour', ['!pragma kermor on', 'component C {', '  [x]', '}', 'note bottom of C #pink : n']);

// 19: HeadColor (Rainbow.build(style), Rainbow.java:84-94) in each engine with arrows.
const ARROWS = {
  activity: ['start', ':a;', ':b;', 'stop'],
  state: ['[*] --> S', 'S --> T'],
  class: ['A --> B'],
  component: ['[A] --> [B]'],
  usecase: ['actor U', 'U --> (x)'],
  sequence: ['A -> B'],
};
for (const [e, body] of Object.entries(ARROWS)) {
  row(`${e}__head-element`, [...style('element { HeadColor #FF0000 }'), ...body]);
  row(`${e}__head-arrow`, [...style('arrow { HeadColor #FF0000 }'), ...body]);
  row(`${e}__head-skinparam`, ['skinparam ArrowHeadColor #FF0000', ...body]);
}

// 20a: skinparam note colours with no <style>, every engine with notes.
const NOTES = {
  class: ['class A', 'note left of A : n'],
  object: ['object O', 'note left of O : n'],
  component: ['[C]', 'note left of C : n'],
  usecase: ['actor U', 'U --> (x)', 'note left of U : n'],
  state: ['state S', 'note left of S : n'],
  activity: ['start', ':a;', 'note right: n', 'stop'],
  sequence: ['A -> B', 'note left: n'],
};
for (const [e, body] of Object.entries(NOTES)) {
  row(`${e}__noteskin-bg`, ['skinparam noteBackgroundColor #BBBBBB', ...body]);
  row(`${e}__noteskin-border`, ['skinparam noteBorderColor #FF0000', ...body]);
  row(`${e}__noteskin-font`, ['skinparam noteFontColor #0000FF', ...body]);
  row(`${e}__deffont`, ['skinparam defaultFontColor #00AA00', ...body]);
}
// 20b: nested class diagram with a note.
row('class__nested-classnote', ['class A {', '  {{', '    class B', '    note left of B : n', '  }}', '}']);
row('class__nested-classonly', ['class A {', '  {{', '    class B', '  }}', '}']);

// 22: map/object stereotype y offset.
row('object__stereo-object', ['object O <<s>>']);
row('object__stereo-map', ['map M <<s>> {', '  k => v', '}']);
row('object__stereo-json', ['json J <<s>> {', '  "k": "v"', '}']);

// dss-T3a: hexagon colour before a quoted name; cluster title style.
row('component__hex-colour-quoted', ['hexagon #pink "Very long"']);
row('component__hex-colour-as', ['hexagon #pink "Very long" as H']);
row('component__hex-colour-after', ['hexagon "Very long" as H #pink']);
row('component__ctitle-style', [...style('title { FontColor #FF0000 }'), 'package P {', '  [a]', '}', 'rectangle R {', '  [b]', '}']);
row('component__ctitle-package', [...style('package { title { FontColor #FF0000 } }'), 'package P {', '  [a]', '}']);
row('component__ctitle-rect', [...style('rectangle { title { FontColor #FF0000 } }'), 'rectangle R {', '  [b]', '}']);
row('class__ctitle-package', [...style('package { title { FontColor #FF0000 } }'), 'package P {', '  class A', '}']);

// dss-T3b: stereotype label colour (legacy FontParam chain).
for (const [e, body] of Object.entries({ class: ['class A <<s>>'], object: ['object O <<s>>'], component: ['[C] <<s>>'], usecase: ['actor U <<s>>', 'U --> (x)'], state: ['state S <<s>>'] })) {
  row(`${e}__stlabel-root`, [...style('root { FontColor #FF0000 }'), ...body]);
  row(`${e}__stlabel-deffont`, ['skinparam defaultFontColor #00AA00', ...body]);
  row(`${e}__stlabel-skin`, [`skinparam ${e}StereotypeFontColor #0000FF`, ...body]);
}

// dss-T3d: parser gaps and FontColor transparent.
row('activity__parse-note-stereo', ['start', ':a;', 'note left <<foo>> : n', 'stop']);
row('activity__parse-fork-colour', ['start', 'fork <<#red>>', ':a;', 'fork again', ':b;', 'end fork', 'stop']);
for (const [e, body] of Object.entries(NOTES)) row(`${e}__transparent-font`, [...style('element { FontColor transparent }'), ...body]);


// Branch variants (planning pass 2).
row('state__head-inline', [...style('arrow { HeadColor #FF0000 }'), 'state S', 'S -[#0000FF]-> T']);
row('state__head-transparent', [...style('arrow { HeadColor transparent }'), 'state S', 'S --> T']);
row('state__head-diagram', [...style('stateDiagram { arrow { HeadColor #FF0000 } }'), 'state S', 'S --> T']);
row('class__head-inline', [...style('arrow { HeadColor #FF0000 }'), 'A -[#0000FF]-> B']);
row('component__head-transparent', [...style('arrow { HeadColor transparent }'), '[A] --> [B]']);
row('state__noteskin-bg-link', ['skinparam noteBackgroundColor #BBBBBB', 'state S', 'S --> T', 'note on link', '  n', 'end note']);
row('state__noteskin-bg-floating', ['skinparam noteBackgroundColor #BBBBBB', 'state S', 'note "n" as N']);
row('state__noteskin-bg-style', ['skinparam noteBackgroundColor #BBBBBB', ...style('stateDiagram { note { FontColor #0000FF } }'), 'state S', 'note left of S : n']);
row('sequence__transparent-font-note', [...style('note { FontColor transparent }'), 'A -> B', 'note left: n']);
row('sequence__transparent-font-participant', [...style('participant { FontColor transparent }'), 'A -> B']);
row('sequence__transparent-font-arrow', [...style('arrow { FontColor transparent }'), 'A -> B : m']);
row('component__kgn-stereo-style', [...style('sequenceDiagram { note { BackgroundColor #AAAAAA } }', '.s { BackgroundColor #FF0000 }'), '!pragma kermor on', 'component C <<s>> {', '  [x]', '}', 'note top of C : n']);

for (const [name, text] of Object.entries(rows)) writeFileSync(join(out, `${name}.puml`), `${text}\n`);
console.log(Object.keys(rows).length);
