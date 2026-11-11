import { LocalDate } from './LocalDate.js';
import { floorDiv, floorMod, SECONDS_PER_DAY } from './time-math.js';

/**
 * The slice of `java.util.GregorianCalendar` (zone GMT, default 1582-10-15 cutover) that
 * `timingdiagram/TimingFormat.java` uses (`gc.setTimeInMillis`, `gc.set(y, m, d)` in lenient mode,
 * `gc.getTimeInMillis`, `gc.get(MONTH | DAY_OF_MONTH)`): integer epoch-day arithmetic, no `Date`.
 * The calendar is Julian before the cutover and proleptic-Gregorian after it (timing-engine-port D4).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/TimingFormat.java:44-101
 * @see java.util.GregorianCalendar#computeTime (lenient `calculateFixedDate`) and #computeFields
 */

/** 1582-10-15 as an epoch day: `GregorianCalendar#gregorianCutoverDate` (577736) - `EPOCH_OFFSET` (719163). */
const CUTOVER_EPOCH_DAY = -141_427;
const JDN_OF_EPOCH_DAY_ZERO = 2_440_588;
const CUTOVER_YEAR = 1582;
const MONTHS_PER_YEAR = 12;
const JULIAN_JDN_OFFSET = 32_083;
const JULIAN_CIVIL_OFFSET = 32_082;
const JULIAN_YEAR_BASE = 4800;
const MILLIS_PER_SECOND = 1000;

/** The epoch day of a Julian-calendar civil date (day may overflow the month, as `fixedDate += DAY_OF_MONTH`). */
function julianEpochDay(year: number, month: number, day: number): number {
  const a = floorDiv(14 - month, 12);
  const y = year + JULIAN_YEAR_BASE - a;
  const m = month + MONTHS_PER_YEAR * a - 3;
  const jdn = day + floorDiv(153 * m + 2, 5) + 365 * y + floorDiv(y, 4) - JULIAN_JDN_OFFSET;
  return jdn - JDN_OF_EPOCH_DAY_ZERO;
}

/** Month (1-12) and day-of-month of a Julian-calendar epoch day (`JulianCalendar#getCalendarDateFromFixedDate`). */
function julianMonthDay(epochDay: number): readonly [number, number] {
  const c = epochDay + JDN_OF_EPOCH_DAY_ZERO + JULIAN_CIVIL_OFFSET;
  const d = floorDiv(4 * c + 3, 1461);
  const e = c - floorDiv(1461 * d, 4);
  const m = floorDiv(5 * e + 2, 153);
  return [m + 3 - MONTHS_PER_YEAR * floorDiv(m, 10), e - floorDiv(153 * m + 2, 5) + 1];
}

/** Normalise a month index outside 0-11 into the year, as `GregorianCalendar#getFixedDate`. */
function normalizeMonth(year: number, month0: number): readonly [number, number] {
  return [year + floorDiv(month0, MONTHS_PER_YEAR), floorMod(month0, MONTHS_PER_YEAR) + 1];
}

/**
 * `gc.setTimeInMillis(0); gc.set(yyyy, month0, dd); gc.getTimeInMillis() / 1000L` in a lenient GMT
 * calendar: month and day may be out of range and roll over. Mirrors `GregorianCalendar#computeTime`'s
 * choice between the Gregorian and Julian fixed dates around the cutover.
 */
export function epochSecondsOfLenientDate(yyyy: number, month0: number, dd: number): number {
  const [year, month] = normalizeMonth(yyyy, month0);
  const gfd = LocalDate.of(year, month, 1).toEpochDay() + dd - 1;
  const jfd = julianEpochDay(year, month, 1) + dd - 1;
  return chooseEpochDay(yyyy, gfd, jfd) * SECONDS_PER_DAY;
}

/**
 * The `calculateFixedDate` block of `GregorianCalendar#computeTime`; `calsys` is the Gregorian system after
 * `setTimeInMillis(0)`, so the "overlapping" period takes `gfd`. `year` is the un-normalised YEAR field.
 */
function chooseEpochDay(year: number, gfd: number, jfd: number): number {
  if (year > CUTOVER_YEAR && gfd >= CUTOVER_EPOCH_DAY) return gfd;
  // `gfd = jfd` when a pre-cutover year's Julian date lands at or after the cutover (computeTime, year < cutoverYear branch)
  if (year < CUTOVER_YEAR) return jfd;
  if (gfd >= CUTOVER_EPOCH_DAY) return gfd;
  // A "missing" date (Oct 5-14 1582) takes the Julian value too, which prints as a Gregorian date (lenient mode).
  return jfd;
}

/**
 * `String.format("%02d/%02d", gc.get(MONTH) + 1, gc.get(DAY_OF_MONTH))` after
 * `gc.setTimeInMillis(epochSeconds * 1000L)`.
 */
export function monthDayOfEpochSeconds(epochSeconds: number): string {
  const epochDay = floorDiv(epochSeconds * MILLIS_PER_SECOND, SECONDS_PER_DAY * MILLIS_PER_SECOND);
  const [month, day] = epochDay >= CUTOVER_EPOCH_DAY ? gregorianMonthDay(epochDay) : julianMonthDay(epochDay);
  return `${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
}

function gregorianMonthDay(epochDay: number): readonly [number, number] {
  const date = LocalDate.ofEpochDay(epochDay);
  return [date.getMonthValue(), date.getDayOfMonth()];
}
