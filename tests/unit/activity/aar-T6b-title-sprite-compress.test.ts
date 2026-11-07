/**
 * aar-T6b: a group/partition title that is one SVG sprite moves shape by shape.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/compress/UGraphicCompressOnXorY.java:100-135
 */
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { activityRatchetOptions, renderFixtureActivity } from '../../oracle/svg-conformance/render-fixture-activity.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';

const DIR = 'tests/fixtures/diagram-style-scope/activity__title-sprite-';
const CIRCLE_CX = /<ellipse cx="([\d.]+)"/;

describe('UGraphicCompressOnXorY draws each title sprite shape at its own ct()', () => {
  for (const kind of ['partition', 'group']) {
    it(`${kind}: circle x and canvas width equal the jar's`, () => {
      const puml = readFileSync(`${DIR}${kind}.puml`, 'utf8');
      const jar = readFileSync(`${DIR}${kind}.svg`, 'utf8');
      const ours = renderFixtureActivity(puml, new DeterministicMeasurer(), activityRatchetOptions());
      expect(CIRCLE_CX.exec(ours)?.[1]).toBe('92.482');
      expect(/ width="(\d+)px"/.exec(ours)?.[1]).toBe(/ width="(\d+)px"/.exec(jar)?.[1]);
      expect((compareSvg(ours, jar, 'deterministic') as { diffs: unknown[] }).diffs).toEqual([]);
    });
  }
});
