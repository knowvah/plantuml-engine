/**
 * `$foo` and `foo` are one variable (upstream 9d5e0d8d0cc, `VariableAlias.java`), while the text
 * replacement only knows the spelling the variable was created with.
 * Source and expected lines: upstream `src/test/resources/vega/preproc/variable_dollar_alias.{puml,preproc}`.
 */
import { describe, expect, it } from 'vitest';
import { renderSync } from '../../../../src/index.js';
import { DeterministicMeasurer } from '../../../../src/core/measurer-deterministic.js';
import { alias, getAliased, resolveKey } from '../../../../src/core/tim/VariableAlias.js';

const measurer = new DeterministicMeasurer();

const VEGA_SOURCE = [
  '@startuml',
  '!$a = 1',
  '!$b = 2',
  'A -> B : %get_variable_value("a") %get_variable_value("$a")',
  'A -> B : %get_variable_value("b") %get_variable_value("$b")',
  'A -> B : %variable_exists("a") %variable_exists("$a") %variable_exists("c")',
  '!$a = 10',
  '!$b = 20',
  'A -> B : %get_variable_value("a") %get_variable_value("$a") %get_variable_value("b") %get_variable_value("$b")',
  '!c ?= 3',
  '!$c ?= 4',
  'A -> B : %get_variable_value("c") %get_variable_value("$c")',
  '!if (a == 10 && $b == 20)',
  'A -> B : both spellings give the same variable',
  '!endif',
  '!function $f($p)',
  '  !return p + 1',
  '!endfunction',
  'A -> B : $f(5)',
  '!$data = {"x": 7}',
  'A -> B : $data.x',
  '!undef $a',
  'A -> B : %variable_exists("a") %variable_exists("$a")',
  '!define sprite 1',
  'A -> B : <$sprite> sprite',
  '@enduml',
].join('\n');

/** The message labels of `variable_dollar_alias.preproc`, minus the `<$1>` sprite line (drawn, not text). */
const VEGA_LABELS = [
  '1 1',
  '2 2',
  '1 1 0',
  '10 10 20 20',
  '3 3',
  'both spellings give the same variable',
  '6',
  '7',
  '0 0',
];

function messageLabels(svg: string): string[] {
  return [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]!.replaceAll(' ', ' '));
}

describe('VariableAlias (VariableAlias.java)', () => {
  it('gives the other spelling', () => {
    expect([alias('toto'), alias('$toto'), alias('$'), alias('')]).toEqual(['$toto', 'toto', undefined, undefined]);
  });

  it('resolves to the stored spelling, or the given name when neither is stored', () => {
    const map = new Map([['$x', 1]]);
    expect([resolveKey(map, 'x'), resolveKey(map, '$x'), resolveKey(map, 'y')]).toEqual(['$x', '$x', 'y']);
    expect([getAliased(map, 'x'), getAliased(map, 'y')]).toEqual([1, undefined]);
  });
});

describe('variable_dollar_alias (upstream vega/preproc)', () => {
  it('reads, sets, tests and removes one variable under both spellings', () => {
    const labels = messageLabels(renderSync(VEGA_SOURCE, { measurer }));
    for (const label of VEGA_LABELS) expect(labels).toContain(label);
    expect(labels).toContain('1');
  });

  it('a no-argument !define of a $-variable updates it, and the bare name stays literal (jar)', () => {
    // jar (scripts/oracle-render.sh): `a <size:TFS>[b]</size>`, the azure stdlib after C4's leading-'$' rule.
    const source = ['@startuml', '!$TFS ?= 12', '!define TFS 12', 'rectangle "a <size:TFS>[b]</size>" as r', '@enduml'];
    expect(messageLabels(renderSync(source.join('\n'), { measurer }))).toContain('a &lt;size:TFS>[b]&lt;/size>');
  });
});
