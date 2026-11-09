/**
 * laep T3b-3: `skinparam activityShape octagon` draws the polygon graphviz computed for the node
 * (`EntityImageActivity#drawOctagon`, `EntityImageActivity.java:108-118`; `SvekNode#setPolygon`).
 * Jar values: the cached rows `activity/japasi-25-pomo480` and `activity/nikezu-09-lovu442`.
 */
import { describe, expect, it } from 'vitest';

import { rowSource } from '../../helpers/legacy-activity-dot.js';
import { renderLegacy, rowDiffs } from '../../helpers/legacy-activity-render.js';

/** The first activity of japasi-25's oracle, `<polygon points=...>` (jar `in.svg`). */
const FIRST_OCTAGON_POINTS =
  '233.924,63.63,233.924,50.37,201.904,41,156.624,41,124.604,50.37,124.604,63.63,156.624,73,201.904,73,233.924,63.63';

describe('octagon activities', () => {
  it('draws the first node of japasi-25 with the jar polygon points', () => {
    const svg = renderLegacy(rowSource('activity', 'japasi-25-pomo480'));
    expect(svg).toContain(`<polygon points="${FIRST_OCTAGON_POINTS}"`);
    expect(svg).not.toContain('rx="12.5"');
  });

  for (const slug of ['japasi-25-pomo480', 'nikezu-09-lovu442'])
    it(`activity/${slug}: no SVG diff`, () => {
      expect(rowDiffs('activity', slug)).toEqual([]);
    });
});
