# Parallel port edges: the second of five routes as a tight arc, not dot's long route

**Fixed in `dot-engine` 2.12.0 (2026-11-06).** With a fixed-size label, all five routes equal native's; the probe
`ports-decors` is an odd-T4a fixture at 0 diffs. Ticked in `TRACKER.md`.

**Verified 2026-11-05 (odd-T4a), `dot-engine` 2.4.0, native graphviz 16.1.0.** Our DOT matches the jar's for every
edge, and the engine alone reproduces the difference: `DE.render(DE.parse(svek-1.dot), 'dot')` differs from
`dot -Tdot svek-1.dot` on exactly one line of the 46.

## Reproduce

```
digraph unix {
nodesep=0.486111;
ranksep=0.833333;
remincross=true;
searchsize=500;
sh0006 [shape=plaintext,label=<<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" CELLPADDING="0"><TR><TD FIXEDSIZE="TRUE" WIDTH="49.575" HEIGHT="18"></TD></TR><TR><TD FIXEDSIZE="TRUE" WIDTH="49.575" HEIGHT="18" PORT="p"></TD></TR></TABLE>>];
sh0007 [shape=plaintext,label=<<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" CELLPADDING="0"><TR><TD FIXEDSIZE="TRUE" WIDTH="49.575" HEIGHT="18"></TD></TR><TR><TD FIXEDSIZE="TRUE" WIDTH="49.575" HEIGHT="18" PORT="q"></TD></TR></TABLE>>];
sh0006:p->sh0007:q[arrowtail=none,arrowhead=none,minlen=1];
sh0006:p->sh0007:q[arrowtail=none,arrowhead=none,minlen=1];
sh0006:p->sh0007:q[arrowtail=none,arrowhead=none,minlen=1,label="x"];
sh0007:q->sh0006[arrowtail=none,arrowhead=none,minlen=1];
sh0006->sh0007:q[arrowtail=none,arrowhead=none,minlen=1];
}
```

The PlantUML source, under `map A { ka => va }` and `map B { xa => ya }`: `A::ka <--> B::xa`, `A::ka *-- B::xa`,
`A::ka o.. B::xa : lbl`, `B::xa --|> A`, `A --> B::xa`. Every pair of these is identical on both engines; the
five together are not.

## Observed

The second edge, from the jar's own `svek-1.dot`:

- native: `pos="39.667,132 12.741,132 7.4945,96.577 22.167,74 40.056,46.473 71.336,71.235 89.667,44 97.304,32.653 104.34,13.305 90.986,13.004"`
- dot-engine: `pos="39.357,132 -13.119,131.54 -13.119,13.463 39.358,13.001"`

Native routes it through the same corridor as the labelled edge; dot-engine draws it as the same outer arc as the
first edge. The canvas follows: 177 wide in the jar, 184 in ours.

## Impact

No corpus row reaches this. It is the probe `ports-decors` of odd-T4a only, and it is left there as a known
difference. The first, third, fourth and fifth edges match.
