/**
 * The link line-style grammar shared by every engine whose arrows take a
 * `[#red,dashed]` style/colour bracket.
 *
 * @see net/sourceforge/plantuml/descdiagram/command/CommandLinkElement.java:71-83
 *   -- `KEY1`, `KEY2`, `LINE_STYLE`, `LINE_STYLE_MULTIPLES`.
 */
export const STYLE_KEY1: string = 'dotted|dashed|plain|bold|hidden|norank|single|node|thickness=\\d+';
export const STYLE_KEY2: string = ',dotted|,dashed|,plain|,bold|,hidden|,norank|,single|,node|,thickness=\\d+';
export const LINE_STYLE: string = `(?:#\\w+|${STYLE_KEY1})(?:,#\\w+|${STYLE_KEY2})*`;
export const LINE_STYLE_MULTIPLES: string = `${LINE_STYLE}(?:;${LINE_STYLE})*`;

/** @see CommandLinkElement.java:71 (`UBREX_KEY1`) */
export const UBREX_KEY1: string = 'dotted┇dashed┇plain┇bold┇hidden┇norank┇single┇node┇thickness=〇+〴d';
/** @see CommandLinkElement.java:74 (`UBREX_KEY2`) */
export const UBREX_KEY2: string = ',dotted┇,dashed┇,plain┇,bold┇,hidden┇,norank┇,single┇,node┇,thickness=〇+〴d';
/** `LINE_STYLE` for a `UnicodeBracketedExpression`. @see CommandLinkElement.java:79-80 */
export const UBREX_LINE_STYLE: string = `【 #〇+〴w ┇${UBREX_KEY1}】 〇*【 ,#〇+〴w ┇${UBREX_KEY2}】`;
