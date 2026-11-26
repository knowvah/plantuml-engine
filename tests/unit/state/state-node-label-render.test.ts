/**
 * snl T4 (#235, D4): the label leaf draws as `EntityImageTransitionLabel` (no entity group, unfilled frame, centred
 * text) and its two links carry upstream's decors, ids and types. Expected values are the jar's
 * (`tests/fixtures/state-node-label/snl-issue.svg`, `snl-left.svg`).
 */
import { describe, expect, it } from 'vitest';

import { withJarCompatibleStyleInput } from '../../../src/core/internal-render-options.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderSync } from '../../../src/index.js';

/** Raw comment bodies: `svgComments` would normalise the clock digits (snl D2). */
function rawComments(svg: string): string[] {
  return [...svg.matchAll(/<!--([\s\S]*?)-->/g)].map((m) => m[1]!);
}

function render(arrow: string): string {
  const src = ['@startuml', 'skinparam stateDiagramEdgeLabelStyle node', 'state A', 'state B', arrow, '@enduml'];
  return renderSync(src.join('\n'), withJarCompatibleStyleInput({ measurer: new DeterministicMeasurer() }));
}

describe('snl T4: the label leaf', () => {
  const svg = render('A --> B : go');

  it('draws the jar frame and centred text, outside any entity group', () => {
    expect(svg).toContain(
      '<rect x="20.77" y="117" width="22.462" height="21" fill="none" stroke="none" rx="2.5" ry="2.5"/>',
    );
    expect(svg).toMatch(/<text x="24\.77" y="131\.111"[^>]*>go<\/text>/);
    expect(svg.match(/<g class="entity"/g)).toHaveLength(2);
  });

  it('link 1 is an association with no head, link 2 a dependency with the arrow', () => {
    expect(svg).toMatch(/id="lnk4"[^>]*data-link-type="association"/);
    expect(svg).toMatch(/id="lnk5"[^>]*data-link-type="dependency"/);
    expect(svg).toContain('id="A-transition_A_B__go__0"');
    expect(svg).toContain('id="transition_A_B__go__0-to-B"');
    expect(svg.match(/<polygon/g)).toHaveLength(1);
    expect(rawComments(svg)).toEqual(['link A to transition_A_B__go__0', 'link transition_A_B__go__0 to B']);
  });
});

describe('snl T4: -left-> inverts both links', () => {
  it('writes the jar ids and the reverse comment', () => {
    const svg = render('A -left-> B : go');
    expect(svg).toContain('id="transition_A_B__go__0-A"');
    expect(svg).toContain('id="B-backto-transition_A_B__go__0"');
    expect(rawComments(svg)).toEqual(['link transition_A_B__go__0 to A', 'reverse link B to transition_A_B__go__0']);
  });
});
