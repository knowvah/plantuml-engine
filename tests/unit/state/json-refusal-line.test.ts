/**
 * A multi-line `json` refusal in a state diagram is reported on the block's closing line (ocr D4, issue #190).
 *
 * The jar reports a multi-line command's `EXECUTION_ERROR` on the last line of its trace
 * (`command/PSystemCommandFactory.java:218-225`): `CommandCreateJson` is a `CommandMultilines2` whose block ends where
 * the JSON completes (`objectdiagram/command/CommandCreateJson.java:155-162`), and both its refusals —
 * `JSON already exists` (`:141-142`) and `badColor()` from `getColor` (`:223-225`) — come from `executeNow`, after
 * the whole block was read. A single-line refusal stays on its own line.
 */
import { describe, expect, it } from 'vitest';
import type { UmlSource } from '../../../src/core/block-extractor.js';
import type { ParseRefusal } from '../../../src/core/parse-refusal.js';
import type { StateDiagramAST } from '../../../src/diagrams/state/ast.js';
import { parseState } from '../../../src/diagrams/state/parser.js';

/** `source` as a block whose line `i` sits at document position `i + 1` (after `@startuml`). */
function block(source: string): UmlSource {
  const lines = source.split('\n');
  return { lines, type: 'state', linePositions: lines.map((_, i) => i + 1) };
}

function refusalOf(source: string): Pick<ParseRefusal, 'line' | 'message' | 'commandScore'> | undefined {
  const result = parseState(block(source));
  if (!('refused' in result)) return undefined;
  return { line: result.line, message: result.message, commandScore: result.commandScore };
}

describe('state: a multi-line json refusal lands on its closing line (PSystemCommandFactory.java:218-225)', () => {
  it('JSON already exists, at the `}` (jar: line 5)', () => {
    expect(refusalOf('state J\njson J {\n  "a": 1\n}')).toEqual({
      line: 4,
      message: 'JSON already exists: J',
      commandScore: 0,
    });
  });

  it('No such color, at the `}`', () => {
    expect(refusalOf('state S\njson J #line:red {\n  "a": 1\n}')).toEqual({
      line: 4,
      message: 'No such color',
      commandScore: 10,
    });
  });

  it('a longer body reports its own closing line', () => {
    expect(refusalOf('state S\njson J #line:red {\n  "a": 1,\n  "b": [1, 2]\n}')).toEqual({
      line: 5,
      message: 'No such color',
      commandScore: 10,
    });
  });

  it('a single-line refusal stays on its own line', () => {
    expect(refusalOf('state S\njson J #line:red {"a": 1}\nstate T')).toEqual({
      line: 2,
      message: 'No such color',
      commandScore: 10,
    });
  });

  it('a refused nested body closes where the JSON completes (CommandCreateJson.java:155-162; jar: line 7)', () => {
    expect(refusalOf('state S\njson J #line:red {\n  "a": {\n    "b": 1\n  }\n}')).toEqual({
      line: 6,
      message: 'No such color',
      commandScore: 10,
    });
  });

  it('an accepted nested body keeps its inner `}` and closes where the JSON completes', () => {
    const ast = parseState(block('state S\njson J {\n  "a": {\n    "b": 1\n  }\n}\nstate T'));
    expect('refused' in ast).toBe(false);
    const json = (ast as StateDiagramAST).states.find((s) => s.id === 'J');
    expect(json?.jsonValue).toEqual({
      kind: 'object',
      entries: [{ key: 'a', value: { kind: 'object', entries: [{ key: 'b', value: { kind: 'scalar', value: 1 } }] } }],
    });
    expect((ast as StateDiagramAST).states.map((s) => s.id)).toEqual(['S', 'J', 'T']);
  });

  it('an accepted block still draws', () => {
    expect(refusalOf('state S\njson J {\n  "a": 1\n}')).toBeUndefined();
  });
});
