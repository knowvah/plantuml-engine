import { describe, expect, it } from 'vitest';
import { HColorSet } from '../../../src/core/klimt/color/HColorSet.js';
import { Display } from '../../../src/core/klimt/creole/Display.js';
import { WArrowDirection } from '../../../src/diagrams/wire/WArrowDirection.js';
import { WLinkType } from '../../../src/diagrams/wire/WLinkType.js';
import { record, type RecordedEvent } from '../../helpers/recording-ugraphic.js';
import { measurer, stringBounder, svgOf, wireDiagram } from './helpers.js';

const STYLE = { type: WLinkType.NORMAL, direction: WArrowDirection.NORMAL, color: undefined, label: Display.NULL };

function drawn(events: readonly RecordedEvent[]): readonly string[] {
  return events.map((e) => ('draw' in e ? e.draw : ''));
}

describe('WireDiagram#print (WireDiagram.java:130-135, wrp D3)', () => {
  it('advances the cursor by the AWT height at 10 pt, whatever the measurer (migaki-17-jori275)', () => {
    const diagram = wireDiagram();
    diagram.addComponent('', 'a', 100, 100, undefined);
    diagram.print('', 'This is me10');
    diagram.print('', 'This is me20');
    diagram.addComponent('', 'b', 100, 100, undefined);
    const svg = svgOf((ug) => diagram.getTextBlock().drawU(ug));
    // 20 + 10 + 100 + 2 x 11.777344 (jarMeasurer's AWT height, not the table's 10) + 10.
    expect(svg).toContain('y="163.555"');
    expect(svg).not.toContain('y="150"');
  });

  it('the table measurer still sizes the drawn text', () => {
    const diagram = wireDiagram();
    diagram.addComponent('', 'a', 100, 100, undefined);
    diagram.print('', 'This is me10');
    const svg = svgOf((ug) => diagram.getTextBlock().drawU(ug));
    expect(svg).toMatch(/<text[^>]*font-size="10"[^>]*textLength="56.688"[^>]*>This is me10</);
  });
});

describe('WireDiagram draw order (WireDiagram.java:87-98, wrp D4)', () => {
  it('root tree, spots, hlinks, vlinks', () => {
    const diagram = wireDiagram();
    diagram.addComponent('', 'a', 100, 100, undefined);
    diagram.addComponent('', 'b', 100, 100, undefined);
    diagram.spot('a', undefined, undefined, undefined);
    diagram.vlink({ name1: 'a', x1: undefined, y1: undefined, name2: 'b', ...STYLE });
    diagram.hlink({ name1: 'a', x1: undefined, y1: undefined, name2: 'b', ...STYLE });
    const events = record(measurer, (ug) => diagram.getTextBlock().drawU(ug));
    expect(drawn(events)).toEqual([
      'URectangle(100,100)',
      'UText(a)',
      'URectangle(100,100)',
      'UText(b)',
      'UText( )',
      'UEllipse(5,5)',
      'UPath',
      'ULine(-102,0)',
      'UPath',
      'ULine(0,18)',
    ]);
  });
});

describe('WireDiagram#computeIndentationLevel (WireDiagram.java:137-140)', () => {
  it.each([
    ['', 0],
    ['    ', 1],
    ['\t', 1],
    ['  ', 2],
    ['\t    ', 2],
    ['        ', 2],
    ['     ', 2],
  ])('%j is level %d', (indent, level) => {
    expect(wireDiagram().computeIndentationLevel(indent)).toBe(level);
  });
});

describe('WireDiagram#getTextBlock', () => {
  it('measures as the root', () => {
    const diagram = wireDiagram();
    diagram.addComponent('', 'a', 100, 50, undefined);
    const dim = diagram.getTextBlock().calculateDimension(stringBounder);
    expect([dim.getWidth(), dim.getHeight()]).toEqual([120, 80]);
  });

  it('an empty root measures as a 100 x 100 leaf (cov-title-only, no throw)', () => {
    const dim = wireDiagram().getTextBlock().calculateDimension(stringBounder);
    expect([dim.getWidth(), dim.getHeight()]).toEqual([100, 100]);
  });

  it('getDescription is Wire Diagram (java:64-66)', () => {
    expect(wireDiagram().getDescription()).toBe('Wire Diagram');
  });
});

