# T3a: an association class with a label

**Rows:** `kofogo-67-jiju461`, `zemeco-27-kaje686`. Both route DESCRIPTION today (`known-misroute` in
`routing-baseline.json`).

```
(ns1.classB, ns1.classA) .. ns1.Exception : Exception
(A_Driver, A_Car) -> A_Contract : under Contract >
```

## Lead (from the ogc-T4b ledger; verify before acting)

The jar accepts both through `CommandLinkClass` (`ClassDiagramFactory.java:143`):
- COUPLE1 `\([%s]*(SINGLE2)[%s]*,[%s]*(SINGLE2)[%s]*\)` is the first endpoint (`CommandLinkClass.java:102,116`);
- then the optional `:` `LABEL_LINK` `(.+)` tail (`:165-170`);
- `executeArg` routes `ENT1 == null` to `executeArgSpecial1` (`:301-302`), which reads `LABEL_LINK` into the
  association-class label (`:414`) and calls `diagram.associationClass`.

Ours: `class-assoc-couple.ts:65-66` `ASSOC_COUPLE_RE` ends `\s*$` right after the third entity, so class refuses the
line and the description engine takes it. Check the trailing-couple form (`C -> (A, B) : label`) and
`ASSOC_DOUBLE_COUPLE_RE` against the Java at the same time, because they share the regex tail. Read how `>` / `<` at
the label's end become a direction decoration on the association class.

## Gate updates

- Flip both rows' routing twins to `agree` with ourType `CLASS`, and their refusal twins if they change. Update the
  running counts the routing and refusal tests assert.
- Remove `kofogo-67-jiju461` from `tests/unit/class/class-cluster-levels.test.ts:133-149`'s exclusions once it
  parses. That suite then covers it.

## Acceptance
- Given each row, when it is measured, then `n=0`, and it routes CLASS.
- Given `(A, B) .. C : x` in a unit test (`tests/unit/class/cogr-T3a.test.ts`), then the class parser accepts it, and
  the association class carries the label `x`.
- Given `class-cluster-levels.test.ts`, then it passes with `kofogo` included.

Observability is N/A. Rollback is Reversible.
