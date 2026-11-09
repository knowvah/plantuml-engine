/**
 * aar-T6b: a rainbow arrow's copies are mutated on the RAW worm and each copy passes through the compressing
 * UGraphic at draw time, not mutated from already-compressed points.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/Snake.java:200-224
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/compress/UGraphicCompressOnXorY.java:122-135
 */
import { describe, it, expect } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderFixtureActivity } from '../../oracle/svg-conformance/render-fixture-activity.js';

const render = (src: string): string => renderFixtureActivity(src, new DeterministicMeasurer());

describe('rainbow arrow through the compressing UGraphic', () => {
  it('kicofo-41: both colour copies of the DLD middle segment stay at the jar y 156', () => {
    const svg = render(
      '@startuml\nskinparam colorArrowSeparationSpace 5\nStart\n-[#green;#orange]->\nif (CondA) then (A?)\n' +
        '  -[#green;#orange]->\n  :Do A;\nelse (B?)\n  -[#green;#orange]->\n  :Do B;\nendif\n\n' +
        '-[#green;#orange]->\nif (CondB) then (A?)\n  :Do A;\nelseif () then (B?)\n  :Do B;\nelse (C?)\n' +
        '  -[#green;#orange]->\n  :Do C;\nendif\nStop\n@enduml',
    );
    expect(svg).toContain('<line x1="124.381" y1="151" x2="124.381" y2="156"');
    expect(svg).toContain('<line x1="124.381" y1="156" x2="57.344" y2="156"');
  });
});

describe('Branch#getInColor of an empty branch', () => {
  it('didixe-34: an empty else whose trailing arrow is orange draws the diamond-to-merge edge orange', () => {
    const svg = render(
      '@startuml\nstart\nif(a?)then(yes)\n  :x;\nelseif(f?)then(yes)\n  :y;\nelse(no)\n  -[#orange]->\nendif\nstop\n@enduml',
    );
    expect(svg).toContain('<line x1="141" y1="67" x2="167.238" y2="67" stroke="#FFA500"');
    expect(svg).toContain(
      '<polygon points="163.238,151.056,167.238,161.056,171.238,151.056,167.238,155.056" fill="#FFA500"',
    );
  });
});

describe('CommandRepeatWhile3 LABEL (.*)', () => {
  it('fuximi-08: a back link whose label is empty still draws the " " text', () => {
    const svg = render('@startuml\nstart\nrepeat\n:s;\nrepeat while(a)is(b) -[#red]->\n:out;\n@enduml');
    expect(svg).toContain('<text x="89" y="166.056" fill="#000" font-size="11">\u00A0</text>');
  });
  it('a bare `->` is the same back link', () => {
    const svg = render('@startuml\nstart\nrepeat\n:s;\nrepeat while(a)is(b) ->\n:out;\n@enduml');
    expect(svg).toContain('<text x="89" y="166.056" fill="#000" font-size="11">\u00A0</text>');
  });
  it('no arrow: no extra text', () => {
    const svg = render('@startuml\nstart\nrepeat\n:s;\nrepeat while(a)is(b)\n:out;\n@enduml');
    expect(svg).not.toContain('font-size="11">\u00A0</text>');
  });
});

describe('diamond2 west/east/north blocks (tbout1/tbout2)', () => {
  it('bucoru-71: with-links, both trailing arrows `->t;` size the merge row and draw west and east', () => {
    const svg = render(
      '@startuml\nif (if?) then (yes)\n  :a a a a a;\n->this is t1;\nelse (no)\n  :b b b b b;\n->this is t2;\nendif\n@enduml',
    );
    const bucoru = render(
      '@startuml\n!t="this is t1\\nthis is t2\\nthis is t3\\n"\n\nif (if?) then (<color blue>yes)\n  :a a a a a;\n->t;\n' +
        'else (<color blue>no)\n  :b b b b b;\n->t;\nendif\n@enduml',
    );
    expect(bucoru).toContain('height="168px"'); // the jar's svg/@height (`in.svg`), 132 without the blocks
    const texts = [...svg.matchAll(/>(this is t[12])<\/text>/g)].map((m) => m[1]);
    expect(texts).toEqual(['this is t1', 'this is t2']);
  });
  it('pabope-47: createDown puts the main flow trailing arrow text north of the merge rhombus', () => {
    const svg = render(
      '@startuml\nstart\nif (c1) then (yes)\n  :a;\nelse (no)\n  if (c2)\n  else\n  :b;\n  -> ending inner else;\n  endif\nendif\nstop\n@enduml',
    );
    expect(svg).toContain('>ending inner else</text>');
  });
});

describe('CommandPartition3 / closeGroup', () => {
  it('dukocu-46: `partition "a\\nb"` is two title lines (Display.getWithNewlines)', () => {
    const svg = render('@startuml\npartition "first line\\nsecond line" {\n:x;\n}\n@enduml');
    expect(svg).toMatch(/>first line<\/text>/);
    expect(svg).toMatch(/>second line<\/text>/);
  });
  it('dukocu-46: an arrow pending at `}` colours the enclosing branch out edge', () => {
    const svg = render(
      '@startuml\nstart\nif (a) then (y)\n  partition p {\n    :x;\n    -[#red]->\n  }\nelse (n)\n  :z;\nendif\nstop\n@enduml',
    );
    const red = [...svg.matchAll(/<line [^>]*stroke="#F00"/g)];
    expect(red.length).toBeGreaterThan(0);
  });
});

describe('Branch#getInColor of an empty branch closed by elseif', () => {
  // `elseIf` sets only `special` (`InstructionIf.java:182`), never `setInlinkRendering` (`:172,197`), so the empty
  // then branch's out link is none and its edge keeps the default arrow colour.
  it('zovacu-12: an empty then branch whose trailing arrow is black, closed by else if, draws #181818', () => {
    const svg = render(
      '@startuml\nstart\n:Action; <<procedure>> <<#lightblue>>\n-[#blue]-> callback;\nif () then (OK)\n' +
        '-[#black]->\nelse if () then (ERROR)\n  -[#red]->\n   :ERROR; <<#lightpink>> <<task>>\n   stop\n' +
        'else (timeout)\n  -[#green]->\n   :TIMEOUT; <<task>> <<#lightpink>> \n   stop\nendif\n-[#yellow]->\nend\n@enduml',
    );
    expect(svg).toMatch(/<line x1="37" y1="152" x2="37" y2="279.5" stroke="#181818"/);
    expect(svg).not.toContain('stroke="#000"');
  });
});