describe('WireDiagram lookups (WireDiagram.java:110-118, :142-176)', () => {
  it('spot names an unknown block', () => {
    expect(wireDiagram().spot('nope', undefined, undefined, undefined).getError()).toBe('No such element nope');
  });

  it('spot with a known block draws at the given colour', () => {
    const diagram = wireDiagram();
    diagram.addComponent('', 'a', 100, 100, undefined);
    expect(diagram.spot('a', HColorSet.instance().getColor('#00FF00'), '1', '2').isOk()).toBe(true);
    expect(svgOf((ug) => diagram.getTextBlock().drawU(ug))).toContain('fill="#0F0"');
  });

  it('hlink checks name1 first and adds no link on an error', () => {
    const diagram = wireDiagram();
    const result = diagram.hlink({ name1: 'x', x1: undefined, y1: undefined, name2: 'y', ...STYLE });
    expect(result.getError()).toBe('No such element x');
    expect(drawn(record(measurer, (ug) => diagram.getTextBlock().drawU(ug)))).toEqual(['UText( )']);
  });

  it('hlink reports an unknown name2', () => {
    const diagram = wireDiagram();
    diagram.addComponent('', 'a', 100, 100, undefined);
    expect(diagram.hlink({ name1: 'a', x1: undefined, y1: undefined, name2: 'z', ...STYLE }).getError()).toBe(
      'No such element z',
    );
  });

  it('vlink checks name1 first and adds no link on an error', () => {
    const diagram = wireDiagram();
    expect(diagram.vlink({ name1: 'x', x1: undefined, y1: undefined, name2: 'y', ...STYLE }).getError()).toBe(
      'No such element x',
    );
  });

  it('vlink reports an unknown name2', () => {
    const diagram = wireDiagram();
    diagram.addComponent('', 'a', 100, 100, undefined);
    expect(diagram.vlink({ name1: 'a', x1: undefined, y1: undefined, name2: 'z', ...STYLE }).getError()).toBe(
      'No such element z',
    );
  });

  it("hlink's destination is the destination block's dx", () => {
    const diagram = wireDiagram();
    diagram.addComponent('', 'a', 100, 100, undefined);
    diagram.newColumn('');
    diagram.addComponent('', 'b', 100, 100, undefined);
    diagram.hlink({ name1: 'a', x1: undefined, y1: undefined, name2: 'b', ...STYLE });
    // a at 10,20; start 110,25; b at 130: line from 111 by 130 - 110 - 2 = 18.
    expect(svgOf((ug) => diagram.getTextBlock().drawU(ug))).toContain('<line x1="111" y1="25" x2="129" y2="25"');
  });

  it("vlink's destination is the destination block's dy", () => {
    const diagram = wireDiagram();
    diagram.addComponent('', 'a', 100, 100, undefined);
    diagram.addComponent('', 'b', 100, 100, undefined);
    diagram.vlink({ name1: 'a', x1: undefined, y1: undefined, name2: 'b', ...STYLE });
    // a at 10,20; start 15,120; b at y 140: line from 121 by 140 - 120 - 2 = 18.
    expect(svgOf((ug) => diagram.getTextBlock().drawU(ug))).toContain('<line x1="15" y1="121" x2="15" y2="139"');
  });

  it('wgoto and wmove resolve the level from the indent', () => {
    const diagram = wireDiagram();
    diagram.addComponent('', 'a', 0, 0, undefined);
    expect(diagram.wgoto('\t', 5, 5).isOk()).toBe(true);
    expect(diagram.wmove('\t', 1, 1).isOk()).toBe(true);
    expect(diagram.addComponent('\t', 'c', 10, 10, undefined).isOk()).toBe(true);
    expect(diagram.newColumn('\t').isOk()).toBe(true);
  });
});
