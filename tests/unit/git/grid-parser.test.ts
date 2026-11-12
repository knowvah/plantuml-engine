import { describe, expect, it } from 'vitest';
import { IllegalArgumentException, UnsupportedOperationException } from '../../../src/core/real/AbstractReal.js';
import { CursorPosition, DOWN_RULES } from '../../../src/diagrams/git/CursorPosition.js';
import type { Commit } from '../../../src/diagrams/git/Commit.js';
import { GitTextArea } from '../../../src/diagrams/git/GitTextArea.js';
import { textAreaOf } from './helpers/text-area.js';

/** The first rule of `getDownFromInternal` that holds at (`x`, `y`) of `lines`. */
function firstRule(lines: readonly string[], x: number, y: number): number {
  const cursor = new CursorPosition(textAreaOf(lines), x, y);
  return DOWN_RULES.findIndex((rule) => rule.test(cursor));
}

/** Every commit's name mapped to its parents' names, in candidate order. */
function parents(lines: readonly string[]): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const c of textAreaOf(lines).getAllCommits())
    out[c.getName()] = c.getAncestors().map((a: Commit) => a.getName());
  return out;
}

/**
 * One minimal grid per `CursorPosition.java` rule: the walk starts at (x, y)
 * and the first rule that holds there is the one named, no earlier one.
 */
const RULE_GRIDS: readonly { line: number; lines: string[]; x: number; y: number }[] = [
  { line: 119, lines: ['* a'], x: 0, y: 0 },
  { line: 122, lines: ['_|/'], x: 2, y: 0 },
  { line: 126, lines: ['_|_'], x: 2, y: 0 },
  { line: 130, lines: ['  _', '/'], x: 2, y: 0 },
  { line: 134, lines: ['|', '* a'], x: 0, y: 0 },
  { line: 138, lines: ['|', '|'], x: 0, y: 0 },
  { line: 142, lines: ['| ', ' \\', '  |'], x: 0, y: 0 },
  { line: 146, lines: ['| ', ' \\', '  \\'], x: 0, y: 0 },
  { line: 150, lines: ['  | ', ' / ', '* a'], x: 2, y: 0 },
  { line: 154, lines: ['   | ', '_|/ '], x: 3, y: 0 },
  { line: 158, lines: ['  | ', ' / ', '| '], x: 2, y: 0 },
  { line: 162, lines: ['   | ', '_|/x'], x: 3, y: 0 },
  { line: 166, lines: ['| ', ' \\', ' / '], x: 0, y: 0 },
  { line: 170, lines: ['| ', ' \\', '  * a'], x: 0, y: 0 },
  { line: 174, lines: ['\\ ', ' * a'], x: 0, y: 0 },
  { line: 178, lines: [' \\'], x: 0, y: 0 },
  { line: 182, lines: ['\\ ', '/ '], x: 0, y: 0 },
  { line: 186, lines: ['\\ ', ' \\ '], x: 0, y: 0 },
  { line: 190, lines: ['\\ ', ' |'], x: 0, y: 0 },
  { line: 194, lines: [' / ', '/ '], x: 1, y: 0 },
  { line: 198, lines: ['  / ', '/| '], x: 2, y: 0 },
  { line: 202, lines: [' /', '* a'], x: 1, y: 0 },
  { line: 206, lines: [' /', '|'], x: 1, y: 0 },
];

/*
 * Which rules the rows and planning probes reach (gip T1a, measured 2026-11-11):
 *   juzane-95  119,134,138,202          mebafo-26  119,134,138,150,158,190
 *   lagapi-44  119,134,138,142,150,174,182,198,202,206
 *   figagi-40  every rule but 162 and 178
 *   probes     119,134,138,150,158,174,182,190,198,202 (cov-crossing, cov-dash-merge, cov-octopus, …)
 * 162 and 178 are reached by no row or probe: T3b authors fixtures for them.
 */

