/**
 * `style-command.ts` -- `CommandStyleMultilinesCSS#executeNow`'s command error
 * (`CommandStyleMultilinesCSS.java:84-98`) and where it cuts the dispatch.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import type { UmlSource } from '../../../src/core/block-extractor.js';
import { setErrorPageObserver } from '../../../src/core/error/error-renderer.js';
import { renderSync } from '../../../src/index.js';
import { commandCutsOf, styleCommandError, styleCutOf } from '../../../src/core/style-command.js';
import { DIAGRAM_STYLE_SCOPE_ROOT } from '../../oracle/svg-conformance/diagram-style-scope.js';

const PARSING = 'Error in style definition: parsing';

function sourceOf(lines: string[], linePositions?: number[]): UmlSource {
  return { lines, type: 'sequence', ...(linePositions === undefined ? {} : { linePositions }) };
}

function drawsErrorPage(markup: string): boolean {
  let errorPage = false;
  setErrorPageObserver(() => {
    errorPage = true;
  });
  try {
    renderSync(markup);
  } finally {
    setErrorPageObserver(undefined);
  }
  return errorPage;
}

describe('styleCommandError', () => {
  it('accepts a well-formed block and a stray closing brace (StyleParser.java:144-148)', () => {
    expect(styleCommandError('document {\n  BackgroundColor red\n}')).toBeUndefined();
    expect(styleCommandError('document {\n  BackgroundColor red\n}\n}')).toBeUndefined();
  });

  it('rejects a key with no value (StyleParser.java:141)', () => {
    expect(styleCommandError('document {\n  BackgroundColor\n}\n}')).toBe(PARSING);
  });

  it('drops a line starting with a quote before parsing (REMOVE_STARTING_QUOTE)', () => {
    expect(styleCommandError("document {\n  ' BackgroundColor\n  BackgroundColor red\n}")).toBeUndefined();
  });
});

describe('styleCutOf', () => {
  it('is undefined when every block parses', () => {
    expect(styleCutOf({ styles: ['a { FontSize 3 }'], stylePositions: [1] }, sourceOf(['x']))).toBeUndefined();
  });

  it('cuts at the opening line of the first failing block, after the body lines before it', () => {
    const cut = styleCutOf(
      { styles: ['a { FontSize 3 }', 'a {\n FontSize\n}\n}'], stylePositions: [1, 6] },
      sourceOf(['x', 'y', 'z'], [4, 5, 9]),
    );
    expect(cut?.index).toBe(2);
    expect(cut?.refusal.message).toBe(PARSING);
    expect(cut?.refusal.line).toBe(6);
    expect(cut?.commandFactoryOnly).toBe(true);
  });
});

describe('commandCutsOf', () => {
  it('orders a skin cut and a style cut by line, the earlier first', () => {
    const cuts = commandCutsOf(
      { skinDirectives: [{ name: 'nope', position: 7 }], styles: ['a {\n FontSize\n}\n}'], stylePositions: [2] },
      sourceOf(['x', 'y'], [5, 9]),
    );
    expect(cuts.map((c) => c.refusal.message)).toEqual([PARSING, 'Cannot find style nope']);
  });
});

describe('a failing <style> block draws the error page', () => {
  it('sequence__scope-malformed-brace', () => {
    const markup = readFileSync(join(DIAGRAM_STYLE_SCOPE_ROOT, 'sequence__scope-malformed-brace.puml'), 'utf8');
    expect(drawsErrorPage(markup)).toBe(true);
  });

  it('class__malformed-novalue, and not class__malformed-straybrace', () => {
    const read = (row: string): string => readFileSync(join(DIAGRAM_STYLE_SCOPE_ROOT, `${row}.puml`), 'utf8');
    expect(drawsErrorPage(read('class__malformed-novalue'))).toBe(true);
    expect(drawsErrorPage(read('class__malformed-straybrace'))).toBe(false);
  });

  it('keeps drawing a json diagram, whose factory logs the error (JsonDiagramFactory.java:99-103)', () => {
    const markup = '@startjson\n<style>\njsonDiagram {\n  BackgroundColor\n}\n}\n</style>\n{"a": 1}\n@endjson\n';
    expect(drawsErrorPage(markup)).toBe(false);
  });
});
