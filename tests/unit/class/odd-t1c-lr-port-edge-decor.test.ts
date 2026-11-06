/**
 * odd T1c: a single-dash port edge under `left to right direction` comes back from dot head to tail with no swap.
 * `SvekEdge.java:636-655` reverses the path to run cl1 to cl2 and leaves the decors where they are, so the head stays
 * on the target.
 */
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { jarFixtureDiffs, jarFixtureNames, renderJarFixture } from '../../helpers/jar-fixture-dir.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderSync } from '../../../src/index.js';

const DIR = 'tests/fixtures/odd-T1c';
const SIVAPA =
  '@startuml\nleft to right direction\nmap "AAA A" as AAAA {\n  ffff1 => ffff2\n}\nmap "CCC C" as CCCC {\n  ssss => tttt\n}\nAAAA::ffff1 => CCCC::ssss\n@enduml\n';
const names = jarFixtureNames(DIR);

describe('an arrowhead on a flat port edge against the jar', () => {
  it('collects every fixture with an oracle', () => {
    expect(names.length).toBe(12);
  });

  it.each(names)('%s', (name) => {
    expect(jarFixtureDiffs(DIR, name)).toEqual([]);
  });

  it('draws the sivapa-41 head on the target, and the path from the source box edge', () => {
    const svg = renderSync(SIVAPA, { measurer: new DeterministicMeasurer() });
    expect(svg).toContain('<polygon points="72.5,113,81.5,117,77.5,113,81.5,109,72.5,113"');
    expect(svg).toContain('d="M40,44 C40,65.94 63.73,61.49 71.5,82 C76.38,94.89 91.28,113 77.5,113"');
  });

  it('keeps the head on the source end of a reversed edge', () => {
    const oracle = readFileSync(`${DIR}/oracle/lr-reversed.svg`, 'utf8');
    const head = /<polygon points="([^"]*)"/.exec(oracle)![1]!;
    expect(renderJarFixture(DIR, 'lr-reversed')).toContain(`<polygon points="${head}"`);
  });
});
