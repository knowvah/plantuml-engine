/**
 * cogr T1b: a multiline `usecase` element (`CommandCreateElementMultilines`,
 * TYPE0 `usecase foo as "…` and TYPE1 `usecase foo [ …`) is a
 * `LeafType.USECASE` leaf, so its svek node is `shape=ellipse` -- the same
 * kind the single-line `usecase foo` declaration already gets.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/descdiagram/command/CommandCreateElementMultilines.java:173-187
 * Oracle: `test-results/dot-cache/class/fosufo-93-kozi113/svek-1.dot` --
 * `sh0006 [shape=ellipse,…]` and `sh0007 [shape=ellipse,…]`.
 */
import { describe, it, expect } from 'vitest';
import { parseClass } from './parse-helper.js';
import type { UmlSource } from '../../../src/core/block-extractor.js';
import type { Classifier } from '../../../src/diagrams/class/ast.js';
import { layoutClass } from '../../../src/diagrams/class/layout.js';
import { defaultTheme } from '../../../src/core/theme.js';
import { FormulaMeasurer } from '../../../src/core/measurer.js';
import { setLayoutInputObserver } from '../../../src/core/graph-layout.js';
import type { DotInputGraph, DotInputNode } from '../../../src/core/graph-layout.js';

/** fosufo-93-kozi113's own source (TYPE0, quote-terminated). */
const FOSUFO = ['usecase foo as "this', 'is &#8734; long"', 'usecase foo2 as "this', 'is <U+221E> long"'];

function parse(lines: readonly string[]): ReturnType<typeof parseClass> {
  return parseClass({ lines: [...lines], type: 'class' } satisfies UmlSource);
}

function classifier(ast: ReturnType<typeof parseClass>, id: string): Classifier {
  const c = ast.classifiers.find((x) => x.id === id);
  if (c === undefined) throw new Error(`Expected classifier "${id}"`);
  return c;
}

function captureNodes(ast: ReturnType<typeof parseClass>): DotInputNode[] {
  let captured: DotInputGraph | undefined;
  setLayoutInputObserver(({ graph: g }) => {
    captured = g;
  });
  try {
    layoutClass(ast, defaultTheme, new FormulaMeasurer());
  } finally {
    setLayoutInputObserver(undefined);
  }
  if (captured === undefined) throw new Error('Expected a captured layout graph');
  return captured.nodes;
}

describe('cogr T1b: multiline usecase is LeafType.USECASE', () => {
  it('TYPE0 `usecase foo as "…"` parses as kind usecase with no usymbol, keeping its display', () => {
    const ast = parse(FOSUFO);
    expect(classifier(ast, 'foo')).toMatchObject({ kind: 'usecase', display: 'this\nis &#8734; long' });
    expect(classifier(ast, 'foo').usymbol).toBeUndefined();
    expect(classifier(ast, 'foo2')).toMatchObject({ kind: 'usecase', display: 'this\nis <U+221E> long' });
  });

  it('TYPE0 usecases emit shape=ellipse, as the oracle svek DOT does', () => {
    const nodes = captureNodes(parse(FOSUFO));
    expect(nodes.map((n) => n.shape)).toEqual(['ellipse', 'ellipse']);
  });

  it('TYPE1 `usecase foo [ … ]` is kind usecase and emits shape=ellipse', () => {
    const ast = parse(['usecase foo [', 'first', 'second', ']', 'usecase bar [', 'third', ']']);
    expect(classifier(ast, 'foo')).toMatchObject({ kind: 'usecase', display: 'first\nsecond' });
    expect(captureNodes(ast).map((n) => n.shape)).toEqual(['ellipse', 'ellipse']);
  });

  it('`usecase/` is the business usecase: kind usecase, usymbol kept as the raw keyword', () => {
    const ast = parse(['usecase/ foo [', 'body', ']']);
    expect(classifier(ast, 'foo')).toMatchObject({ kind: 'usecase', usymbol: 'usecase/' });
  });

  it('any other keyword stays a descriptive leaf carrying its keyword', () => {
    const ast = parse(['rectangle foo as "a', 'b"', 'rectangle bar as "c', 'd"']);
    expect(classifier(ast, 'foo')).toMatchObject({ kind: 'descriptive', usymbol: 'rectangle' });
    expect(captureNodes(ast).map((n) => n.shape)).toEqual([undefined, undefined]);
  });
});
