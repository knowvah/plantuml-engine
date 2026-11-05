/**
 * odd T2d: a section with icons places each member by `PlacementStrategyVisibility#getPositions` (java:56-69): rows step
 * by `max(icon, text)` and text centres in the step, while the box height sums the text heights alone
 * (`MethodsOrFieldsArea#calculateDimensionOnlyMembers`, java:154-178).
 */
import { describe, expect, it } from 'vitest';

import { visibilityMemberStep } from '../../../src/diagrams/class/class-visibility-icon.js';
import { jarFixtureDiffs, jarFixtureNames, renderJarFixture } from '../../helpers/jar-fixture-dir.js';

const DIR = 'tests/fixtures/odd-T2d';
const names = jarFixtureNames(DIR);

describe('visibility row pitch against the jar', () => {
  it('collects every fixture with an oracle', () => {
    expect(names.length).toBe(10);
  });

  it.each(names)('%s', (name) => {
    expect(jarFixtureDiffs(DIR, name)).toEqual([]);
  });

  it('steps 17 past a modified row and 14 past a plain one at icon size 16', () => {
    const ys = [
      ...renderJarFixture(DIR, 'object-mixed-16').matchAll(/<text x="\d+"[^>]*y="([\d.]+)"[^>]*>[abc] =/g),
    ].map((m) => m[1]);
    expect(ys).toEqual(['41.389', '56.889', '72.389']);
  });
});

describe('visibilityMemberStep', () => {
  it('leaves a row alone while the text is the taller', () => {
    expect(visibilityMemberStep(11, true, 14)).toEqual({ maxHeight12: 14, textDrop: 0 });
  });

  it('centres the text in a taller icon block', () => {
    expect(visibilityMemberStep(21, true, 14)).toEqual({ maxHeight12: 21, textDrop: 3.5 });
  });

  it('gives a member with no modifier a one pixel block (MethodsOrFieldsArea.java:345-347)', () => {
    expect(visibilityMemberStep(21, false, 14)).toEqual({ maxHeight12: 14, textDrop: 0 });
  });
});
