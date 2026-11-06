/** Annotation commands reach `BoardDiagram#annotations`, not the activities. */
import { describe, expect, it } from 'vitest';
import { isEmpty } from '../../../src/core/annotations/index.js';
import { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';
import type { BoardDiagram } from '../../../src/diagrams/board/BoardDiagram.js';
import { parseBoard } from '../../../src/diagrams/board/BoardDiagramFactory.js';

function parseOk(lines: string[]): BoardDiagram {
  const parsed = parseBoard({ lines, type: 'board' }, new PreprocessingArtifact());
  if ('refused' in parsed) throw new Error(`refused at line ${String(parsed.line)}: ${parsed.message}`);
  return parsed;
}

function names(diagram: BoardDiagram): string[][] {
  return diagram.getActivities().map((a) => a.getCells().map((n) => n.getName()));
}

describe('parseBoard — annotation commands', () => {
  it('single-line `title X` populates annotations.title, not an activity', () => {
    const diagram = parseOk(['title My Board', 'World']);
    expect(diagram.annotations.title.display).toEqual(['My Board']);
    expect(names(diagram)).toEqual([['World']]);
  });

  it('multi-line `legend ... end legend` populates annotations.legend, not an activity', () => {
    const diagram = parseOk(['World', 'legend', 'a legend line', 'end legend']);
    expect(diagram.annotations.legend.display).toEqual(['a legend line']);
    expect(names(diagram)).toEqual([['World']]);
  });

  it('an annotation-free source leaves the annotations empty', () => {
    const diagram = parseOk(['World', '+Europe', '++France']);
    expect(isEmpty(diagram.annotations)).toBe(true);
    expect(names(diagram)).toEqual([['World', 'Europe', 'France']]);
  });
});
