/**
 * aar-T4c: `<style> element { MaximumWidth N }` is the same knob as `skinparam wrapWidth`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/style/FromSkinparamToStyle.java:250
 */
import { describe, it, expect } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderFixtureActivity } from '../../oracle/svg-conformance/render-fixture-activity.js';

describe('element { MaximumWidth }', () => {
  it('raneku-06: wraps the activity box (jar canvas 148 px wide)', () => {
    const svg = renderFixtureActivity(
      '@startuml\n<style>\nelement {\n  MaximumWidth 100\n}\n</style>\n' +
        ':this is a very long long long long long activity description;\n@enduml',
      new DeterministicMeasurer(),
    );
    expect(svg).toMatch(/width="148(px)?"/);
  });
});
