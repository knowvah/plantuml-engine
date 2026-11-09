/**
 * aar-T6b: `skinparam arrow { MessageAlign .. }` (key `arrowMessageAlign` -> `arrowMessageAlignment`,
 * `SkinParam.java:283-290`) aligns every activity arrow label (`AbstractFtile.java:108-110`). Jar values from the
 * cached oracle of gelizi-30-kole759 (center) and zifaza-86-tigo119 (right).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/skin/SkinParam.java:671-728
 */
import { describe, it, expect } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { arrowMessageAlignmentOf } from '../../../src/core/arrow-message-alignment.js';
import { renderFixtureActivity } from '../../oracle/svg-conformance/render-fixture-activity.js';

const render = (align: string): string =>
  renderFixtureActivity(
    `@startuml\nskinparam arrow {\n    MessageAlign ${align}\n}\n\n|Customer|\n|Sales|\n:**SEND** report\nto customer;\n` +
      '->in big envelop;\n|Customer|\n:**RECEIVE** report;\n-> by mail;\n|Sales|\n:**RECEIVE** ack;\n@enduml',
    new DeterministicMeasurer(),
  );

describe('arrowMessageAlignment', () => {
  it('center places the labels at the jar x', () => {
    const svg = render('center');
    expect(svg).toContain('<text x="101.262"');
    expect(svg).toContain('<text x="117.797"');
  });
  it('right places the labels at the jar x', () => {
    const svg = render('right');
    expect(svg).toContain('<text x="118.837"');
    expect(svg).toContain('<text x="40.831"');
  });
  it('resolves first/direction/unknown to the LEFT default', () => {
    for (const v of ['first', 'direction', 'reverseDirection', 'bogus'])
      expect(arrowMessageAlignmentOf(new Map([['arrowMessageAlign', v]]))).toBe('LEFT');
    expect(arrowMessageAlignmentOf(new Map([['ArrowMessageAlignment', 'Right']]))).toBe('RIGHT');
  });
});
