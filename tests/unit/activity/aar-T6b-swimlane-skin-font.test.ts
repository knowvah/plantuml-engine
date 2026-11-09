/**
 * aar-T6b: a swimlane title's font size is the merged `{root, element, activityDiagram, swimlane}` style's
 * (`Swimlanes#getStyle`, `Swimlanes.java:135-138,287`). `plantuml.skin:309-314` gives it 18; `skin debug` declares an
 * empty `swimlane { }` (`debug.skin:175`), so the title inherits that skin's `root { FontSize 19 }`.
 * Jar values: rutaji-30-suda150 (title `font-size="19"`, title rect height 19, box y 41.722).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/Swimlanes.java:135-138
 */
import { describe, it, expect } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderFixtureActivity } from '../../oracle/svg-conformance/render-fixture-activity.js';

const render = (src: string): string => renderFixtureActivity(src, new DeterministicMeasurer());

describe('swimlane title font size from the merged style', () => {
  it('skin debug: the title is 19 and the first box sits at the jar y', () => {
    const svg = render('@startuml\nskin debug\n|a|\n:x;\n|b|\n:y;\n@enduml');
    expect(svg).toContain('font-size="19">a<');
    expect(svg).toContain('<text x="25" y="32.5"');
  });
  it('skin debug: the divider and the diamond stroke take the skin root LineThickness 4 (lulavi-01-fose679)', () => {
    const svg = render('@startuml\nskin debug\n|a|\n:x;\nif (c) then\n:y;\nendif\n|b|\n:z;\n@enduml');
    expect(svg).toContain('<line x1="20" y1="17.722" x2="20" y2="');
    expect(svg).toMatch(/<line x1="20"[^>]*stroke-width="4"/);
    expect(svg).toMatch(/<polygon[^>]*stroke-width="4"/);
  });
  it('default skin keeps 18', () => {
    const svg = render('@startuml\n|a|\n:x;\n|b|\n:y;\n@enduml');
    expect(svg).toContain('font-size="18">a<');
  });
});
