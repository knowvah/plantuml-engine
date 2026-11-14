## Observation: AtomOpenIconic's "url is always null" comment was true of one caller only
- **Context**: sogr T2d, `tupema-84-tako461` (OpenIconic inside `[[url ...]]`).
- **Finding**: `StripeSimple.java:242` passes `null`, but `AtomTextUtils.java:117` passes the url. The port's
  `'inline'` atom already carried `url` (`StripeSimple.ts:261`, DUR T2); `asAtomOpenIconic` dropped it. Sequence labels
  use `chromeAtomOps` -> `asAtomOpenIconic` (`sequence-creole-sheet.ts`). Fixed in `AtomOpenIconic.ts`; comment corrected.
- **Impact**: any engine on `chromeAtomOps` now gets the `<a>` around a url-label glyph (no ratchet moved).
- **Confidence**: High
