/**
 * Port of upstream `YamlParserSubsetTest` (0537b558644): block scalars,
 * quotes, plain scalars on several lines and the errors of `YamlParser`.
 * @see ~/git/plantuml/src/test/java/net/sourceforge/plantuml/yaml/parser/YamlParserSubsetTest.java
 */
import { describe, expect, it } from 'vitest';
import { YamlParser } from '../../../src/diagrams/yaml/yaml-parser.js';
import { YamlSyntaxException } from '../../../src/diagrams/yaml/yaml-syntax-exception.js';
import type { Monomorph } from '../../../src/diagrams/yaml/monomorph.js';

function parse(...lines: string[]): Monomorph {
  return new YamlParser().parse(lines);
}

function error(...lines: string[]): YamlSyntaxException {
  try {
    parse(...lines);
  } catch (e) {
    expect(e).toBeInstanceOf(YamlSyntaxException);
    return e as YamlSyntaxException;
  }
  throw new Error(`no YamlSyntaxException for ${JSON.stringify(lines)}`);
}

describe('YamlParserSubsetTest (upstream 0537b558644)', () => {
  it('blockKeepsTheInnerIndentationAndTheComments', () => {
    const result = parse('text: |', '  def f(x):', '    # a comment', '    return x', '# after', 'z: 1');
    expect(result.getMapValue('text').getValue()).toBe('def f(x):\n  # a comment\n  return x\n');
    expect(result.getMapValue('z').getValue()).toBe('1');
  });

  it('blockEndsAtTheFirstLineThatIsNotDeeperEvenIfItIsAComment', () => {
    const result = parse('a:', '  text: |', '    one', '  # not in the block', '  b: 2');
    expect(result.getMapValue('a').getMapValue('text').getValue()).toBe('one\n');
    expect(result.getMapValue('a').getMapValue('b').getValue()).toBe('2');
  });

  it('blockKeepsInnerEmptyLinesAndDropsTrailingOnes', () => {
    const result = parse('t: |', '  a', '', '  b', '', '', 'z: 1');
    expect(result.getMapValue('t').getValue()).toBe('a\n\nb\n');
  });

  it('foldedBlock', () => {
    const result = parse('t: >', '  a', '  b', '', '  c', 'z: 1');
    expect(result.getMapValue('t').getValue()).toBe('a b\nc\n');
  });

  it('blockInAListItem', () => {
    const result = parse('l:', '  - name: x', '    text: |', '      one', '      two', '  - name: y');
    const first = result.getMapValue('l').getElementAt(0);
    expect(first.getMapValue('name').getValue()).toBe('x');
    expect(first.getMapValue('text').getValue()).toBe('one\ntwo\n');
    expect(result.getMapValue('l').getElementAt(1).getMapValue('name').getValue()).toBe('y');
  });

  it('plainScalarOnSeveralLines', () => {
    const result = parse('t: first', '  second', 'z: 1');
    expect(result.getMapValue('t').getValue()).toBe('first second');
    expect(result.getMapValue('z').getValue()).toBe('1');
  });

  it('quotes', () => {
    const result = parse("a: 'it''s'", 'b: "say \\"hi\\""', 'c: "x\\ny"', 'd: "a: b"');
    expect(result.getMapValue('a').getValue()).toBe("it's");
    expect(result.getMapValue('b').getValue()).toBe('say "hi"');
    expect(result.getMapValue('c').getValue()).toBe('x\ny');
    expect(result.getMapValue('d').getValue()).toBe('a: b');
  });

  it('duplicateKeyIsAnErrorOnItsLine', () => {
    const e = error('a: 1', 'b: 2', 'a: 3');
    expect(e.getLine()).toBe(3);
    expect(e.message).toBe("duplicate key 'a' (line 3)");
  });

  it('unexpectedIndentationIsAnErrorOnItsLine', () => {
    expect(error('a: 1', '  b: 2').getLine()).toBe(2);
  });

  it('textWithoutKeyIsAnErrorOnItsLine', () => {
    expect(error('hello').getLine()).toBe(1);
  });

  it('listInListAndFlowMappingAreRejected', () => {
    expect(error('l:', '  - - a', '    - b').getLine()).toBe(2);
    expect(error('l:', '  -', '    - a').getLine()).toBe(2);
    const flow = error('m: {a: 1}');
    expect(flow.getLine()).toBe(1);
    expect(flow.message).toBe('flow mappings {...} are not supported (line 1)');
  });

  it('everyErrorIsAYamlSyntaxException', () => {
    // these used to leak IllegalStateException or UnsupportedOperationException
    // "- b" sits at indent 2 (YamlLine.java:68-71) under a closed level.
    expect(error('a: 1', '- b').message).toBe('unexpected indentation (line 2)');
    // adjustIndentation pops the root itself; the builder's own failure is
    // re-thrown as one (YamlParser.java:120-123).
    expect(error('- a', 'b: 1').message).toBe('inconsistent structure (line 2)');
  });
});
