/**
 * `ActivityBox` drawn at the origin. Every value is a jar oracle's, shifted
 * by the box's own `rect` origin: `cov-single`, `cov-label-creole`,
 * `cov-label-newline`, `cov-label-newline-fn` (`plans/flow-engine-port/probes/`).
 */
import { describe, expect, it } from 'vitest';
import { TilesField } from '../../../src/core/golem/TilesField.js';
import { renderDrawableToFragment } from '../../../src/core/klimt/document-shell-fragment.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { BLOCK_E1_NEWLINE } from '../../../src/core/tim/builtin/jaws-constants.js';
import { ActivityBox } from '../../../src/diagrams/flow/ActivityBox.js';

/** The creole space atom the jar writes (U+00A0, `cov-label-creole`'s oracle bytes). */
const NBSP = '\u00a0';

const RECT_STYLE = 'fill="#FEFECE" style="stroke:#A80036;stroke-width:1.5;" rx="12.5" ry="12.5"';

function draw(label: string): string {
  const box = new ActivityBox(new TilesField().getRoot(), '10', label);
  return renderDrawableToFragment(box, { uid: 'f', width: 0, height: 0, measurer: new DeterministicMeasurer() }).body;
}

describe('ActivityBox', () => {
  it('keeps its tile, id and label', () => {
    const tile = new TilesField().getRoot();
    const box = new ActivityBox(tile, '20', 'FINDHW()');
    expect([box.getTile(), box.getId(), box.getLabel()]).toEqual([tile, '20', 'FINDHW()']);
  });

  it('draws START as cov-single does (66.025x34, text at +10,+20.889)', () => {
    expect(draw('START')).toBe(
      `<rect x="0" y="0" width="66.025" height="34" ${RECT_STYLE}/>` +
        '<text x="10" y="20.889" fill="#000" font-size="14" textLength="46.025" font-family="serif">START</text>',
    );
  });

  it('runs creole as cov-label-creole does', () => {
    const body = draw('**bold** <color:blue>c</color> //it//');
    expect(body).toContain('<rect x="0" y="0" width="68.213" height="34"');
    // The oracle's text x minus its rect x (65.894).
    expect([...body.matchAll(/<text x="([\d.]+)"[^>]*>([^<]*)<\/text>/g)].map((m) => [m[1], m[2]])).toEqual([
      ['10', 'bold'],
      ['36.513', NBSP],
      ['40.363', 'c'],
      ['47.363', NBSP],
      ['51.213', 'it'],
    ]);
    expect(body).toContain('fill="#00F" font-size="14" font-family="serif">c</text>');
  });

  it('keeps a typed \\n literal (cov-label-newline)', () => {
    expect(draw('line1\\nline2')).toContain('width="90.963" height="34"');
    expect(draw('line1\\nline2')).toContain('textLength="70.963" font-family="serif">line1\\nline2</text>');
  });

  it('splits a %newline() newline into two lines 14 apart (cov-label-newline-fn)', () => {
    // `%newline()` returns `Jaws.BLOCK_E1_NEWLINE` (Newline.java:64-66, JawsFlags.java:40).
    const body = draw(`a${BLOCK_E1_NEWLINE}b`);
    expect(body).toContain('width="27.787" height="48"');
    expect([...body.matchAll(/<text x="([\d.]+)" y="([\d.]+)"/g)].map((m) => [m[1], m[2]])).toEqual([
      ['10', '20.889'],
      ['10', '34.889'],
    ]);
  });
});
