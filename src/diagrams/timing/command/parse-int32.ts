/**
 * PORT-ONLY. `Integer.parseInt` on the digits a grammar leaf matched: more than 10 digits can overflow `int`,
 * which Java reports as a `NumberFormatException` (an execution error, through `ProtectedCommand`).
 */
/** `Integer.parseInt(String)` on the `\d+` the grammar matched: more than 10 digits can overflow. */
export function parseInt32(text: string | undefined): number {
  if (text === undefined || !/^[+-]?\d+$/.test(text)) throw new Error('java.lang.NumberFormatException');
  const n = Number(text);
  if (n > 2_147_483_647 || n < -2_147_483_648) {
    throw new Error(`java.lang.NumberFormatException: For input string: "${text}"`);
  }
  return n;
}
