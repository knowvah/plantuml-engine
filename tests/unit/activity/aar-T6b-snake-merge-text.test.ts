/**
 * aar-T6b: `Snake#merge` refuses when the NEWLY pushed snake carries text, whichever end touches.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/Snake.java:303-327
 */
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderFixtureActivity } from '../../oracle/svg-conformance/render-fixture-activity.js';

describe('Snake#merge text guard', () => {
  it('zovacu-12: the labelled callback snake stays apart from the if`s blue snake, drawn after it', () => {
    const src = readFileSync('test-results/dot-cache/activity/zovacu-12-zate765/in.puml', 'utf8');
    const svg = renderFixtureActivity(src, new DeterministicMeasurer());
    const labelledVertical = svg.indexOf('<line x1="124.2" y1="87" x2="124.2" y2="113"');
    const ifHorizontal = svg.indexOf('<line x1="124.2" y1="113" x2="37" y2="113"');
    expect(ifHorizontal).toBeGreaterThan(-1);
    expect(labelledVertical).toBeGreaterThan(ifHorizontal);
  });

  it('zovacu-12: FtileIfLongHorizontal ConnectionIn takes the if`s in-link colour (topInColor)', () => {
    const src = readFileSync('test-results/dot-cache/activity/zovacu-12-zate765/in.puml', 'utf8');
    const svg = renderFixtureActivity(src, new DeterministicMeasurer());
    expect(svg).toContain('<line x1="124.2" y1="113" x2="37" y2="113" stroke="#00F"');
  });
});
