/**
 * aar-T2a: `-> label;` around while / repeat / backward, values from the jar's own SVGs.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ActivityDiagram3.java:403-405,445-467
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/InstructionRepeat.java:163-204
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/vcompact/FtileWhile.java:147,585
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/vcompact/FtileFactoryDelegatorAssembly.java:80-93
 */
import { describe, it, expect } from 'vitest';
import { parseActivity } from '../../../src/diagrams/activity/parser.js';
import type { ActivityDiagramAST } from '../../../src/diagrams/activity/ast.js';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderFixtureActivity } from '../../oracle/svg-conformance/render-fixture-activity.js';

function parsed(lines: string[]): ActivityDiagramAST {
  const r = parseActivity({ lines, type: 'activity' });
  if ('refused' in r) throw new Error(`refused at ${String(r.line)}: ${r.message}`);
  return r;
}

/** Every `<text>` of a rendered source, in document order. */
function texts(source: string): string[] {
  return [...renderSync(source).matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]!);
}

describe('while', () => {
  it('bunefa-86: the arrow pending at endwhile is drawn on the loop-back edge (back1)', () => {
    expect(texts('@startuml\nwhile (test)\n:task;\n->label;\nendwhile\n@enduml')).toContain('label');
  });

  it('tisese-63: `-> true;` before the first instruction overwrites the yes label, its colour stays', () => {
    const ast = parsed(['while (w)', '-[#LightGreen]-> true;', ':action;', 'endwhile']);
    expect(ast.nodes[0]).toMatchObject({ kind: 'while', yesLabel: 'true' });
    const w = ast.nodes[0] as Extract<ActivityDiagramAST['nodes'][number], { kind: 'while' }>;
    expect(w.body[0]).toMatchObject({ kind: 'arrow-label', label: '', style: '#LightGreen' });
  });

  it('a coloured arrow after endwhile is the closed while`s outColor', () => {
    const ast = parsed(['while (w)', ':a;', 'endwhile', '-[#Grey]-> false;', 'stop']);
    expect(ast.nodes[0]).toMatchObject({ kind: 'while', outColor: '#Grey', specialOut: { kind: 'stop' } });
  });

  it('mojacu-63: `stop` after `endwhile` and an arrow is still the special out', () => {
    const ast = parsed(['while (w)', ':foo1;', 'endwhile ([done])', '-> found;', 'stop']);
    expect(ast.nodes[0]).toMatchObject({ kind: 'while', specialOut: { kind: 'stop' } });
    expect(ast.nodes[1]).toMatchObject({ kind: 'arrow-label', label: 'found' });
  });
});

describe('repeat', () => {
  it('linene-56: `repeat while (...) -> label` is the back link, label greedy to the end', () => {
    const ast = parsed(['repeat', ':a;', 'repeat while (Valid?) is (No) not (Yes) -> back to foo']);
    expect(ast.nodes[0]).toMatchObject({ kind: 'repeat', condition: 'Valid?', backLink: { label: 'back to foo' } });
  });

  it('kuxigo-12: `-[#black]-> yes` carries the colour', () => {
    const ast = parsed(['repeat', ':a;', 'repeat while (c) is (yes) -[#black]-> yes']);
    expect(ast.nodes[0]).toMatchObject({ backLink: { label: 'yes', color: '#black' } });
  });

  it('loriki-95: a repeat never closed draws its in label and the pending link on the back edge', () => {
    const ast = parsed(['repeat :Text 1;', '-> visible;', ':Text 2;', '-> not visible;']);
    expect(ast.nodes[0]).toMatchObject({ kind: 'repeat', unclosed: true });
    expect(texts('@startuml\nrepeat :Text 1;\n-> visible;\n:Text 2;\n-> not visible;\n@enduml')).toEqual([
      'Text 2',
      'Text 1',
      'visible',
      'not visible',
    ]);
  });
});

describe('backward', () => {
  it('cajore-10 / vujufe-00: the arrow inside `( )` is no part of the label; its style is the colour', () => {
    const ast = parsed(['repeat', ':a;', '(-[#blue]->inc) backward:B; (-[#green,dashed]->out)', 'repeat while (c)']);
    const r = ast.nodes[0] as Extract<ActivityDiagramAST['nodes'][number], { kind: 'repeat' }>;
    expect(r.body[1]).toMatchObject({
      kind: 'backward',
      incoming: 'inc',
      outgoing: 'out',
      incomingColor: '#blue',
      outgoingColor: '#green,dashed',
    });
  });
});

describe('FtileMargedRight', () => {
  it('ximelo-07: a labelled arrow widens its sequence to the label`s right edge (jar 142 px)', () => {
    const svg = renderFixtureActivity(
      '@startuml\nstart\nrepeat\n:taskA;\n-> dataaaa;\nif (check) is (OK) then\nbreak;\nelse (NG)\nendif\n' +
        'repeat while (retry?) is (true) not (false)\nstop\n@enduml',
      new DeterministicMeasurer(),
    );
    expect(svg).toMatch(/<line x1="107\.106" y1="67" x2="107\.106" y2="269\.444"/);
  });
});
