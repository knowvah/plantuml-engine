/**
 * `CommandBoardPlus`'s regex, `^([+]*)[%s]*([^%s].*)$`, on the line as
 * written (`doTrim = false`), and its `executeArg`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/board/CommandBoardPlus.java
 */
import { describe, expect, it } from 'vitest';
import { applyBoardPlus, BOARD_PLUS_RE } from '../../../src/diagrams/board/command/CommandBoardPlus.js';
import { emptyBoardDiagram } from './helpers/board-diagram.js';

function groups(line: string): [string, string] | null {
  const m = BOARD_PLUS_RE.exec(line);
  return m === null ? null : [m.groups!['PLUS']!, m.groups!['LABEL']!];
}

describe('CommandBoardPlus regex', () => {
  it.each([
    ['World', ['', 'World']],
    ['+Europe', ['+', 'Europe']],
    ['+++  Paris', ['+++', 'Paris']],
    ['+', ['', '+']],
    ['++', ['+', '+']],
    ['  +  B', ['', '+  B']],
    ['\t++C', ['', '++C']],
    ['A trailing space ', ['', 'A trailing space ']],
  ] as const)('splits %j into %j', (line, expected) => {
    expect(groups(line)).toEqual(expected);
  });

  it('matches no blank line, and no line a Java line terminator interrupts', () => {
    // jshell, JDK 21, on the same pattern: `+` NBSP is [|+ NBSP]; U+2028 and U+0085 do not match.
    expect(groups('')).toBeNull();
    expect(groups('   ')).toBeNull();
    expect(groups('+\u00A0')).toEqual(['', '+\u00A0']);
    expect(groups('A\u2028B')).toBeNull();
    expect(groups('A\u0085B')).toBeNull();
  });
});

describe('CommandBoardPlus#executeArg', () => {
  it('hands the plus run and label to addLine and answers ok', () => {
    const diagram = emptyBoardDiagram();
    expect(applyBoardPlus(diagram, BOARD_PLUS_RE.exec('A')!).isOk()).toBe(true);
    expect(applyBoardPlus(diagram, BOARD_PLUS_RE.exec('++B')!).isOk()).toBe(true);
    expect(
      diagram
        .getActivities()[0]!
        .getCells()
        .map((n) => n.toString()),
    ).toEqual(['A(0) [0]', 'B(2) [0]']);
  });
});
