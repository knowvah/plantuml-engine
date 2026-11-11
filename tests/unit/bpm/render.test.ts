/**
 * `@startbpm` through `renderSync`: the plugin at `PSystemBuilder.java:141`,
 * the `TitledDiagram` exporter, and the error pages for the jar's crashes.
 */
import { describe, expect, it } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

function render(body: string): string {
  return renderSync(`@startbpm\n${body}\n@endbpm`, { measurer: new DeterministicMeasurer() });
}

describe('bpm plugin', () => {
  it('draws bibuka-01 as a BPM document 146x83 on a white background', () => {
    const svg = render(':login;');
    expect(svg).toContain('data-diagram-type="BPM"');
    expect(svg).toContain('width="146px" height="83px" viewBox="0 0 146 83"');
    expect(svg).toContain('background:#FFFFFF;');
    expect(svg).toContain('<text x="85" y="44.333" fill="#000" font-size="12" textLength="25.425">login</text>');
  });

  it('jiggles the strokes under !option handwritten (cov-option-handwritten)', () => {
    const plain = render(':a;');
    const hand = renderSync('@startbpm\n!option handwritten true\n:a;\n@endbpm', {
      measurer: new DeterministicMeasurer(),
    });
    expect(hand).toContain('data-diagram-type="BPM"');
    expect(hand).not.toBe(plain);
    expect(hand).toContain('<path');
  });

  it('draws the debug rectangle under !option debug true (cov-option-debug)', () => {
    const svg = renderSync('@startbpm\n!option debug true\n:a;\n@endbpm', { measurer: new DeterministicMeasurer() });
    expect(svg).toContain('fill="none" style="stroke:#00F;stroke-width:2;"');
  });

  it.each([
    ['cov-else-orphan', ':a;\nelse'],
    ['cov-resume-unknown', ':a;\nresume nope'],
    ['cov-blank-lines', ':a;\n\n:b;'],
  ])('renders an error page, not a BPM diagram, for %s', (_slug, body) => {
    const svg = render(body);
    expect(svg).not.toContain('data-diagram-type="BPM"');
    expect(svg).toContain('<svg');
  });
});
