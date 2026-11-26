/**
 * A multi-line `json` refusal in a description diagram is reported on the block's closing line (ocr D4, issue #190).
 *
 * The jar reports a multi-line command's `EXECUTION_ERROR` on the last line of its trace
 * (`command/PSystemCommandFactory.java:218-225`); `CommandCreateJson`'s refusals come from `executeNow`
 * (`objectdiagram/command/CommandCreateJson.java:141-142,223-225`), after the whole block was read. A single-line
 * refusal stays on its own line. A preprocessor-stripped line inside the block keeps the document position.
 */
import { describe, expect, it } from 'vitest';
import type { UmlSource } from '../../../src/core/block-extractor.js';
import type { ParseRefusal } from '../../../src/core/parse-refusal.js';
import { parseDescription } from '../../../src/diagrams/description/parser.js';

function refusalOf(
  lines: readonly string[],
  linePositions: readonly number[] = lines.map((_, i) => i + 1),
): Pick<ParseRefusal, 'line' | 'consumed' | 'message' | 'commandScore'> | undefined {
  const block: UmlSource = { lines: [...lines], type: 'description', linePositions };
  const result = parseDescription(block);
  if (!('refused' in result)) return undefined;
  return { line: result.line, consumed: result.consumed, message: result.message, commandScore: result.commandScore };
}

describe('description: a multi-line json refusal lands on its closing line (PSystemCommandFactory.java:218-225)', () => {
  it('JSON already exists, at the `}` (jar: line 5)', () => {
    expect(refusalOf(['component J', 'json J {', '  "a": 1', '}'])).toEqual({
      line: 4,
      consumed: 4,
      message: 'JSON already exists: J',
      commandScore: 0,
    });
  });

  it('No such color, at the `}`', () => {
    expect(refusalOf(['component C', 'json J #line:red {', '  "a": 1', '}'])).toEqual({
      line: 4,
      consumed: 4,
      message: 'No such color',
      commandScore: 10,
    });
  });

  it('the closing line keeps its document position when a stripped line sat inside the block', () => {
    // `' a comment` (document line 4) never reaches the parser; the `}` is document position 5.
    expect(refusalOf(['component C', 'json J #line:red {', '  "a": 1', '}'], [1, 2, 4, 5])).toEqual({
      line: 5,
      consumed: 4,
      message: 'No such color',
      commandScore: 10,
    });
  });

  it('a single-line refusal stays on its own line', () => {
    expect(refusalOf(['component C', 'json J #line:red {"a": 1}', 'component D'])).toEqual({
      line: 2,
      consumed: 2,
      message: 'No such color',
      commandScore: 10,
    });
  });
});
