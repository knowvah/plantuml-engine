/**
 * aar-T6b: an arrow label occupies the compress pass only as its drawn `UText`. The reservation
 * `tile-layout-inlabel.ts` keeps for the lane width and canvas must not enter the Y slot finder as a `UEmpty`:
 * upstream's label block draws none, so the ink-free band under a cross-lane label compresses.
 * Jar values: `scripts/oracle-render.sh` on the same source (box y 108.556, line y 93.556).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/compress/SlotFinder.java:70-140
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/vcompact/ConnectionVerticalDown.java:90-104
 */
import { describe, it, expect } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderFixtureActivity } from '../../oracle/svg-conformance/render-fixture-activity.js';

const render = (src: string): string => renderFixtureActivity(src, new DeterministicMeasurer());

describe('arrow label ink in the compress pass', () => {
  it('a labelled cross-lane arrow compresses the band under its label like the jar', () => {
    const svg = render('@startuml\n|A|\n:x;\n->lab;\n|B|\n:y;\n@enduml');
    expect(svg).toContain('<rect x="62" y="108.556" width="26" height="32"');
    expect(svg).toContain('<line x1="39" y1="93.556" x2="75" y2="93.556"');
  });
});
