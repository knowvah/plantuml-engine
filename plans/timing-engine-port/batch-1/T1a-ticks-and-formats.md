# T1a — `BigDecimal`, `TimeTick`, `TimingFormat`, the small types

**Read:** D3, D4, D6; `TimeTick.java`, `TimingFormat.java`, `TimeProjected.java`, `TimeAxisStategy.java`,
`TimingStyle.java`, `Clocks.java`; every `BigDecimal` call site (`grep -rn 'BigDecimal\|getTime()\.'
timingdiagram/`); `src/core/time/README.md` (the subset-port shape to copy); `src/core/tim/builtin/date-format.ts`;
`src/core/clock.ts`; the JDK's `BigDecimal(String)`, `toPlainString`, `toString`/`layoutChars`, `longValueExact`,
`GregorianCalendar` (Julian cutover, lenient `set`) and `SimpleDateFormat#compile` (the pattern-letter check).

**Do:**

1. `src/core/decimal/BigDecimal.ts` and `README.md`: exactly the members the call sites reach, each with a JSDoc
   naming the JDK method; `bigint` unscaled value and integer scale. Errors carry the Java exception name in the message
   (`NumberFormatException`, `ArithmeticException`), since `ProtectedCommand` prints it.
2. `TimeTick.ts`, `TimeProjected.ts`, `TimeAxisStategy.ts`, `TimingStyle.ts`, `Clocks.ts`.
3. `TimingFormat.ts`: `DECIMAL`, `HOUR`, `DATE` as distinct singletons (identity matters, java:46-48 and 62), `create`,
   both `formatTime` overloads, `createDate` with lenient fields and the Julian rule before 1582-10-15, on
   `src/core/time/` arithmetic (D4). The `sdf` path takes a pattern and a zone and formats `time * 1000` ms through
   `formatDate` in that zone.
4. `date-format.ts`: a separate exported check mirroring `SimpleDateFormat`'s `IllegalArgumentException` on an
   unquoted pattern letter outside `GyMdkHmsSEDFwWahKzZYuXL` (and an unterminated quote); add any pattern letter the
   timing probes and rows use that `formatDate` lacks. `%date`'s existing tests stay green unchanged.
5. Find the throw site of `cov-date-julian`'s `IllegalStateException` (it may be in `TimingRuler`, T1c's): journal it
   and the task that owns it.

**Tests (`tests/unit/timing/`, `tests/unit/core/decimal/`):** `new BigDecimal('2.50').toPlainString()` is `2.50`;
`compareTo` of `1` and `1.0` is 0; `new BigDecimal('+.5')` parses and `'-.'` throws; `longValue` of `-2.7` is `-2`;
`longValueExact` of `2.5` throws; `toString` of `1E+3`-scale values matches Java; `TimingFormat.HOUR.formatTime(4530)`
is `1:15:30`; `DATE` of `createDate(2020, 7, 4)` is `07/04`; `createDate(2020, 13, 45)` formats `02/14`
(`cov-date-lenient`); the `sdf` path with `YY-MM-dd` in `America/Chicago` on `2020/07/04` is `20-07-03`
(`cov-date-format`), and `yyyy` on `1992/01/01` is `1991` (`mekivo-95-xafe506`); the pattern check rejects `qq` and
accepts `yyyy`, `YY-MM-dd`.

## Acceptance
- Given `BigDecimal`, when compared with the JDK on every value the probes and rows use as a tick, then
  `toPlainString`, `compareTo` and `doubleValue` agree.
- Given the `sdf` path and a zone, when formatting the two probe dates, then the jar's labels result.
- Given `npm test`, then it passes with the new files covered ≥90 % on lines, branches and functions.

Observability N/A. Rollback Reversible.
