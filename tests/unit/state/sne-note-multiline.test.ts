/**
 * sne T2b (issue #168): every multi-line state note is read by `PSystemCommandFactory#isMultilineCommandOk`, whose
 * reader takes an embedded block as one step through its matching `}}` (`PSystemCommandFactory.java:288-307`). An
 * `end note` inside `{{ … }}` is body; an unterminated `{{` (or a note never closed) runs the reader out of lines, and
 * the diagram is `Syntax Error?` at the note's first line (`:169-175`). Expected lines are the jar's
 * (`tests/fixtures/state-note-embed/{open,open-free,open-link,open-plain}.svg`: `(line 3)`, `(line 3)`, `(line 5)`,
 * `(line 3)`, 1-based).
 */
import { describe, expect, it } from 'vitest';
import { extractBlocks } from '../../../src/core/block-extractor.js';
import { parseState } from '../../../src/diagrams/state/parser.js';
import type { StateDiagramAST } from '../../../src/diagrams/state/ast.js';
import type { ParseRefusal } from '../../../src/core/parse-refusal.js';

const SYNTAX_ERROR = 'Syntax Error?';

function parse(lines: readonly string[]): StateDiagramAST | ParseRefusal {
  return parseState(extractBlocks(['@startuml', ...lines, '@enduml'])[0]!);
}

/** A refusal's 0-based line inside the block (the line after `@startuml` is 0, so the jar's 1-based `(line N)` is
 *  `N - 2`), or `undefined` for a parsed diagram. */
function refusedAt(result: StateDiagramAST | ParseRefusal): { line: number; message: string } | undefined {
  return 'refused' in result ? { line: result.line, message: result.message } : undefined;
}

describe('sne T2b: the state note reader keeps an embedded block whole', () => {
  it('refuses an unterminated `{{` in an attached note at the note line (open.svg, line 3)', () => {
    expect(refusedAt(parse(['state S1', 'note right of S1', 'text', '{{', 'end note']))).toEqual({
      line: 1,
      message: SYNTAX_ERROR,
    });
  });

  it('refuses it in a `note as N` (open-free.svg, line 3)', () => {
    expect(refusedAt(parse(['state S1', 'note as N', '{{', 'class X', 'end note', 'S1 --> N']))).toEqual({
      line: 1,
      message: SYNTAX_ERROR,
    });
  });

  it('refuses it in a `note on link` (open-link.svg, line 5)', () => {
    expect(refusedAt(parse(['state A', 'state B', 'A --> B', 'note on link', '{{', 'end note']))).toEqual({
      line: 3,
      message: SYNTAX_ERROR,
    });
  });

  it('refuses a note that is never closed (open-plain.svg, line 3)', () => {
    expect(refusedAt(parse(['state S1', 'note right of S1', 'text']))).toEqual({ line: 1, message: SYNTAX_ERROR });
  });

  it('keeps an `end note` inside a closed embed as note body (embed-endnote.svg)', () => {
    const ast = parse(['state S1', 'note right of S1', '{{', 'class X', 'end note', '}}', 'end note']);
    expect(refusedAt(ast)).toBeUndefined();
    expect((ast as StateDiagramAST).notes!.map((n) => n.text)).toEqual(['{{\nclass X\nend note\n}}']);
  });

  it('keeps a blank line inside an embed in the note body', () => {
    const ast = parse(['state S1', 'note right of S1', '{{', 'class X', '', 'class Y', '}}', 'end note']);
    expect((ast as StateDiagramAST).notes!.map((n) => n.text)).toEqual(['{{\nclass X\n\nclass Y\n}}']);
  });

  it('leaves an embed-free note as it was', () => {
    const ast = parse(['state S1', 'note right of S1', 'a', 'b', 'end note']);
    expect((ast as StateDiagramAST).notes!.map((n) => n.text)).toEqual(['a\nb']);
  });
});
