# Batch 1 — ticks, formats, ruler

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T1a | `BigDecimal` subset, `TimeTick`, `TimingFormat`, the small enums and interfaces | orchestrator or typescript-pro | `src/core/decimal/**`, `src/diagrams/timing/{TimeTick,TimingFormat,TimeProjected,TimeAxisStategy,TimingStyle,Clocks}.ts`, `date-format.ts`, tests | T0 | [x] |
| T1b | `DeduceFormat`, `TimeSeries`, upstream's two tests | orchestrator or typescript-pro | `src/diagrams/timing/{DeduceFormat,TimeSeries}.ts`, tests | T1a | [x] |
| T1c | `TimingRuler`, `TickInPlayer`, `TimeTickBuilder` | orchestrator or typescript-pro | `src/diagrams/timing/{TimingRuler,TickInPlayer}.ts`, `command/TimeTickBuilder.ts`, tests | T1a | [x] |

Serial (D15). Nothing here is reachable from `renderSync`; the unit tests are the measure.

## Interface contract (T1a → everything after)

```ts
class BigDecimal {              // src/core/decimal/BigDecimal.ts, D3
  static readonly ZERO: BigDecimal
  static valueOf(n: number /* Java long */): BigDecimal
  constructor(s: string)        // Java grammar; throws NumberFormatException-named Error
  add(o: BigDecimal): BigDecimal; multiply(o: BigDecimal): BigDecimal
  compareTo(o: BigDecimal): number; signum(): -1 | 0 | 1
  doubleValue(): number; longValue(): number; longValueExact(): number   // the last throws ArithmeticException-named Error
  toPlainString(): string; toString(): string
}
class TimingFormat { static DECIMAL; static HOUR; static DATE; static create(sdf): TimingFormat;
  formatTime(t: BigDecimal | number): string; static createDate(yyyy, mm, dd, format): TimeTick }
class TimeTick { constructor(time: BigDecimal, format: TimingFormat); getTime(); getFormat(); compareTo(o); toString() }
enum TimeAxisStategy { AUTOMATIC, HIDDEN, MANUAL }   // Java order, TimeAxisStategy.java:38
enum TimingStyle { ROBUST, CONCISE, RECTANGLE }
interface Clocks { getNow(): TimeTick; getClockValue(clockName: string, nb: number): TimeTick | undefined;
  getCodeValue(code: string): TimeTick | undefined; getTimingFormatDate(): TimingFormat }  // Clocks.java
```

`sdf` is whatever T1a builds for `SimpleDateFormat`: a pattern plus the zone it formats in (D4). Exact members follow
the Java; extend this block in the journal if a member is added.

## Batch close

The task contract's batch close, steps 1 and 4 (no survey: nothing is registered yet).
