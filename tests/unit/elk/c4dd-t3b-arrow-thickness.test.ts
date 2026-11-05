/**
 * c4dd T3b: an ELK link's stroke (`MyElkEdge.java:169-180`, `LinkType.java:245-256`): a non-normal link takes
 * `skinparam arrowThickness`, a normal one the merged `arrow` style, and a bracket thickness beats both.
 */
import { beforeAll, describe, expect, it } from 'vitest';

import { loadElk } from '../../../src/index.js';
import type { ElkBackend } from '../../../src/core/elk/elk-backend.js';
import { jarFixtureDiffs, jarFixtureNames } from '../../helpers/jar-fixture-dir.js';

const DIR = 'tests/fixtures/c4dd-T3b';
const names = jarFixtureNames(DIR);

let elk: ElkBackend;
beforeAll(async () => {
  elk = await loadElk();
});

describe('ELK arrow strokes against the jar', () => {
  it('collects every fixture with an oracle', () => {
    expect(names.length).toBe(14);
  });

  it.each(names)('%s', (name) => {
    expect(jarFixtureDiffs(DIR, name, { elk })).toEqual([]);
  });
});
