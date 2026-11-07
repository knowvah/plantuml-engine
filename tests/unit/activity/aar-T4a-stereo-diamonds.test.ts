/**
 * aar-T4a: a stereogroup's class style fills the repeat and if diamonds.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/Stereogroup.java:150-155
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/vcompact/FtileFactoryDelegatorRepeat.java:91-97
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/vcompact/FtileFactoryDelegatorIf.java:79-83
 */
import { describe, it, expect } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderFixtureActivity } from '../../oracle/svg-conformance/render-fixture-activity.js';

const STYLE = '<style>\n.r {\n  BackgroundColor red\n}\n.b {\n  BackgroundColor blue\n}\n</style>\n';
const render = (src: string): string => renderFixtureActivity(src, new DeterministicMeasurer());

describe('Stereogroup#getHColor on diamonds', () => {
  it('totave-53: `repeat <<r>>` / `repeat while ... <<b>>` fill red then blue', () => {
    const svg = render(`@startuml\n${STYLE}start\nrepeat <<r>>\n:a;\nrepeat while (v) <<b>>\nstop\n@enduml`);
    const fills = [...svg.matchAll(/<polygon[^>]* fill="(#[0-9A-F]+)"/g)].map((m) => m[1]);
    expect(fills.slice(0, 2)).toEqual(['#F00', '#00F']);
  });

  it('`if (x) then <<r>>` fills its diamond red', () => {
    const svg = render(`@startuml\n${STYLE}if (x) then (y) <<r>>\n:a;\nelse (n)\n:b;\nendif\n@enduml`);
    expect(svg).toMatch(/<polygon[^>]* fill="#F00"/);
  });
});
