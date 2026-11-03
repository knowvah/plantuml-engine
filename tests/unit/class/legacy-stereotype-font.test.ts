/**
 * dss T3b: the stereotype label of a class or object box reads the legacy skinparam chain, never a style
 * (`EntityImageClassHeader.java:131`, `EntityImageObject.java:105-106`, `EntityImageMap.java`):
 * `FontConfiguration.create(skinParam, FontParam.<KIND>_STEREOTYPE, stereotype)` ->
 * `SkinParamUtils.getFontColor` -> `SkinParam#getFontHtmlColor` (`SkinParam.java:484-505`):
 * `<kind>stereotypefontcolor`, then `defaultfontcolor`, then the `FontParam` default.
 */
import { describe, expect, it } from 'vitest';
import {
  CLASS_STEREOTYPE_BUCKET,
  OBJECT_STEREOTYPE_BUCKET,
  legacyStereotypeFonts,
} from '../../../src/core/legacy-stereotype-font.js';
import { measureScopeRow } from './dss-test-helpers.js';

const skin = (entries: Record<string, string>): ReadonlyMap<string, string> => new Map(Object.entries(entries));
const LIGHT_TEXT = '#000000';
const DARK_TEXT = '#FFFFFF';

describe('legacyStereotypeFonts (SkinParam.java:484-505)', () => {
  it('writes nothing when no skinparam names the colour', () => {
    expect(legacyStereotypeFonts(skin({}), LIGHT_TEXT)).toEqual({});
  });

  it('classstereotypefontcolor feeds the class bucket only', () => {
    expect(legacyStereotypeFonts(skin({ classstereotypefontcolor: '#00BB00' }), LIGHT_TEXT)).toEqual({
      [CLASS_STEREOTYPE_BUCKET]: { font: '#00BB00' },
    });
  });

  it('objectstereotypefontcolor feeds the object bucket only', () => {
    expect(legacyStereotypeFonts(skin({ objectstereotypefontcolor: '#00BB00' }), LIGHT_TEXT)).toEqual({
      [OBJECT_STEREOTYPE_BUCKET]: { font: '#00BB00' },
    });
  });

  it('defaultfontcolor is the second tier of both, below the kind key', () => {
    expect(
      legacyStereotypeFonts(skin({ defaultfontcolor: '#BB0000', classstereotypefontcolor: '#00BB00' }), LIGHT_TEXT),
    ).toEqual({
      [CLASS_STEREOTYPE_BUCKET]: { font: '#00BB00' },
      [OBJECT_STEREOTYPE_BUCKET]: { font: '#BB0000' },
    });
  });

  it('dark mode keeps the dark text as the FontParam default', () => {
    expect(legacyStereotypeFonts(skin({ mode: 'dark' }), DARK_TEXT)).toEqual({
      [CLASS_STEREOTYPE_BUCKET]: { font: DARK_TEXT },
      [OBJECT_STEREOTYPE_BUCKET]: { font: DARK_TEXT },
    });
  });
});

describe('stereotype label rows against the jar', () => {
  it.each(['class__kinds-font-diag', 'class__kinds-font-element', 'class__kinds-font-root'])(
    '%s differs from kinds-none by nothing',
    (row) => {
      expect(measureScopeRow(row).diffCount).toBe(measureScopeRow('class__kinds-none').diffCount);
    },
  );
});
