/**
 * The `\n` / `\t` / `\\` escapes of a captured activity label, the slice of
 * `Display.getWithNewlines` (`Display.java:262-345`) the activity commands'
 * labels reach.
 *
 * `<math>`, `<latex>` and `[[` open a raw region and `</math>`, `</latex>`
 * and `]]` close it (`Display.java:273-276`); inside it a backslash is not an
 * escape (`:288`, `rawMode == false && c == '\\'`), so `\textrm` in a
 * `<latex>` label stays `\textrm`.
 *
 * `\r`/`\l` (`:291-296`, upstream's right/left natural-alignment escapes) are
 * a documented gap: no branch-label fixture uses either, and porting them
 * means threading a per-label alignment override through `ActivityIf` /
 * `ActivityElseIf` and `renderIfLabel`.
 *
 * @see net.sourceforge.plantuml.klimt.creole.Display#getWithNewlines
 */

/** `Display.java:273`. */
const RAW_OPEN = ['<math>', '<latex>', '[['] as const;
/** `Display.java:275`. */
const RAW_CLOSE = ['</math>', '</latex>', ']]'] as const;

/** `rawMode` after reading position `i` (`Display.java:273-276`). */
function rawModeAt(text: string, i: number, rawMode: boolean): boolean {
  if (RAW_OPEN.some((tag) => text.startsWith(tag, i))) return true;
  if (RAW_CLOSE.some((tag) => text.startsWith(tag, i))) return false;
  return rawMode;
}

/** `Display.java:290-313`: the character an escape `\` + `c2` appends. */
function escaped(c2: string): string {
  if (c2 === 'n') return '\n';
  if (c2 === 't') return '\t';
  if (c2 === '\\') return '\\';
  return `\\${c2}`;
}

export function unescapeLabelNewlines(text: string): string {
  let out = '';
  let rawMode = false;
  for (let i = 0; i < text.length; i++) {
    rawMode = rawModeAt(text, i, rawMode);
    const c = text[i]!;
    if (!rawMode && c === '\\' && i < text.length - 1) {
      i++;
      out += escaped(text[i]!);
    } else {
      out += c;
    }
  }
  return out;
}
