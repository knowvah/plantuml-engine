import { describe, expect, it } from 'vitest';

import {
  LINE_STYLE,
  LINE_STYLE_MULTIPLES,
  STYLE_KEY1,
  STYLE_KEY2,
  UBREX_KEY1,
  UBREX_KEY2,
} from '../../../src/core/link-style-regex.js';

// descdiagram/command/CommandLinkElement.java:82-86: `nonode` follows `node` in every key list.
describe('link-style-regex (CommandLinkElement KEY1/KEY2)', () => {
  it('lists nonode after node, as upstream does', () => {
    expect(STYLE_KEY1).toBe('dotted|dashed|plain|bold|hidden|norank|single|node|nonode|thickness=\\d+');
    expect(STYLE_KEY2).toBe(',dotted|,dashed|,plain|,bold|,hidden|,norank|,single|,node|,nonode|,thickness=\\d+');
    expect(UBREX_KEY1).toBe('dotted┇dashed┇plain┇bold┇hidden┇norank┇single┇node┇nonode┇thickness=〇+〴d');
    expect(UBREX_KEY2).toBe(',dotted┇,dashed┇,plain┇,bold┇,hidden┇,norank┇,single┇,node┇,nonode┇,thickness=〇+〴d');
  });

  it('LINE_STYLE accepts nonode alone, first, and after a colour', () => {
    const re = new RegExp(`^(?:${LINE_STYLE})$`);
    for (const s of ['nonode', 'nonode,dashed', '#red,nonode', 'node', 'dashed,nonode,bold'])
      expect(re.test(s), s).toBe(true);
    expect(re.test('nonodes')).toBe(false);
    expect(new RegExp(`^(?:${LINE_STYLE_MULTIPLES})$`).test('#red,nonode;#blue')).toBe(true);
  });
});
