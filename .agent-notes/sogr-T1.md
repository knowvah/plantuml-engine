## Observation: sequence CommandArrow lacked upstream's protectSize(2000)
- **Context**: sogr T1, pinning borala-01-tepu803 (a 65838-char `p ---…->` line) into the sequence golden ratchet
- **Finding**: `CommandArrow.java:133` ends its regex with `.protectSize(2000)`; `RegexConcat.java:129-130` makes `match` false for a trimmed line over 2000 chars. The port had no guard: the arrow body `(-+)…(-*)` backtracks O(n²) (27 s for borala) and a 2001-char arrow stayed SEQUENCE where the jar routes CLASS. Now `SizeProtectedRegExp` in `src/diagrams/sequence/sequence-arrow-compose.ts`.
- **Impact**: `protectSize` has only this one upstream caller (grep `src/main/java/net/`). A slow parse of a long line elsewhere is not covered by it; check upstream for an equivalent guard before raising a test budget.
- **Confidence**: High (Java read, jar probed at 2000/2001)

## Observation: the sequence golden ratchet's budget is keyed on golden size only
- **Context**: same
- **Finding**: `budgetFor` in both sequence ratchets grants `LARGE_GOLDEN_BUDGET_MS` only when `in.svg` > 1 MB. A fixture whose cost is in the parse (tiny golden, huge source) gets the 5 s default.
- **Impact**: a slow-to-parse pin times out; find the parse mechanism rather than widening the budget.
- **Confidence**: High
