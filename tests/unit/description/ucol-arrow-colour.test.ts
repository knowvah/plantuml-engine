/**
 * ucol T3a (issue #145, M1): description's arrow-style token is `getColorOrWhite` (`CommandLinkElement.java:330` ->
 * `WithLinkType.java:161-163`). Expected values are the jar's, from `tests/fixtures/unresolved-colour/comp-arrow*.svg`.
 */
import { describe, it, expect } from 'vitest';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const render = (body: string): string =>
  renderSync(`@startuml\n${body}\n@enduml\n`, { measurer: new DeterministicMeasurer() });
const tags = (svg: string, name: string): string[] =>
  [...svg.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'g'))].map((m) => m[0]);

describe('description arrow-style colour (M1, T3a)', () => {
  it('[A] -[#zzblue]-> [B] draws the link and its head #FFF', () => {
    const svg = render('[A] -[#zzblue]-> [B]');
    expect(tags(svg, 'path').find((p) => p.includes('id="A-to-B"'))).toContain('stroke:#FFF;');
    expect(tags(svg, 'polygon').at(-1)).toContain('fill="#FFF"');
  });

  it('-[#zzblue,dashed]-> is #FFF and dashed', () => {
    const link = tags(render('[A] -[#zzblue,dashed]-> [B]'), 'path').find((p) => p.includes('id="A-to-B"'));
    expect(link).toContain('stroke:#FFF;');
    expect(link).toContain('stroke-dasharray:7,7;');
  });

  it('[A] -[#red]-> [B] keeps red', () => {
    expect(tags(render('[A] -[#red]-> [B]'), 'path').find((p) => p.includes('id="A-to-B"'))).toContain('stroke:#F00;');
  });
});
