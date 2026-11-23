/**
 * plantuml#3028, upstream `b066ee08c`: time-axis labels that come within `LABEL_GAP` of the previously kept one are
 * skipped, break-edge labels always kept (`TimingRuler.java:404-469`), and a state label that overflows its band is
 * drawn only when it stays `LABEL_GAP` away from every other state label (`PanelsState.java:240-305`).
 *
 * Sources are upstream's `vega/nonreg/group3028` cases, copied verbatim as `tests/fixtures/timing/vega-3028-*.puml`;
 * the `.svg` beside each is the jar's (`scripts/oracle-render.sh`, oracle b066ee08c, 2026-11-23).
 */
import { describe, expect, it } from 'vitest';

import { compareSvg } from '../../oracle/svg-conformance/compare.js';
import {
  readAuthoredTimingFixture,
  renderFixtureTiming,
  timingClockFor,
} from '../../oracle/svg-conformance/render-fixture-timing.js';

function render(slug: string): { ours: string; golden: string } {
  const { markup, golden } = readAuthoredTimingFixture(slug);
  return { ours: renderFixtureTiming(markup, undefined, timingClockFor(slug)), golden: golden! };
}

/** The text of every `<text>` element, in drawing order. */
function texts(svg: string): string[] {
  return [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]!);
}

describe('time-axis and state labels that collide are skipped (#3028)', () => {
  it('close_events: drops "500"/"501" from the axis and the overflowing "Busy"', () => {
    const { ours } = render('vega-3028-close-events');
    expect(texts(ours)).not.toContain('Busy');
    expect(texts(ours).filter((t) => /^\d+$/.test(t))).not.toContain('500');
  });

  it('overflow_without_neighbour: keeps an overflowing label with nothing around it', () => {
    const { ours } = render('vega-3028-overflow-without-neighbour');
    expect(texts(ours)).toContain('VeryLongStateName');
  });

  for (const slug of [
    'vega-3028-break-close-events',
    'vega-3028-close-events',
    'vega-3028-manual-axis-codes',
    'vega-3028-neighbours-fit',
    'vega-3028-overflow-without-neighbour',
    'vega-3028-rectangle-close-events',
  ]) {
    it(`${slug}: zero-diff against the jar`, () => {
      const { ours, golden } = render(slug);
      expect(compareSvg(ours, golden, 'deterministic').diffs).toEqual([]);
    });
  }
});
