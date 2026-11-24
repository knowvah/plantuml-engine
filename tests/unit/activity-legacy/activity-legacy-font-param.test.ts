/**
 * lae T2a (#158): `FontConfiguration.create(skinParam, FontParam.ARROW, null)` on the legacy skin parameters
 * (`SkinParam.java:461-574`): the `arrowFont*` keys, then `defaultFont*`, then `FontParam.ARROW`'s defaults (size 11 in
 * an activity diagram, `FontParam.java:159-162`).
 */
import { describe, expect, it } from 'vitest';

import { FontStyle } from '../../../src/core/klimt/shape/UText.js';
import { arrowFontConfiguration } from '../../../src/diagrams/activity-legacy/activity-legacy-font-param.js';
import { parseThroughPreprocessor } from '../../helpers/legacy-activity-dot.js';

function fontOf(...skinparams: string[]) {
  const source = ['@startuml', ...skinparams, '(*) --> A', '@enduml'].join('\n');
  return arrowFontConfiguration(parseThroughPreprocessor(source).getSkinParam());
}

describe('arrowFontConfiguration', () => {
  it('defaults to 11pt SansSerif, black, plain, underlined hyperlinks', () => {
    const font = fontOf();

    expect(font.size).toBe(11);
    expect(font.family).toBe('SansSerif');
    expect(font.color).toBe('#000000');
    expect([...font.styles]).toEqual([]);
    expect(font.hyperlinkUnderlineStroke?.getThickness()).toBe(1);
  });

  it('reads the arrowFont* keys first', () => {
    const font = fontOf(
      'skinparam arrowFontSize 15',
      'skinparam arrowFontName "Courier"',
      'skinparam arrowFontColor red',
      'skinparam arrowFontStyle bold',
      'skinparam defaultFontSize 9',
    );

    expect(font.size).toBe(15);
    expect(font.family).toBe('Courier');
    expect(font.color).toBe('#FF0000');
    expect([...font.styles]).toEqual([FontStyle.BOLD]);
  });

  it('falls back to defaultFont*, and reads italic and bold italic faces', () => {
    expect(fontOf('skinparam defaultFontSize 9').size).toBe(9);
    expect(fontOf('skinparam defaultFontName Serif').family).toBe('Serif');
    expect(fontOf('skinparam defaultFontColor blue').color).toBe('#0000FF');
    expect([...fontOf('skinparam defaultFontStyle italic').styles]).toEqual([FontStyle.ITALIC]);
    expect([...fontOf('skinparam arrowFontStyle "bold italic"').styles].sort()).toEqual(
      [FontStyle.BOLD, FontStyle.ITALIC].sort(),
    );
    expect([...fontOf('skinparam arrowFontStyle plain').styles]).toEqual([]);
  });

  it('ignores a non-numeric size, and turns the hyperlink underline off', () => {
    expect(fontOf('skinparam arrowFontSize big').size).toBe(11);
    expect(fontOf('skinparam hyperlinkUnderline false').hyperlinkUnderlineStroke).toBeNull();
    expect(fontOf('skinparam hyperlinkColor green', 'skinparam tabSize 4').hyperlinkColor).toBe('#008000');
  });
});
