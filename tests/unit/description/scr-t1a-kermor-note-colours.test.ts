/**
 * scr-T1a -- the `!pragma kermor on` group note is an `EntityImageNoteLink` built from the note's own `Colors`
 * (`Cluster.java:393-399`), signed `ComponentType.NOTE` = `{root, element, sequenceDiagram, note}`
 * (`EntityImageNoteLink.java:61-65`, `ComponentType.java:98-99`). Expected fills are the jar's, from the
 * `component__kgn-*` oracles in `tests/fixtures/diagram-style-scope/`.
 */
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { defaultTheme } from '../../../src/core/theme.js';
import { astOrThrow } from '../../helpers/parse-ast.js';
import { parseDescription } from '../../../src/diagrams/description/parser.js';
import { layoutDescription } from '../../../src/diagrams/description/layout.js';

const DIR = 'tests/fixtures/diagram-style-scope';
const NOTE_FILL = /<path d="M\d+,\d+ L[^"]*" style="stroke:#181818;stroke-width:0\.5;" fill="(#[0-9A-F]+)"\/>/;

function noteFill(row: string): string | undefined {
  const src = readFileSync(`${DIR}/${row}.puml`, 'utf8');
  return NOTE_FILL.exec(renderSync(src, { measurer: new DeterministicMeasurer() }))?.[1];
}

describe('kermor group note colours (ComponentType.NOTE + the note Colors)', () => {
  it.each([
    ['component__kgn-style-comp', '#FEFFDD'],
    ['component__kgn-style-seq', '#AAA'],
    ['component__kgn-stereo-style', '#AAA'],
    ['component__kgn-bottom-colour', '#FFC0CB'],
  ])('%s fills the note %s', (row, fill) => {
    expect(noteFill(row)).toBe(fill);
  });
});

describe('kermor group note colour slot', () => {
  function bottomNote(lines: string): { text?: string; color?: string } | undefined {
    const ast = astOrThrow(parseDescription({ lines: lines.split('\n'), type: 'description' }), 'description');
    const geo = layoutDescription(ast, defaultTheme, new DeterministicMeasurer());
    return geo.nodes.find((n) => n.id === 'C')?.kermorNotes?.bottom;
  }
  const HEAD = '!pragma kermor on\ncomponent C {\n  [x]\n}';

  it('carries the note #colour onto the geo note', () => {
    expect(bottomNote(`${HEAD}\nnote bottom of C #pink : n`)).toEqual(expect.objectContaining({ color: '#pink' }));
  });

  it('keeps the first note and its colours: getNotes(position).get(0) (Cluster.java:394-397)', () => {
    const note = bottomNote(`${HEAD}\nnote bottom of C : first\nnote bottom of C #pink : second`);
    expect(note?.text).toBe('first');
    expect(note?.color).toBeUndefined();
  });
});
