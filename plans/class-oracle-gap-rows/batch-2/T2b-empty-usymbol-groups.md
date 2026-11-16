# T2b: empty USymbol groups become leaves

**Rows:** `puboje-01-suna474`, `secomu-36-pabe790`, `cokute-29-gezu131`, `vacuso-72-faro236`, `mikepu-83-jono930`.

Each is a set of empty groups (`node node { }`, `queue queue { }`, … , 14 USymbols in `cokute`/`vacuso`; four empty
`node`s inside `together { }` in `mikepu`). The jar's page is one row of leaves (`puboje`: bb 385×48), while ours
stacks clusters (276×142).

## Lead (verify before acting)

`GraphvizImageBuilder.java:416-418`:

```java
if (dotData.isEmpty(g) && g.getGroupType() == GroupType.PACKAGE) {
    g.muteToType(LeafType.EMPTY_PACKAGE);
    printEntity(stringBounder, g);
```

`node X {` makes a `GroupType.PACKAGE` group with a USymbol (read `CommandPackage` to confirm), so every empty USymbol
group is muted, not only `package`. `GeneralImageBuilder.java:201` sends `EMPTY_PACKAGE` to
`EntityImageEmptyPackage`, which draws with the group's USymbol.

The port mutes empty packages already: `class-container.ts:26`, `class-dot-clusters.ts:58`,
`class-namespace-shape.ts#measureEmptyPackageLeafDim`, `class-cluster-corner.ts`. Find which condition there keeps
a USymbol group out, and whether the leaf image draws the USymbol. `together { }` is not a `PACKAGE` group: read how
`mikepu`'s empty nodes inside it are treated.

`secomu` adds an empty `<style></style>`, and `cokute` adds `skinparam BackgroundColor transparent` /
`shadowing false`. Each must come out zero once the main mechanism lands.

## Acceptance
- Given each of the 5 rows, when it is measured, then `n=0`.
- Given a unit test in `tests/unit/class/cogr-T2b.test.ts`, then it asserts the jar's page size and the leaf shapes
  for a small empty-USymbol case.
- Given the class ratchet, then no pinned row moves (empty `package` rows are already pinned).

Observability is N/A. Rollback is Reversible.
