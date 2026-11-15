/**
 * The refusal gate's every-row colour check (ucol T1a, D3, issue #145). A colour token the jar cannot resolve still
 * draws a valid colour (`HColorSet.java:58-76`: `getColorOrWhite`, `getColorOrNull`), so a fixture whose render
 * carries any other value has passed a token through unresolved. The rule is `invalidColours`
 * (`tests/helpers/svg-colour-validity.ts`); a value the fixture's own golden also carries is the jar's answer and is
 * not counted (the gate subtracts it before this check sees the list).
 *
 * Pure, so every branch is exercised in `refusal-coverage.test.ts` with fabricated input. Kept out of
 * `refusal-coverage-gate.ts`, which sits near the 500-line limit.
 */

export interface ColourCheckResult {
  readonly ok: boolean;
  readonly message: string;
}

/** What the check reads from one fixture's live measurement. */
export interface ColourMeasurement {
  /** `invalidColours(ours)`, minus every value the golden itself carries. */
  readonly invalidColours: readonly string[];
}

/**
 * Fixture key (`keyOf`) -> the issue that holds its residual. Empty at T1a (2026-11-15): every committed fixture
 * renders a valid colour on `5bab49f41`. An entry must name an issue (`#N`) and must still be needed.
 */
export const INVALID_COLOUR_ALLOWLIST: Readonly<Record<string, string>> = {};

const ISSUE = /#\d+/;

/** One fixture's verdict. Absent fixtures are the completeness gate's subject, so they pass here. */
export function checkNoInvalidColour(
  key: string,
  now: ColourMeasurement | undefined,
  allow: Readonly<Record<string, string>>,
): ColourCheckResult {
  const reason = allow[key];
  if (reason !== undefined && !ISSUE.test(reason)) {
    return { ok: false, message: `${key}: its invalid-colour allowlist entry names no issue (#N): "${reason}".` };
  }
  if (now === undefined) return { ok: true, message: `${key}: absent; owned by the walk gate.` };
  const bad = now.invalidColours;
  if (bad.length === 0) {
    if (reason === undefined) return { ok: true, message: `${key}: every colour is valid.` };
    return {
      ok: false,
      message: `${key}: allowlisted (${reason}) but now draws only valid colours. Remove the stale entry.`,
    };
  }
  if (reason !== undefined) return { ok: true, message: `${key}: invalid colour held by ${reason}: ${bad.join(' ')}` };
  return {
    ok: false,
    message:
      `${key}: draws ${bad.join(' ')}, a colour the jar never emits. Find the call site and resolve the token ` +
      `with the HColorSet method upstream calls there (getColorOrWhite / getColorOrNull, HColorSet.java:58-76).`,
  };
}
