/**
 * state-node-label (snl, #235, D2): the clock digits of a transition-label leaf id, rewritten to one fixed token.
 *
 * The jar names the leaf `"transition_" + src + "_" + tgt + "_" + sanitisedLabel + "_" + System.currentTimeMillis()`
 * (`statediagram/command/CommandLinkStateCommon.java:388-395`), so its ids differ on every run; the port reads the
 * injected clock instead (D1). `normalize.ts` applies this to every attribute value and `svg-comments.ts` to every
 * comment body, on jar and port alike. Text content is never rewritten: the jar never draws the id as text.
 *
 * Anchored so that it is inert everywhere else (stop condition 8): `transition_`, then characters that are not
 * whitespace, a quote or `-`, then `_` and a digit run that ends at a token boundary (`"`, `-`, whitespace or the end).
 */

/** The fixed replacement for the millisecond suffix. */
export const TRANSITION_MILLIS_TOKEN = '<millis>';

const TRANSITION_ID_MILLIS = /(transition_[^\s"'-]*_)\d+(?=["\s-]|$)/g;

/** `value` with every transition-label id's trailing digit run replaced by {@link TRANSITION_MILLIS_TOKEN}. */
export function normaliseTransitionNodeId(value: string): string {
  return value.replace(TRANSITION_ID_MILLIS, `$1${TRANSITION_MILLIS_TOKEN}`);
}
