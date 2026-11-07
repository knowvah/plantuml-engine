/**
 * aar-T6a, denono-78-vaje778: a partition's `#back;header:c` colour spec and a `----` rule in its title.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/command/CommandPartition3.java:145-163
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/Fashion.java:67-83
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/creole/CreoleHorizontalLine.java:92-97
 */
import { describe, expect, it } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderFixtureActivity } from '../../oracle/svg-conformance/render-fixture-activity.js';

const render = (src: string): string => renderFixtureActivity(src, new DeterministicMeasurer());
const SRC =
  '@startuml\n:start1;\npartition #CadetBlue;header:red "go up \\n----\\nnow" {\n :go up first step;\n}\n' +
  ':start2;\n@enduml';

describe('partition #back;header:c and a creole rule in its title', () => {
  it('fills the frame with the BACK part of the Colors spec', () => {
    expect(render(SRC)).toMatch(
      /<rect x="[\d.]+" y="[\d.]+" width="[\d.]+" height="[\d.]+" fill="#5F9EA0" stroke="#000"/,
    );
  });

  it('strokes the title rule with the frame fore colour, as Fashion#apply leaves it on the ug', () => {
    expect(render(SRC)).toMatch(
      /<line x1="[\d.]+" y1="([\d.]+)" x2="[\d.]+" y2="\1" style="stroke:#000;stroke-width:1;"/,
    );
  });
});
