/**
 * aar-T6a: `Display.getWithNewlines`' raw regions (`Display.java:273-276,288`).
 * pedulu-06-xomo122's `is (<latex>\textrm{true}</latex>)` keeps `\textrm`.
 */
import { describe, expect, it } from 'vitest';
import { unescapeLabelNewlines } from '../../../src/diagrams/activity/label-newlines.js';

describe('unescapeLabelNewlines (Display.getWithNewlines)', () => {
  it('converts \\n, \\t and \\\\ outside a raw region', () => {
    expect(unescapeLabelNewlines('a\\nb\\tc\\\\d\\xe')).toBe('a\nb\tc\\d\\xe');
  });

  it('keeps every backslash inside <latex>, <math> and [[ ]]', () => {
    expect(unescapeLabelNewlines('<latex>\\textrm{true}\\n</latex>')).toBe('<latex>\\textrm{true}\\n</latex>');
    expect(unescapeLabelNewlines('<math>\\n</math>')).toBe('<math>\\n</math>');
    expect(unescapeLabelNewlines('[[http://x\\n]]')).toBe('[[http://x\\n]]');
  });

  it('resumes escaping after the raw region closes', () => {
    expect(unescapeLabelNewlines('<latex>\\t</latex>a\\nb')).toBe('<latex>\\t</latex>a\nb');
  });
});
