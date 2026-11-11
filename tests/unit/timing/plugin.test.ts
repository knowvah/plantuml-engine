/** T4a: the timing plugin registered at `PSystemBuilder.java:187`, driven through the production `renderSync`. */
import { describe, expect, it } from 'vitest';

import { upstreamTypeOf } from '../../../src/core/block-extractor.js';
import { DEFAULT_CLOCK } from '../../../src/core/clock.js';
import { withClock } from '../../../src/core/internal-render-options.js';
import { renderSync } from '../../../src/index.js';
import { diagramOf, ORACLE_ZONE, probeText } from './helpers/factory.js';

const TIMING_TYPE = 'data-diagram-type="TIMING"';
const CHICAGO_CLOCK = { nowMillis: () => 0, zone: ORACLE_ZONE };

function sizeOf(svg: string): string {
  const m = /style="width:(\d+)px;height:(\d+)px/.exec(svg);
  return `${m?.[1]}x${m?.[2]}`;
}

function bodyTexts(svg: string): string[] {
  return [...svg.matchAll(/>([^<]*)<\/text>/g)].map((m) => m[1]!);
}

describe('timingPlugin through renderSync', () => {
  it('draws cov-concise-basic as TIMING at 251 x 106', () => {
    const svg = renderSync(probeText('cov-concise-basic'));
    expect(svg).toContain(TIMING_TYPE);
    expect(sizeOf(svg)).toBe('251x106');
  });

  it('chromes cov-chrome-all at 151 x 229', () => {
    expect(sizeOf(renderSync(probeText('cov-chrome-all')))).toBe('151x229');
  });

  it('draws the timing diagram inside the note of cov-embedded at 276 x 223', () => {
    expect(sizeOf(renderSync(probeText('cov-embedded')))).toBe('276x223');
  });

  it('treats @starttiming as unknown (D10): an error page, not a timing diagram', () => {
    const svg = renderSync(probeText('cov-starttiming-tag'));
    expect(svg).not.toContain(TIMING_TYPE);
    expect(bodyTexts(svg)).toContain('Error: unknown diagram type');
  });

  it('labels the date ticks in the clock zone (D4)', () => {
    const text = probeText('cov-date-format');
    expect(bodyTexts(renderSync(text, withClock({}, CHICAGO_CLOCK)))).toEqual(['C', 'A', 'B', '20-07-03', '20-07-09']);
    expect(bodyTexts(renderSync(text, withClock({}, DEFAULT_CLOCK)))).toEqual(['C', 'A', 'B', '20-07-04', '20-07-10']);
  });

  it('renders the Julian-date crash as an error page without throwing', () => {
    const svg = renderSync(probeText('cov-date-julian'));
    expect(svg).not.toContain(TIMING_TYPE);
    expect(bodyTexts(svg)).toContain('java.lang.IllegalStateException');
  });

  it('renders an unknown player as an error page assumed to be timing', () => {
    const svg = renderSync(probeText('cov-unknown-player'));
    expect(bodyTexts(svg)).toContain('Unknown "X" (Assumed diagram type: timing)');
  });

  it('names TIMING upstream for the port key', () => {
    expect(upstreamTypeOf('timing')).toBe('TIMING');
  });

  it('reads skinparam handwritten through isHandwritten', () => {
    const body = 'concise "C" as C\n@0\nC is A\n';
    expect(diagramOf(`@startuml\n${body}@enduml`).isHandwritten()).toBe(false);
    expect(diagramOf(`@startuml\nskinparam handwritten true\n${body}@enduml`).isHandwritten()).toBe(true);
  });
});
