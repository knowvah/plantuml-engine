# T1c: `PSystemKeycheck`; both `keycheck` forms

**Decisions:** D1, D2, D3, D5 (`keycheck`).

## Read first

- `PSystemVersionFactory.java:77-87`; `PSystemKeycheck.java` in full (constructors :31-43, `getTextBlock` :64-81,
  `addDetails` :83-90, `header` :92-101, `drawFlash` :103-131).
- `LicenseInfo.java:138-166` (`retrieveNamed`, `retrieveDistributorOrNamed`), `License.java:374-388`
  (`addLicenseInfo`, ported at `License.ts:271`).
- `PSystemKeygen.ts` from T1b.

## Do

1. Create `src/diagrams/version/PSystemKeycheck.ts`: `class PSystemKeycheck extends UgSimpleDiagram` with `sig`
   (`string | undefined`, Java's `null`) and `key`; the one-key form passes `undefined` for `sig` (java:41-43).
   Upstream overloads the constructor by arity; TS cannot, so use one constructor with an optional `sig`, or a
   static factory per form, and document which (preserve the upstream names in `@see`).
2. `getTextBlock()`: `header()`, `<u>Provided license information</u>:`,
   `License.addLicenseInfo(strings, LicenseInfo.NONE)` (D3: no key decoding exists, so `info` is `NONE` for both
   forms; cite java:67-68), D5's line 5, then ` `. Cite `addDetails` (java:83-90, non-`NONE` only) and `drawFlash`
   (java:103-131, never called upstream) as not ported. The `try`/`catch` (java:66, :76-79) guards a decode this port
   does not perform; say so.
3. Private `header()` (java:92-101), as T1b's.
4. Factory: `KEYCHECK_SIG_KEY` (java:77) then `KEYCHECK_KEY` (java:84), in that order, after `KEYIMPORT`.
5. Remove the last D8 sentence from the factory header: it now claims every upstream regex.
6. Tests (`tests/unit/version/PSystemKeycheck.test.ts` + factory cases): `keycheck abc123 def456`,
   `keycheck abc123`, `KEYCHECK ABC123` draw D5's six lines; `keycheck` alone and `keycheck a-b` are refused.

## Acceptance
- Given `@startuml\nkeycheck abc123 def456\n@enduml`, when rendered, then the lines are D5's six `keycheck` lines.
- Given `keycheck abc123`, when rendered, then the page equals the two-argument page.
- Given `keycheck` with no argument, when the factory runs, then it answers `undefined`.

Observability: N/A, no new observable operations. Rollback: Reversible.