describe('CursorPosition#getDownFromInternal rules (CursorPosition.java:117-213)', () => {
  it('lists 23 rules in upstream line order', () => {
    expect(DOWN_RULES.map((r) => r.line)).toEqual(RULE_GRIDS.map((g) => g.line));
  });

  for (const [index, grid] of RULE_GRIDS.entries()) {
    it(`takes rule ${index} (CursorPosition.java:${grid.line}) and no earlier one`, () => {
      expect(DOWN_RULES[index]!.line).toBe(grid.line);
      expect(firstRule(grid.lines, grid.x, grid.y)).toBe(index);
    });
  }

  it('moves by the rule offset: "| " over " \\\\" then "|" lands two right, two down (java:142-145)', () => {
    expect(DOWN_RULES[6]).toMatchObject({ dx: 2, dy: 2 });
    expect(DOWN_RULES[15]).toMatchObject({ dx: 2, dy: 1 });
    expect(DOWN_RULES[12]).toMatchObject({ dx: 1, dy: 2 });
  });

  it('walks a merge leg down to its commit', () => {
    const area = textAreaOf(['| * b', '|/', '* a']);
    const down = new CursorPosition(area, 1, 1).getDownFromHere();
    expect(down.toString()).toBe('(1,3)');
    expect(down.getCommit().getName()).toBe('a');
  });

  it('throws UnsupportedOperationException with the one-based cell when no rule holds (java:210-211)', () => {
    const area = textAreaOf(['* a1 msg', '|', '']);
    const walk = () => new CursorPosition(area, 0, 1).getDownFromHere();
    expect(walk).toThrow(UnsupportedOperationException);
    expect(walk).toThrow('(1,2)');
  });

  it('cov-orphan-pipe: a `|` under the last commit throws from getAncestors', () => {
    const [a1] = textAreaOf(['* a1 msg', '|', '']).getAllCommits();
    expect(() => a1!.getAncestors()).toThrow(UnsupportedOperationException);
  });
});

describe('CursorPosition#matches (CursorPosition.java:63-72)', () => {
  const area = textAreaOf(['ab']);
  it('is false left of the line and past its end, true at the end for an empty prefix', () => {
    expect(new CursorPosition(area, -1, 0).matches('')).toBe(false);
    expect(new CursorPosition(area, 3, 0).matches('')).toBe(false);
    expect(new CursorPosition(area, 2, 0).matches('')).toBe(true);
    expect(new CursorPosition(area, 1, 0).matches('b')).toBe(true);
    expect(new CursorPosition(area, 0, 5).matches('')).toBe(true);
    expect(new CursorPosition(area, 1, 5).matches('')).toBe(false);
  });
});

describe('CursorPosition#getCommitNameInLine (CursorPosition.java:91-103)', () => {
  it.each([
    ['*   0b11a046 Merge pull request #713', '0b11a046'],
    ['| | * 20388a97 stress: added an already supported layout option', '20388a97'],
    ['* **bold** msg', 'bold'],
    ['*-.---.   2d2a6c2 (HEAD -> master) merge', '2d2a6c2'],
    ['* a1', 'a1'],
    ['* a1 b', ' a1'],
  ])('%j names %j', (line, name) => {
    expect(CursorPosition.getCommitNameInLine(line)).toBe(name);
  });

  it('is null with no `*`, and Java-trims only code points up to U+0020', () => {
    expect(CursorPosition.getCommitNameInLine('| |')).toBeNull();
    expect(CursorPosition.getCommitNameInLine('*\t a1\t')).toBe('a1');
  });
});

