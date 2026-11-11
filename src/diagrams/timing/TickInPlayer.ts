import type { Player } from './Player.js';
import type { TimeTick } from './TimeTick.js';

/**
 * A tick a message or constraint touches, with the player it belongs to.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/TickInPlayer.java:38-55
 */
export class TickInPlayer {
  readonly #player: Player;
  readonly #tick: TimeTick;

  /** `Objects.requireNonNull(player)`: the tick may be null in Java, `undefined` here. */
  public constructor(player: Player, tick: TimeTick) {
    if ((player as Player | null | undefined) == null) throw new Error('java.lang.NullPointerException');
    this.#player = player;
    this.#tick = tick;
  }

  public getPlayer(): Player {
    return this.#player;
  }

  public getTick(): TimeTick {
    return this.#tick;
  }
}
