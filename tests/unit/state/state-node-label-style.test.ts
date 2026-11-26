/**
 * snl T5 (#235, D4): the label's font colour is the merged arrow style with the leaf's `<<transition>>` stereotype
 * (`EntityImageTransitionLabel.java:65-70`); the transition's own stereotype never reaches it (`:323-386`). Expected
 * colours are the jar's (`snl-pf-transition-stereo-style.svg`, `snl-stereotype.svg`, `snl-skinparam-font.svg`).
 */
import { describe, expect, it } from 'vitest';

import { withJarCompatibleStyleInput } from '../../../src/core/internal-render-options.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderSync } from '../../../src/index.js';

function labelText(lines: readonly string[]): string {
  const src = [
    '@startuml',
    ...lines,
    'skinparam stateDiagramEdgeLabelStyle node',
    'state A',
    'state B',
    'A --> B : go',
  ];
  const svg = renderSync(
    [...src, '@enduml'].join('\n'),
    withJarCompatibleStyleInput({ measurer: new DeterministicMeasurer() }),
  );
  return svg.match(/<text[^>]*>go<\/text>/)![0];
}

describe('snl T5: the label font', () => {
  it('takes the <<transition>> tier: .transition { FontColor blue }', () => {
    expect(labelText(['<style>', '.transition {', '  FontColor blue', '}', '</style>'])).toContain('fill="#00F"');
  });

  it('takes the arrow skinparams: ArrowFontColor red, ArrowFontSize 18', () => {
    const text = labelText(['skinparam ArrowFontColor red', 'skinparam ArrowFontSize 18']);
    expect(text).toContain('fill="#F00"');
    expect(text).toContain('font-size="18"');
    expect(text).toContain('textLength="20.025"');
  });

  it('defaults to the arrow font: #000 at 13', () => {
    const text = labelText([]);
    expect(text).toContain('fill="#000"');
    expect(text).toContain('font-size="13"');
  });
});
