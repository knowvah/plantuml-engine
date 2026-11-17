# T1e: cluster comment names are the quark name (D3)

**Writes:** the namespace create site (`class-namespace-resolve.ts#ensureNamespaceChain` and the `package`/`namespace`
opener commands), the namespace AST and `class-geo-namespace-types.ts` / `class-geo-builders.ts` (carry `quarkName`),
`renderer.ts:185` (pass it to `wrapCluster`), unit tests.
**Reads:** D3 in `decisions.md`; `svek/Cluster.java:298-311` (`group.getName()`), `abel/Entity.java:686-688`, and T1d's
journal rows on how `Plasma` names a quark.

## Steps

1. Red: unit tests on `curuju-86` (`package Purchase as Pu` → `<!--cluster Pu-->`), `sumule-00` (`A.B.C.D` → `D`),
   `satabo-94` (`CodeVerification`), `pijugo-91` (`profiles`), `zasuxe-15` (`[[…]]` in the label) and `jabama-09`.
2. Green: stamp `quarkName` on the namespace where it is created (the same rule as T1d, for a group's quark), carry it,
   and have `renderer.ts` pass it, not `ns.label`. The `##` synthetic-name skip in `wrapCluster` keeps reading the
   upstream name (`Cluster.java:310`).
3. Measure. Expect bucket B to empty. Every open-list entry left must name a filed issue or another mechanism.

## Acceptance
- Given `curuju-86-laci922`, when rendered, then its cluster comment is `<!--cluster Pu-->`.
- Given both open lists after T1e, when read, then every remaining entry names a filed issue.

Observability is N/A. Rollback is Reversible.
