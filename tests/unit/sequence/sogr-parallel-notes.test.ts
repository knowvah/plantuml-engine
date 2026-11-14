/**
 * sogr T2b: a `/ note` group is one `Notes` event, and `NotesTile#addConstraints`
 * (`teoz/NotesTile.java:202-226`) pushes each later member's `getX` past the
 * earlier member's `getX2`. An `OVER_SEVERAL` member's `getX` is
 * `RealUtils.middle(posC1, posC2).addFixed(-width / 2)` (`:168-172`), so the
 * demand lands on the MIDDLE of two lifelines, not on one participant.
 * Oracle: `test-results/dot-cache/sequence/tenibi-81-sede977/in.svg`.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderFixtureSequence, sequenceFixtureOptions } from '../../oracle/svg-conformance/render-fixture-sequence.js';

const ROW_DIR = 'test-results/dot-cache/sequence/tenibi-81-sede977';
const LIFELINE_RE = /<line x1="([\d.]+)" y1="\d+" x2="\1"/g;
const ACTOR_COUNT = 6;

/** The first `ACTOR_COUNT` dashed lifelines' x, in document order (A1 to A6). */
const lifelineCentres = (svg: string): number[] =>
  [...svg.matchAll(LIFELINE_RE)].slice(0, ACTOR_COUNT).map((m) => Number(m[1]));

describe('/ note group over several participants (tenibi-81-sede977)', () => {
  it('places A1 to A6 at the jar lifeline centres', () => {
    const jar = lifelineCentres(readFileSync(`${ROW_DIR}/in.svg`, 'utf8'));
    const ours = lifelineCentres(
      renderFixtureSequence(
        readFileSync(`${ROW_DIR}/in.puml`, 'utf8'),
        new DeterministicMeasurer(),
        sequenceFixtureOptions(),
      ),
    );
    expect(jar).toEqual([93.653, 130.653, 297.959, 334.959, 502.266, 539.266]);
    expect(ours).toEqual(jar);
  });
});
