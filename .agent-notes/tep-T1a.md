## Observation: cov-date-julian's IllegalStateException is the all-negative-ticks rule, not a Julian check
- **Context**: T1a, looking for the throw site D4 asks for.
- **Finding**: `TimingRuler#getFirstPositiveOrZeroValue` (TimingRuler.java:273-279) throws `IllegalStateException` when
  no tick is >= 0. `@1500/01/01` makes the only tick negative (-14830992000 s, Julian date handled by
  `GregorianCalendarGmt`), `ensureNotEmpty` adds a zero tick only when max > 0 and min < 0, so `drawTimeAxis*` reaches
  the throw. The throw site is T1c's (`TimingRuler.ts`); any all-negative timeline crashes the same way.
- **Impact**: T1c mirrors the throw; T4 probes need an all-negative non-Julian case to confirm (e.g. `@-5` alone).
- **Confidence**: High (source read; not yet run through the jar)

## Observation: java.util.GregorianCalendar lenient set around the cutover
- **Context**: porting `TimingFormat.createDate`.
- **Finding**: `computeTime`'s branch uses the un-normalised YEAR field while `getFixedDate` normalises the month; the
  year < 1582 branch takes the Julian fixed date even when it lands after the cutover (1581/12/330 prints 11/05).
  Measured rows are in `tests/unit/core/time/GregorianCalendarGmt.test.ts`.
- **Impact**: do not "simplify" `chooseEpochDay`.
- **Confidence**: High (JDK 21.0.1 measured)
