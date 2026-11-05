/**
 * `BoardDiagramFactory` and `CommandBoardPlus`: what each line does to the
 * diagram, and which lines the jar refuses.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/board/BoardDiagramFactory.java
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/board/CommandBoardPlus.java
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { ParseRefusal } from '../../../src/core/parse-refusal.js';
import { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';
import type { BoardDiagram } from '../../../src/diagrams/board/BoardDiagram.js';
import { parseBoard } from '../../../src/diagrams/board/BoardDiagramFactory.js';
import { BOARD_CACHE, cardOrigins } from './helpers/board-diagram.js';

function parse(...lines: string[]): BoardDiagram | ParseRefusal {
  return parseBoard({ lines, type: 'board' }, new PreprocessingArtifact());
}

function parsed(...lines: string[]): BoardDiagram {
  const result = parse(...lines);
  if ('refused' in result) throw new Error(`refused line ${String(result.line)}: ${result.message}`);
  return result;
}

function names(diagram: BoardDiagram): string[][] {
  return diagram.getActivities().map((a) => a.getCells().map((n) => n.getName()));
}

describe('BoardDiagramFactory', () => {
  it.each(['gasaxu-65-cipo396', 'jifeju-37-zeza533', 'nuropa-85-vili653', 'rebire-77-depi269'])(
    "parses %s to the jar's card count: one header and every cell per activity",
    (slug) => {
      const lines = readFileSync(`${BOARD_CACHE}/${slug}/in.puml`, 'utf8').split('\n');
      const diagram = parsed(...lines);
      const cards = diagram.getActivities().reduce((sum, a) => sum + 1 + a.getCells().length, 0);
      expect(cards).toBe(cardOrigins(readFileSync(`${BOARD_CACHE}/${slug}/in.svg`, 'utf8')).length);
    },
  );

  it('reads a lone + as an activity labelled + (cov-grid-plus-alone)', () => {
    // `([+]*)` gives back the `+` so that `([^%s].*)` can match it.
    expect(names(parsed('A', '+'))).toEqual([['A'], ['+']]);
  });

  it('matches the untrimmed line, as doTrim = false does (cov-grid-whitespace)', () => {
    // The jar draws three activities: `A`, `+  B` and `++C`.
    expect(names(parsed('  A', '  +  B', '\t++C'))).toEqual([['A'], ['+  B'], ['++C']]);
  });

  it('strips the spaces between the plus run and the label', () => {
    expect(names(parsed('A', '+   B'))).toEqual([['A', 'B']]);
  });

  it('throws on a release before any activity, so the render is an error page (cov-grid-plus-first)', () => {
    expect(() => parse('+B', 'A')).toThrow('IndexOutOfBoundsException');
  });

  it('lets the common commands consume title, scale and blank lines first', () => {
    const diagram = parsed('title My board', 'scale 2', '', 'A', '+B');
    expect(names(diagram)).toEqual([['A', 'B']]);
    expect(diagram.scale).toBeDefined();
    expect(diagram.annotations.title).toBeDefined();
  });

  it("refuses a line Java's `.` cannot cross, at its line number", () => {
    const result = parse('A', 'B\u0085C');
    expect(result).toMatchObject({ refused: true, line: 1, message: 'Syntax Error?' });
  });

  it('skips the @startboard/@endboard lines of a hand-built source', () => {
    expect(names(parsed('@startboard', 'A', '@endboard'))).toEqual([['A']]);
  });
});

describe('BoardDiagramFactory common commands', () => {
  it('consumes minwidth and a positive page, as CommandMinwidth and CommandPage do', () => {
    expect(names(parsed('minwidth 10', 'page 2x3', 'A'))).toEqual([['A']]);
  });

  it('refuses page 0x1 with the command error, at its line', () => {
    expect(parse('A', 'page 0x1')).toMatchObject({ refused: true, line: 1, message: 'Argument must be positive' });
  });

  it('crashes on a minwidth past Integer.MAX_VALUE, as Integer.parseInt throws', () => {
    expect(() => parse('minwidth 99999999999', 'A')).toThrow('NumberFormatException');
  });
});

describe('BoardDiagramFactory style dispatch', () => {
  it('a style syntax error refuses with its message, at line 0', () => {
    const result = parseBoard(
      { lines: ['A'], type: 'board', styleSource: { skinparam: new Map(), styles: ['node { { }'] } },
      new PreprocessingArtifact(),
    );
    expect(result).toMatchObject({ refused: true, kind: 'execution', line: 0 });
    expect('refused' in result && result.message.startsWith('Error in style definition: ')).toBe(true);
  });

  it('names the document line of a refusal through linePositions', () => {
    const result = parseBoard(
      { lines: ['A', 'B\u0085C'], type: 'board', linePositions: [4, 7] },
      new PreprocessingArtifact(),
    );
    expect(result).toMatchObject({ refused: true, line: 7 });
  });

  it('adds the skinparam deprecation warnings', () => {
    const result = parseBoard(
      { lines: ['A'], type: 'board', styleSource: { skinparam: new Map([['handwritten', 'true']]), styles: [] } },
      new PreprocessingArtifact(),
    );
    if ('refused' in result) throw new Error(result.message);
    expect(result.getWarnings()).toHaveLength(1);
  });
});
