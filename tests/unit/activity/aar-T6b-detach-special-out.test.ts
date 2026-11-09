/**
 * aar-T6b: `detach` between `endwhile` and `end`/`stop` adds no instruction, so the stop is still the while's special out.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ActivityDiagram3.java:177-192,414-419
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/InstructionList.java:169-174
 */
import { describe, it, expect } from 'vitest';
import { parseActivity } from '../../../src/diagrams/activity/parser.js';
import type { ActivityDiagramAST } from '../../../src/diagrams/activity/ast.js';

function parsed(lines: string[]): ActivityDiagramAST {
  const r = parseActivity({ lines, type: 'activity' });
  if ('refused' in r) throw new Error(`refused at ${String(r.line)}: ${r.message}`);
  return r;
}

describe('detach before end after endwhile (botuge-46-jese647)', () => {
  it('end after `detach` is the while`s specialOut', () => {
    const ast = parsed(['while (w)', ':a;', 'endwhile', '->exit;', 'detach', 'end']);
    expect(ast.nodes[0]).toMatchObject({ kind: 'while', specialOut: { kind: 'end' } });
  });
});

describe('stop after endwhile inside an if (nuluji-89-xebu820)', () => {
  it('is an ordinary sibling: current() is the InstructionIf, not an InstructionList', () => {
    const ast = parsed(['if (c) then (yes)', 'while (w)', ':a;', 'endwhile', 'stop', 'endif']);
    const branch = (ast.nodes[0] as Extract<ActivityDiagramAST['nodes'][number], { kind: 'if' }>).thenBranch;
    expect(branch.map((n) => n.kind)).toEqual(['while', 'stop']);
    expect(branch[0]).not.toHaveProperty('specialOut');
  });
});

describe('detach after an if whose branch is already detached (zuseke-31-xepi502)', () => {
  it('does not add a second kill to the branch: [action, detach] stays a single killed action', () => {
    const ast = parsed([
      'if (c) then (yes)',
      'if (d) then (y)',
      'else (n)',
      ':a;',
      'detach',
      'endif',
      'detach',
      'endif',
    ]);
    const outer = ast.nodes[0] as Extract<ActivityDiagramAST['nodes'][number], { kind: 'if' }>;
    const inner = outer.thenBranch[0] as Extract<ActivityDiagramAST['nodes'][number], { kind: 'if' }>;
    expect(inner.elseBranch.map((n) => n.kind)).toEqual(['action', 'detach']);
  });
});
