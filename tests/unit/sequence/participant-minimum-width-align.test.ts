/**
 * Upstream `54cbdd6e59e` (forum 20505): when `MinimumWidth` (or `skinparam
 * minClassWidth`) widens a participant box past its text, the text block is
 * shifted by `HorizontalAlignment#getPosition(textWidth, textWidth + extra)`
 * inside the extra room (`ComponentRoseParticipant.java:114-121`), instead of
 * sticking to the left padding.
 *
 * Expected x values are the jar's (`scripts/oracle-render.sh`, 1.2026.11beta1,
 * 2026-11-19).
 */
import { describe, expect, it } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderFixtureSequence } from '../../oracle/svg-conformance/render-fixture-sequence.js';

/** The x of each head-row text, by its content (first occurrence: the head row). */
function headTextX(lines: readonly string[]): Record<string, number> {
  const svg = renderFixtureSequence(['@startuml', ...lines, '@enduml', ''].join('\n'), new DeterministicMeasurer());
  const out: Record<string, number> = {};
  for (const m of svg.matchAll(/<text x="([\d.]+)"[^>]*>([^<]*)<\/text>/g)) out[m[2]!] ??= Number(m[1]);
  return out;
}

const STYLED = (align: string): string[] => [
  '<style>',
  'participant {',
  '  MinimumWidth 200',
  `  HorizontalAlignment ${align}`,
  '}',
  '</style>',
];

describe('participant text inside a MinimumWidth box (ComponentRoseParticipant.java:114-121)', () => {
  it('centres the block by default, multi-line names and stereotypes included', () => {
    const x = headTextX([
      'skinparam minClassWidth 200',
      'participant "Alice" as A',
      'participant "two\\nlines here" as B <<st>>',
      'A -> B : hi',
    ]);
    expect(x).toMatchObject({ Alice: 101.775, '«st»': 327.788, two: 330.106, 'lines here': 310.638 });
  });

  it('pushes the block to the right edge under HorizontalAlignment right', () => {
    const x = headTextX([
      ...STYLED('right'),
      'participant Alice',
      'participant "two\\nlines here" as B',
      'Alice -> B : hi',
    ]);
    expect(x).toMatchObject({ Alice: 186.55, two: 419.212, 'lines here': 380.275 });
  });

  it('leaves the block at the left padding under HorizontalAlignment left', () => {
    expect(headTextX([...STYLED('left'), 'participant Alice', 'Alice -> Alice : hi'])).toMatchObject({ Alice: 17 });
  });
});
