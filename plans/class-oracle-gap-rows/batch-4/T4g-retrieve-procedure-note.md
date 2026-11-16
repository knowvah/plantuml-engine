# T4g: the `%retrieve_procedure` note

**Rows:** `gelefo-99-vexu215`, `sokivo-58-tijo947`, `tezefu-05-xuvi984`.

Each defines `!unquoted procedure OBJ(…)` holding a `class Object { … }`, adds two notes with `{{ … }}` sequence
embeds, and `note "%retrieve_procedure('OBJ', 'foo')" as detailsNote4`. The one diff is `g[4]/text[1]/@x`: ours 190.2,
the jar's 200.925 (10.725 apart).

## Lead (verify before acting)

First find which element `g[4]` is in both SVGs (likely `detailsNote4`). `%retrieve_procedure` returns the procedure's
body text, so the note displays `class Object {` / `name : token` / … lines. A 10.725 shift on one line's `x` points at
a leading-whitespace or tab expansion difference (the body lines are indented) in the note's text block. Read the TIM
builtin `RetrieveProcedure` for exactly what text it returns (indentation, line separators), then the note's
`Display` creation for how leading spaces are kept.

## Acceptance
- Given each row, when it is measured, then `n=0`.
- Given a unit test in `tests/unit/class/cogr-T4g.test.ts`, then the note line's `x` matches the oracle.

Observability is N/A. Rollback is Reversible.
