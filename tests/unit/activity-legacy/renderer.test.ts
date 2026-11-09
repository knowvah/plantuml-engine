/**
 * The legacy activity renderer, through `activityLegacyPlugin` (laep T2c): the svek result's draw order, the edge and
 * partition adapters, the opalised note, the quantifier placement and the chrome. The oracles are the cached jar
 * renders of the 124 rows (`test-results/dot-cache/<bucket>/<slug>/in.svg`) and the jar's render of probe
 * `lap-chrome` (`scripts/oracle-render.sh`, deterministic text), whose numbers are written out below.
 */
import { describe, expect, it } from 'vitest';
import { HColorSimple } from '../../../src/core/klimt/color/HColorSimple.js';
import { parseLegacy } from '../../helpers/legacy-leaf-images.js';
import { probeSource, renderLegacy, rowDiffs } from '../../helpers/legacy-activity-render.js';

/** The root attribute the jar prints for BOTH activity engines (`TextBlockExporter.java:292-294`). */
const PRINTED_TYPE = 'data-diagram-type="ACTIVITY"';

function textAt(svg: string, content: string): { x: number; y: number } {
  const match = new RegExp(`<text x="([0-9.]+)" y="([0-9.]+)"[^>]*>${content}</text>`).exec(svg);
  if (match === null) throw new Error(`no <text> with ${content}`);
  return { x: Number(match[1]), y: Number(match[2]) };
}

describe('renderer: rows conformant against the jar', () => {
  it.each([
    ['activity', 'bokuba-91-poda774', 'two bars, start, end: draw order and extremities'],
    ['activity', 'cozepi-30-jenu085', 'two partitions and a title'],
    ['activity', 'petora-44-nafe514', 'if with [true]/[false] labels and a head label'],
    ['activity', 'dupoge-67-gimu324', 'an empty `if ""` condition is drawn as a space'],
    ['activity', 'beteta-16-robe105', 'a quantifier pushed clear of a node, and a link url'],
    ['activity', 'guzecu-01-didu313', 'two opalised notes'],
    ['activity', 'pileje-51-zubu880', 'a note beside a partition'],
    ['activity', 'nipata-68-xoke122', 'link colours the style stored as a bare colour'],
    ['unknown', 'coruvi-63-vuzu133', 'a lone note'],
    ['activity', 'fozoxu-26-fibu076', 'an inner activity: the nested svek result inside an InnerActivity frame'],
  ])('%s/%s (%s) has 0 diffs', (bucket, slug) => {
    expect(rowDiffs(bucket, slug)).toEqual([]);
  });
});

describe('renderer: chrome (lap-chrome)', () => {
  const svg = renderLegacy(probeSource('lap-chrome'));

  it('prints ACTIVITY through its own routing key, at the jar canvas', () => {
    expect(svg).toContain(PRINTED_TYPE);
    expect(svg).not.toContain('ACTIVITY_LEGACY');
    expect(svg).toContain('width="109px" height="297px" viewBox="0 0 109 297"');
  });

  it('puts header, title, caption and footer where the jar does', () => {
    expect(textAt(svg, 'h')).toEqual({ x: 96.863, y: 7.778 });
    expect(textAt(svg, 'Legacy title')).toEqual({ x: 15.819, y: 31.889 });
    expect(textAt(svg, 'c')).toEqual({ x: 47.713, y: 274.889 });
    expect(textAt(svg, 'f')).toEqual({ x: 49.838, y: 287.778 });
  });

  it('puts the legend box where the jar does', () => {
    expect(svg).toContain('<rect x="12" y="226" width="78.425" height="24" fill="#DDD"');
  });
});

describe('skin param reads the renderer needs', () => {
  const skinOf = (skinparam: Record<string, string>) =>
    parseLegacy('@startuml\n(*) --> A\n@enduml', { skinparam: new Map(Object.entries(skinparam)) }).getSkinParam();

  it('getThickness answers null with no arrow param, the thickness with one, a dash with a style', () => {
    expect(skinOf({}).getThickness('arrow')).toBeNull();
    expect(skinOf({ arrowthickness: '2.5' }).getThickness('arrow')?.getThickness()).toBe(2.5);
    const dashed = skinOf({ arrowstyle: 'dashed' }).getThickness('arrow');
    expect([dashed?.getDashVisible(), dashed?.getDashSpace()]).toEqual([7, 7]);
  });

  it('getBackgroundColor reads backgroundcolor, else the document style', () => {
    const hex = (skinparam: Record<string, string>): unknown => {
      const color = skinOf(skinparam).getBackgroundColor();
      return color instanceof HColorSimple ? color.asPaint() : color;
    };
    expect(hex({})).toBe('#FFFFFF');
    expect(hex({ backgroundcolor: 'red' })).toBe('#FF0000');
  });
});
