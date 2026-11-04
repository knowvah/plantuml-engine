import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';

/**
 * stdd T6c, layout inputs the jar's DOT or draw disagreed with.
 * - the extremity move is `DotPath#moveStartPoint`/`#moveEndPoint` (`SvekEdge.java:559-562`): the start move drops the
 *   first bezier when it is at least that bezier's length (`DotPath.java:206-216`) -- kotagu-43, pesita-10, dogeji-46.
 * - `Extremity#getDecorationLength` is 8 unless overridden (`Extremity.java:83-85`): an `x-->` tail and a `-->o`
 *   head move the path by 8, and `ExtremityArrowAndCircle` draws its arrow `radius` behind the end -- viguto-81,
 *   xexika-61.
 * - `EntityPosition#drawSymbol` draws EXPANSION_INPUT/OUTPUT as a `RADIUS*2*4` bar split by three lines, transposed
 *   under `left to right direction` (`EntityPosition.java:100-116`) -- bujuta-44, mimaga-15, rinisi-79.
 * - a border point's label is centred on a `2 * RADIUS` symbol whatever the pin's width
 *   (`EntityImageStateBorder.java:83`), and a transparent back colour becomes the diagram background
 *   (`:94-98`) -- nijugi-19, xipela-98.
 * - `hide empty description` reaches a LEAF (`GeneralImageBuilder.java:135-136`); a childless `state B {}` is a group
 *   and keeps `EntityImageState` (`GroupMakerState.java:113-114`) -- bitaxo-18.
 * - `frame X {` is a PACKAGE group with `USymbols.FRAME`: never autarkic (`Entity.java:691-692`), drawn through
 *   `ClusterDecoration` instead of `drawUState` (`Cluster.java:353-374`) with the `stateDiagram.state.group` style
 *   (`:286-289`) and a bold centred title (`ClusterHeader.java:155-160`) -- tucotu-42.
 */

const CACHE = 'test-results/dot-cache/state';
const measurer = new DeterministicMeasurer();

function render(puml: string): string {
  return renderSync(puml, { measurer, jarCompatibleStyleInput: true } as Parameters<typeof renderSync>[1]);
}

function cachedDiffs(slug: string): { ours: string; diffs: unknown[] } {
  const ours = render(readFileSync(`${CACHE}/${slug}/in.puml`, 'utf8'));
  const jar = readFileSync(`${CACHE}/${slug}/in.svg`, 'utf8');
  return { ours, diffs: compareSvg(ours, jar, 'deterministic').diffs };
}

describe('stdd T6c: layout inputs', () => {
  it('drops a start bezier shorter than the decoration move (kotagu-43)', () => {
    const { ours, diffs } = cachedDiffs('kotagu-43-miza629');
    expect(ours).toContain('M64.913,130.336 C64.807,130.57 66.6,126.601 66.492,126.838');
    expect(diffs).toEqual([]);
  });

  it('moves an x--> tail by 8 and pulls the -->o arrow 5 behind its circle (viguto-81)', () => {
    const { ours, diffs } = cachedDiffs('viguto-81-gana093');
    expect(ours).toContain('M82.38,278.22');
    expect(diffs).toEqual([]);
  });

  it('draws an expansion pin as a 12x48 bar with three rules under left to right (bujuta-44)', () => {
    const { ours, diffs } = cachedDiffs('bujuta-44-rovo666');
    expect(ours).toMatch(/<rect x="105.97" y="101" width="12" height="48"/);
    expect(ours).toMatch(/<line x1="105.97" y1="113" x2="117.97" y2="113"/);
    expect(diffs).toEqual([]);
  });

  it('keeps `state B {}` a group and drops the group of a hidden-description leaf (bitaxo-18)', () => {
    const { ours, diffs } = cachedDiffs('bitaxo-18-tamo974');
    expect(ours).toMatch(/<rect x="7" y="19.611" width="50" height="40"/);
    expect(ours).toMatch(/<g class="entity" data-qualified-name="B"/);
    expect(ours).not.toMatch(/<g class="entity" data-qualified-name="A"/);
    expect(diffs).toEqual([]);
  });

  it('draws a frame composite as a package cluster with the frame symbol (tucotu-42)', () => {
    const { ours, diffs } = cachedDiffs('tucotu-42-vufi714');
    expect(ours).toMatch(/<g class="cluster" data-qualified-name="state_machine"/);
    expect(ours).toContain('<path d="M108,7 L108,14 L98,24 L7,24"');
    expect(ours).toMatch(/font-weight="700">state_machine</);
    expect(diffs).toEqual([]);
  });

  it.each([
    'pesita-10-dene726',
    'dogeji-46-sapo750',
    'xexika-61-fedu273',
    'mimaga-15-doze740',
    'rinisi-79-peko570',
    'nijugi-19-jazi166',
    'xipela-98-nuvu593',
  ])('%s matches the jar', (slug) => {
    expect(cachedDiffs(slug).diffs).toEqual([]);
  });
});
