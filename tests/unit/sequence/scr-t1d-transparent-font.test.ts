/**
 * scr-T1d -- a transparent `FontColor` is measured but never written: `DriverTextSvg.java:92-93` returns before any
 * `<text>` when `fontConfiguration.getColor().isTransparent()`. Expected values are read off the jar's
 * `sequence__transparent-font*` oracles in `tests/fixtures/diagram-style-scope/`.
 */
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const DIR = 'tests/fixtures/diagram-style-scope';

function facts(svg: string): { texts: string[]; width: string | undefined } {
  return {
    texts: [...svg.matchAll(/<text[^>]*>([^<]*)</g)].map((m) => m[1] ?? ''),
    width: /<svg[^>]* width="([^"]*)"/.exec(svg)?.[1],
  };
}

describe('sequence FontColor transparent: measured, not drawn', () => {
  it.each([
    ['sequence__transparent-font', 0],
    ['sequence__transparent-font-note', 4],
    ['sequence__transparent-font-participant', 0],
    ['sequence__transparent-font-arrow', 4],
  ])('%s writes the jar texts (%i) at the jar width', (row, count) => {
    const ours = facts(
      renderSync(readFileSync(`${DIR}/${row}.puml`, 'utf8'), { measurer: new DeterministicMeasurer() }),
    );
    const jar = facts(readFileSync(`${DIR}/${row}.svg`, 'utf8'));
    expect(jar.texts).toHaveLength(count);
    expect(ours).toEqual(jar);
  });
});
