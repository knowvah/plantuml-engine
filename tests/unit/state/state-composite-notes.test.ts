/**
 * dss T3c (D7): the composite pipeline lays a top-level note out as a DOT node
 * (`state-composite-pass-edges.ts#addScopeNotes`) and must also materialise it
 * (`StateNodeGeo.kind === 'note'`), as the flat pipeline does
 * (`layout.ts#buildFlatStateGeos`). Oracle: row `state__cascade-none`, whose jar
 * SVG draws the note (`ent0012`) in creation order after the composite.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/GeneralImageBuilder.java:118-119
 */
import { describe, it, expect } from 'vitest';
import { statePlugin } from '../../../src/diagrams/state/index.js';
import { layoutState } from '../../../src/diagrams/state/layout.js';
import { parseAst } from '../../helpers/parse-ast.js';
import { defaultTheme } from '../../../src/core/theme.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

function geoOf(source: string) {
  const lines = source.split('\n').filter((l) => l.trim().length > 0);
  const ast = parseAst(statePlugin, { lines, type: 'state' });
  return layoutState(ast, defaultTheme, new DeterministicMeasurer());
}

describe('composite pipeline top-level notes', () => {
  it('materialises an attached note beside a composite, in creation order', () => {
    const geo = geoOf(
      [
        '[*] --> A',
        'state A {',
        '  [*] --> B',
        '}',
        'A --> [*] : l',
        'state C <<choice>>',
        'A --> C',
        'note left of A : n',
      ].join('\n'),
    );
    const note = geo.states.filter((s) => s.kind === 'note');
    expect(note).toHaveLength(1);
    expect(note[0]!.noteOpale?.direction).toBe('right');
    expect(note[0]!.noteLines).toHaveLength(1);
    // the note is the last-created entity: it sorts after every non-note geo
    expect(geo.states.at(-1)!.kind).toBe('note');
  });

  it('keeps the note inside the document ink, so the canvas holds it', () => {
    const withNote = geoOf(['state A {', '  [*] --> B', '}', 'note left of A : n'].join('\n'));
    const without = geoOf(['state A {', '  [*] --> B', '}'].join('\n'));
    expect(withNote.totalWidth).toBeGreaterThan(without.totalWidth);
  });
});
