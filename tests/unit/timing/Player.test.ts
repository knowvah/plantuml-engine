import { describe, expect, it } from 'vitest';

import { ColorType } from '../../../src/core/abel/ColorType.js';
import { Colors } from '../../../src/core/abel/Colors.js';
import { HColorSet } from '../../../src/core/klimt/color/HColorSet.js';
import { Display } from '../../../src/core/klimt/creole/Display.js';
import { UTranslate } from '../../../src/core/klimt/UTranslate.js';
import { Stereotype } from '../../../src/core/stereo/Stereotype.js';
import { stringBounder, svgGraphic } from '../mindmap/helpers/mindmap-skin.js';
import { TestStatePlayer } from './helpers/players.js';
import { paint, svgElements, tick, timingSkinParam } from './helpers/timing.js';

const set = HColorSet.instance();

describe('Player', () => {
  it('draws its title as the frame of cov-concise-basic', () => {
    const ug = svgGraphic();
    new TestStatePlayer().drawFrameTitle(ug.apply(new UTranslate(25, 20)));
    expect(svgElements(ug.getSvgString())[0]).toBe(
      '<text x="25" y="30.889" fill="#333" font-size="14" textLength="62.213" font-weight="700">Web User</text>',
    );
  });

  it('reports the frame height and the pass-through accessors', () => {
    const skinParam = timingSkinParam();
    const background = set.getColorOrWhite('#abc');
    const player = new TestStatePlayer({ skinParam, compact: true, generalBackgroundColor: background });
    expect(player.getFrameHeight(stringBounder())).toBe(13);
    expect(player.isCompact()).toBe(true);
    expect(player.getGeneralBackgroundColor()).toBe(background);
    expect(player.getSkinParam()).toBe(skinParam);
    expect(player.getRuler()).toBeDefined();
    expect(new TestStatePlayer().getGeneralBackgroundColor()).toBeUndefined();
  });

  it('has no frame for a white title (EMPTY_TEXT_BLOCK)', () => {
    const player = new TestStatePlayer({ title: '' });
    const ug = svgGraphic();
    player.drawFrameTitle(ug);
    expect(svgElements(ug.getSvgString())).toEqual([]);
    expect(player.getFrameHeight(stringBounder())).toBe(1);
  });

  it('starts at the AbstractStatePlayer height 0 and takes setHeight', () => {
    const player = new TestStatePlayer();
    expect(player.getSuggestedHeight()).toBe(0);
    player.setHeight(40);
    expect(player.getSuggestedHeight()).toBe(40);
  });

  it('builds the panels once and answers the same object after (java:153-158)', () => {
    const player = new TestStatePlayer();
    expect(player.builds).toBe(0);
    expect(player.panels()).toBe(player.marker);
    expect(player.panels()).toBe(player.marker);
    expect(player.builds).toBe(1);
  });

  it('keeps notes in order and hands out a live view', () => {
    const skinParam = timingSkinParam();
    const player = new TestStatePlayer({ skinParam });
    const view = player.getNotes();
    const text = (s: string): Display => Display.getWithNewlines(skinParam.getPragma(), s);
    player.addNote(tick('100'), text('first'), 'TOP');
    player.addNote(undefined, text('second'), 'BOTTOM');
    expect(view.map((n) => n.getPosition())).toEqual(['TOP', 'BOTTOM']);
    expect(view[0]?.getWhen()?.getTime().toPlainString()).toBe('100');
    expect(view[1]?.getWhen()).toBeUndefined();
  });

  it('reads the note style with the note stereotype (java:75-79) and the player style with its own', () => {
    const css =
      '<style>\ntimingDiagram {\n  .foo { note { BackGroundColor red } concise { LineColor blue } }\n}\n</style>';
    const skinParam = timingSkinParam(css);
    const foo = Stereotype.build('<<foo>>');
    const player = new TestStatePlayer({ skinParam, stereotype: foo });
    player.addNote(undefined, Display.getWithNewlines(skinParam.getPragma(), 'x'), 'TOP', foo);
    player.addNote(undefined, Display.getWithNewlines(skinParam.getPragma(), 'x'), 'TOP');
    const fill = (index: number): string | undefined => {
      const ug = svgGraphic();
      player.getNotes()[index]?.drawU(ug);
      return /fill="([^"]*)"/.exec(svgElements(ug.getSvgString())[0] ?? '')?.[1];
    };
    expect(fill(0)).toBe('#F00');
    expect(fill(1)).toBe('#FEFFDD');
    expect(paint(player.style().value('LineColor').asColor(skinParam.getIHtmlColorSet()))).toBe('#0000FF');
  });

  it('keeps the colours the player was given for its initial state', () => {
    const player = new TestStatePlayer();
    const colors = Colors.parse('#lime', set, ColorType.BACK);
    player.setState(undefined, undefined, colors, 'Idle');
    expect(player.initialColors()).toBe(colors);
  });
});
