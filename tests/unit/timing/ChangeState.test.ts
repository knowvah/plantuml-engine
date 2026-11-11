import { describe, expect, it } from 'vitest';

import { ColorType } from '../../../src/core/abel/ColorType.js';
import { Colors } from '../../../src/core/abel/Colors.js';
import { HColorSet } from '../../../src/core/klimt/color/HColorSet.js';
import { ChangeState } from '../../../src/diagrams/timing/ChangeState.js';
import { URectangle } from '../../../src/core/klimt/shape/URectangle.js';
import { svgGraphic } from '../mindmap/helpers/mindmap-skin.js';
import { timingStyle } from '../../../src/diagrams/timing/timing-klimt.js';
import { paint, svgElements, tick, timingSkinParam } from './helpers/timing.js';

const skinParam = timingSkinParam();
const style = timingStyle(skinParam, 'concise');
const set = HColorSet.instance();

describe('ChangeState', () => {
  it('rejects an empty state list (IllegalArgumentException)', () => {
    expect(() => new ChangeState(tick('0'), undefined, undefined)).toThrow('java.lang.IllegalArgumentException');
  });

  it('orders on the tick alone; @1 and @1.0 compare equal', () => {
    const a = new ChangeState(tick('1'), 'x', undefined, 'A');
    const b = new ChangeState(tick('1.0'), 'y', undefined, 'B');
    const c = new ChangeState(tick('2'), undefined, undefined, 'C');
    expect(a.compareTo(b)).toBe(0);
    expect(a.compareTo(c)).toBeLessThan(0);
    expect(c.compareTo(a)).toBeGreaterThan(0);
  });

  it('exposes the first state, all states, the tick and the comment', () => {
    const when = tick('7');
    const change = new ChangeState(when, 'note', undefined, 'A', 'B');
    expect(change.getWhen()).toBe(when);
    expect(change.getState()).toBe('A');
    expect(change.getStates()).toEqual(['A', 'B']);
    expect(change.getComment()).toBe('note');
  });

  it('classifies {...}, {hidden} and {-} on the first state only', () => {
    const blank = new ChangeState(tick('0'), undefined, undefined, '{...}');
    const hidden = new ChangeState(tick('0'), undefined, undefined, '{hidden}');
    const flat = new ChangeState(tick('0'), undefined, undefined, '{-}');
    const plain = new ChangeState(tick('0'), undefined, undefined, 'A', '{-}');
    expect([blank.isBlank(), blank.isCompletelyHidden(), blank.isFlat()]).toEqual([true, false, false]);
    expect([hidden.isBlank(), hidden.isCompletelyHidden(), hidden.isFlat()]).toEqual([false, true, false]);
    expect([flat.isBlank(), flat.isCompletelyHidden(), flat.isFlat()]).toEqual([false, false, true]);
    expect([plain.isBlank(), plain.isCompletelyHidden(), plain.isFlat()]).toEqual([false, false, false]);
    expect(ChangeState.isFlat('{-}')).toBe(true);
    expect(ChangeState.isFlat('{?}')).toBe(false);
  });

  it('takes the style colours when it has no colours or none for the slot (oracle: fill #E2E2F0, line #006400)', () => {
    const none = new ChangeState(tick('0'), undefined, undefined, 'A');
    const textOnly = new ChangeState(tick('0'), undefined, Colors.parse('#red', set, ColorType.TEXT), 'A');
    for (const change of [none, textOnly]) {
      expect(paint(change.getBackColor(skinParam, style))).toBe('#E2E2F0');
      expect(paint(change.getContext(skinParam, style).getBackColor())).toBe('#E2E2F0');
    }
  });

  it('takes the change colours for the back and the line when given (cov-state-colors)', () => {
    const colors = Colors.parse('#lime;line:#blue', set, ColorType.BACK);
    const change = new ChangeState(tick('0'), undefined, colors, 'A');
    const context = change.getContext(skinParam, style);
    expect(paint(change.getBackColor(skinParam, style))).toBe('#00FF00');
    expect(paint(context.getBackColor())).toBe('#00FF00');
    // the line colour reaches the Fashion's fore colour: drawn, it is the jar's `stroke:#0000FF`
    const ug = svgGraphic();
    context.apply(ug).draw(URectangle.build(10, 5));
    expect(svgElements(ug.getSvgString())[0]).toContain('fill="#0F0"');
    expect(svgElements(ug.getSvgString())[0]).toContain('stroke:#00F;stroke-width:1.5');
  });
});
