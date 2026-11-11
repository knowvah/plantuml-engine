/**
 * `GroupSplitter`: splits the text of a `[…]` group into the items `ETileRegexGroup` draws — a range `a-z`, an
 * escape (`\s` kept, `\]` reduced to `]`), or one character. Upstream marks `split` `@JawsStrange` (no comment).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/regexdiagram/GroupSplitter.java:44-65
 */

/** `Character.isLetter(char)` on one UTF-16 unit (false on a lone surrogate), rep D9. */
const LETTER = /^\p{L}$/u;

export class GroupSplitter {
  /** `@JawsStrange`; the result is frozen, as `Collections.unmodifiableList`. @see GroupSplitter.java:46-63 */
  split(group: string): readonly string[] {
    const result: string[] = [];
    for (let i = 0; i < group.length; i++) {
      if (i + 2 < group.length && group.charAt(i + 1) === '-') {
        result.push(group.substring(i, i + 3));
        i += 2;
      } else if (i + 1 < group.length && group.charAt(i) === '\\') {
        let tmp = group.substring(i, i + 2);
        if (!LETTER.test(tmp.charAt(1))) tmp = tmp.substring(1);
        result.push(tmp);
        i++;
      } else result.push(group.charAt(i));
    }
    return Object.freeze(result);
  }
}
