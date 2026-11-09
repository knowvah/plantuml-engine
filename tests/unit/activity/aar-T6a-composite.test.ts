/**
 * aar-T6a: the composite rows' separate mechanisms.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/vcompact/ParallelBuilderSplit.java:114-125
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/command/CommandElseIf3.java:64-104
 */
import { describe, it, expect } from 'vitest';
import { parseActivity } from '../../../src/diagrams/activity/parser.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderFixtureActivity } from '../../oracle/svg-conformance/render-fixture-activity.js';

const render = (src: string): string => renderFixtureActivity(src, new DeterministicMeasurer());

describe('getThin1Color', () => {
  it('tovuka-43: every branch hidden draws the split line unstroked', () => {
    const svg = render('@startuml\nsplit\n-[hidden]->\n:A;\nsplit again\n-[hidden]->\n:B;\nend split\n:D;\n@enduml');
    expect(svg).toMatch(/<line [^>]*stroke="none"/);
  });
});

describe('transparent arrow colour', () => {
  it('nevavo-98: -[#00000000]-> is written stroke none', () => {
    const svg = render('@startuml\n:a;\n-[#00000000]-> t;\n:b;\n@enduml');
    expect(svg).toMatch(/<line [^>]*stroke="none"/);
  });
});

describe('CommandElseIf3', () => {
  it('cidibe-55: `elseif (a) equals (2) then` is condition `a`, label `2`', () => {
    const r = parseActivity({
      lines: ['if (a) equals (1) then', ':x;', 'elseif (a) equals (2) then', ':y;', 'endif'],
      type: 'activity',
    });
    if ('refused' in r) throw new Error('refused');
    expect(r.nodes[0]).toMatchObject({ kind: 'if', elseIfBranches: [{ condition: 'a', label: '2' }] });
  });
});

describe('Stereogroup#getInnerColors `#back;line:c`', () => {
  it('tusaxu-17: `start <<#green;line:red>>` fills green and strokes red', () => {
    const svg = render('@startuml\nstart <<#green;line:red>>\n:foo;\n@enduml');
    expect(svg).toMatch(/<ellipse[^>]* fill="#008000"[^>]*stroke:#F00|<ellipse[^>]* fill="#008000" stroke="#F00"/);
  });
});
