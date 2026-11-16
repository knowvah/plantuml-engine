/**
 * cogr T4g: a single-line `note "text" as X` keeps the leading whitespace of its first line.
 * Oracle: `test-results/dot-cache/class/gelefo-99-vexu215/in.svg`: `%retrieve_procedure('OBJ', 'foo')` returns
 * `   class Object {` + `        name : token` + ..., and the jar draws the first line at x=200.925 (three spaces,
 * 3 x 3.575, after the note's 184.2 + 6 + 10.725), as it does `}` (four spaces) at 204.5.
 * `CommandFactoryNote.java:124` builds the display with `Display.getWithNewlines` and no trim.
 */
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const measurer = new DeterministicMeasurer();
const SPACE_W13 = 3.575;

function textXs(svg: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const m of svg.matchAll(/<text x="([\d.]+)"[^>]*>([^<]+)</g)) out[m[2]!] = Number(m[1]);
  return out;
}

describe('single-line freestanding note keeps first-line indentation (cogr T4g)', () => {
  it('indents the first line by its leading spaces, like the second', () => {
    const xs = textXs(renderSync('@startuml\nnote "   a\\n    b" as n1\n@enduml', { measurer }));
    expect(xs['b']! - xs['a']!).toBeCloseTo(SPACE_W13, 3);
  });

  it('draws the %retrieve_procedure note lines at the jar x values', () => {
    const puml = readFileSync('test-results/dot-cache/class/gelefo-99-vexu215/in.puml', 'utf8');
    const xs = textXs(renderSync(puml, { measurer }));
    expect(xs['class Object {']).toBeCloseTo(200.925, 3);
    expect(xs['name : token']).toBeCloseTo(218.8, 3);
    expect(xs['}']).toBeCloseTo(204.5, 3);
  });
});
