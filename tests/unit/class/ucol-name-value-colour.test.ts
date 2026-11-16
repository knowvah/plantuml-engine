/**
 * ucol T2b (issue #145, M2): a `name:value` colour part puts `set.getColorOrNull(value)` under its key
 * (`Colors.java:105-113`). A null is still a `map.put`, so an unresolvable value leaves the key unset AND clears an
 * earlier value for it. The link's trailing colour is one `ColorParser.simpleColor(ColorType.LINE)` capture after ENT2
 * (`CommandLinkClass.java:160,173-175`), so `#line:red` is never split into a colour and a label.
 */
import { describe, it, expect } from 'vitest';

import { parseDeclarationColors } from '../../../src/diagrams/class/class-declaration-extractors.js';
import { parseRelColors } from '../../../src/diagrams/class/class-relationship-colors.js';
import { parseRelationshipLine } from '../../../src/diagrams/class/class-relationship-parser.js';
import { resolveBareOrBackColor } from '../../../src/core/color-override.js';

describe('class declaration name:value parts (M2)', () => {
  it('an unresolvable line value is unset', () => {
    expect(parseDeclarationColors('#line:zzblue')).toEqual({});
  });

  it('a later null replaces an earlier value (Colors.java:113)', () => {
    expect(parseDeclarationColors('#line:red;line:zzblue')).toEqual({});
    expect(parseDeclarationColors('#line:red;text:zzblue')).toEqual({ line: 'red' });
  });

  it('a resolvable value keeps its stored form', () => {
    expect(parseDeclarationColors('#line:red;text:blue')).toEqual({ line: 'red', text: 'blue' });
    expect(parseDeclarationColors('#line.dashed:green')).toEqual({ line: 'green', lineStyle: 'dashed' });
  });

  it('an unresolvable back value is unset and clears an earlier back', () => {
    expect(resolveBareOrBackColor('#back:zzblue')).toBeUndefined();
    expect(resolveBareOrBackColor('#pink;back:zzblue')).toBeUndefined();
    expect(resolveBareOrBackColor('#back:blue;text:red')).toBe('blue');
  });
});

describe('class link trailing colour (M2 + grammar)', () => {
  it('#line:red is one colour capture and no label', () => {
    const r = parseRelationshipLine('A --> B #line:red');
    expect(r).toMatchObject({ from: 'A', to: 'B', colorOverride: '#red' });
    expect(r?.label).toBeUndefined();
  });

  it('#line:zzblue leaves the line unset and draws no label', () => {
    const r = parseRelationshipLine('A --> B #line:zzblue');
    expect(r).toMatchObject({ from: 'A', to: 'B' });
    expect(r?.colorOverride).toBeUndefined();
    expect(r?.label).toBeUndefined();
  });

  it('a colour then a label still parses both', () => {
    expect(parseRelationshipLine('A --> B #red;text:blue : hello')).toMatchObject({
      colorOverride: '#red',
      labelTextColor: '#blue',
      label: 'hello',
    });
  });

  it('parseRelColors: a null part claims its key', () => {
    expect(parseRelColors('#line:zzblue')).toEqual({});
    expect(parseRelColors('#red;line:zzblue')).toEqual({});
    expect(parseRelColors('#line:red;text:zzblue')).toEqual({ line: '#red' });
    expect(parseRelColors('#line:zzblue;arrow:red')).toEqual({ line: '#red' });
  });
});
