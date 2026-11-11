import { describe, expect, it } from 'vitest';

import { Colors } from '../../../src/core/abel/Colors.js';
import { Display } from '../../../src/core/klimt/creole/Display.js';
import { XPoint2D } from '../../../src/core/klimt/geom/XPoint2D.js';
import { UTranslate } from '../../../src/core/klimt/UTranslate.js';
import { IntricatedPoint } from '../../../src/diagrams/timing/graphic/IntricatedPoint.js';
import { TimeArrow } from '../../../src/diagrams/timing/graphic/TimeArrow.js';
import { TickInPlayer } from '../../../src/diagrams/timing/TickInPlayer.js';
import { TimeMessage } from '../../../src/diagrams/timing/TimeMessage.js';
import { svgGraphic } from '../mindmap/helpers/mindmap-skin.js';
import { TestStatePlayer } from './helpers/players.js';
import { svgElements, tick, timingSkinParam } from './helpers/timing.js';

const skinParam = timingSkinParam();
const point = (x: number, y: number): IntricatedPoint => new IntricatedPoint(new XPoint2D(x, y), new XPoint2D(x, y));
const split = (x: number, ya: number, yb: number): IntricatedPoint =>
  new IntricatedPoint(new XPoint2D(x, ya), new XPoint2D(x, yb));

function messageWith(label: string, style?: string): TimeMessage {
  const player = new TestStatePlayer({ skinParam });
  const m = new TimeMessage(new TickInPlayer(player, tick('1')), new TickInPlayer(player, tick('2')), label, skinParam);
  if (style !== undefined) m.applyStyle(style);
  return m;
}

function drawn(arrow: TimeArrow): string[] {
  const ug = svgGraphic();
  arrow.drawU(ug);
  return svgElements(ug.getSvgString());
}

const label = (text: string): Display => Display.getWithNewlines(skinParam.getPragma(), text);

describe('TimeArrow', () => {
  it('draws cov-messages "WU -> WB : URL": the shortest of the four combinations, label above the head', () => {
    const arrow = TimeArrow.create(
      point(134.4, 135),
      split(134.4, 85, 65),
      label('URL'),
      skinParam,
      messageWith('URL'),
    );
    expect(drawn(arrow)).toEqual([
      '<line x1="134.4" y1="135" x2="134.4" y2="85" style="stroke:#00008B;stroke-width:1.5;"/>',
      '<polygon points="137.136,92.518,131.664,92.518,134.4,85" fill="#00008B" style="stroke:#00008B;stroke-width:1.5;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
      '<text x="134.4" y="103.406" fill="#00008B" font-size="14" textLength="28.087" font-family="serif">URL</text>',
    ]);
  });

  it('draws cov-messages "WB -[#red]> WU@350 : back": red line and head, label raised by its height when going down', () => {
    const arrow = TimeArrow.create(
      point(234.4, 65),
      split(259.4, 123, 147),
      label('back'),
      skinParam,
      messageWith('back', '#red'),
    );
    expect(drawn(arrow)).toEqual([
      '<line x1="234.4" y1="65" x2="259.4" y2="123" style="stroke:#F00;stroke-width:1.5;"/>',
      '<polygon points="253.912,117.18,258.937,115.013,259.4,123" fill="#F00" style="stroke:#F00;stroke-width:1.5;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
      '<text x="256.424" y="112.985" fill="#00008B" font-size="14" textLength="29.575" font-family="serif">back</text>',
    ]);
  });

  it('draws cov-message-dotted: no dasharray for -[dotted]>, blue for -[#blue,bold]>', () => {
    const dotted = TimeArrow.create(
      split(75, 40, 64),
      split(75, 94, 118),
      label('dotted'),
      skinParam,
      messageWith('dotted', 'dotted'),
    );
    expect(drawn(dotted)).toEqual([
      '<line x1="75" y1="64" x2="75" y2="94" style="stroke:#00008B;stroke-width:1.5;"/>',
      '<polygon points="72.264,86.482,77.736,86.482,75,94" fill="#00008B" style="stroke:#00008B;stroke-width:1.5;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
      '<text x="75" y="83.371" fill="#00008B" font-size="14" textLength="38.85" font-family="serif">dotted</text>',
    ]);
    const coloured = TimeArrow.create(
      split(95, 40, 64),
      split(115, 94, 118),
      label('coloured'),
      skinParam,
      messageWith('coloured', '#blue,bold'),
    );
    expect(drawn(coloured)).toEqual([
      '<line x1="95" y1="64" x2="115" y2="94" style="stroke:#00F;stroke-width:1.5;"/>',
      '<polygon points="108.553,89.263,113.107,86.227,115,94" fill="#00F" style="stroke:#00F;stroke-width:1.5;stroke-linejoin:miter;stroke-miterlimit:10;"/>',
      '<text x="110.83" y="84.634" fill="#00008B" font-size="14" textLength="53.725" font-family="serif">coloured</text>',
    ]);
  });

  it('keeps the first arrow when two combinations are equally long (shorter is a strict "<")', () => {
    const arrow = TimeArrow.create(split(0, 0, 10), split(10, 5, 5), label(''), skinParam, messageWith(''));
    // a->a and b->a are the same distance from (10,5); the first one drawn from (0,0)? No: shorter(a,b) keeps b on a tie.
    const ug = svgGraphic();
    arrow.drawU(ug);
    expect(svgElements(ug.getSvgString())[0]).toBe(
      '<line x1="0" y1="10" x2="10" y2="5" style="stroke:#00008B;stroke-width:1.5;"/>',
    );
  });

  it('translate moves both ends, the same as translating the points first', () => {
    const t = new UTranslate(100, 50);
    const base = TimeArrow.create(point(1, 2), point(31, 52), label('m'), skinParam, messageWith('m'));
    const direct = TimeArrow.create(
      point(1, 2).translated(t),
      point(31, 52).translated(t),
      label('m'),
      skinParam,
      messageWith('m'),
    );
    expect(drawn(base.translate(t))).toEqual(drawn(direct));
    expect(drawn(direct)[0]).toBe(
      '<line x1="101" y1="52" x2="131" y2="102" style="stroke:#00008B;stroke-width:1.5;"/>',
    );
  });

  it('onCircle puts a point 8 away from the tip at the angle', () => {
    const tip = new XPoint2D(10, 10);
    const left = TimeArrow.onCircle(tip, Math.PI / 2);
    expect(left.getX()).toBeCloseTo(2, 9);
    expect(left.getY()).toBeCloseTo(10, 9);
    const up = TimeArrow.onCircle(tip, 0);
    expect(up.getX()).toBeCloseTo(10, 9);
    expect(up.getY()).toBeCloseTo(2, 9);
  });

  it('throws NullPointerException when its message has no colour (type.getSpecificColor().bg())', () => {
    const m = messageWith('x');
    m.setColors(Colors.empty());
    const arrow = TimeArrow.create(point(0, 0), point(10, 10), label('x'), skinParam, m);
    expect(() => arrow.drawU(svgGraphic())).toThrow('java.lang.NullPointerException');
  });
});
