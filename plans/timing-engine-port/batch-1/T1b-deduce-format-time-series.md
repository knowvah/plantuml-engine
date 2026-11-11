# T1b — `DeduceFormat`, `TimeSeries`

**Read:** D5, D6; `DeduceFormat.java`, `TimeSeries.java`; upstream `src/test/java/net/sourceforge/plantuml/timingdiagram/
{DeduceFormatTest,TimeSeriesTest}.java`; the JDK's `DecimalFormat` for the pattern shapes `DeduceFormat` builds
(`HALF_EVEN`, `Locale.US` symbols, minimum/maximum fraction digits, no grouping unless the pattern has `,`).

**Do:**

1. `DeduceFormat.ts`: the Java class, with `getDecimalFormat` returning a formatter for exactly the patterns it can
   build (`decimal-format.ts` beside it if the file passes 500 lines); `mergeWith` as the Java.
2. `TimeSeries.ts`: a `TreeMap<TimeTick, number>` as a sorted array (D6: `put` on an equal tick keeps the first key and
   takes the new value), `minOverride`/`maxOverride`, the interpolation at java:120-130 on `doubleValue()`.
3. Port both upstream tests case for case into `tests/unit/timing/DeduceFormat.test.ts` and `TimeSeries.test.ts`,
   each `it` naming its Java test method.

**Tests:** the two ported suites; plus `HALF_EVEN` on `0.125` → `0.12` and `0.135` → `0.14` under a `0.00` pattern.

## Acceptance
- Given the ported upstream tests, then every case passes with the Java expectation unchanged.
- Given an analog probe's values (`cov-analog`, `cov-ticks-every`), when formatted, then the labels match the oracle
  text in `/tmp/tdp-plan/oracle/`.

Observability N/A. Rollback Reversible.
