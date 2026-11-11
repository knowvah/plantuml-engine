import { describe, expect, it } from 'vitest';

import { Colors } from '../../../src/core/abel/Colors.js';
import type { ArrowConfiguration } from '../../../src/diagrams/sequence/sequence-arrowhead.js';
import { TestStatePlayer } from './helpers/players.js';
import { tick } from './helpers/timing.js';

const NO_COLORS = Colors.empty();
const CONFIG: ArrowConfiguration = {
  dressing1: { head: 'NORMAL', part: 'FULL' },
  dressing2: { head: 'NORMAL', part: 'FULL' },
  decoration1: 'NONE',
  decoration2: 'NONE',
  dashed: false,
};

describe('AbstractStatePlayer', () => {
  it('drops a second change at an equal tick: @1 then @1.0 keeps the first (D6)', () => {
    const player = new TestStatePlayer();
    player.setState(tick('1'), undefined, NO_COLORS, 'First');
    player.setState(tick('1.0'), undefined, NO_COLORS, 'Second');
    expect(player.changes().map((c) => c.getState())).toEqual(['First']);
    expect(player.changes()[0]?.getWhen().getTime().toPlainString()).toBe('1');
  });

  it('keeps changes sorted by tick whatever the order they were set in', () => {
    const player = new TestStatePlayer();
    player.setState(tick('300'), undefined, NO_COLORS, 'C');
    player.setState(tick('0'), undefined, NO_COLORS, 'A');
    player.setState(tick('100'), 'why', NO_COLORS, 'B');
    expect(player.changes().map((c) => [c.getState(), c.getComment()])).toEqual([
      ['A', undefined],
      ['B', 'why'],
      ['C', undefined],
    ]);
  });

  it('maps a defined state code to its label (cov-define-states: LL = Long Label)', () => {
    const player = new TestStatePlayer();
    player.defineState('LL', 'Long Label');
    player.setState(tick('0'), undefined, NO_COLORS, 'LL', 'plain');
    expect(player.labels().get('LL')).toBe('Long Label');
    expect(player.changes()[0]?.getStates()).toEqual(['Long Label', 'plain']);
  });

  it('decodes the initial state too, and keeps its colours (a null tick is the initial state)', () => {
    const player = new TestStatePlayer();
    player.defineState('LL', 'Long Label');
    player.setState(undefined, undefined, NO_COLORS, 'LL');
    expect(player.initialState()).toBe('Long Label');
    expect(player.initialColors()).toBe(NO_COLORS);
    expect(player.changes()).toEqual([]);
  });

  it('re-defining a code replaces the label and keeps its first position', () => {
    const player = new TestStatePlayer();
    player.defineState('A', 'one');
    player.defineState('B', 'two');
    player.defineState('A', 'three');
    expect([...player.labels()]).toEqual([
      ['A', 'three'],
      ['B', 'two'],
    ]);
  });

  it('throws ArrayIndexOutOfBounds for an initial state with no state (states[0])', () => {
    expect(() => new TestStatePlayer().setState(undefined, undefined, NO_COLORS)).toThrow(
      'java.lang.ArrayIndexOutOfBoundsException',
    );
  });

  it('rejects a change with no state (ChangeState: IllegalArgumentException)', () => {
    expect(() => new TestStatePlayer().setState(tick('1'), undefined, NO_COLORS)).toThrow(
      'java.lang.IllegalArgumentException',
    );
  });

  it('stores the constraint between its two ticks, with its label', () => {
    const player = new TestStatePlayer();
    player.createConstraint(tick('0'), tick('100'), '{50 ms lag}', CONFIG);
    const [constraint] = player.constraints();
    expect(player.constraints()).toHaveLength(1);
    expect(constraint?.getTick1().getTime().toPlainString()).toBe('0');
    expect(constraint?.getTick2().getTime().toPlainString()).toBe('100');
    expect(constraint?.getLabel().toString()).toBe('[{50 ms lag}]');
  });
});
