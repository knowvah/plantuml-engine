/**
 * sogr T2c: `-> a **` files a CREATE life event through
 * `diagram.activate(p, LifeEventType.CREATE, null)`
 * (`CommandExoArrowAny.java:103-106`). `SequenceDiagram#activate` parks it as
 * `pendingCreate` (`:374-377`) and `addMessage` hands it to the exo message
 * (`:207-214`), which becomes `isCreate()`. It draws no activation box: the
 * jar draws `a`'s lifeline group (title `a`, transparent 8x32 hit rect from
 * the create tile's top) and no white 10x24 activation rect.
 * Oracle: `test-results/dot-cache/sequence/kikate-70-xevi302/in.svg`.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderFixtureSequence, sequenceFixtureOptions } from '../../oracle/svg-conformance/render-fixture-sequence.js';

const ROW_DIR = 'test-results/dot-cache/sequence/kikate-70-xevi302';
const LIFELINE_GROUP_RE = /<g><title>a<\/title>(<rect [^>]*\/>)(<line [^>]*\/>)/;

const render = (): string =>
  renderFixtureSequence(
    readFileSync(`${ROW_DIR}/in.puml`, 'utf8'),
    new DeterministicMeasurer(),
    sequenceFixtureOptions(),
  );

describe('exo arrow with ** (kikate-70-xevi302)', () => {
  it('draws the created lifeline group as the jar does', () => {
    const jar = LIFELINE_GROUP_RE.exec(readFileSync(`${ROW_DIR}/in.svg`, 'utf8'));
    expect(jar?.[1]).toBe('<rect x="30.5" y="39" width="8" height="32" fill="#000" fill-opacity="0"/>');
    expect(LIFELINE_GROUP_RE.exec(render())?.slice(1)).toEqual(jar?.slice(1));
  });

  it('draws no activation box and puts the arrowhead at the head edge', () => {
    const svg = render();
    expect(svg).not.toContain('width="10" height="24"');
    expect(svg).toContain('<polygon points="22,49,32,53,22,57,26,53"');
  });
});
