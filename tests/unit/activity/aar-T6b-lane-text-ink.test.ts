/**
 * aar-T6b: a lane's `LimitFinder` also sees the action's text, which spills past the rectangle's `x + w - 1` when the
 * box style's right padding is below 1 (`skin debug`: no padding).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/drawing/LimitFinder.java:184-188,216-226
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/Swimlanes.java:379-394
 */
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderFixtureActivity } from '../../oracle/svg-conformance/render-fixture-activity.js';

describe('swimlane width from text ink', () => {
  it('rutaji-30: lane 1 ends at the text`s right edge (divider 175.756, jar)', () => {
    const src = readFileSync('test-results/dot-cache/activity/rutaji-30-suda150/in.puml', 'utf8');
    const svg = renderFixtureActivity(src, new DeterministicMeasurer());
    expect(svg).toContain('<line x1="175.756" y1="17.722" x2="175.756"');
    expect(svg).toContain('viewBox="0 0 360 364"');
  });
});
