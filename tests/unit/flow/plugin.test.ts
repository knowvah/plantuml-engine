/**
 * `@startflow` through `renderSync`: the plugin at `PSystemBuilder.java:185`,
 * the `TitledDiagram` exporter, and the error pages for the jar's errors.
 */
import { describe, expect, it } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

function render(body: string): string {
  return renderSync(`@startflow\n${body}\n@endflow`, { measurer: new DeterministicMeasurer() });
}

describe('flow plugin', () => {
  it('draws cov-single as a FLOW document 201x71 on a white background', () => {
    const svg = render('10 "START"');
    expect(svg).toContain('data-diagram-type="FLOW"');
    expect(svg).toContain('width="201px" height="71px" viewBox="0 0 201 71"');
    expect(svg).toContain('background:#FFFFFF;');
    expect(svg).toContain(
      '<text x="76.987" y="38.889" fill="#000" font-size="14" textLength="46.025" font-family="serif">START</text>',
    );
  });

  it('jiggles the strokes under !option handwritten (cov-option-handwritten)', () => {
    const hand = renderSync('@startflow\n!option handwritten true\n10 "A"\ns 20 "B"\n@endflow', {
      measurer: new DeterministicMeasurer(),
    });
    expect(hand).toContain('data-diagram-type="FLOW"');
    expect(hand).not.toContain('<rect');
    expect(hand).toContain('<path d="M100,52');
  });

  it.each([
    ['cov-blank-line', '10 "A"\n\ns 20 "B"'],
    ['cov-title', 'title T\n10 "A"'],
    ['cov-link-unknown', '10 "A"\ns 99'],
    ['cov-collision-vertical', '10 "A"\ns 20 "B"\nn 30 "C"'],
  ])('renders an error page, not a FLOW diagram, for %s', (_slug, body) => {
    const svg = render(body);
    expect(svg).not.toContain('data-diagram-type="FLOW"');
    expect(svg).toContain('<svg');
  });
});
