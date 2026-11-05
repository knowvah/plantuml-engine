/**
 * NwDiagram — only the static `toSet` attribute parser, which `packetdiag`'s
 * `CommandNumRange` calls (`CommandNumRange.java:118`). The nwdiag engine
 * itself is unported (#124), which grows this class in place (pep D3).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/NwDiagram.java
 */

/**
 * `\s*(\w+)\s*=\s*("([^"]*)"|[^\s,]+)`, found repeatedly (`Matcher.find`).
 * Java's `\s` and `\w` without `UNICODE_CHARACTER_CLASS` are ASCII, as JS's are,
 * except JS `\s` also matches Unicode spaces.
 * @see NwDiagram.java:288
 */
const p = /[ \t\n\x0B\f\r]*(\w+)[ \t\n\x0B\f\r]*=[ \t\n\x0B\f\r]*("([^"]*)"|[^ \t\n\x0B\f\r,]+)/g;

export class NwDiagram {
  /**
   * Every `name = value` pair in `definition`; a quoted value loses its
   * quotes. A repeated name keeps the last value (`HashMap.put`).
   * @see NwDiagram.java:290-303
   */
  static toSet(definition: string | undefined): Map<string, string> {
    const result = new Map<string, string>();
    if (definition === undefined) return result;
    for (const m of definition.matchAll(p)) {
      const name = m[1]!;
      const value = m[3] ?? m[2]!;
      result.set(name, value);
    }
    return result;
  }
}
