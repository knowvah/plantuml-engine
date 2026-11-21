/**
 * An unclosed `<style>` block (upstream 96380842043). `CommandStyleMultilinesCSS`
 * never accepts an opening `<style>` no `</style>` closes, so the line stays in
 * the body (`preprocessor-collector.ts`, `notAnOpening`) and the engine's own
 * loop refuses it: `PSystemCommandFactory#getSyntaxErrorMessage`
 * (PSystemCommandFactory.java:249-259) words that refusal
 * "Unclosed <style> block: '</style>' is missing".
 *
 * The four sources are upstream's Vega fixtures
 * (`src/test/resources/vega/nonreg/group2997/style_error_unclosed_style*.puml`,
 * `style_tolerated_unclosed_block.puml`); each expectation is the fixture's
 * front matter (`expected-error-line` is 0-based, the page prints it 1-based).
 */
import { describe, expect, it } from 'vitest';

import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import {
  getSyntaxErrorMessage,
  SYNTAX_ERROR_MESSAGE,
  syntaxErrorMessageOf,
  UNCLOSED_STYLE_MESSAGE,
} from '../../../src/core/parse-refusal.js';
import { preprocess } from '../../../src/core/preprocessor.js';
import { StringLocated } from '../../../src/core/tim/StringLocated.js';
import { renderSync } from '../../../src/index.js';

const STYLE_BODY = ['<style>', 'root {', '  LineColor red', '}'];

/** The `[From string (line N) ]` row and the message row of an error page. */
function errorPageOf(markup: string): { readonly from: string | undefined; readonly message: string | undefined } {
  const svg = renderSync(markup, { measurer: new DeterministicMeasurer() });
  const texts = [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => (m[1] ?? '').replaceAll('&lt;', '<'));
  return { from: texts.find((t) => t.startsWith('[From')), message: texts.at(-1) };
}

describe('getSyntaxErrorMessage (PSystemCommandFactory.java:249-259)', () => {
  it('words a lone <style> line as an unclosed block, case-insensitively and trimmed', () => {
    expect(getSyntaxErrorMessage(new StringLocated('<style>', undefined))).toBe(UNCLOSED_STYLE_MESSAGE);
    expect(syntaxErrorMessageOf('  <STYLE>\t')).toBe(UNCLOSED_STYLE_MESSAGE);
    expect(UNCLOSED_STYLE_MESSAGE).toBe("Unclosed <style> block: '</style>' is missing");
  });

  it('keeps "Syntax Error?" for any other line', () => {
    expect(syntaxErrorMessageOf('foo bar')).toBe(SYNTAX_ERROR_MESSAGE);
    expect(syntaxErrorMessageOf('<style> root { }')).toBe('Syntax Error?');
    expect(syntaxErrorMessageOf('</style>')).toBe('Syntax Error?');
  });
});

describe('the collector leaves an unclosed <style> in the body', () => {
  it('keeps the opening line and every line after it, and collects no sheet', () => {
    const result = preprocess(['@startmindmap', ...STYLE_BODY, '* root', '@endmindmap'].join('\n'));
    expect(result.lines).toEqual(['@startmindmap', ...STYLE_BODY, '* root', '@endmindmap']);
    expect(result.styles).toEqual([]);
    expect(result.stylePositions).toEqual([]);
  });

  it('still collects a closed block', () => {
    const result = preprocess(['@startmindmap', ...STYLE_BODY, '</style>', '* root', '@endmindmap'].join('\n'));
    expect(result.lines).toEqual(['@startmindmap', '* root', '@endmindmap']);
    expect(result.styles).toEqual(['root {\n  LineColor red\n}']);
  });
});

describe('upstream group2997 fixtures', () => {
  it('style_error_unclosed_style: error line 1, mindmap', () => {
    const page = errorPageOf(['@startmindmap', ...STYLE_BODY, '* root', '** child', '@endmindmap'].join('\n'));
    expect(page.from).toBe('[From string (line 2) ]');
    expect(page.message).toBe(`${UNCLOSED_STYLE_MESSAGE} (Assumed diagram type: mindmap)`);
  });

  it('style_error_unclosed_style_typo: </sytle> closes nothing, error line 1', () => {
    const page = errorPageOf(
      ['@startmindmap', ...STYLE_BODY, '</sytle>', '* root', '** child', '@endmindmap'].join('\n'),
    );
    expect(page.from).toBe('[From string (line 2) ]');
    expect(page.message).toBe(`${UNCLOSED_STYLE_MESSAGE} (Assumed diagram type: mindmap)`);
  });

  it('style_error_unclosed_style_class: error line 2, class', () => {
    const page = errorPageOf(
      ['@startuml', 'class A', '<style>', 'class {', '  RoundCorner 5', '}', 'class B', '@enduml'].join('\n'),
    );
    expect(page.from).toBe('[From string (line 3) ]');
    expect(page.message).toBe(`${UNCLOSED_STYLE_MESSAGE} (Assumed diagram type: class)`);
  });

  it('style_tolerated_unclosed_block: a missing } inside a closed block draws', () => {
    const page = errorPageOf(
      ['@startmindmap', '<style>', 'root {', '  LineColor red', '</style>', '* root', '** child', '@endmindmap'].join(
        '\n',
      ),
    );
    expect(page.from).toBeUndefined();
    expect(page.message).toBe('child');
  });
});
