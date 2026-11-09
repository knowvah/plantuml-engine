/**
 * aar-T6b: `<back:c1/c2>` gradient patch under the text run.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/drawing/svg/DriverTextSvg.java:160-171
 */
import { describe, it, expect } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderFixtureActivity } from '../../oracle/svg-conformance/render-fixture-activity.js';

describe('DriverTextSvg HColorGradient BACKCOLOR arm', () => {
  it('cedero-01: <back:#FF9999/white> draws a 12px gradient rect before the run', () => {
    const svg = renderFixtureActivity(
      '@startuml\n:hello <back:#FF9999/white>there1</back>;\n@enduml',
      new DeterministicMeasurer(),
    );
    expect(svg).toMatch(/<linearGradient[^>]*x1="0%" y1="0%" x2="100%" y2="100%"/);
    expect(svg).toMatch(/<rect [^>]*height="12" fill="url\(#g[a-z0-9]+0\)"[^>]*\/><text[^>]*>there1</);
    expect(svg).toContain('stop-color="#F99"');
  });
});
