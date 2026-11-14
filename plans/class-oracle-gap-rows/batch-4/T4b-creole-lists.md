# T4b: creole lists in a `[ … ]` body

**Row:** `gimumo-81-fuce233`.

A `node n #pink [ … ]` and a `file f #pink as " … "` holding `*` / `**` / `***` bullet lists and `#` / `##` numbered
lists, split by `----`. Our page is 409 wide and the jar's 399. Body text sits 5 to the right.

## Lead (verify before acting)

The 10 = 2×5 suggests one indent unit too many on the widest line. Read the creole list stripes
(`klimt/creole/` `StripeSimple`, the `CommandCreoleListItem` / numbered list commands) for the bullet and number
indents, and compare each line's `x` with the oracle to find which list level is off. Check whether the same body in a
description-bucket row is conformant, which would point at the class path rather than creole.

## Acceptance
- Given `gimumo-81-fuce233`, when it is measured, then `n=0`.
- Given a unit test in `tests/unit/class/cogr-T4b.test.ts`, then the list line `x` values match the oracle.

Observability is N/A. Rollback is Reversible.
