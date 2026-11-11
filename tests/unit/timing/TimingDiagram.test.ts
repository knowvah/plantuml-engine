/**
 * `TimingDiagram`, built by direct calls (no parser yet) against the planning probe oracles
 * `cov-concise-basic` (251 x 106) and `cov-robust-basic` (410 x 135). The oracle's canvas is the text block plus the
 * document chrome (10 px margin each side, plus 1), and its body starts at the text block's 10 px margin plus the
 * chrome's 10.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/TimingDiagram.java
 */
import { describe, expect, it } from 'vitest';
import { BigDecimal } from '../../../src/core/decimal/BigDecimal.js';
import { Colors } from '../../../src/core/abel/Colors.js';
import { Display } from '../../../src/core/klimt/creole/Display.js';
import { UTranslate } from '../../../src/core/klimt/UTranslate.js';
import { Pragma } from '../../../src/core/skin/Pragma.js';
import { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';
import { PlayerClock } from '../../../src/diagrams/timing/PlayerClock.js';
import { TimeAxisStategy } from '../../../src/diagrams/timing/TimeAxisStategy.js';
import type { TimeTick } from '../../../src/diagrams/timing/TimeTick.js';
import { TimingDiagram } from '../../../src/diagrams/timing/TimingDiagram.js';
import { TimingFormat } from '../../../src/diagrams/timing/TimingFormat.js';
import type { SkinParam } from '../../../src/diagrams/timing/timing-skin-param.js';
import { stringBounder, svgGraphic } from '../mindmap/helpers/mindmap-skin.js';
import { CONCISE_BASIC_BODY, ROBUST_BASIC_BODY } from './helpers/oracle.js';
import { svgElements, tick, timingSkinParam } from './helpers/timing.js';

const CHROME = 10;

function diagram(skinParam: SkinParam = timingSkinParam() as SkinParam): TimingDiagram {
  return new TimingDiagram({ lines: [] }, new PreprocessingArtifact(), skinParam);
}

/** Every drawn element of the diagram's text block, as the jar prints the body (chrome at 10, 10). */
function body(d: TimingDiagram): string[] {
  const root = svgGraphic();
  d.getTextBlock().drawU(root.apply(new UTranslate(CHROME, CHROME)));
  return svgElements(root.getSvgString());
}

function dimension(d: TimingDiagram): [number, number] {
  const dim = d.getTextBlock().calculateDimension(stringBounder());
  return [dim.getWidth(), dim.getHeight()];
}

function conciseBasic(): TimingDiagram {
  const d = diagram();
  const wu = d.createPlayerConcise('WU', 'Web User', false, undefined, undefined);
  for (const [t, state] of [
    ['0', 'Idle'],
    ['100', 'Waiting'],
    ['300', 'Idle'],
  ] as const) {
    d.addTime(tick(t), undefined);
    wu.setState(d.getNow(), undefined, Colors.empty(), state);
  }
  return d;
}

function robustBasic(): TimingDiagram {
  const d = diagram();
  const wb = d.createPlayerRobust('WB', 'Web Browser', false, undefined, undefined);
  for (const [t, state] of [
    ['0', 'Idle'],
    ['100', 'Processing'],
    ['300', 'Waiting'],
    ['500', 'Idle'],
  ] as const) {
    d.addTime(tick(t), undefined);
    wb.setState(d.getNow(), undefined, Colors.empty(), state);
  }
  return d;
}

describe('TimingDiagram (cov-concise-basic)', () => {
  it('draws the oracle body', () => {
    expect(body(conciseBasic())).toEqual(CONCISE_BASIC_BODY);
  });

  it('is 230 x 85 with its 10 px margin (oracle canvas 251 x 106 less the chrome)', () => {
    const [w, h] = dimension(conciseBasic());
    expect(w).toBeCloseTo(230, 3);
    expect(h).toBeCloseTo(85, 3);
  });

  it('answers the skin param it was built with', () => {
    const sp = timingSkinParam() as SkinParam;
    expect(diagram(sp).getSkinParam()).toBe(sp);
  });

  it('describes itself', () => {
    expect(diagram().getDescription()).toBe('(Timing Diagram)');
    expect(diagram().getDiagramType()).toBe('TIMING');
  });
});

describe('TimingDiagram (cov-robust-basic)', () => {
  it('draws the oracle body', () => {
    expect(body(robustBasic())).toEqual(ROBUST_BASIC_BODY);
  });

  it('is 389.4 x 114 (oracle canvas 410 x 135: ceil(389.4 + 21))', () => {
    const [w, h] = dimension(robustBasic());
    expect(w).toBeCloseTo(389.4, 3);
    expect(h).toBeCloseTo(114, 3);
  });
});

describe('TimingDiagram factories and state', () => {
  it('robust, concise and rectangle set lastPlayer and honour compact', () => {
    const d = diagram();
    const a = d.createPlayerRobust('A', 'A', true, undefined, undefined);
    expect([d.getLastPlayer(), a.isCompact(), d.getPlayer('A')]).toEqual([a, true, a]);
    const b = d.createPlayerConcise('B', 'B', false, undefined, undefined);
    expect([d.getLastPlayer(), b.isCompact()]).toEqual([b, false]);
    const c = d.createPlayerRectangle('C', 'C', true, undefined, undefined);
    expect([d.getLastPlayer(), c.isCompact()]).toEqual([c, true]);
    d.setLastPlayer(a);
    expect(d.getLastPlayer()).toBe(a);
  });

  it('compact mode makes robust, concise and rectangle players compact', () => {
    const d = diagram();
    d.goCompactMode();
    expect(d.createPlayerRobust('A', 'A', false, undefined, undefined).isCompact()).toBe(true);
    expect(d.createPlayerConcise('B', 'B', false, undefined, undefined).isCompact()).toBe(true);
    expect(d.createPlayerRectangle('C', 'C', false, undefined, undefined).isCompact()).toBe(true);
  });

  it('D7: clock, analog and binary pass compactByDefault, not compact, and keep lastPlayer', () => {
    const d = diagram();
    const first = d.createPlayerConcise('F', 'F', false, undefined, undefined);
    const clock = d.createPlayerClock({
      code: 'C',
      full: 'C',
      period: new BigDecimal('10'),
      pulse: BigDecimal.ZERO,
      offset: BigDecimal.ZERO,
      compact: true,
      stereotype: undefined,
    });
    const analog = d.createPlayerAnalog('N', 'N', true, undefined);
    const binary = d.createPlayerBinary('B', 'B', true, undefined);
    expect([clock.isCompact(), analog.isCompact(), binary.isCompact()]).toEqual([false, false, false]);
    expect(d.getLastPlayer()).toBe(first);
    expect([d.getPlayer('C'), d.getPlayer('N'), d.getPlayer('B')]).toEqual([clock, analog, binary]);
    d.goCompactMode();
    expect(d.createPlayerAnalog('N2', 'N2', false, undefined).isCompact()).toBe(true);
    expect(d.createPlayerBinary('B2', 'B2', false, undefined).isCompact()).toBe(true);
  });

  it('D7: createPlayerClock adds the period as a ruler tick (the clock draws from x -50)', () => {
    const d = diagram();
    const clock = d.createPlayerClock({
      code: 'C',
      full: 'C',
      period: new BigDecimal('10'),
      pulse: BigDecimal.ZERO,
      offset: BigDecimal.ZERO,
      compact: false,
      stereotype: undefined,
    });
    expect(clock).toBeInstanceOf(PlayerClock);
    expect(clock.getPeriod().toPlainString()).toBe('10');
    expect(body(d).filter((e) => e.startsWith('<line')).length).toBeGreaterThan(0);
    // the one ruler tick is the period: the ruler's width covers 10 units.
    expect(dimension(d)[0]).toBeGreaterThan(0);
  });

  it('getClockValue is period * nb, in DECIMAL, and undefined for an unknown clock', () => {
    const d = diagram();
    d.createPlayerClock({
      code: 'C',
      full: 'C',
      period: new BigDecimal('2.5'),
      pulse: BigDecimal.ZERO,
      offset: BigDecimal.ZERO,
      compact: false,
      stereotype: undefined,
    });
    const value = d.getClockValue('C', 3);
    expect(value?.getTime().toPlainString()).toBe('7.5');
    expect(value?.getFormat()).toBe(TimingFormat.DECIMAL);
    expect(d.getClockValue('X', 1)).toBeUndefined();
  });

  it('addTime sets now and the code; updateNow only now; re-put keeps the code table', () => {
    const d = diagram();
    const t1 = tick('5');
    d.addTime(t1, 'start');
    expect([d.getNow(), d.getCodeValue('start')]).toEqual([t1, t1]);
    const t2 = tick('9');
    d.addTime(t2, undefined);
    expect([d.getNow(), d.getCodeValue('start')]).toEqual([t2, t1]);
    const t3 = tick('1');
    d.updateNow(t3);
    expect(d.getNow()).toBe(t3);
    expect(d.getCodeValue('nope')).toBeUndefined();
    expect(d.getPlayer('nope')).toBeUndefined();
  });

  it('players is insertion ordered: a re-put code keeps its first position', () => {
    const d = diagram();
    d.createPlayerConcise('A', 'first A', false, undefined, undefined);
    d.createPlayerConcise('B', 'B', false, undefined, undefined);
    const again = d.createPlayerConcise('A', 'second A', false, undefined, undefined);
    expect(d.getPlayer('A')).toBe(again);
    expect(Array.from(d['players'].keys())).toEqual(['A', 'B']);
  });

  it('setTimeAxisStategy and highlight answer ok', () => {
    const d = diagram();
    expect(d.setTimeAxisStategy(TimeAxisStategy.HIDDEN).isOk()).toBe(true);
    const caption = Display.getWithNewlines(Pragma.createEmpty(), 'cap');
    expect(d.highlight(tick('0'), tick('10'), caption, Colors.empty()).isOk()).toBe(true);
  });
});

describe('TimingDiagram draw options', () => {
  it('hide time-axis draws no axis', () => {
    const d = conciseBasic();
    d.setTimeAxisStategy(TimeAxisStategy.HIDDEN);
    const els = body(d);
    expect(els.filter((e) => e.includes('font-size="11"'))).toEqual([]);
    expect(els.length).toBeLessThan(CONCISE_BASIC_BODY.length);
  });

  it('compact mode draws no border and no separator', () => {
    const d = diagram();
    d.goCompactMode();
    const p = d.createPlayerConcise('A', 'A', false, undefined, undefined);
    d.addTime(tick('0'), undefined);
    p.setState(d.getNow(), undefined, Colors.empty(), 'x');
    const els = body(d);
    expect(
      els.some((e) => e.includes('stroke:#333;stroke-width:0.5;"/>') && e.startsWith('<line x1="20" y1="20" x2="20"')),
    ).toBe(false);
  });

  it('a highlight draws its band, its two lines and its caption', () => {
    const d = conciseBasic();
    d.highlight(tick('100'), tick('300'), Display.getWithNewlines(Pragma.createEmpty(), 'Hi'), Colors.empty());
    const els = body(d);
    expect(els.some((e) => e.startsWith('<rect') && e.includes('fill='))).toBe(true);
    expect(els.filter((e) => e.startsWith('<text') && e.endsWith('>Hi</text>')).length).toBe(1);
    expect(els.length).toBeGreaterThan(CONCISE_BASIC_BODY.length);
  });

  it('a player with a background colour is filled over the whole frame and panel', () => {
    const d = diagram();
    const bg = timingSkinParam().getIHtmlColorSet().getColorOrWhite('#FFC0CB');
    const p = d.createPlayerConcise('A', 'A', false, undefined, bg);
    d.addTime(tick('0'), undefined);
    p.setState(d.getNow(), undefined, Colors.empty(), 'x');
    const first = body(d)[0];
    expect(first).toMatch(/^<rect x="\d+" y="\d+" width="[\d.]+" height="[\d.]+" fill="#FFC0CB"/);
  });
});

describe('TimingDiagram messages', () => {
  function twoPlayers(): {
    d: TimingDiagram;
    a: ReturnType<TimingDiagram['createPlayerConcise']>;
    b: ReturnType<TimingDiagram['createPlayerConcise']>;
  } {
    const d = diagram();
    const a = d.createPlayerConcise('A', 'A', false, undefined, undefined);
    const b = d.createPlayerConcise('B', 'B', false, undefined, undefined);
    for (const [t, s] of [
      ['0', 'x'],
      ['10', 'y'],
    ] as const) {
      d.addTime(tick(t), undefined);
      a.setState(d.getNow(), undefined, Colors.empty(), s);
      b.setState(d.getNow(), undefined, Colors.empty(), s);
    }
    return { d, a, b };
  }

  it('draws an arrow with its label between two projections', () => {
    const { d, a, b } = twoPlayers();
    const without = body(d).length;
    d.createTimeMessage(a, tick('0'), b, tick('10'), 'hello');
    const els = body(d);
    expect(els.length).toBeGreaterThan(without);
    expect(els.filter((e) => e.endsWith('>hello</text>')).length).toBe(1);
  });

  it('D7: a message whose projection is null draws nothing and does not throw', () => {
    const { d, a, b } = twoPlayers();
    const without = body(d);
    // Java passes a `null` tick; `PanelsState#getTimeProjection(null)` answers `null` (PanelsState.java:80-81).
    d.createTimeMessage(a, undefined as unknown as TimeTick, b, tick('10'), 'lost');
    expect(body(d)).toEqual(without);
  });
});

describe('TimingDiagram player stacking (D7)', () => {
  it('getUTranslateForPlayer of an unknown player throws IllegalArgumentException', () => {
    const d = conciseBasic();
    const stranger = diagram().createPlayerConcise('Z', 'Z', false, undefined, undefined);
    expect(() => d['getUTranslateForPlayer'](stranger, stringBounder())).toThrow('java.lang.IllegalArgumentException');
    expect(() => d['getUTranslateForPlayerFrame'](stranger, stringBounder())).toThrow(
      'java.lang.IllegalArgumentException',
    );
  });

  it('a known player is found, and the diagram height is the translate of no player', () => {
    const d = conciseBasic();
    const wu = d.getPlayer('WU')!;
    const sb = stringBounder();
    expect(d['getUTranslateForPlayerFrame'](wu, sb).getDy()).toBe(0);
    expect(d['getUTranslateForPlayer'](wu, sb).getDy()).toBe(wu.getFrameHeight(sb));
    expect(d['getUTranslateForPlayer'](undefined, sb).getDy()).toBeCloseTo(54, 3);
    expect(d['getUTranslateForPlayerFrame'](undefined, sb).getDy()).toBeCloseTo(54, 3);
  });
});

describe('TimingDiagram scale, date format, stop-at', () => {
  it('scaleInPixels widens the ruler', () => {
    const d = conciseBasic();
    const before = dimension(d)[0];
    d.scaleInPixels(100, 100);
    expect(dimension(d)[0]).toBeGreaterThan(before);
  });

  it('getTimingFormatDate is DATE until use date format, then a fresh format in the injected zone', () => {
    const d = diagram();
    expect(d.getTimingFormatDate()).toBe(TimingFormat.DATE);
    expect(d.useDateFormat('yyyy').isOk()).toBe(true);
    const f = d.getTimingFormatDate();
    expect(f).not.toBe(TimingFormat.DATE);
    expect(f.formatTime(new BigDecimal('0'))).toBe('1970');
  });

  it('the zone is injected: yyyy of epoch 0 in America/Chicago is 1969', () => {
    const d = new TimingDiagram(
      { lines: [] },
      new PreprocessingArtifact(),
      timingSkinParam() as SkinParam,
      'America/Chicago',
    );
    d.useDateFormat('yyyy');
    expect(d.getTimingFormatDate().formatTime(new BigDecimal('0'))).toBe('1969');
  });

  it('a bad pattern is "Bad date format" and leaves the format alone', () => {
    const d = diagram();
    const result = d.useDateFormat('qq');
    expect([result.isOk(), result.getError()]).toEqual([false, 'Bad date format']);
    expect(d.getTimingFormatDate()).toBe(TimingFormat.DATE);
  });

  it('setStopAt reaches the ruler', () => {
    const d = conciseBasic();
    expect(() => d.setStopAt(tick('50'))).not.toThrow();
  });

  it('marginX1 is 5', () => {
    expect(TimingDiagram.marginX1).toBe(5);
  });
});
