import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

/**
 * stdd T3b: a state box's stroke is `EntityImageStateCommon.getStyleState(...).getStroke()`
 * (`EntityImageState.java:130`, `Style.java:299-305`: `LineThickness` merged over
 * `{root, element, stateDiagram, state}`), a cluster's the same (`Cluster.java:480-484`),
 * the start and end circles read `{root, element, stateDiagram, circle, start|end}`
 * (`EntityImageCircleStart.java:56-64`, `CircleStart.java:82`). `StyleStorage#computeMergedStyle`
 * merges declarations in registration order, so a later `root { LineThickness 1 }` (the plain
 * theme) overrides the skin's `element { LineThickness 0.5 }` (`plantuml.skin:91-93`). Values
 * are the jar's `in.svg`.
 */

const CACHE = 'test-results/dot-cache/state';
const measurer = new DeterministicMeasurer();

function render(slug: string): string {
  const puml = readFileSync(`${CACHE}/${slug}/in.puml`, 'utf8');
  return renderSync(puml, { measurer, jarCompatibleStyleInput: true } as Parameters<typeof renderSync>[1]);
}

const widths = (svg: string): Record<string, number> => {
  const out: Record<string, number> = {};
  for (const m of svg.matchAll(/stroke-width[=:]"?([0-9.]+)/g)) out[m[1]!] = (out[m[1]!] ?? 0) + 1;
  return out;
};

describe('stdd T3b: LineThickness from the state and circle styles', () => {
  it('masofa-52: `stateDiagram { start, end { LineThickness 2.5 } }` reaches both circles', () => {
    const svg = render('masofa-52-puli433');
    expect(svg.match(/<g class="start_entity"[^>]*><ellipse [^>]*stroke-width="2.5"/)).not.toBeNull();
    expect(svg.match(/<g class="end_entity"[^>]*><ellipse [^>]*stroke-width="2.5"/)).not.toBeNull();
    expect(widths(svg)['2.5']).toBe(2);
  });

  it('tacufe-37: the same declarations at the top level', () => {
    expect(widths(render('tacufe-37-fono831'))['2.5']).toBe(2);
  });

  it('taluke-81: `LineThickness 5` on start, state and end', () => {
    const svg = render('taluke-81-noxa842');
    expect(svg.match(/<g class="entity"[^>]*><rect [^>]*stroke-width="5"/)).not.toBeNull();
    expect(svg.match(/<line [^>]*stroke-width="5"/)).not.toBeNull();
    expect(widths(svg)['5']).toBe(4);
    expect(widths(svg)['0.5']).toBeUndefined();
  });

  it('sugico-41: `!theme plain` puts `root { LineThickness 1 }` after the skin, so a box draws 1', () => {
    const svg = render('sugico-41-vase848');
    expect(svg.match(/<g class="entity"[^>]*><rect [^>]*stroke-width="1"/)).not.toBeNull();
    expect(widths(svg)['0.5']).toBeUndefined();
  });

  it('the default theme keeps the skin element thickness 0.5 on a box', () => {
    const svg = render('jotini-12-fuba072');
    expect(svg.match(/data-qualified-name="s1"[^>]*><rect [^>]*stroke-width="0.5"/)).not.toBeNull();
  });
});