describe('CursorPosition#getCommentInLine (CursorPosition.java:74-89)', () => {
  const comment = (line: string) => new CursorPosition(textAreaOf([line]), 0, 0).getCommentInLine();
  it('reads the first (…) after the `*`, anywhere on the line', () => {
    expect(comment('* a1 fix (bug) in parser')).toBe('bug');
    expect(comment('* a1 (HEAD -> master, origin/master) b (c)')).toBe('HEAD -> master, origin/master');
    expect(comment('(x) * a1 (y)')).toBe('y');
  });
  it('is the empty string for (), and null when `*`, `(` or `)` is missing', () => {
    expect(comment('* a1 ()')).toBe('');
    expect(comment('* a1 (open')).toBeNull();
    expect(comment('* a1 msg')).toBeNull();
    expect(comment('| (x)')).toBeNull();
  });
});

describe('Commit (Commit.java:42-128)', () => {
  it.each([['*'], ['*a1 msg'], ['*\ta1 msg']])('%j throws IllegalArgumentException (java:52-53)', (line) => {
    expect(() => textAreaOf([line, '* r0 root']).getAllCommits()).toThrow(IllegalArgumentException);
  });

  it('accepts `* ` and `*-`, and keeps the comment', () => {
    const [a, b] = textAreaOf(['* a1 (c1) x', '*-. b2']).getAllCommits();
    expect(a!.getComment()).toBe('c1');
    expect(a!.toString()).toBe('a1');
    expect(b!.getComment()).toBeNull();
  });

  it('juzane-95: each commit has its hand-traced parents', () => {
    expect(
      parents([
        '* a0f65180 (origin/cds/issue700) Layered: Clarified code. #700',
        '* 23a9f435 Layered: Fix wrong hierarchy handling. #700',
        '| * 9037d534 (HEAD -> master, origin/master) Build: Properly sign Maven artifacts. #722',
        '|/  ',
        '* 91fc1c7b Build: Mount Jenkins home. #722',
        '* 4fe6df1e Build: Add HOME env var to maven container. #722',
      ]),
    ).toEqual({
      a0f65180: ['23a9f435'],
      '23a9f435': ['91fc1c7b'],
      '9037d534': ['91fc1c7b'],
      '91fc1c7b': ['4fe6df1e'],
      '4fe6df1e': [],
    });
  });

  // The octopus `*-.---…---.` collects `|` and `\` under the `*`, then `\` under the
  // first `.` and `|` under the last: four candidates, so four parents, in that order.
  // The jar draws 7 edges (14 paths: a dashed curve and an arrow each) = 4 + 1 + 1 + 1.
  it('mebafo-26: the octopus 2d2a6c2 has its parents in candidate order', () => {
    expect(
      parents([
        '*-.---------------.   2d2a6c2 (HEAD -> master) merge',
        '|\\ \\              |  ',
        '| | |             * arnaud',
        '| | * 2300c18 2 ',
        '| * | 7e096cb 1',
        '| |/  ',
        '* | 50aa125 3',
        '|/  ',
        '* a1e94fd root',
      ]),
    ).toEqual({
      '2d2a6c2': ['50aa125', '7e096cb', '2300c18', 'arnaud'],
      arnaud: [],
      '2300c18': ['a1e94fd'],
      '7e096cb': ['a1e94fd'],
      '50aa125': ['a1e94fd'],
      a1e94fd: [],
    });
  });

  it('takes a `*` directly below first, then `|`, `\\`, `/` (java:79-81, 96-106)', () => {
    expect(parents(['* m', '|\\ ', '| * b', '* a'])).toEqual({ m: ['a', 'b'], b: [], a: [] });
    expect(parents(['* c', '* p'])).toEqual({ c: ['p'], p: [] });
  });
});

describe('GitTextArea (GitTextArea.java:44-88)', () => {
  it('returns "" past the last line and skips lines with no `*`', () => {
    const area = new GitTextArea();
    area.add('| x');
    area.add('* a1 m');
    expect(area.getLine(5)).toBe('');
    expect(area.getAllCommits().map((c) => c.getName())).toEqual(['a1']);
    expect(area.getAllCommits()).toBe(area.getAllCommits());
  });
});
