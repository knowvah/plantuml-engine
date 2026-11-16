# T3f: `json` entities and a `<<style>>` arrow in a class diagram

**Row:** `style-stereotype-on-arrow-6`.

```
<style>
.mystyle { linecolor: blue; linethickness: 3 }
</style>
json n0 42
json n1 true
n0 -> n1 <<mystyle>> : label
```

The only diffs are the page width, 170 against the jar's 171.

## Lead (verify before acting)

The 1 px is a width rounding or a margin on the widest element. Find which one: compare each entity's `rect` and the
label's `text` `x`/`textLength` with the oracle (the comparator stops at the first diff path). Then read how
`EntityImageJson` (or whichever image `json` leaves use in class) sizes a scalar value. Its sibling
`style-stereotype-on-arrow-4` is the same source with `class n0` / `class n1`, and it is pinned. So the `json` leaves
are the difference.

## Acceptance
- Given `style-stereotype-on-arrow-6`, when it is measured, then `n=0`.
- Given a unit test in `tests/unit/class/cogr-T3f.test.ts`, then the page width and the measured element's size match
  the oracle.

Observability is N/A. Rollback is Reversible.
