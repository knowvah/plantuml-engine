import { Commit } from './Commit.js';
import { CursorPosition } from './CursorPosition.js';

/**
 * GitTextArea — the pasted `git log --graph --oneline` lines, read as a
 * character grid.
 *
 * Not ported (gip D1): `charAt(int, int)` and `getCommitByName(String)`, which
 * nothing in `src/main/java/net` calls, and the TeaVM-only `assert` at
 * `GitTextArea.java:59` (the release jar runs with assertions off).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/gitlog/GitTextArea.java:44-88
 */
export class GitTextArea {
  /** @see GitTextArea.java:46 */
  private readonly lines: string[] = [];
  /** Filled by the first `getAllCommits` that finds it empty. @see GitTextArea.java:47 */
  private readonly commits: Commit[] = [];

  /** @see GitTextArea.java:49-51 */
  add(s: string): void {
    this.lines.push(s);
  }

  /**
   * Every line holding a `*` is a commit at the first `*`. The cache is filled
   * only while it is empty, so a source with no commit rescans each call.
   * @see GitTextArea.java:53-67
   */
  getAllCommits(): readonly Commit[] {
    if (this.commits.length === 0)
      for (let y = 0; y < this.lines.length; y++) {
        const s = this.lines[y]!;
        const name = CursorPosition.getCommitNameInLine(s);
        const x = s.indexOf('*');
        if (x === -1) continue;
        // `name` is non-null whenever `x !== -1`: both test `indexOf("*")` (CursorPosition.java:92).
        this.commits.push(new Commit(name!, new CursorPosition(this, x, y)));
      }
    return this.commits;
  }

  /** `""` past the last line. @see GitTextArea.java:73-78 */
  getLine(y: number): string {
    if (y >= this.lines.length) return '';
    return this.lines[y]!;
  }
}
