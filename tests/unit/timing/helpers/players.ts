/** A concrete state player over the abstract ones, for tests that need a `Player` before T2c's real ones. */
import type { Colors } from '../../../../src/core/abel/Colors.js';
import { AbstractStatePlayer } from '../../../../src/diagrams/timing/AbstractStatePlayer.js';
import type { ChangeState } from '../../../../src/diagrams/timing/ChangeState.js';
import type { Panels } from '../../../../src/diagrams/timing/graphic/Panels.js';
import type { PlayerBaseArgs } from '../../../../src/diagrams/timing/Player.js';
import type { TimeConstraint } from '../../../../src/diagrams/timing/TimeConstraint.js';
import type { TimingNote } from '../../../../src/diagrams/timing/TimingNote.js';
import { tick, timingSkinParam } from './timing.js';
import { PlayerConcise } from '../../../../src/diagrams/timing/PlayerConcise.js';
import { PlayerRectangle } from '../../../../src/diagrams/timing/PlayerRectangle.js';
import { PlayerRobust } from '../../../../src/diagrams/timing/PlayerRobust.js';
import { PlayerAnalog } from '../../../../src/diagrams/timing/PlayerAnalog.js';
import { PlayerBinary } from '../../../../src/diagrams/timing/PlayerBinary.js';
import { PlayerClock } from '../../../../src/diagrams/timing/PlayerClock.js';
import { BigDecimal } from '../../../../src/core/decimal/BigDecimal.js';
import { TimingRuler } from '../../../../src/diagrams/timing/TimingRuler.js';

/** `buildPlayerPanels` answers a marker and counts its calls. */
export class TestStatePlayer extends AbstractStatePlayer {
  public builds = 0;
  public readonly marker = {} as Panels;

  public constructor(args: Partial<PlayerBaseArgs> = {}) {
    const skinParam = args.skinParam ?? timingSkinParam();
    super({
      title: 'Web User',
      skinParam,
      ruler: new TimingRuler(skinParam),
      compact: false,
      stereotype: undefined,
      generalBackgroundColor: undefined,
      ...args,
      sname: 'concise',
      constraintOffset: 1,
    });
  }

  protected override buildPlayerPanels(): Panels {
    this.builds++;
    return this.marker;
  }

  public changes(): readonly ChangeState[] {
    return this.getChanges();
  }
  public constraints(): readonly TimeConstraint[] {
    return this.getConstraints();
  }
  public labels(): ReadonlyMap<string, string> {
    return this.getStatesLabel();
  }
  public initialState(): string | undefined {
    return this.getInitialState();
  }
  public initialColors(): Colors | undefined {
    return this.getInitialColors();
  }
  public style(): ReturnType<AbstractStatePlayer['getStyle']> {
    return this.getStyle();
  }
  public notesOf(): readonly TimingNote[] {
    return this.getNotes();
  }
}

/** A real concise or rectangle player over a fresh ruler; `ticks` are added to the ruler as `@time` does. */
export function statePlayer(
  kind: 'concise' | 'rectangle',
  options: Partial<PlayerBaseArgs> & { ticks?: readonly string[] } = {},
): PlayerConcise | PlayerRectangle {
  const skinParam = options.skinParam ?? timingSkinParam();
  const args: PlayerBaseArgs = {
    title: 'P',
    skinParam,
    ruler: new TimingRuler(skinParam),
    compact: false,
    stereotype: undefined,
    generalBackgroundColor: undefined,
    ...options,
  };
  for (const t of options.ticks ?? []) args.ruler.addTime(tick(t));
  return kind === 'concise' ? new PlayerConcise(args) : new PlayerRectangle(args);
}

/** A real robust player over a fresh ruler (or the `ruler` given); `ticks` are added to the ruler as `@time` does. */
export function robustPlayer(options: Partial<PlayerBaseArgs> & { ticks?: readonly string[] } = {}): PlayerRobust {
  const skinParam = options.skinParam ?? timingSkinParam();
  const args: PlayerBaseArgs = {
    title: 'P',
    skinParam,
    ruler: new TimingRuler(skinParam),
    compact: false,
    stereotype: undefined,
    generalBackgroundColor: undefined,
    ...options,
  };
  for (const t of options.ticks ?? []) args.ruler.addTime(tick(t));
  return new PlayerRobust(args);
}

type Options = Partial<Omit<PlayerBaseArgs, 'generalBackgroundColor'>> & { ticks?: readonly string[] };

function baseArgs(options: Options): Omit<PlayerBaseArgs, 'generalBackgroundColor'> {
  const skinParam = options.skinParam ?? timingSkinParam();
  const args = {
    title: 'P',
    skinParam,
    ruler: new TimingRuler(skinParam),
    compact: false,
    stereotype: undefined,
    ...options,
  };
  for (const t of options.ticks ?? []) args.ruler.addTime(tick(t));
  return args;
}

/** A real binary player; `ticks` are added to the ruler as `@time` does. */
export function binaryPlayer(options: Options = {}): PlayerBinary {
  return new PlayerBinary(baseArgs(options));
}

/** A real analog player; `ticks` are added to the ruler as `@time` does. */
export function analogPlayer(options: Options = {}): PlayerAnalog {
  return new PlayerAnalog(baseArgs(options));
}

/** A real clock player: `period`, `pulse`, `offset` as the command's decimal text (`pulse`/`offset` default to 0). */
export function clockPlayer(options: Options & { period: string; pulse?: string; offset?: string }): PlayerClock {
  const { period, pulse, offset, ...rest } = options;
  return new PlayerClock({
    ...baseArgs(rest),
    period: new BigDecimal(period),
    pulse: new BigDecimal(pulse ?? '0'),
    offset: new BigDecimal(offset ?? '0'),
  });
}
