import { describe, expect, it } from 'vitest';

import { TickInPlayer } from '../../../src/diagrams/timing/TickInPlayer.js';
import { TimeMessage } from '../../../src/diagrams/timing/TimeMessage.js';
import { specificColorOf, type TimingSkinParam } from '../../../src/diagrams/timing/timing-klimt.js';
import { TestStatePlayer } from './helpers/players.js';
import { paint, tick, timingSkinParam } from './helpers/timing.js';

function message(label: string, skinParam: TimingSkinParam = timingSkinParam()): TimeMessage {
  const from = new TestStatePlayer();
  const to = new TestStatePlayer();
  return new TimeMessage(new TickInPlayer(from, tick('100')), new TickInPlayer(to, tick('350')), label, skinParam);
}

const specific = (m: TimeMessage): string | undefined => paint(specificColorOf(m.getSpecificColor()));

const noBuilder = (): TimingSkinParam =>
  Object.create(timingSkinParam(), { getCurrentStyleBuilder: { value: () => undefined } }) as TimingSkinParam;

describe('TimeMessage', () => {
  it('keeps the two players, the two ticks and the label', () => {
    const skinParam = timingSkinParam();
    const from = new TestStatePlayer({ skinParam });
    const to = new TestStatePlayer({ skinParam });
    const m = new TimeMessage(new TickInPlayer(from, tick('100')), new TickInPlayer(to, tick('350')), 'URL', skinParam);
    expect(m.getPlayer1()).toBe(from);
    expect(m.getPlayer2()).toBe(to);
    expect(m.getTick1().getTime().toPlainString()).toBe('100');
    expect(m.getTick2().getTime().toPlainString()).toBe('350');
    expect(m.getLabel().toString()).toBe('[URL]');
  });

  it('starts darkblue from the arrow style, with the style stroke (cov-messages: #00008B, width 1.5)', () => {
    const m = message('URL');
    expect(specific(m)).toBe('#00008B');
    expect(m.getUStroke().getThickness()).toBe(1.5);
    expect(m.getType().looksLikeNoDecorAtAllSvg()).toBe(true);
  });

  it('takes -[#red]> as the specific colour (cov-messages "back" arrow, #F00)', () => {
    const m = message('back');
    m.applyStyle('#red');
    expect(specific(m)).toBe('#FF0000');
  });

  it('ignores dotted and bold in the stroke (cov-message-dotted: the dotted arrow has no dasharray)', () => {
    const m = message('dotted');
    m.applyStyle('dotted');
    m.applyStyle('#blue,bold');
    expect(specific(m)).toBe('#0000FF');
    expect(m.getUStroke().getDashVisible()).toBe(0);
    expect(m.getUStroke().getThickness()).toBe(1.5);
  });

  it('goNorank does nothing', () => {
    const m = message('x');
    m.goNorank();
    expect(specific(m)).toBe('#00008B');
  });

  it('with no style builder, falls back to HColors.MY_RED #A80036 and a 1.5 stroke (java:73-84)', () => {
    const m = message('x', noBuilder());
    expect(specific(m)).toBe('#A80036');
    expect(m.getUStroke().getThickness()).toBe(1.5);
  });
});
