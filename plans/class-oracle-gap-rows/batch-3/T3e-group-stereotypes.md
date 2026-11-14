# T3e: several stereotypes on a package or node group

**Row:** `xupuzi-80-deri689`.

```
package foo1 <<Node>> { class Class1 }
package foo2 <<A>><<B>> { class Class2 }
package foo3 <<Foo>><<Node>><<Bar>> { class Class3 }
node foo4 <<Node>> { … }   node foo5 <<A>><<B>> { … }   node foo6 <<Foo>><<Node>><<Bar>> { … }
```

The page is 825×170 against the jar's 835×175. The first structural diff is a cluster's stereotype text
(`g[5]/text[1]/text()[1]`).

## Lead (verify before acting)

Two candidate mechanisms: `<<Node>>` on a `package` may select a USymbol (as `<<Rectangle>>` and `<<Frame>>` do, #149),
and several stereotypes print one label each, or one joined label. Read `CommandPackage`'s stereotype handling, the
`Stereotype` label list (`getLabels`), and the cluster title's stereotype block (`ClusterHeader` or
`EntityImageEmptyPackage`'s stereo block for empty ones). Measure which group's text differs first.

## Acceptance
- Given `xupuzi-80-deri689`, when it is measured, then `n=0`.
- Given a unit test in `tests/unit/class/cogr-T3e.test.ts`, then the stereotype texts and the cluster heights match
  the oracle.

Observability is N/A. Rollback is Reversible.
