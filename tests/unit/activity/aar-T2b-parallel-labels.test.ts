/**
 * aar-T2b: labels around fork / split / merge, and a note after `end split` (issue #121 items 9, 10).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/InstructionSplit.java:155-158
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/vcompact/AbstractParallelFtilesBuilder.java:89-156
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/vcompact/FtileWithNoteOpale.java:251-253
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

describe('InstructionSplit#addNote', () => {
  it('splitnote-attached: a note after `end split` belongs to the last branch`s last box', () => {
    const ast = parsed(['split', ':a;', 'split again', ':b;', 'end split', 'note right: n']);
    expect(ast.nodes).toHaveLength(1);
    const split = ast.nodes[0] as Extract<ActivityDiagramAST['nodes'][number], { kind: 'split' }>;
    expect(split.branches[1]!.map((n) => n.kind)).toEqual(['action', 'note']);
  });
});

describe('getSuppSpace1/2 and getSuppForIncomingArrow', () => {
  it('mergelabel-split: the branch in/out labels add height (jar 131 px)', () => {
    const svg = render('@startuml\nsplit\n-> s;\n:a;\nsplit again\n:b;\n-> t;\nend split\n@enduml');
    expect(svg).toMatch(/height="131(px)?"/);
  });

  it('mergelabel-end: a label before `end merge` widens its branch (jar diamond at 74.244)', () => {
    const svg = render('@startuml\nfork\n:a;\nfork again\n:b;\n-> done;\nend merge\n@enduml');
    expect(svg).toContain('points="74.244,');
  });
});

describe('FtileWithNoteOpale#getInLinkRendering', () => {
  it('mergelabel-box-note: the arrow into a noted box keeps its label gap (jar box y 87.444)', () => {
    const svg = render('@startuml\n:a;\n-> x;\n:b;\nnote right: n\n@enduml');
    expect(svg).toMatch(/<rect[^>]* y="87\.444"/);
  });
});
