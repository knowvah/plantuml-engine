import { describe, expect, it } from 'vitest';
import { Display } from '../../../src/core/klimt/creole/Display.js';
import { UTranslate } from '../../../src/core/klimt/UTranslate.js';
import { MeasurerStringBounder } from '../../../src/core/measurer-bounder.js';
import { jarMeasurer } from '../../../src/core/measurer-jar.js';
import { WPrint } from '../../../src/diagrams/wire/WPrint.js';
import { record } from '../../helpers/recording-ugraphic.js';
import { measurer, stringBounder, wireSkinParam } from './helpers.js';

function printOf(text: string): WPrint {
  const skinParam = wireSkinParam();
  return new WPrint(skinParam, new UTranslate(10, 20), undefined, Display.getWithNewlines(skinParam.getPragma(), text));
}

describe('WPrint (WPrint.java:59-87)', () => {
  it('holds its position', () => {
    expect(printOf('x').getPosition()).toEqual(new UTranslate(10, 20));
  });

  it('is one 10 pt line high under the injected bounder', () => {
    expect(printOf('This is me').getHeight(stringBounder)).toBe(10);
  });

  it('stacks a \\n into two lines', () => {
    expect(printOf('a\\nb').getHeight(stringBounder)).toBe(20);
  });

  it('draws its text', () => {
    const events = record(measurer, (ug) => printOf('This').drawMe(ug));
    expect(events.map((e) => ('draw' in e ? e.draw : ''))).toEqual(['UText(This)']);
  });
});

describe('WPrint table sheet cache (SkinParam.java:1291-1303, CreoleParser.java:129-139)', () => {
  it('freezes table geometry on the bounder that measured first, as the jar does', () => {
    const skinParam = wireSkinParam();
    const text = '|= a |= b |\\n| 1 | 2 |';
    const label = Display.getWithNewlines(skinParam.getPragma(), text);
    const print = new WPrint(skinParam, new UTranslate(0, 0), undefined, label);
    print.getHeight(new MeasurerStringBounder(jarMeasurer));
    // Two AWT 10 pt rows (11.777 each) plus the stripe margin of 2 top and bottom: the cached sheet keeps it under the deterministic bounder.
    expect(print.getHeight(stringBounder)).toBeCloseTo(11.777344 * 2 + 4, 3);
  });
});
