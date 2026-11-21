/**
 * The eleven player, state and time commands (T3b): each grammar against the lines Java accepts and refuses, each
 * `executeArg` against the diagram call it makes, and whole probes against the jar's drawn body.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { CommandControl } from '../../../src/core/command/CommandControl.js';
import { ParserPass } from '../../../src/core/command/ParserPass.js';
import { BigDecimal } from '../../../src/core/decimal/BigDecimal.js';
import { StringLocated } from '../../../src/core/tim/StringLocated.js';
import { CommandAnalog } from '../../../src/diagrams/timing/command/CommandAnalog.js';
import { CommandAtPlayer } from '../../../src/diagrams/timing/command/CommandAtPlayer.js';
import { CommandAtTime } from '../../../src/diagrams/timing/command/CommandAtTime.js';
import { CommandBinary } from '../../../src/diagrams/timing/command/CommandBinary.js';
import { CommandChangeState } from '../../../src/diagrams/timing/command/CommandChangeState.js';
import { CommandChangeStateByPlayerCode } from '../../../src/diagrams/timing/command/CommandChangeStateByPlayerCode.js';
import { CommandClock } from '../../../src/diagrams/timing/command/CommandClock.js';
import { CommandDefineStateLong } from '../../../src/diagrams/timing/command/CommandDefineStateLong.js';
import { CommandDefineStateShort } from '../../../src/diagrams/timing/command/CommandDefineStateShort.js';
import { CommandDigital } from '../../../src/diagrams/timing/command/CommandDigital.js';
import type { CommandNumericPlayer } from '../../../src/diagrams/timing/command/CommandNumericPlayer.js';
import { CommandConcise } from '../../../src/diagrams/timing/command/CommandConcise.js';
import { CommandRectangle } from '../../../src/diagrams/timing/command/CommandRectangle.js';
import { CommandRobust } from '../../../src/diagrams/timing/command/CommandRobust.js';
import type { CommandStatePlayer } from '../../../src/diagrams/timing/command/CommandStatePlayer.js';
import { PLAYER_CODE } from '../../../src/diagrams/timing/command/player-code.js';
import { AbstractNumericPlayer } from '../../../src/diagrams/timing/AbstractNumericPlayer.js';
import { PlayerDigital } from '../../../src/diagrams/timing/PlayerDigital.js';
import { PROBE_BODIES } from './helpers/probe-bodies.js';
import { drawBody, newDiagram, runLine, runLines, runSource, singleLineCommands } from './helpers/commands.js';
import { paint } from './helpers/timing.js';

const PROBES = new URL('../../../plans/timing-engine-port/probes/', import.meta.url);

function accepts(command: { isValid(line: StringLocated): CommandControl }, line: string): boolean {
  return command.isValid(new StringLocated(line, undefined)) === CommandControl.OK;
}

function claimedBy(line: string): string | undefined {
  return singleLineCommands().find((c) => accepts(c, line))?.constructor.name;
}

describe('PLAYER_CODE (CommandTimeMessage.java:56)', () => {
  it('starts with a letter or underscore, then letters, digits, underscore and dot', () => {
    const re = new RegExp(`^${PLAYER_CODE.replace('%pLN', String.raw`\p{L}\p{N}`)}$`, 'u');
    expect(['WB', '_x', 'a.b_1', 'é'].map((s) => re.test(s))).toEqual([true, true, true, true]);
    expect(['1a', '.a', 'a-b', ''].map((s) => re.test(s))).toEqual([false, false, false, false]);
  });
});

describe('command order claims a line (TimingDiagramFactory.java:83-109)', () => {
  it.each([
    ['robust "Web Browser" as WB', 'CommandRobust'],
    ['compact concise WU', 'CommandConcise'],
    ['rectangle R #pink', 'CommandRectangle'],
    ['clock clk with period 50', 'CommandClock'],
    ['analog "Vcc" between -4.5 and 6.5 as VCC', 'CommandAnalog'],
    ['digital D between 0 and 3', 'CommandDigital'],
    ['binary "Enable" as EN', 'CommandBinary'],
    ['R has Idle,Busy', 'CommandDefineStateShort'],
    ['R has "Long Label" as LL', 'CommandDefineStateLong'],
    ['WB is Idle', 'CommandChangeStateByPlayerCode'],
    ['100 is Idle', 'CommandChangeStateByTime'],
    ['@100', 'CommandAtTime'],
    ['@WB', 'CommandAtPlayer'],
  ])('%s is %s', (line, name) => {
    expect(claimedBy(line)).toBe(name);
  });

  it('refuses a line no command knows', () => {
    expect(claimedBy('stop at 10')).toBeUndefined();
    expect(() => runLine(newDiagram(), 'stop at 10')).toThrow('no command accepts');
  });
});

describe('CommandStatePlayer: CommandRobust, CommandConcise, CommandRectangle (CommandStatePlayer.java:59-146)', () => {
  it('each accepts its own keyword, an optional compact, full and code', () => {
    const concise = new CommandConcise();
    for (const line of [
      'concise "Web Browser" as WB',
      'concise WU',
      'compact concise X',
      'concise "A" <<s>> as A',
      'concise A <<s>>',
      'concise A #pink',
      '  concise A  ',
    ])
      expect([line, accepts(concise, line)]).toEqual([line, true]);
    for (const line of ['concisex A', 'robust A', 'rectangle A', 'concise', 'concise "A" A', 'concise "" as A'])
      expect([line, accepts(concise, line)]).toEqual([line, false]);
    expect([accepts(new CommandRobust(), 'compact robust X'), accepts(new CommandRobust(), 'concise X')]).toEqual([
      true,
      false,
    ]);
    expect([accepts(new CommandRectangle(), 'rectangle R'), accepts(new CommandRectangle(), 'robust R')]).toEqual([
      true,
      false,
    ]);
  });

  it('explains the line as Java does (CommandStatePlayer.java:107-126)', () => {
    const explain = (command: CommandStatePlayer, line: string): string | undefined =>
      command.explain(new StringLocated(line, undefined));
    expect(explain(new CommandRobust(), 'robust "Web Browser" as WB')).toBe(
      'Creating a robust timing player \'WB\' displayed as "Web Browser"',
    );
    expect(explain(new CommandConcise(), 'compact concise A <<s>> #pink')).toBe(
      "Creating a compact concise timing player 'A' stereotyped <<s>> with background color #pink",
    );
    expect(explain(new CommandRectangle(), 'robust A')).toBeUndefined();
  });

  it('calls createPlayerRobust(code, full, compact, stereotype, back) as Java does', () => {
    const d = newDiagram();
    const spy = vi.spyOn(d, 'createPlayerRobust');
    expect(runLine(d, 'robust "Web Browser" as WB').isOk()).toBe(true);
    expect(spy).toHaveBeenCalledWith('WB', 'Web Browser', false, undefined, undefined);
    runLine(d, 'compact robust X');
    expect(spy).toHaveBeenLastCalledWith('X', '', true, undefined, undefined);
  });

  it('takes the stereotype from either slot, STEREOTYPE first', () => {
    const d = newDiagram();
    const spy = vi.spyOn(d, 'createPlayerConcise');
    runLine(d, 'concise "A" <<first>> as A');
    runLine(d, 'concise B <<second>>');
    const stereo = (n: number): string => String(spy.mock.calls[n]![3]);
    expect([stereo(0), stereo(1)]).toEqual(['<<first>>', '<<second>>']);
  });

  it('a background colour reaches the player, and a bad colour is "No such color"', () => {
    const d = newDiagram();
    const spy = vi.spyOn(d, 'createPlayerRectangle');
    runLine(d, 'rectangle R #pink');
    expect(spy).toHaveBeenCalledWith('R', '', false, undefined, expect.anything());
    expect(paint(spy.mock.calls[0]![4])).toBe('#FFC0CB');
    const bad = runLine(d, 'rectangle S #nosuchcolourname');
    expect([bad.isOk(), bad.getError()]).toEqual([false, 'No such color']);
  });

  it('builds the three player kinds', () => {
    const d = newDiagram();
    for (const line of ['robust A', 'concise B', 'rectangle C']) runLine(d, line);
    expect(['A', 'B', 'C'].map((c) => d.getPlayer(c)?.constructor.name)).toEqual([
      'PlayerRobust',
      'PlayerConcise',
      'PlayerRectangle',
    ]);
    expect(d.getLastPlayer()).toBe(d.getPlayer('C'));
  });
});

describe('CommandClock (CommandClock.java:54-151)', () => {
  const command = new CommandClock();

  it('needs "with period N"; pulse and offset are optional, in that order', () => {
    for (const line of [
      'clock clk with period 50',
      'clock "Clock_0" as C0 with period 50',
      'clock clk with period 0.5',
      'clock clk with period 50 pulse 15',
      'clock clk with period 50 offset 10',
      'clock clk with period 50 pulse 15 offset 10',
      'compact clock clk with period 50 <<s>>',
    ])
      expect([line, accepts(command, line)]).toEqual([line, true]);
    for (const line of [
      'clock clk',
      'clock clk with period',
      'clock clk with period .5',
      'clock clk with period 50 offset 10 pulse 15',
      'clock clk with period -5',
    ])
      expect([line, accepts(command, line)]).toEqual([line, false]);
  });

  it('calls createPlayerClock with BigDecimals, ZERO for an absent pulse and offset', () => {
    const d = newDiagram();
    const spy = vi.spyOn(d, 'createPlayerClock');
    expect(runLine(d, 'clock clk with period 50').isOk()).toBe(true);
    const a = spy.mock.calls[0]![0];
    expect([a.code, a.full, a.period.toPlainString(), a.pulse, a.offset, a.compact, a.stereotype]).toEqual([
      'clk',
      '',
      '50',
      BigDecimal.ZERO,
      BigDecimal.ZERO,
      false,
      undefined,
    ]);
  });

  it('reads full, decimals, pulse, offset, compact and the stereotype (cov-clock-pulse-offset)', () => {
    const d = newDiagram();
    const spy = vi.spyOn(d, 'createPlayerClock');
    runLine(d, 'compact clock "Clock_1" as C1 with period 2.50 pulse 15 offset 10 <<s>>');
    const a = spy.mock.calls[0]![0];
    expect([a.code, a.full, a.period.toPlainString(), a.pulse.toPlainString(), a.offset.toPlainString()]).toEqual([
      'C1',
      'Clock_1',
      '2.50',
      '15',
      '10',
    ]);
    expect([a.compact, String(a.stereotype)]).toEqual([true, '<<s>>']);
  });
});

describe('CommandNumericPlayer: CommandAnalog, CommandDigital (CommandNumericPlayer.java:57-207)', () => {
  const command = new CommandAnalog();

  it('takes "Display" as CODE [bounds], "Display" bounds as CODE, or CODE [bounds]', () => {
    for (const line of [
      'analog "Vcore" as VDD',
      'analog "Vcc" between -4.5 and 6.5 as VCC',
      'analog "V" from 1 to 5 as V',
      'analog "V" between .5 and 2 as V',
      'compact analog "V" <<s>> as V',
      'analog "V" as V <<t>>',
      'analog "V" as V between 1 and 2',
      'analog "V" as V <<t>> from 1 to 2 <<u>>',
      'analog V',
      'analog V between 350 and 450',
      'compact analog V <<s>> from 0 to 1',
    ])
      expect([line, accepts(command, line)]).toEqual([line, true]);
    for (const line of [
      'analog "V"',
      'analog',
      'analog "V" between 1 as V',
      'analog "V" between 1 or 2 as V',
      'analog V between 1 and 2 as V',
      'digital V',
    ])
      expect([line, accepts(command, line)]).toEqual([line, false]);
    expect([
      accepts(new CommandDigital(), 'compact digital "D" as D'),
      accepts(new CommandDigital(), 'analog D'),
    ]).toEqual([true, false]);
  });

  it('calls createPlayerAnalog and setBounds only when both bounds are present', () => {
    const d = newDiagram();
    const create = vi.spyOn(d, 'createPlayerAnalog');
    const bounds = vi.spyOn(AbstractNumericPlayer.prototype, 'setBounds');
    try {
      runLine(d, 'analog "Vcore" as VDD');
      expect(create).toHaveBeenLastCalledWith('VDD', 'Vcore', false, undefined);
      expect(bounds).not.toHaveBeenCalled();
      runLine(d, 'compact analog "Vcc" <<s>> between -4.5 and 6.5 as VCC');
      expect(create.mock.calls[1]!.slice(0, 3)).toEqual(['VCC', 'Vcc', true]);
      expect(String(create.mock.calls[1]![3])).toBe('<<s>>');
      expect(bounds).toHaveBeenLastCalledWith('-4.5', '6.5');
      runLine(d, 'analog "A" as A from 1 to 2');
      expect(bounds).toHaveBeenLastCalledWith('1', '2');
      runLine(d, 'analog A between 350 and 450');
      expect(create).toHaveBeenLastCalledWith('A', '', false, undefined);
      expect(bounds).toHaveBeenLastCalledWith('350', '450');
    } finally {
      bounds.mockRestore();
    }
  });

  it('digital builds a PlayerDigital, which takes ticks', () => {
    const d = newDiagram();
    const create = vi.spyOn(d, 'createPlayerDigital');
    runLine(d, 'digital D <<s>> between 0 and 3');
    expect(create.mock.calls[0]!.slice(0, 3)).toEqual(['D', '', false]);
    expect(String(create.mock.calls[0]![3])).toBe('<<s>>');
    expect(d.getPlayer('D')).toBeInstanceOf(PlayerDigital);
    const ticks = vi.spyOn(AbstractNumericPlayer.prototype, 'setTicks');
    try {
      expect(runLine(d, 'D ticks every 2').isOk()).toBe(true);
      expect(ticks).toHaveBeenCalledWith(2);
    } finally {
      ticks.mockRestore();
    }
  });

  it('explains the line as Java does (CommandNumericPlayer.java:160-182)', () => {
    const explain = (c: CommandNumericPlayer, line: string): string | undefined =>
      c.explain(new StringLocated(line, undefined));
    expect(explain(command, 'analog "Vcc" between -4.5 and 6.5 as VCC')).toBe(
      'Creating an analog timing player \'VCC\' displayed as "Vcc" with bounds from -4.5 to 6.5',
    );
    expect(explain(new CommandDigital(), 'compact digital D <<s>>')).toBe(
      "Creating a compact digital timing player 'D' stereotyped <<s>>",
    );
    expect(explain(command, 'digital D')).toBeUndefined();
  });
});

describe('analog and binary stereotype slots', () => {
  it('analog takes STEREOTYPE2 after the code; binary takes STEREOTYPE after the full name', () => {
    const d = newDiagram();
    const analog = vi.spyOn(d, 'createPlayerAnalog');
    const binary = vi.spyOn(d, 'createPlayerBinary');
    runLine(d, 'analog "V" as V <<t>>');
    runLine(d, 'binary "E" <<s>> as EN');
    expect([String(analog.mock.calls[0]![3]), String(binary.mock.calls[0]![3])]).toEqual(['<<t>>', '<<s>>']);
  });
});

describe('CommandBinary (CommandBinary.java:52-118)', () => {
  const command = new CommandBinary();

  it('accepts binary with an optional full "as" and compact', () => {
    for (const line of [
      'binary EN',
      'binary "Enable" as EN',
      'compact binary EN',
      'binary "E" <<s>> as EN',
      'binary EN <<s>>',
    ])
      expect([line, accepts(command, line)]).toEqual([line, true]);
    for (const line of ['binary', 'binary "E" EN', 'binaries EN'])
      expect([line, accepts(command, line)]).toEqual([line, false]);
  });

  it('calls createPlayerBinary(code, full, compact, stereotype)', () => {
    const d = newDiagram();
    const spy = vi.spyOn(d, 'createPlayerBinary');
    runLine(d, 'binary "Enable" as EN');
    expect(spy).toHaveBeenLastCalledWith('EN', 'Enable', false, undefined);
    runLine(d, 'compact binary B2 <<x>>');
    expect(spy.mock.calls[1]!.slice(0, 3)).toEqual(['B2', '', true]);
    expect(String(spy.mock.calls[1]![3])).toBe('<<x>>');
  });
});

describe('CommandDefineStateShort / Long (java:52-105, 50-91)', () => {
  it('Short: one state, then comma separated states', () => {
    const short = new CommandDefineStateShort();
    for (const line of ['R has Idle', 'R has Idle,Busy,Off', 'R has -,x@y'])
      expect([line, accepts(short, line)]).toEqual([line, true]);
    for (const line of ['R has', 'R has Idle,', 'R have Idle'])
      expect([line, accepts(short, line)]).toEqual([line, false]);
  });

  it('Short defines each state with its code as its label', () => {
    const d = newDiagram();
    runLine(d, 'robust "R" as R');
    const player = d.getPlayer('R')!;
    const spy = vi.spyOn(player, 'defineState');
    expect(runLine(d, 'R has Idle,Busy,Off').isOk()).toBe(true);
    expect(spy.mock.calls).toEqual([
      ['Idle', 'Idle'],
      ['Busy', 'Busy'],
      ['Off', 'Off'],
    ]);
    spy.mockClear();
    runLine(d, 'R has Solo');
    expect(spy.mock.calls).toEqual([['Solo', 'Solo']]);
  });

  it('Long: a quoted label and its code', () => {
    const long = new CommandDefineStateLong();
    expect(accepts(long, 'R has "Long Label" as LL')).toBe(true);
    expect(accepts(long, 'R has Long as LL')).toBe(false);
    expect(accepts(long, 'R has "" as LL')).toBe(false);
    const d = newDiagram();
    runLine(d, 'robust "R" as R');
    const spy = vi.spyOn(d.getPlayer('R')!, 'defineState');
    expect(runLine(d, 'R has "Long Label" as LL').isOk()).toBe(true);
    expect(spy.mock.calls).toEqual([['LL', 'Long Label']]);
  });

  it('both fail with "Unknown X" (no quotes) for an undeclared player', () => {
    const d = newDiagram();
    const a = runLine(d, 'X has Idle');
    const b = runLine(d, 'X has "L" as LL');
    expect([a.isOk(), a.getError(), b.isOk(), b.getError()]).toEqual([false, 'Unknown X', false, 'Unknown X']);
  });
});

describe('CommandChangeState and its two subclasses', () => {
  it('STATE_CODE and the seven alternatives, in order', () => {
    expect(CommandChangeState.STATE_CODE).toBe('([-%pLN_][-%pLN_.]*)');
    const command = new CommandChangeStateByPlayerCode();
    for (const state of ['"quoted state"', '""', 'Idle', '-', '{hidden}', '{...}', '{-}', '{?}', '{A,B}', 'a.b'])
      expect([state, accepts(command, `WB is ${state}`)]).toEqual([state, true]);
    for (const state of ['', '{unknown}', '{A}', '{A,}', '.x'])
      expect([state, accepts(command, `WB is ${state}`)]).toEqual([state, false]);
  });

  it('ByPlayerCode: unknown player is `Unknown "X"` (cov-unknown-player), with quotes', () => {
    const { results } = runLines('concise "C" as C', '@0', 'X is a');
    expect([results[2]!.isOk(), results[2]!.getError()]).toEqual([false, 'Unknown "X"']);
  });

  it('ByPlayerCode: setState(now, comment, colors, ...states) with each alternative', () => {
    const d = newDiagram();
    runLine(d, 'robust "R" as R');
    const spy = vi.spyOn(d.getPlayer('R')!, 'setState');
    runLine(d, '@5 as :five');
    for (const state of ['Idle', '"quoted state"', '{hidden}', '{...}', '{-}', '{?}', '{A,B}'])
      expect(runLine(d, `R is ${state}`).isOk()).toBe(true);
    expect(spy.mock.calls.map((c) => c.slice(3))).toEqual([
      ['Idle'],
      ['quoted state'],
      ['{hidden}'],
      ['{...}'],
      ['{-}'],
      ['{?}'],
      ['A', 'B'],
    ]);
    expect(spy.mock.calls.every((c) => c[0] === d.getCodeValue('five'))).toBe(true);
  });

  it('ByPlayerCode: colour and comment (cov-state-colors)', () => {
    const d = newDiagram();
    runLine(d, 'concise "C" as C');
    const spy = vi.spyOn(d.getPlayer('C')!, 'setState');
    runLine(d, 'C is A #pink');
    runLine(d, 'C is B : comment');
    runLine(d, 'C is D #pink : with both');
    const back = (n: number): string | undefined => {
      const c = spy.mock.calls[n]![2].getColor('BACK');
      return c === undefined ? undefined : paint(c);
    };
    expect([spy.mock.calls[0]![1], spy.mock.calls[1]![1], spy.mock.calls[2]![1]]).toEqual([
      undefined,
      'comment',
      'with both',
    ]);
    expect([back(0), back(1), back(2)]).toEqual(['#FFC0CB', undefined, '#FFC0CB']);
  });

  it('ByTime: no last player is "Missing @ line before this"', () => {
    const d = newDiagram();
    const result = runLine(d, '100 is Idle');
    expect([result.isOk(), result.getError()]).toEqual([false, 'Missing @ line before this']);
  });

  it("ByTime: adds the tick (not as a code) and sets the last player's state", () => {
    const d = newDiagram();
    runLine(d, 'concise "A" as A');
    const spy = vi.spyOn(d.getPlayer('A')!, 'setState');
    expect(runLine(d, '100 is Idle').isOk()).toBe(true);
    expect(runLine(d, '+50 is Busy').isOk()).toBe(true);
    expect(spy.mock.calls.map((c) => [c[0]?.getTime().toPlainString(), ...c.slice(3)])).toEqual([
      ['100', 'Idle'],
      ['150', 'Busy'],
    ]);
    expect(d.getNow()?.getTime().toPlainString()).toBe('150');
  });

  it('ByTime: a tick that resolves to null reaches the ruler and throws (Java NullPointerException)', () => {
    const d = newDiagram();
    runLine(d, 'concise "A" as A');
    expect(() => runLine(d, 'nope*2 is x')).toThrow(TypeError);
  });
});

describe('CommandAtTime and CommandAtPlayer', () => {
  it('AtTime: @time, optional "as :code"', () => {
    const command = new CommandAtTime();
    for (const line of [
      '@0',
      '@+10',
      '@-5',
      '@1:15:00',
      '@2020/07/04',
      '@clk*2',
      '@:start+3',
      '@0 as :start',
      '@0 as :a.b ',
    ])
      expect([line, accepts(command, line)]).toEqual([line, true]);
    for (const line of ['0', '@', '@0 as start', '@0 as :'])
      expect([line, accepts(command, line)]).toEqual([line, false]);
  });

  it('AtTime: adds the tick and its code; @:code reads it back (cov-anchors)', () => {
    const { diagram, results } = runLines('@0 as :start', '@5 as :en_high', '@:start', '@:en_high+3');
    expect(results.map((r) => r.isOk())).toEqual([true, true, true, true]);
    expect(diagram.getCodeValue('start')?.getTime().toPlainString()).toBe('0');
    expect(diagram.getCodeValue('en_high')?.getTime().toPlainString()).toBe('5');
    expect(diagram.getNow()?.getTime().toPlainString()).toBe('8');
  });

  it('AtTime: a time that resolves to null is "What time?"', () => {
    const d = newDiagram();
    const result = runLine(d, '@:nope');
    expect([result.isOk(), result.getError()]).toEqual([false, 'What time?']);
    expect(d.getNow()).toBeUndefined();
  });

  it('AtPlayer: a player code, and sets the last player (cov-at-player)', () => {
    const command = new CommandAtPlayer();
    expect([
      accepts(command, '@WB'),
      accepts(command, '@WB  '),
      accepts(command, '@1WB'),
      accepts(command, '@'),
    ]).toEqual([true, true, false, false]);
    const { diagram, results } = runLines('robust "R" as R', 'concise "C" as C', '@R');
    expect(results[2]!.isOk()).toBe(true);
    expect(diagram.getLastPlayer()).toBe(diagram.getPlayer('R'));
  });

  it('AtPlayer: an unknown player is "No such participant X"', () => {
    const result = runLine(newDiagram(), '@X');
    expect([result.isOk(), result.getError()]).toEqual([false, 'No such participant X']);
  });
});

describe('whole probes drawn from the commands match the jar body', () => {
  it.each(Object.keys(PROBE_BODIES))('%s', (slug) => {
    const source = readFileSync(new URL(`${slug}.puml`, PROBES), 'utf8');
    expect(drawBody(runSource(source))).toEqual(PROBE_BODIES[slug]);
  });

  it('cov-unknown-player: the line errors, the command run stops there', () => {
    const { results } = runLines(
      ...readFileSync(new URL('cov-unknown-player.puml', PROBES), 'utf8')
        .split('\n')
        .filter((l) => l !== '' && !l.startsWith('@start') && !l.startsWith('@end')),
    );
    expect(results.map((r) => r.isOk())).toEqual([true, true, false]);
  });
});

describe('ParserPass', () => {
  it('every command is eligible for pass ONE only', () => {
    for (const c of singleLineCommands())
      expect([c.isEligibleFor(ParserPass.ONE), c.isEligibleFor(ParserPass.TWO)]).toEqual([true, false]);
  });
});
