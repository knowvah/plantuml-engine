# src/core/decimal -- the `java.math.BigDecimal` subset (timing-engine-port D3)

`src/core/math/` is `net.sourceforge.plantuml.math` (AsciiMath), hence `decimal/`.

Representation: a `bigint` unscaled value and an `int` scale (value = unscaled * 10^-scale), as in the JDK.
`compareTo` ignores scale; `toPlainString` and `toString` print it. Java `long` is a JS `number` (exact to 2^53).
Errors are `Error`s whose message is `Throwable#toString` (`java.lang.NumberFormatException: ...`), because
`ProtectedCommand` prints `t.toString()` (`command/ProtectedCommand.java:75`).

## Java member -> TS member (call site in `timingdiagram/`)

- `BigDecimal.ZERO` -> `ZERO` (`TimingRuler.java:83,86`, `CommandClock.java:149`)
- `BigDecimal.valueOf(long)` -> `valueOf(n)` (`TimingDiagram.java:377`); `new BigDecimal(long|int)` -> `valueOf` too
  (`TimingFormat.java:101`, `TimeTickBuilder.java:92`, `Panels.java:185`)
- `BigDecimal.valueOf(double)` -> `valueOfDouble(d)` (`TimeSeriesTest.java:14`)
- `new BigDecimal(String)` -> `new BigDecimal(s)` (`TimeTickBuilder.java:79,108`, `CommandClock.java:133,150`)
- `add`, `multiply`, `compareTo`, `signum` (`TimeTickBuilder.java:79`, `TimingDiagram.java:377`, `TimeTick.java`,
  `TimingRuler.java:82-86,277`)
- `doubleValue` (`TimingRuler.java`, `TimeSeries.java`), `longValue` (`TimingRuler.java:153,165,285,302`),
  `longValueExact` (`TimingFormat.java:63`)
- `toPlainString` (`TimingFormat.java:65`), `toString` (`layoutChars`)

Not ported (not reached): `abs`, `max`, `min`, `negate`, `divide`, `setScale`, `equals`, `hashCode`, `MathContext`.
