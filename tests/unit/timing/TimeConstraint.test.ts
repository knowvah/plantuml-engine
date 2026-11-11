import { describe, expect, it } from 'vitest';

import { UTranslate } from '../../../src/core/klimt/UTranslate.js';
import type { ArrowConfiguration } from '../../../src/diagrams/sequence/sequence-arrowhead.js';
import { TimeConstraint } from '../../../src/diagrams/timing/TimeConstraint.js';
import type { TimingRuler } from '../../../src/diagrams/timing/TimingRuler.js';
import { TimingRuler as Ruler } from '../../../src/diagrams/timing/TimingRuler.js';
import { stringBounder, svgGraphic } from '../mindmap/helpers/mindmap-skin.js';
import { svgElements, tick, timingSkinParam } from './helpers/timing.js';

const skinParam = timingSkinParam();
const CONFIG: ArrowConfiguration = {
  dressing1: { head: 'NORMAL', part: 'FULL' },
  dressing2: { head: 'NORMAL', part: 'FULL' },
  decoration1: 'NONE',
  decoration2: 'NONE',
  dashed: false,
};

/** The ruler of `cov-constraint`: ticks 0, 200, 300 and 500 at 0.5 px per unit (HCF 100 over 50 px). */
function constraintRuler(): TimingRuler {
  const ruler = new Ruler(skinParam);
  for (const t of ['0', '200', '300', '500']) ruler.addTime(tick(t));
  return ruler;
}

function constraint(from: string, to: string, label: string, marginx: number, config = CONFIG): TimeConstraint {
  return new TimeConstraint({ marginx, tick1: tick(from), tick2: tick(to), label, skinParam, config });
}

function draw(c: TimeConstraint, x: number, y: number): string[] {
  const ug = svgGraphic();
  c.drawU(ug.apply(new UTranslate(x, y)), constraintRuler());
  return svgElements(ug.getSvgString());
}

describe('TimeConstraint', () => {
  it('draws cov-constraint "WB@0 <-> @50 : {50 ms lag}" (offset 2.5): heads outside a short line', () => {
    expect(draw(constraint('0', '50', '{50 ms lag}', 2.5), 124.4, 80)).toEqual([
      '<line x1="125.9" y1="80" x2="147.9" y2="80" style="stroke:#8B0000;stroke-width:1.5;"/>',
      '<polygon points="118.9,84,118.9,76,126.9,80" fill="#8B0000" style="stroke:#8B0000;stroke-width:1;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
      '<polygon points="154.9,84,154.9,76,146.9,80" fill="#8B0000" style="stroke:#8B0000;stroke-width:1;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
      '<text x="106.938" y="72.333" fill="#8B0000" font-size="12" textLength="59.925">{50 ms lag}</text>',
    ]);
  });

  it('draws cov-constraint "@200 <-> @+150 : {150 ms}" (offset 1): heads inside a wide line', () => {
    expect(draw(constraint('200', '350', '{150 ms}', 1), 124.4, 146.5)).toEqual([
      '<line x1="228.4" y1="146.5" x2="295.4" y2="146.5" style="stroke:#8B0000;stroke-width:1.5;"/>',
      '<polygon points="233.4,150.5,233.4,142.5,225.4,146.5" fill="#8B0000" style="stroke:#8B0000;stroke-width:1;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
      '<polygon points="290.4,150.5,290.4,142.5,298.4,146.5" fill="#8B0000" style="stroke:#8B0000;stroke-width:1;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
      '<text x="238.275" y="138.833" fill="#8B0000" font-size="12" textLength="47.25">{150 ms}</text>',
    ]);
  });

  it('is the label height plus the 5 px top margin high (oracle: 12 px text is 17 high, the baseline 9.333 below the top)', () => {
    const c = constraint('200', '350', '{150 ms}', 1);
    expect(TimeConstraint.getTopMargin()).toBe(5);
    expect(c.getConstraintHeight(stringBounder())).toBe(17);
  });

  it('takes the colour of its ArrowConfiguration over the style (java:132-137)', () => {
    const red = skinParam.getIHtmlColorSet().getColorOrWhite('#ff0000');
    const out = draw(constraint('200', '350', 'x', 1, { ...CONFIG, color: red }), 0, 50);
    expect(out[0]).toBe('<line x1="104" y1="50" x2="171" y2="50" style="stroke:#F00;stroke-width:1.5;"/>');
    expect(out[1]).toContain('fill="#F00"');
    expect(out[3]).toContain('fill="#8B0000"');
  });

  it('keeps its ticks and label, and tests strict containment', () => {
    const c = constraint('200', '350', '{150 ms}', 1);
    expect(c.getTick1().getTime().toPlainString()).toBe('200');
    expect(c.getTick2().getTime().toPlainString()).toBe('350');
    expect(c.getLabel().toString()).toBe('[{150 ms}]');
    expect(c.containsStrict(tick('300'))).toBe(true);
    expect(c.containsStrict(tick('200'))).toBe(false);
    expect(c.containsStrict(tick('350'))).toBe(false);
    expect(c.containsStrict(tick('100'))).toBe(false);
    expect(c.containsStrict(tick('400'))).toBe(false);
  });

  it('requires both ticks (Objects.requireNonNull)', () => {
    const none = undefined as unknown as ReturnType<typeof tick>;
    expect(
      () => new TimeConstraint({ marginx: 1, tick1: none, tick2: tick('1'), label: '', skinParam, config: CONFIG }),
    ).toThrow('java.lang.NullPointerException');
    expect(
      () => new TimeConstraint({ marginx: 1, tick1: tick('1'), tick2: none, label: '', skinParam, config: CONFIG }),
    ).toThrow('java.lang.NullPointerException');
  });
});
