/**
 * aar-T6b: `<style> activity { FontName }` reaches the box text (`FtileBox` reads the merged style's font).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/vertical/FtileBox.java:164-176
 */
import { describe, it, expect } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderFixtureActivity } from '../../oracle/svg-conformance/render-fixture-activity.js';

describe('activity FontName from <style>', () => {
  it('labuxo-17: a plain action`s text carries the style`s font-family', () => {
    const src = '@startuml\n<style>\nactivity {\n  FontName arial\n}\n</style>\nstart\n:hello;\n@enduml';
    const svg = renderFixtureActivity(src, new DeterministicMeasurer());
    expect(svg).toMatch(/<text [^>]*font-family="arial">hello<\/text>/);
  });
});
