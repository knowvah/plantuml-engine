import { javaTrim } from '../../core/java-number-format.js';
import { UnsupportedOperationException } from '../../core/real/AbstractReal.js';
import { Commit } from './Commit.js';
import type { GitTextArea } from './GitTextArea.js';

/** `replaceAll("[-.*|/\\\\]", "")`: every `-`, `.`, `*`, `|`, `/` and `\`. @see CursorPosition.java:96 */
const GRID_CHARS = /[-.*|/\\]/g;

/**
 * One rule of `getDownFromInternal`'s loop: when `test` holds, the walk moves by
 * (`dx`, `dy`) and loops. The first rule (`matches("* ")`) has no move: it stops.
 */
export interface DownRule {
  /** The `CursorPosition.java` line of the rule's `if`. */
  readonly line: number;
  readonly test: (current: CursorPosition) => boolean;
  readonly dx: number;
  readonly dy: number;
}

/** A rule whose `if` is `current.matches(a) && current.move(dx, dy).matches(b)`, moving to that same cell. */
function nextTo(line: number, a: string, dx: number, dy: number, b: string): DownRule {
  return { line, test: (c) => c.matches(a) && c.move(dx, dy).matches(b), dx, dy };
}

/** A neighbour cell, (`dx`, `dy`) from the cursor, and the prefix it must match. */
type Cell = readonly [number, number, string];

/** A rule with a third cell, `current.move(0, 1).matches(b)` or `current.move(-1, 1)…`, then the move target. */
function threeCell(line: number, a: string, b: Cell, to: Cell): DownRule {
  const [bx, by, bs] = b;
  const [dx, dy, c] = to;
  return {
    line,
    test: (cur) => cur.matches(a) && cur.move(bx, by).matches(bs) && cur.move(dx, dy).matches(c),
    dx,
    dy,
  };
}

/**
 * `getDownFromInternal`'s 23 rules, first match wins, in upstream order (gip D11).
 * Several overlap — `"| "` over `" \\"` is tested four times with different third
 * cells — so the order is behaviour, not style.
 * @see CursorPosition.java:117-213
 */
export const DOWN_RULES: readonly DownRule[] = [
  { line: 119, test: (c) => c.matches('* '), dx: 0, dy: 0 },
  nextTo(122, '/', -2, 0, '_|/'),
  nextTo(126, '_', -2, 0, '_|_'),
  nextTo(130, '_', -2, 1, '/'),
  nextTo(134, '|', 0, 1, '* '),
  nextTo(138, '|', 0, 1, '|'),
  threeCell(142, '| ', [0, 1, ' \\'], [2, 2, '|']),
  threeCell(146, '| ', [0, 1, ' \\'], [2, 2, '\\']),
  threeCell(150, '| ', [-1, 1, '/ '], [-2, 2, '* ']),
  nextTo(154, '| ', -3, 1, '_|/ '),
  threeCell(158, '| ', [-1, 1, '/ '], [-2, 2, '| ']),
  nextTo(162, '| ', -3, 1, '_|/'),
  threeCell(166, '| ', [0, 1, ' \\'], [1, 2, '/ ']),
  threeCell(170, '| ', [0, 1, ' \\'], [2, 2, '* ']),
  nextTo(174, '\\ ', 1, 1, '* '),
  { line: 178, test: (c) => c.matches(' \\'), dx: 2, dy: 1 },
  nextTo(182, '\\ ', 0, 1, '/ '),
  nextTo(186, '\\ ', 1, 1, '\\ '),
  nextTo(190, '\\ ', 1, 1, '|'),
  nextTo(194, '/ ', -1, 1, '/ '),
  nextTo(198, '/ ', -2, 1, '/| '),
  nextTo(202, '/', -1, 1, '* '),
  nextTo(206, '/', -1, 1, '|'),
];

/** The index in `DOWN_RULES` of the stopping rule, `matches("* ")`. @see CursorPosition.java:119-120 */
const STOP_RULE = 0;

