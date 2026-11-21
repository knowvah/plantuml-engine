const BARS = new Set(['│', '┃', '¦', '|', '║', '┆', '┊']);
const BRANCHES = new Set(['├', '└', '┣', '┗', '╠', '╚', '┠', '┖', '+', '\\', '`', '|']);
const DASHES = new Set(['─', '━', '═', '-']);

/** Dashes of the Windows `tree /f` branch (`+---`, `├───`). @see TreePrefix.java:79 */
const WINDOWS_DASHES = 3;

/**
 * `TreePrefix` -- the tree drawing in front of a name (`├── `, `|   `, `+---`): where the name starts, and
 * whether the branch says the entry is a folder.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/filesdiagram/TreePrefix.java:37-109
 */
export class TreePrefix {
  private constructor(
    private readonly column: number,
    private readonly folder: boolean,
  ) {}

  /** @see TreePrefix.java:46-49 */
  static isBar(c: string): boolean {
    return BARS.has(c);
  }

  /** @see TreePrefix.java:51-54 */
  static isBranch(c: string): boolean {
    return BRANCHES.has(c);
  }

  /** @see TreePrefix.java:56-58 */
  static isDash(c: string): boolean {
    return DASHES.has(c);
  }

  /** `line` has its tabs already expanded. @see TreePrefix.java:60-95 */
  static parse(line: string): TreePrefix {
    let i = 0;
    while (i < line.length) {
      const c = line.charAt(i);
      if (c === ' ') {
        i++;
        continue;
      }
      if (TreePrefix.isBranch(c)) {
        const branch = TreePrefix.parseBranch(line, i);
        if (branch !== null) return branch;
      }
      if (!TreePrefix.isBar(c)) break;
      i++;
    }
    return new TreePrefix(i, false);
  }

  /** The branch (`├──`) starting at `i`, with the blanks after it; `null` when no dash follows. @see TreePrefix.java:71-86 */
  private static parseBranch(line: string, start: number): TreePrefix | null {
    let dashes = 0;
    while (start + 1 + dashes < line.length && TreePrefix.isDash(line.charAt(start + 1 + dashes))) dashes++;
    if (dashes === 0) return null;
    let i = start + 1 + dashes;
    // Windows "tree" only draws a branch in front of folders and glues the name to it; GNU tree puts a blank
    // there, in front of files as well as folders.
    const windows = dashes === WINDOWS_DASHES && i < line.length && line.charAt(i) !== ' ';
    while (i < line.length && line.charAt(i) === ' ') i++;
    return new TreePrefix(i, windows);
  }

  /** @see TreePrefix.java:97-99 */
  getColumn(): number {
    return this.column;
  }

  /** @see TreePrefix.java:101-103 */
  isFolder(): boolean {
    return this.folder;
  }
}
