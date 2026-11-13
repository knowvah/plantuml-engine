/**
 * sogr T3a: `LinkAnchor#drawAnchor` (`sequencediagram/LinkAnchor.java:82-123`)
 * reads `tile.getMiddleX()` (`teoz/CommonTile.java:62-66`), `(getMinX +
 * getMaxX) / 2`, of the tile `matchAnchor` found. For a message carrying a
 * `note right` that tile is `CommunicationTileNoteRight`, whose `getMaxX` is
 * the note's position plus its preferred width (`CommunicationTileNoteRight
 * .java:246-250`), not the message's. Oracle:
 * `test-results/dot-cache/sequence/dociti-46-podu738/in.svg`.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderFixtureSequence, sequenceFixtureOptions } from '../../oracle/svg-conformance/render-fixture-sequence.js';

const ROW_DIR = 'test-results/dot-cache/sequence/dociti-46-podu738';
const ANCHOR_LINE_RE = /<line x1="([\d.]+)" y1="68" x2="\1" y2="97"/;
const ANCHOR_LABEL_RE = /<text x="([\d.]+)" y="86.111"[^>]*>some time</;
const JAR_ANCHOR_X = 77.813;
const JAR_LABEL_X = 81.813;

const read = (svg: string, re: RegExp): number => Number(re.exec(svg)?.[1]);

describe('anchor duration beside a note right (dociti-46-podu738)', () => {
  const jar = readFileSync(`${ROW_DIR}/in.svg`, 'utf8');
  const ours = renderFixtureSequence(
    readFileSync(`${ROW_DIR}/in.puml`, 'utf8'),
    new DeterministicMeasurer(),
    sequenceFixtureOptions(),
  );

  it('the jar draws the anchor line at 77.813 and its label at 81.813', () => {
    expect([read(jar, ANCHOR_LINE_RE), read(jar, ANCHOR_LABEL_RE)]).toEqual([JAR_ANCHOR_X, JAR_LABEL_X]);
  });

  it('draws the anchor line and label at the jar x', () => {
    expect([read(ours, ANCHOR_LINE_RE), read(ours, ANCHOR_LABEL_RE)]).toEqual([JAR_ANCHOR_X, JAR_LABEL_X]);
  });
});
