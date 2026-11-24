/**
 * ocb (issue #223): no class command takes a non-empty `{ … }` body on one line.
 *
 * `CommandCreateClass` ends with an optional EMPTY pair, `[%s]*\{[%s]*\}`, then the end of the line
 * (`classdiagram/command/CommandCreateClass.java:117-119`). `CommandCreateClassMultilines` opens only on a line
 * ending in `\{` (`CommandCreateClassMultilines.java:140-142`). `%s` is Java's `\s` (`[ \t\n\x0B\f\r]`) plus U+00A0
 * (`regex/Pattern2.java:56`). Any other brace tail matches no class command, so `getCandidate` returns null and the
 * factory builds `SYNTAX_ERROR "Syntax Error?"` at that line (`command/PSystemCommandFactory.java:206-208`).
 */
import { describe, expect, it } from 'vitest';

import { parseRefusalOf } from '../../../src/core/dispatcher.js';
import { parseClass as parseClassRaw } from '../../../src/diagrams/class/parser.js';
import { parseClass } from './parse-helper.js';

const SYNTAX_ERROR = 'Syntax Error?';
const NBSP = ' ';
const EM_SPACE = ' ';

/** The refusal of a one-block source, `lines` as the block extractor hands them (no `@startuml`). */
function refusalOf(lines: readonly string[]): { kind: string; line: number; message: string } | undefined {
  const refusal = parseRefusalOf(parseClassRaw({ lines: [...lines], type: 'class' }));
  return refusal === undefined ? undefined : { kind: refusal.kind, line: refusal.line, message: refusal.message };
}

describe('a one-line non-empty classifier body is refused (CommandCreateClass.java:117-119)', () => {
  it.each([
    ['class A { x : int }'],
    // The issue's two U+00A0 variants: `%s` takes U+00A0, the body is still non-empty.
    [`class A {${NBSP}x : int${NBSP}}`],
    [`class A { ${NBSP}x : int }`],
    ['abstract class B { +f() }'],
    ['enum C { RED; GREEN }'],
    ['struct S { a }'],
  ])('%s: syntax refusal at its line, PSystemCommandFactory.java:206-208', (line) => {
    expect(refusalOf([line])).toEqual({ kind: 'syntax', line: 0, message: SYNTAX_ERROR });
  });

  it('refuses at the line it sits on, after a class the diagram already holds', () => {
    expect(refusalOf(['class B', 'class A { x : int }'])).toEqual({ kind: 'syntax', line: 1, message: SYNTAX_ERROR });
  });

  it('a U+2003 inside the pair is not `%s` (Pattern2.java:56: `\\s` plus U+00A0 only), so the jar refuses it', () => {
    expect(refusalOf([`class A {${EM_SPACE}}`])).toEqual({ kind: 'syntax', line: 0, message: SYNTAX_ERROR });
  });
});

describe('an empty pair is a body that never opens (CommandCreateClass.java:117-119)', () => {
  it.each([['class A { }'], ['class A {}'], [`class A {${NBSP}}`], [`class A${NBSP}{ }`]])(
    '%s: classifier A, no members, the next line is not a member',
    (line) => {
      const ast = parseClass({ lines: [line, 'class B'], type: 'class' });
      expect(ast.classifiers.map((c) => ({ id: c.id, members: c.members.length }))).toEqual([
        { id: 'A', members: 0 },
        { id: 'B', members: 0 },
      ]);
    },
  );

  it('keeps the decorations to the left of the pair (stereotype, colour, extends)', () => {
    const ast = parseClass({ lines: ['class A <<S>> #pink extends B { }'], type: 'class' });
    const a = ast.classifiers.find((c) => c.id === 'A')!;
    expect({ stereotype: a.stereotype, members: a.members.length }).toEqual({ stereotype: 'S', members: 0 });
    expect(ast.classifiers.map((c) => c.id).sort()).toEqual(['A', 'B']);
  });
});

describe('a trailing `{` opens the body (CommandCreateClassMultilines.java:140-142)', () => {
  it('reads the next lines as members until `}` (END, `:100`)', () => {
    const ast = parseClass({ lines: ['class A {', 'x : int', '}'], type: 'class' });
    expect(ast.classifiers.map((c) => ({ id: c.id, members: c.members.map((m) => [m.name, m.type]) }))).toEqual([
      { id: 'A', members: [['x', 'int']] },
    ]);
  });
});

describe('rule 9 (allowmixing) takes no brace tail (CommandCreateElementFull2.java:120-124)', () => {
  it.each([['database D { x }'], ['database D { }']])('%s: syntax refusal at its line', (line) => {
    expect(refusalOf(['allowmixing', 'class A', line])).toEqual({ kind: 'syntax', line: 2, message: SYNTAX_ERROR });
  });

  it('still declares a leaf with no brace tail', () => {
    const ast = parseClass({ lines: ['allowmixing', 'class A', 'database D'], type: 'class' });
    expect(ast.classifiers.map((c) => [c.id, c.kind])).toEqual([
      ['A', 'class'],
      ['D', 'descriptive'],
    ]);
  });
});
