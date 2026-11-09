/**
 * aar-T4b: a group frame's style re-signed with its stereotype.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/vcompact/FtileGroup.java:89-103
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/style/FromSkinparamToStyle.java:131-132
 */
import { describe, it, expect } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderFixtureActivity } from '../../oracle/svg-conformance/render-fixture-activity.js';

const render = (src: string): string => renderFixtureActivity(src, new DeterministicMeasurer());

describe('group frame stereotype tier', () => {
  it('gateti-51: `.action { RoundCorner 25 }` rounds `rectangle X <<action>>` (rx 12.5)', () => {
    const svg = render(
      '@startuml\n<style>\n.action {\n  RoundCorner 25\n}\nrectangle {\n  RoundCorner 0\n}\n</style>\n' +
        'rectangle A <<action>> {\n:a;\n}\n@enduml',
    );
    expect(svg).toMatch(/<rect[^>]* rx="12\.5"/);
  });

  it('fuficu-36: `skinparam partition { BackgroundColor<<p>> blue }` is a composite<<p>> rule', () => {
    const svg = render(
      '@startuml\nskinparam partition {\n  BackgroundColor<<p>> blue\n}\npartition "P" <<p>> {\nstart\n:a;\nstop\n}\n@enduml',
    );
    expect(svg).toMatch(/<rect[^>]* fill="#00F"/);
  });
});
