# T2a: per-group colours on a cluster

**Rows:** `mipuzo-23-saji028`, `tufuru-60-laxo740`.

- `mipuzo`: `package p1 #red;text:blue;line:yellow { class cl1 }`. The cluster `path`/`line` stroke is ours `#000`, the jar's
  `#FF0`, and the title fill is ours `#000`, the jar's `#00F`.
- `tufuru`: `rectangle "My first Box" as box1 #text:red;line:red { Bob -> Alice }`. The rect stroke is ours `#181818`,
  the jar's `#F00`, and the title fill is ours `#000`, the jar's `#F00`.

## Lead (verify before acting)

The `#back;line:x;text:y` spec parses into a `Colors` with `ColorType.BACK`, `LINE` and `TEXT`. Find where the jar's
cluster drawing reads `LINE` and `TEXT` from the group's colours: start at `svek/Cluster*.java` and the
`ClusterDecoration` / USymbol `asBig` path, and at how `CommandPackage` stores the colours on the group. Then check
which of the three our class cluster renderer drops. `BACK` already works in other rows.

Both rows have a single group. T2c reuses this mechanism on empty groups.

## Acceptance
- Given `mipuzo-23-saji028`, when it is measured, then `n=0`.
- Given `tufuru-60-laxo740`, when it is measured, then `n=0`.
- Given a unit test in `tests/unit/class/cogr-T2a.test.ts`, then it asserts the stroke and title fill values from
  each oracle.

Observability is N/A. Rollback is Reversible.
