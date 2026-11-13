# T1d: `PSystemBuilder`'s catch

**Writes:** `src/core/dispatcher.ts` (`attempt`, and `resolveAllRefused` if the error needs a new carrier),
`src/core/error/error-diagrams.ts` (only if a `buildV2`-shaped page needs a new entry point),
`tests/unit/core/dispatcher-fatal-crash.test.ts`.

**Read:**
- `PSystemBuilder.java:242-290`. The catch builds an `EXECUTION_ERROR` at `source.get(0)`, using
  `PSystemErrorUtils.buildV2(umlSource, err, emptyList, source, preprocessing, t)`. It adds that to `errors` and
  continues the loop. `merge` then picks among the errors.
- `error/PSystemErrorUtils.java#buildV2,merge`, and `src/core/error/PSystemErrorUtils.ts` (what is already ported);
- `src/core/dispatcher.ts:140-240`, `src/core/parse-refusal.ts`, `src/index.ts:189-215` (the D1 note on throw versus
  refusal);
- `decisions.md` D7.

**Do:**
1. Red:
   - `cov-crash-finalizing` through `fixtures.mts` gives `error-pair` once our page reads `Fatal crash error, you
     should send a mail to plantuml@gmail.com with: java.lang.IllegalStateException: This is a normal crash when
     FINALIZING` at the jar's line (3).
   - A unit test with two stub plugins: the first throws, the second parses. The second must win, as upstream's loop
     continues.
2. Port the catch in `attempt`, as a refusal-shaped result that carries the fatal message and the throwable.
   - `merge`'s score rules decide which error page wins. Keep every existing refusal path unchanged.
   - Before writing the score, read how upstream scores this error (`ErrorUml` at score 0).
3. Survey, alone: `npm run svg:survey`, then `verdict-diff.mjs <base>`. Also run every family's authored and golden
   ratchets that hold "Fatal crash" fixtures (`grep -rl 'Fatal crash' tests/fixtures`: packet, git).
   - A pin that falls is a gain: re-pin it with that family's tool, and journal it.
   - A loss you cannot explain with a Java quote: revert T1d (D7), journal the mechanism, add a next-missions
     follow-on, and continue to batch 2.

## Acceptance
- Given a plugin whose `parse` throws and a later candidate that parses, then the later candidate's diagram renders.
- Given `cov-crash-finalizing`, then `fixtures.mts` prints `error-pair`.
- Given the survey, then `verdict-diff` shows 0 lost in every engine.

Observability is N/A: there are no new observable operations. Rollback is Reversible: revert the commit (D7).
