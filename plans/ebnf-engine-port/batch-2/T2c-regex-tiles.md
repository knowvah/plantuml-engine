# T2c — Regex-only tiles

**Read:** `ebnf/ETileOptional.java`, `ETileNamedGroup.java`, `ETileRegexGroup.java`, `ETileRegexGroupAllBut.java`,
`ETileLookAheadOrBehind.java`; `regexdiagram/PSystemRegex.java` for how each is constructed (which arguments, which
symbols); D4.

**Do:**

1. Port the five classes whole. They are unreachable from EBNF (D4); say so in each header with the
   `PSystemRegex.java` line that constructs it, so #126 finds them.
2. No registration, no `renderSync` path: the regex factory is #126's.

**Tests:** for each tile, find a `regex` row whose oracle draws it (`grep -l` the cached `test-results/dot-cache/regex/*/in.puml`
for a named group `(?<…>`, a character class `[…]` / `[^…]`, a lookahead `(?=`, `(?!`, a lookbehind `(?<=`, an
optional `?`), build the tile by hand with the arguments `PSystemRegex.java` would pass, and assert its dimension and
drawn primitives against that oracle's. Journal the slug each test uses. Where no regex row draws a branch, author a
`.puml` probe under `plans/ebnf-engine-port/probes/regex/`, render it with `scripts/oracle-render.sh`, and use that.

## Acceptance
- Given each of the five tiles, then at least one test asserts its geometry against a jar oracle.
- Given `npm test`, then it passes with every new file at 90/90/90.

Observability N/A. Rollback Reversible.
