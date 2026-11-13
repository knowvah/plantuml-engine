/**
 * sogr T1a: `CommandArrow`'s regex is built with `.protectSize(2000)`
 * (`CommandArrow.java:133`), and `RegexConcat.match` returns false for a
 * (trimmed, `SingleLineCommand2.java:56-57,93,102`) line longer than that
 * (`RegexConcat.java:129-130`). Jar-probed with `scripts/oracle-render.sh`:
 * `A <1995 dashes>> B` (2000 chars) draws a SEQUENCE A -> B, while one more
 * dash (2001 chars) is declined by every sequence command and the jar falls
 * through to a CLASS diagram.
 */
import { describe, expect, it } from 'vitest';
import { DRESSED_ARROW_RE, UNDRESSED_ARROW_RE } from '../../../src/diagrams/sequence/sequence-arrow-compose.js';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

/** `CommandArrow.java:133`. */
const LIMIT_SIZE = 2000;
/** `A ` + dashes + `> B` is the dash count plus 5 characters. */
const arrowLine = (length: number): string => `A ${'-'.repeat(length - 5)}> B`;
const diagramType = (line: string): string | undefined =>
  /data-diagram-type="([A-Z]+)"/.exec(
    renderSync(`@startuml\n${line}\n@enduml\n`, { measurer: new DeterministicMeasurer() }),
  )?.[1];

describe('CommandArrow protectSize(2000)', () => {
  it('matches a line of exactly the limit', () => {
    expect(arrowLine(LIMIT_SIZE)).toHaveLength(LIMIT_SIZE);
    expect(UNDRESSED_ARROW_RE.exec(arrowLine(LIMIT_SIZE))?.groups?.['PART2CODE']).toBe('B');
    expect(DRESSED_ARROW_RE.test(`A <${'-'.repeat(LIMIT_SIZE - 5)} B`)).toBe(true);
  });

  it('declines a line one character over the limit, dressed or not', () => {
    expect(UNDRESSED_ARROW_RE.exec(arrowLine(LIMIT_SIZE + 1))).toBeNull();
    expect(UNDRESSED_ARROW_RE.test(arrowLine(LIMIT_SIZE + 1))).toBe(false);
    expect(DRESSED_ARROW_RE.test(`A <${'-'.repeat(LIMIT_SIZE - 4)} B`)).toBe(false);
  });

  it('declines a 65838-character arrow without backtracking over it (borala-01-tepu803)', () => {
    expect(UNDRESSED_ARROW_RE.exec(`p ${'-'.repeat(65835)}>`)).toBeNull();
  });

  it('routes the 2001-character line away from sequence, as the jar does', () => {
    expect(diagramType(arrowLine(LIMIT_SIZE))).toBe('SEQUENCE');
    expect(diagramType(arrowLine(LIMIT_SIZE + 1))).not.toBe('SEQUENCE');
  });
});
