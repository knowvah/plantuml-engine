import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';

/**
 * stdd T3c: a non-autonom composite is `Cluster#drawUState` (`Cluster.java:450-510`) over a
 * `RoundedContainer` (`RoundedContainer.java:78-100`): `nameHeight` is the title block's
 * height + `MARGIN`, `descriptionHeight` the attribute block's height + `MARGIN` when there is
 * one, the centre zone a rect stroked in its own colour (`drawCenter`, `UStroke.simple()`),
 * a second hline under it, the title centred per line (`state.name { HorizontalAlignment
 * center }`, `plantuml.skin:282-285`), the attribute at `(minX + MARGIN, minY + nameHeight +
 * MARGIN/2)`. A `#colour` on the group is `north`, `center` and `south` at once
 * (`Cluster.java:459-461`), so the south path is drawn. A leaf's name block is aligned by the
 * `state` style (`EntityImageStateCommon.java:75-78`), `root { HorizontalAlignment left }`
 * (`plantuml.skin:12`): lines sit at the block's left, the block centred in the box
 * (`EntityImageState.java:150-152`). Values are the jar's `in.svg`.
 */

const CACHE = 'test-results/dot-cache/state';
const measurer = new DeterministicMeasurer();

function render(slug: string): string {
  const puml = readFileSync(`${CACHE}/${slug}/in.puml`, 'utf8');
  return renderSync(puml, { measurer, jarCompatibleStyleInput: true } as Parameters<typeof renderSync>[1]);
}

function diffs(slug: string): unknown[] {
  return compareSvg(render(slug), readFileSync(`${CACHE}/${slug}/in.svg`, 'utf8'), 'deterministic').diffs;
}

describe('stdd T3c: a composite draws its description and zones', () => {
  it('kacifo-58: `comp1: entry / do_entry()` is a centre zone with its own rect, hline and text', () => {
    const svg = render('kacifo-58-dale036');
    expect(svg).toContain(
      '<rect x="7" y="58.611" width="116" height="19" fill="#F1F1F1" stroke="#F1F1F1" stroke-width="1"/>',
    );
    expect(svg).toContain('<line x1="7" y1="77.611" x2="123" y2="77.611" stroke="#181818" stroke-width="0.5"/>');
    expect(svg).toMatch(/<text x="12" y="72" [^>]*textLength="106.313">entry \/ do_entry\(\)<\/text>/);
    expect(diffs('kacifo-58-dale036')).toEqual([]);
  });

  it('mivelu-58: `#green` on the group fills the north and the south zones', () => {
    const svg = render('mivelu-58-julo307');
    expect(svg.match(/fill="#008000"/g)).toHaveLength(2);
    expect(svg).toContain('<path d="M7,69 L115,69 L115,232.5 A12.5,12.5 0 0 1 102.5,245');
    expect(diffs('mivelu-58-julo307')).toEqual([]);
  });

  it('sosoxe-55: a three-line title puts the divider at 7 + 3*14 + MARGIN', () => {
    const svg = render('sosoxe-55-demi451');
    expect(svg).toContain('<line x1="7" y1="54" x2="133" y2="54"');
    expect(svg).toMatch(/<text x="57.531" y="35.889" [^>]*>with<\/text>/);
    expect(diffs('sosoxe-55-demi451')).toEqual([]);
  });

  it('dapuko-98: a two-line leaf name is left-aligned inside its centred block', () => {
    const svg = render('dapuko-98-zuzo096');
    expect(svg).toMatch(/<text x="29" y="72.889" [^>]*>search input<\/text>/);
    expect(diffs('dapuko-98-zuzo096')).toEqual([]);
  });

  it('resido-15: `<<O-O>>` on a cluster draws the symbol at its bottom-right corner', () => {
    const svg = render('resido-15-reza040');
    expect(svg).toContain(
      '<ellipse cx="217" cy="184.331" rx="3" ry="3" fill="none" stroke="#181818" stroke-width="1"/>',
    );
    expect(svg).toContain('<line x1="220" y1="184.331" x2="223" y2="184.331" stroke="#181818" stroke-width="1"/>');
  });

  it('pesita-10: `State AA <<O-O>>` then `state AA {` -- the `{` line resets the stereotype to none', () => {
    // `CommandCreatePackageState.java:178-179`, `Stereogroup.java:94-97`.
    const svg = render('pesita-10-dene726');
    expect(svg).not.toMatch(/rx="3" ry="3"/);
    expect(diffs('pesita-10-dene726').filter((d) => String((d as { p: string }).p).includes('childCount'))).toEqual([]);
  });

  it('xipela-98: `StateBackgroundColor transparent` draws no north zone (`RoundedNorth.java:65-66`)', () => {
    const cluster = /<g class="cluster"[^>]*>(.*?)<\/g>/s.exec(render('xipela-98-nuvu593'))![1]!;
    expect(cluster.startsWith('<rect x="7" y="39.611" width="83" height="132.72" fill="none"')).toBe(true);
    expect(cluster).not.toContain('<path');
  });
});
