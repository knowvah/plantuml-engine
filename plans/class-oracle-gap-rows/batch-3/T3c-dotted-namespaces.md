# T3c: namespaces made from dotted and `::` names

**Rows:** `gemufi-65-riba175`, `vapasu-07-fajo818`, `botome-06-bera894`.

- `gemufi`: `package a_$a #yellow {}`, `package java.lang #white {}`, `a_$a --> dummy$2`. The jar draws a `java` cluster
  holding `java.lang`. Our cluster is 30 narrower, and `textLength` differs on the cluster title.
- `vapasu`: `!define table(x) class x << (T,mistyrose) >>`, then `table('"m3.Table1" <generic here>')`. The jar makes
  package `m3` holding `Table1` with the generic `generic here`. Our page is 65 wider.
- `botome`: `"Customer::AccountReconciliation" <|.. Object` with `hide empty members`. Ours is 398 wide and the jar's
  244, and the first drawn entity differs (`ent0002` / `ent0001`).

## Lead (verify before acting)

Read how `CucaDiagram` / `ClassDiagram` split a name on the namespace separator (`getNamespaceSeparator`, the `Quark`
tree under `abel/`), and when a quoted name with a separator still splits. Then check:
- the cluster title the jar prints for a nested package (`java` holding `java.lang`, and what text each title holds);
- whether `::` is a separator for class by default, or only under `set namespaceSeparator ::`.

If the three rows turn out to be three mechanisms, split the task (push-forward).

## Acceptance
- Given each row, when it is measured, then `n=0`.
- Given unit tests in `tests/unit/class/cogr-T3c.test.ts`, then each case asserts the jar's cluster titles and
  widths.

Observability is N/A. Rollback is Reversible.