/**
 * CursorPosition — a cell of the `GitTextArea` grid, and the walk from a
 * graph character down to the commit it leads to.
 *
 * Not ported (gip D1): the `System.err.println` before the walk's throw
 * (`CursorPosition.java:210`) — `src/` has no console in rendering paths.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/gitlog/CursorPosition.java:38-215
 */
export class CursorPosition {
  /** @see CursorPosition.java:40-42 */
  private readonly x: number;
  private readonly y: number;
  private readonly source: GitTextArea;

  /** @see CursorPosition.java:44-48 */
  constructor(source: GitTextArea, x: number, y: number) {
    this.source = source;
    this.x = x;
    this.y = y;
  }

  /** @see CursorPosition.java:50-52 */
  private getCurrentLine(): string {
    return this.source.getLine(this.y);
  }

  /** One-based `(x,y)`. @see CursorPosition.java:54-57 */
  toString(): string {
    return `(${this.x + 1},${this.y + 1})`;
  }

  /** @see CursorPosition.java:59-61 */
  move(dx: number, dy: number): CursorPosition {
    return new CursorPosition(this.source, this.x + dx, this.y + dy);
  }

  /**
   * Both guards stay (gip D5): Java's `substring(x)` throws past the end, JS
   * `startsWith(prefix, x)` would clamp a negative `x` to 0.
   * @see CursorPosition.java:63-72
   */
  matches(prefix: string): boolean {
    if (this.x < 0) return false;
    const line = this.getCurrentLine();
    if (this.x > line.length) return false;
    return line.startsWith(prefix, this.x);
  }

  /**
   * The text between the first `(` after the line's first `*` and the next `)`,
   * wherever the cursor sits; `null` when any of the three is missing.
   * @see CursorPosition.java:74-89
   */
  getCommentInLine(): string | null {
    const line = this.getCurrentLine();
    const x = line.indexOf('*');
    if (x === -1) return null;
    const y = line.indexOf('(', x);
    if (y === -1) return null;
    const z = line.indexOf(')', y);
    if (z === -1) return null;
    return line.substring(y + 1, z);
  }

  /**
   * The first space-separated token once every grid character is stripped and
   * the rest Java-trimmed; `null` when the line has no `*`.
   * @see CursorPosition.java:91-103
   */
  static getCommitNameInLine(s: string): string | null {
    const x = s.indexOf('*');
    if (x === -1) return null;
    s = javaTrim(s.replace(GRID_CHARS, ''));
    const space = s.indexOf(' ');
    if (space === -1) return s;
    return s.substring(0, space);
  }

  /** @see CursorPosition.java:105-107 */
  getCommitDefinition(): string | null {
    return CursorPosition.getCommitNameInLine(this.getCurrentLine().substring(this.x));
  }

  /**
   * Only called on a cell the walk stopped at, where `matches("* ")` holds, so
   * the definition is non-null (`CursorPosition.java:119-120`).
   * @see CursorPosition.java:109-111
   */
  getCommit(): Commit {
    return new Commit(this.getCommitDefinition()!, this);
  }

  /** @see CursorPosition.java:113-115 */
  getDownFromHere(): CursorPosition {
    return CursorPosition.getDownFromInternal(this);
  }

  /**
   * Walks the grid until a `"* "` cell, taking the first rule of `DOWN_RULES`
   * that holds; throws when none does. Every move goes down or left, so the
   * walk ends.
   * @see CursorPosition.java:117-213
   */
  private static getDownFromInternal(current: CursorPosition): CursorPosition {
    for (;;) {
      const index = DOWN_RULES.findIndex((rule) => rule.test(current));
      if (index === STOP_RULE) return current;
      if (index === -1) throw new UnsupportedOperationException(current.toString());
      const rule = DOWN_RULES[index]!;
      current = current.move(rule.dx, rule.dy);
    }
  }
}
