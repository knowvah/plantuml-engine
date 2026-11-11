# T1b — `ShuntingYard` and `GroupSplitter`

**Read:** `regexdiagram/ShuntingYard.java` (111 lines), `GroupSplitter.java` (65 lines); the batch's interface
contract; D4, D5, D9.

**Write-set:** `src/diagrams/regex/{ShuntingYard,GroupSplitter}.ts`, `tests/unit/regex/ShuntingYard.test.ts`,
`tests/unit/regex/GroupSplitter.test.ts`.

**Do:**

1. `ShuntingYard` with `ouputQueue`, `operatorStack` and `getOuputQueue` at upstream's spelling. `operatorStack` is an
   `ArrayDeque`: `removeFirst` on an empty stack must throw (Java's `NoSuchElementException`), so `a)b`
   (`cov-unbalanced-close`) throws from `:84` rather than reading `undefined` (D5 kind 3). Keep the unread `first`.
   `UnsupportedOperationException` for an unknown token type becomes a thrown `Error` with `token.toString()`.
2. `GroupSplitter#split`, keeping `@JawsStrange`'s note as a comment and `Character.isLetter` as D9 says; the result
   is frozen, as `Collections.unmodifiableList`.

**Tests:**
- `ab|c` after `addImplicitConcatenation` (written inline in the test from Java's rule) gives the queue
  `SIMPLE_CHAR[a] SIMPLE_CHAR[b] CONCATENATION_IMPLICIT[] SIMPLE_CHAR[c] ALTERNATIVE[|]`.
- `(?<n>b)c` moves `NAMED_GROUP[n]` to the queue when its `)` closes (`ShuntingYard.java:83-86`).
- `(ab` leaves `PARENTHESIS_OPEN[(]` in the queue (`cov-unbalanced-open`'s message).
- `split("a-z0-9_")` is `["a-z","0-9","_"]`; `split("^\\s%g{}\\[\\]")` gives `\s` kept and `\[` reduced to `[`
  (`GroupSplitter.java:53-58`); the texts match `faporu-75-biso094`'s cached SVG.

## Acceptance
- Given each drawn row's line, when tokenized, concatenated and run through `ShuntingYard`, then no error is thrown.
- Given `a)b`, then a non-`RegexParsingException` error is thrown.

Observability N/A. Rollback Reversible.
