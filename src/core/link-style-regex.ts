/**
 * The link line-style grammar shared by every engine whose arrows take a
 * `[#red,dashed]` style/colour bracket.
 *
 * @see net/sourceforge/plantuml/descdiagram/command/CommandLinkElement.java:82-95
 *   -- `KEY1`, `KEY2`, `LINE_STYLE`, `LINE_STYLE_MULTIPLES`. `nonode` follows
 *   `node` in every list (`:82-86`, upstream `4753cfe26`, #2988).
 */
export const STYLE_KEY1: string = 'dotted|dashed|plain|bold|hidden|norank|single|node|nonode|thickness=\\d+';
export const STYLE_KEY2: string = ',dotted|,dashed|,plain|,bold|,hidden|,norank|,single|,node|,nonode|,thickness=\\d+';
export const LINE_STYLE: string = `(?:#\\w+|${STYLE_KEY1})(?:,#\\w+|${STYLE_KEY2})*`;
export const LINE_STYLE_MULTIPLES: string = `${LINE_STYLE}(?:;${LINE_STYLE})*`;

/** @see CommandLinkElement.java:83 (`UBREX_KEY1`) */
export const UBREX_KEY1: string = 'dotted┇dashed┇plain┇bold┇hidden┇norank┇single┇node┇nonode┇thickness=〇+〴d';
/** @see CommandLinkElement.java:86 (`UBREX_KEY2`) */
export const UBREX_KEY2: string =
  ',dotted┇,dashed┇,plain┇,bold┇,hidden┇,norank┇,single┇,node┇,nonode┇,thickness=〇+〴d';
/** `LINE_STYLE` for a `UnicodeBracketedExpression`. @see CommandLinkElement.java:90-91 */
export const UBREX_LINE_STYLE: string = `【 #〇+〴w ┇${UBREX_KEY1}】 〇*【 ,#〇+〴w ┇${UBREX_KEY2}】`;
