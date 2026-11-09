/**
 * aar-T3c, item 16: `FtileGroup#getInLinkRendering` is the inner's, so the arrow into a group takes the colour of the
 * group body's first arrow.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/vcompact/FtileGroup.java:124-126
 */
import { describe, it, expect } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderFixtureActivity } from '../../oracle/svg-conformance/render-fixture-activity.js';

describe('FtileGroup#getInLinkRendering', () => {
  it('groupin-group: the edge from start into the group is blue', () => {
    const svg = renderFixtureActivity(
      '@startuml\nstart\ngroup G\n-[#blue]->\n:a;\nend group\nstop\n@enduml',
      new DeterministicMeasurer(),
    );
    expect(svg).toMatch(/<line[^>]*stroke="#00F"/);
  });
});
