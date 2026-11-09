/**
 * aar-T3a: which edge a `-[#c]->` colours.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ActivityDiagram3.java:442-454
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/command/CommandElseIf2.java:70-97
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/vcompact/FtileIfLongHorizontal.java:206-255
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/vcompact/FtileFactoryDelegatorSwitch.java:116-124
 */
import { describe, it, expect } from 'vitest';
import { parseActivity } from '../../../src/diagrams/activity/parser.js';
import type { ActivityDiagramAST } from '../../../src/diagrams/activity/ast.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderFixtureActivity } from '../../oracle/svg-conformance/render-fixture-activity.js';

function parsed(lines: string[]): ActivityDiagramAST {
  const r = parseActivity({ lines, type: 'activity' });
  if ('refused' in r) throw new Error(`refused at ${String(r.line)}: ${r.message}`);
  return r;
}

const render = (src: string): string => renderFixtureActivity(src, new DeterministicMeasurer());

describe('elseif / else parens', () => {
  it('takupu-75: the arrow leaf is stripped from the label and kept as the colour', () => {
    const ast = parsed([
      'if (A) then (yes)',
      ':AA;',
      '(-[#blue]->inc) elseif (B) then (-[#green,dashed]->out)',
      ':BB;',
      'else (-[#red,dashed]->no)',
      ':EE;',
      'endif',
    ]);
    expect(ast.nodes[0]).toMatchObject({
      kind: 'if',
      elseLabel: 'no',
      elseLabelColor: '#red,dashed',
      elseIfBranches: [{ incomingLabel: 'inc', incomingColor: '#blue', label: 'out', labelColor: '#green,dashed' }],
    });
  });
});

describe('setNextLink', () => {
  it('kixuja-22: a coloured arrow after endif is the closed if`s outColor', () => {
    const ast = parsed(['if (a) then', ':x;', 'elseif (b) then', ':y;', 'endif', '-[#red]->;', 'stop']);
    expect(ast.nodes[0]).toMatchObject({ kind: 'if', outColor: '#red' });
  });
});

describe('switch', () => {
  it('gopori-87: a case`s own -[#c]-> never colours its exit', () => {
    const svg = render(
      '@startuml\nstart\nswitch (t)\ncase (A)\n:Text 1;\n-[#red]->\ncase (C)\n:Text C;\nendswitch\nstop\n@enduml',
    );
    expect(svg).not.toContain('#F00');
  });
});
