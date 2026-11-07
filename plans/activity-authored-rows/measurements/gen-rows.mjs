// aar T0: writes the authored activity rows of #121 as `activity__<group>-<case>.puml`.
// Usage: node plans/activity-authored-rows/measurements/gen-rows.mjs <out-dir>
// Then render oracles: scripts/oracle-render.sh <out-dir> <out-dir>/*.puml
// Groups, one per #121 item that has no row in the dss pin yet:
//   `splitnote-*` item 9  (a note after `end split`, InstructionSplit.java:155-158)
//   `mergelabel-*` item 10 (`-> label;` before a merge branch, `end merge`, or a box and note)
//   `long3-*`     item 12 (CommandActivityLong3's leading colour, CommandActivityLong3.java:126)
//   `spot-*`      item 13 (`(X)` for letters outside A, B, E, G, DriverCenteredCharacterSvg.java:72-81)
//   `title-sprite-*` item 14 (a group/partition title that is one SVG sprite, UGraphicCompressOnXorY.java:100-135)
//   `groupin-*`   item 16 (a group whose body starts with an inline colour arrow, FtileGroup.java:124-125)
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = process.argv[2];
if (out === undefined) throw new Error('usage: gen-rows.mjs <out-dir>');
mkdirSync(out, { recursive: true });

const rows = {};
const row = (name, lines) => {
  rows[`activity__${name}`] = ['@startuml', ...lines, '@enduml'].join('\n');
};

// item 9
row('splitnote-floating', ['split', ':a;', 'split again', ':b;', 'end split', 'floating note right: n']);
row('splitnote-attached', ['split', ':a;', 'split again', ':b;', 'end split', 'note right: n']);
row('splitnote-then-box', ['split', ':a;', 'split again', ':b;', 'end split', 'note left: n', ':c;']);

// item 10
row('mergelabel-first', ['fork', '-> hello;', ':a;', 'fork again', ':b;', 'end merge']);
row('mergelabel-end', ['fork', ':a;', 'fork again', ':b;', '-> done;', 'end merge']);
row('mergelabel-both', ['fork', '-> in;', ':a;', '-> out;', 'fork again', ':b;', 'end merge', ':c;']);
row('mergelabel-box-note', [':a;', '-> x;', ':b;', 'note right: n']);
row('mergelabel-box-note-left', [':a;', '-> a longer label;', ':b;', 'note left: n']);
row('mergelabel-split', ['split', '-> s;', ':a;', 'split again', ':b;', '-> t;', 'end split']);
row('mergelabel-fork-end', ['fork', ':a;', '-> done;', 'fork again', ':b;', 'end fork']);

// item 12
row('long3-colour', ['start', '#red:a', 'b;', 'stop']);
row('long3-colour-hex', ['start', '#00FF00:first', 'second;', 'stop']);
row('long3-oneline-colour', ['start', '#red:a;', 'stop']);

// item 13: one spot per row, every letter the jar outline table lacks, plus digits
for (const c of 'CDFHIJKLMNOPQRSTUVWXYZ0123456789') row(`spot-${c}`, [':a;', `(${c})`, 'detach', `(${c})`, ':b;']);
// aar-T5a push-forward: `CommandCircleSpot3.java:61` takes any `\S` and `FtileCircleSpot.java:111` draws it as written,
// so lowercase letters get their own outlines (file names `spot-l<c>`: the fixture dir must not rely on case).
for (const c of 'abcdefghijklmnopqrstuvwxyz') row(`spot-l${c}`, [':a;', `(${c})`, 'detach', `(${c})`, ':b;']);

// item 16
row('groupin-partition', ['start', 'partition P {', '-[#red]->', ':a;', '}', 'stop']);
row('groupin-group', ['start', 'group G', '-[#blue]->', ':a;', 'end group', 'stop']);
row('groupin-merge', ['start', 'partition P {', '-[#red]->', 'fork', ':a;', 'fork again', ':b;', 'end merge', '}', 'stop']);

// aar-T6b: a lone sprite title whose circle sits in the lower right of its viewBox, so compression moves the shape
const SPRITE_DOT = ['sprite dot <svg viewBox="0 0 230 230">', '<circle cx="200" cy="200" r="20" fill="#61dafb"/>', '</svg>', ''];
row('title-sprite-partition', [...SPRITE_DOT, 'partition <$dot{scale=0.5}> {', ':inside;', '}']);
row('title-sprite-group', [...SPRITE_DOT, 'group <$dot{scale=0.5}>', ':inside;', 'end group']);

for (const [name, text] of Object.entries(rows)) writeFileSync(join(out, `${name}.puml`), `${text}\n`);
console.log(`rows ${String(Object.keys(rows).length)}`);
