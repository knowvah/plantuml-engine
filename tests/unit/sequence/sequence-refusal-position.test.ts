/**
 * laep T3c: the sequence refusal carries the failing line's position in the WHOLE source (`@startuml` is line 0), as
 * class, state and legacy activity do, because upstream's `it.getTrace()` counts the start line and every engine's trace
 * is compared in the max-score tie-break (`PSystemCommandFactory.java:169-175`, `PSystemErrorUtils.java:140-147`).
 * Index into `source.lines` made sequence lose the tie it wins in the jar (ufp follow-on, `next-missions.md`).
 */
import { describe, expect, it } from 'vitest';
import { buildBlockUmls } from '../../../src/core/BlockUmlBuilder.js';
import { parseSequence } from '../../../src/diagrams/sequence/parser.js';
import { parseRefusalOf } from '../../../src/core/parse-refusal.js';

describe('sequence refusal position', () => {
  it('a first-body-line syntax error is at position 1, consumed 1', () => {
    const block = buildBlockUmls('@startuml\n(*) --> [[http://example.com]] A\n@enduml')[0]!;
    if (!block.ok) throw new Error('preprocessor failure');
    const refusal = parseRefusalOf(parseSequence(block.source));
    expect(refusal).toMatchObject({ kind: 'syntax', line: 1, consumed: 1 });
  });
});
