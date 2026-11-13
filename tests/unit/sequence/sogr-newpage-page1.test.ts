/**
 * sogr T3b: a `{a1} <-> {a2}` link is drawn by `PlayingSpace#drawUInternal`
 * (`teoz/PlayingSpace.java:129-134`) through `ugBody`, which
 * `PlayingSpaceWithParticipants#drawU` clips to the page when `getNbPages() > 1`
 * (`:218-221`, `new UClip(-1000, ymin, MAX, pageHeight + 1)`).
 * `LinkAnchor.drawAnchor` (`LinkAnchor.java:112-117`) strokes a `ULine` and two
 * `UPolygon` heads and writes a `UText`; `DriverLineSvg`/`DriverPolygonSvg`/
 * `DriverTextSvg` and `UClip#getClippedLine` drop each outside the band. Page
 * 1 of `teoz-ng-001-5` ends at the newpage rule, y=165; the link lives on page
 * 2, so the jar's page 1 carries none of it and is 216 high. Oracle:
 * `test-results/dot-cache/sequence/teoz-ng-001-5/in.svg`.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderFixtureSequence, sequenceFixtureOptions } from '../../oracle/svg-conformance/render-fixture-sequence.js';

const ROW_DIR = 'test-results/dot-cache/sequence/teoz-ng-001-5';
const HEIGHT_RE = /<svg [^>]*\sheight="(\d+)px"/;
const NEWPAGE_RULE_RE =
  /<line x1="10" y1="165" x2="392.012" y2="165" style="[^"]*stroke-width:0.5;stroke-dasharray:2,2;"\/>/;
const JAR_PAGE_HEIGHT = 216;
const LINK_LABEL = '>some time<';

describe('page 1 of a newpage diagram whose link lives on page 2 (teoz-ng-001-5)', () => {
  const jar = readFileSync(`${ROW_DIR}/in.svg`, 'utf8');
  const ours = renderFixtureSequence(
    readFileSync(`${ROW_DIR}/in.puml`, 'utf8'),
    new DeterministicMeasurer(),
    sequenceFixtureOptions(),
  );

  it('the jar is 216 high, ends with the dashed rule and draws no link label', () => {
    expect(Number(HEIGHT_RE.exec(jar)?.[1])).toBe(JAR_PAGE_HEIGHT);
    expect(NEWPAGE_RULE_RE.test(jar)).toBe(true);
    expect(jar.includes(LINK_LABEL)).toBe(false);
  });

  it('is 216 high, ends with the dashed rule and draws no link label', () => {
    expect(Number(HEIGHT_RE.exec(ours)?.[1])).toBe(JAR_PAGE_HEIGHT);
    expect(NEWPAGE_RULE_RE.test(ours)).toBe(true);
    expect(ours.includes(LINK_LABEL)).toBe(false);
    expect(ours.endsWith('</g></svg>')).toBe(true);
    expect(ours.match(/<polygon /g)?.length).toBe(jar.match(/<polygon /g)?.length);
  });
});
