/**
 * The line gathering `CommandMultilines2` does for the description factory's `map` and `json` blocks: from the
 * header, every following line joins the block until one matches `END` (`^\s*\}\s*$`, trimmed both sides) and
 * `finalVerification` answers `OK`. Lines starting with a quote are dropped first (`MultilinesStrategy
 * .REMOVE_STARTING_QUOTE`). A document that ends first leaves the command `OK_PARTIAL`, which upstream reports as a
 * Syntax Error, so the block answers `null` and the line falls through to the refusal.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/CommandMultilines2.java (`isValid`, `execute`)
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/MultilinesStrategy.java:46-63
 */

/** `END`, shared by `CommandCreateMap.java:69-70` and `CommandCreateJson.java:68-69`. */
const BLOCK_END_RE = /^\s*\}\s*$/;
const STARTING_QUOTE = "'";

/** A gathered block: how many raw lines it spans, header included, and its body lines. */
export interface GatheredBlock {
  readonly consumed: number;
  /** `lines.trim().removeEmptyLines().subExtract(1, 1)`: trimmed, non-empty, header and `}` excluded. */
  readonly body: readonly string[];
}

/**
 * Gathers the block whose header is `lines[start]`. `complete` is the command's `finalVerification` over the body
 * (absent = always `OK`, `CommandMultilines2.java`'s default).
 */
export function gatherMultilineBlock(
  lines: readonly string[],
  start: number,
  complete?: (body: readonly string[]) => boolean,
): GatheredBlock | null {
  const kept: string[] = [];
  for (let j = start + 1; j < lines.length; j++) {
    const trimmed = lines[j]!.trim();
    if (trimmed.startsWith(STARTING_QUOTE)) continue;
    if (BLOCK_END_RE.test(trimmed)) {
      const body = kept.filter((l) => l !== '');
      if (complete === undefined || complete(body)) return { consumed: j - start + 1, body };
    }
    kept.push(trimmed);
  }
  return null;
}
