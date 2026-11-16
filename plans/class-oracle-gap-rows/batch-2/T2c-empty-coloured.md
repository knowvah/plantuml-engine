# T2c: empty USymbol groups with per-group colours

**Rows:** `beragu-30-zate466`, `zitene-13-xeda918`, `tegipa-83-bilu912`.

These are T2b's sources with `#aliceblue;line:blue;line.dotted;text:blue` on every group (`zitene` adds an empty
`<style>`, and `tegipa` adds `hexagon` and the other USymbols). They need T2a and T2b both.

## Lead (verify before acting)

After T2a and T2b, measure first. What is left is the colour and `line.dotted` stroke reaching
`EntityImageEmptyPackage`, rather than the cluster. Read how `EntityImageEmptyPackage` takes the group's `Colors`
(including the `line.dotted` stroke style) and which ones it applies to the USymbol. If T2a's cluster path already
covers it, this task is pin-only: journal that.

## Acceptance
- Given each of the 3 rows, when it is measured, then `n=0`.
- Given a unit test in `tests/unit/class/cogr-T2c.test.ts`, then it asserts a dotted blue stroke and blue title on an
  empty `node`.

Observability is N/A. Rollback is Reversible.
