/**
 * `note on link` in a legacy activity diagram (laep T3b-1): `EntityImageNoteLink` drawn beside the edge label,
 * `SvekEdge.java:308-326`. Oracles: the four cached rows and the jar's render of probe `lap-note-on-link`
 * (`fixtures/lap-note-on-link.svg`, `scripts/oracle-render.sh`).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { setLayoutInputObserver, type DotInputGraph } from '../../../src/core/graph-layout.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';
import { dotInputToStructural } from '../../oracle/svek-dot.js';
import { probeSource, renderLegacy, rowDiffs } from '../../helpers/legacy-activity-render.js';

const FIXTURES = join(import.meta.dirname, 'fixtures');
const AUTHORED = join(import.meta.dirname, '../../fixtures/activity-legacy');

describe('note on link', () => {
  it.each([
    ['activity', 'pumime-12-lupa500'],
    ['activity', 'robezu-51-zoja177'],
    ['activity', 'terupo-52-xixo563'],
    ['activity', 'xudulo-43-modo554'],
  ])('%s/%s has 0 diffs against the jar', (bucket, slug) => {
    expect(rowDiffs(bucket, slug)).toEqual([]);
  });

  it('lap-note-on-link has 0 diffs against the jar', () => {
    const svg = renderLegacy(probeSource('lap-note-on-link'));
    const jar = readFileSync(join(FIXTURES, 'lap-note-on-link.svg'), 'utf8');
    expect(compareSvg(svg, jar, 'deterministic').diffs).toEqual([]);
  });

  it('reserves the drawn note block in the DOT, a hidden stereotype included (note-on-link-stereotype-hide)', () => {
    // SvekEdge.java:311-312 merges the very EntityImageNoteLink it draws. Under `skinparam ShowStereotype false` that
    // block hides `<<foo>>`, and the jar's svek-1.dot reserves `<TABLE ... FIXEDSIZE="TRUE" WIDTH="115" HEIGHT="33">`.
    const graphs: DotInputGraph[] = [];
    setLayoutInputObserver(({ graph }) => graphs.push(graph));
    try {
      renderLegacy(readFileSync(join(AUTHORED, 'note-on-link-stereotype-hide.puml'), 'utf8'));
    } finally {
      setLayoutInputObserver(undefined);
    }
    const boxes = dotInputToStructural(graphs[0]!).edges.map((e) => e.labelBox);
    expect(boxes.filter((b) => b !== undefined)).toEqual(['115x33']);
  });

  it('draws the Opale box and its folded corner at the table corner (terupo-52)', () => {
    const jar = readFileSync(
      join(import.meta.dirname, '../../../test-results/dot-cache/activity/terupo-52-xixo563/in.puml'),
      'utf8',
    );
    const svg = renderLegacy(jar);
    expect(svg).toContain('<path d="M31.97,51 L31.97,87 L135.97,87 L135.97,61 L125.97,51 L31.97,51"');
    expect(svg).toContain('<path d="M125.97,51 L125.97,61 L135.97,61 L125.97,51"');
  });
});
