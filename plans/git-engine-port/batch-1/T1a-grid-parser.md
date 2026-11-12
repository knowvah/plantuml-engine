# T1a — The grid parser: `GitTextArea`, `CursorPosition`, `Commit`

**Read:** D1, D5, D11; `gitlog/{GitTextArea,CursorPosition,Commit}.java` in full.

**Write-set:** `src/diagrams/git/{GitTextArea,CursorPosition,Commit}.ts`; `tests/unit/git/**`.

**Do:**
1. `GitTextArea`: `lines`, a lazily filled `commits` cache (`getAllCommits` fills it only while it is empty,
   `GitTextArea.java:54`), `getLine(y)` returning `""` past the end. Record the D1 greps for `charAt` and
   `getCommitByName` in the journal; they are not ported.
2. `CursorPosition`: `move`, `matches` (keep both guards: `x < 0` and `x > line.length()`, `:64-69`),
   `getCommentInLine`, the static `getCommitNameInLine` (`replaceAll("[-.*|/\\\\]", "")` → a global JS regex over the
   same class, then Java `trim()` through the existing `javaTrim` in `src/core/java-number-format.ts:40`, which strips
   code points ≤ U+0020 rather than JS whitespace), `getCommitDefinition`,
   `getCommit`, `getDownFromHere`.
3. `getDownFromInternal` as an ordered rule array (D11). Each entry is `{ test(current), dx, dy }`, with its Java line;
   rule 1 (`matches("* ")`, `:119-120`) returns. No match throws an `Error` named for `UnsupportedOperationException`,
   whose message is `current.toString()` (`"(" + (x+1) + "," + (y+1) + ")"`).
4. `Commit`: the constructor reads the comment and throws an `IllegalArgumentException`-named `Error` unless the cursor
   `matches("* ")` or `matches("*-")` (`Commit.java:52-53`). Then `getCandidatesForDown` (the `.`/`-` scan right of the
   `*`) with `addAbove` (`|` below, `\` below-right, `/` below-left, in that order), and `getAncestors`.
5. Tests:
   - One test per rule-array entry, each a minimal grid whose walk takes that rule and no earlier one. Then a table in
     the test file (and the journal) of which rules the 4 rows and the 38 probes reach. T3b authors fixtures for the
     rest.
   - The parents of every commit in `juzane-95` and `mebafo-26` (the octopus), traced from the source lines.
   - `getCommitNameInLine` on `"*   0b11a046 Merge pull request #713"`, `"| | * 20388a97 stress: …"` and
     `"* **bold** msg"`.
   - `getCommentInLine` on `"* a1 fix (bug) in parser"` (`bug`), an unclosed `(`, and `()` (empty string, not null).
   - The three D5 constructor throws and the `cov-orphan-pipe` walk throw.

## Acceptance
- Given `mebafo-26`'s source, when `getAllCommits()` and `getAncestors()` run, then `2d2a6c2` has 3 parents in
  candidate order, and every other parent list matches a hand trace recorded in the test.
- Given `"*a1 msg"` or `"*\ta1 msg"` as a commit line, then the constructor throws the `IllegalArgumentException` error.
- Given a walk with no matching rule, then it throws the `UnsupportedOperationException` error, never loops, and never
  returns `undefined`.
- Given the rule array, then every entry has its own passing test and cites its `CursorPosition.java` line.

Observability N/A. Rollback Reversible.
