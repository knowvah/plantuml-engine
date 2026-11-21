/**
 * `PythonLine.isLegacyAffectation` (upstream 0537b558644) and the deprecation warning it gates
 * (`Eater#checkVariableStartsWithDollar`, upstream 8ae9ef41383). The banner of the last case is the
 * jar's for corpus `sequence/monafo-92` (`!global ijk = "foo"`).
 */
import { describe, expect, it } from 'vitest';
import {
  isDecoratorLine,
  isKeywordLine,
  isLegacyAffectation,
  isStatementLine,
  nameAssignedWithoutDollar,
  startsWithEscapedBang,
  startsWithInterpolation,
} from '../../../../src/core/text/PythonLine.js';
import { preprocess } from '../../../../src/core/preprocessor.js';

function warningsOf(...lines: string[]): string[] {
  const result = preprocess(['@startuml', ...lines, 'A -> B', '@enduml'].join('\n'));
  return (result.warnings ?? []).map((w) => w.message[0]!);
}

describe('PythonLine.isLegacyAffectation (PythonLine.java)', () => {
  it.each([
    ['!$x = 1', true],
    ['  ! $x=1', true],
    ['!local $x = 1', true],
    ['!global x = 1', true],
    ['!x ?= 1', true],
    ['!$x ?= 1', true],
    ['!x = 1', false],
    ['!t="a"', false],
    ['!global x', false],
    ['!x == 1', false],
    ['!$ = 1', false],
    ['x = 1', false],
  ])('%s -> %s', (line, legacy) => {
    expect(isLegacyAffectation(line)).toBe(legacy);
  });
});

describe("a variable declared without '$' (Eater.java#checkVariableStartsWithDollar)", () => {
  const message = (name: string): string =>
    `This diagram is using the variable '${name}' declared without '$', which is deprecated and will be removed in the future.`;

  it('warns for the legacy forms without a dollar, once per name', () => {
    expect(warningsOf('!global ijk = "foo"', '!k ?= 1', '!global ijk = "bar"')).toEqual([message('ijk'), message('k')]);
  });

  it('warns for a !foreach variable without a dollar', () => {
    expect(warningsOf('!foreach item in [1, 2]', '!endfor')).toEqual([message('item')]);
  });

  it('stays silent for $-variables and for `!x = 1`, a Python statement upstream', () => {
    expect(warningsOf('!$a = 1', '!global $b = 2', '!t = "x"')).toEqual([]);
  });
});

/** Port of upstream `PythonLineTest.java` (plantuml/plantuml#3032 fix, 908fb9df265). */
describe('PythonLine.nameAssignedWithoutDollar (PythonLine.java:147, #3032)', () => {
  it.each([
    ['!x = 1', 'x'],
    ['!t="this is t1\\nthis is t2"', 't'],
    ['  !Response = "FOO"', 'Response'],
    ['!ijk\t= "foo"', 'ijk'],
    ['!foo = $myjson.root', 'foo'],
    ['!a_at_AtoB = "a"', 'a_at_AtoB'],
    // a Python keyword cannot be assigned in Python: before Python it was a legacy variable
    ['!global = "changed value"', 'global'],
  ])('%s -> %s', (line, name) => {
    expect(nameAssignedWithoutDollar(line)).toBe(name);
  });

  it.each([
    // legacy assignments, already told apart by isLegacyAffectation
    '!$x = 1',
    '!x ?= 1',
    '!global $x = 1',
    // Python only
    '!x == 1',
    '!x += 1',
    '!x.y = 1',
    '!x[0] = 1',
    '!a, b = 1, 2',
    '!f(1)',
    '!1 = 2',
    '!x',
    // not a "!" line
    'x = 1',
  ])('%s has none', (line) => {
    expect(nameAssignedWithoutDollar(line)).toBeUndefined();
  });
});

describe('PythonLine: the Python verdicts of section 6 (PythonLine.java:72-198)', () => {
  it.each([
    ['!def f(x):', true],
    ['!for i in range(3):', true],
    ['!global x', true],
    ['!if x == 1:', true],
    ['!if $x == 1', false],
    ['!while True :  ', true],
    ['!else:', true],
    ['!endif', false],
  ])('isKeywordLine(%s) -> %s', (line, verdict) => {
    expect(isKeywordLine(line)).toBe(verdict);
  });

  it.each([
    ['!@macro', true],
    ['  ! @macro("$color")', true],
    ['!macro', false],
  ])('isDecoratorLine(%s) -> %s', (line, verdict) => {
    expect(isDecoratorLine(line)).toBe(verdict);
  });

  it.each([
    ['!x = 1', true],
    ['!x == 1', true],
    ['!f(1)', true],
    ['!1 + 1', true],
    ['!(a, b) = c', true],
    ['![1, 2]', true],
    ['! x = 1', true],
    ['!define 4K(x) x', false],
    ['!pragma teoz true', false],
    ['!include foo.puml', false],
    ['!"text"', false],
    ['!$x', false],
    ['!', false],
    ['x = 1', false],
  ])('isStatementLine(%s) -> %s', (line, verdict) => {
    expect(isStatementLine(line)).toBe(verdict);
  });

  it.each([
    ['!{a} -> !{b}', true],
    ['  !{a}', true],
    ['!!{a}', false],
    ['A -> !{b}', false],
  ])('startsWithInterpolation(%s) -> %s', (line, verdict) => {
    expect(startsWithInterpolation(line)).toBe(verdict);
  });

  it.each([
    ['!!important', true],
    ['  !!{x}', true],
    ['!important', false],
  ])('startsWithEscapedBang(%s) -> %s', (line, verdict) => {
    expect(startsWithEscapedBang(line)).toBe(verdict);
  });
});
