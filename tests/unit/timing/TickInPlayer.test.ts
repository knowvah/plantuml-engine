import { describe, expect, it } from 'vitest';

import type { Player } from '../../../src/diagrams/timing/Player.js';
import { TickInPlayer } from '../../../src/diagrams/timing/TickInPlayer.js';
import { TestStatePlayer } from './helpers/players.js';
import { tick } from './helpers/timing.js';

describe('TickInPlayer', () => {
  it('holds the player and the tick it was built with', () => {
    const player = new TestStatePlayer();
    const t = tick('5');
    const tp = new TickInPlayer(player, t);
    expect(tp.getPlayer()).toBe(player);
    expect(tp.getTick()).toBe(t);
  });

  it('requires a player (Objects.requireNonNull)', () => {
    expect(() => new TickInPlayer(null as unknown as Player, tick('5'))).toThrow('java.lang.NullPointerException');
    expect(() => new TickInPlayer(undefined as unknown as Player, tick('5'))).toThrow('java.lang.NullPointerException');
  });
});
