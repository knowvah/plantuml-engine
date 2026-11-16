/**
 * cogr T2c: an empty group's whole `Colors` reaches the leaf it is muted to. `Entity#muteToType` keeps the SAME
 * entity, and both leaf images read its `Colors`:
 * - `EntityImageDescription.java:149-170` (a USymbol group): `eventuallyOverride(colors)` puts LINE over `LineColor`
 *   and TEXT over `FontColor`; `getStroke(colors)` is `getSpecificLineStroke()`.
 * - `EntityImageEmptyPackage.java:107-108` (a plain package): the same override and stroke.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/style/Style.java:195-212,322-328
 * Oracles: `test-results/dot-cache/class/zitene-13-xeda918/in.svg` (blue `stroke-dasharray:1,3`, blue titles).
 */
import { describe, it, expect } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const SPEC = '#aliceblue;line:blue;line.dotted;text:blue';

function render(lines: readonly string[]): string {
  return renderSync(['@startuml', ...lines, '@enduml'].join('\n'), { measurer: new DeterministicMeasurer() });
}

describe('empty group colours reach the muted leaf (cogr T2c)', () => {
  it('draws an empty node with a dotted blue stroke and a blue title', () => {
    const svg = render([`node node ${SPEC} {`, '}']);
    expect(svg).toMatch(/<polygon[^>]*fill="#F0F8FF"[^>]*stroke:#00F;stroke-width:1;stroke-dasharray:1,3;/);
    expect(svg).toMatch(/<text[^>]*fill="#00F"[^>]*>node<\/text>/);
  });

  it('draws an empty package with a dotted blue folder and a blue title', () => {
    const svg = render([`package package ${SPEC} {`, '}']);
    expect(svg).toMatch(/<path[^>]*stroke="#00F" stroke-width="1" stroke-dasharray="1,3"/);
    expect(svg).toMatch(/<text[^>]*fill="#00F"[^>]*>package<\/text>/);
  });
});
