/**
 * `PythonLine.isLegacyAffectation` (upstream 0537b558644) and the deprecation warning it gates
 * (`Eater#checkVariableStartsWithDollar`, upstream 8ae9ef41383). The banner of the last case is the
 * jar's for corpus `sequence/monafo-92` (`!global ijk = "foo"`).
 */
import { describe, expect, it } from 'vitest';
import { isLegacyAffectation } from '../../../../src/core/text/PythonLine.js';
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
