# Engine warnings reach `console.warn` with no way to redirect them

**Fixed in `dot-engine` 2.12.0 (2026-11-06)** by the public `agseterrf`; plantuml-ts uses it in
`src/core/dot-engine-messages.ts`. Ticked in `TRACKER.md`.

**Impact:** `@knowvah/dot-engine` 2.10.3 writes to the console of anyone using
plantuml-ts, on valid diagrams. No SVG changes: the verdicts of all 28 surveyed types
are unaffected. Every diagram with a titled cluster that was tried prints this:

```
Warning: table size too small for content
in label of graph cluster0
```

2.4.0 printed nothing for these. Found 2026-11-05 on the bump from 2.4.0 to 2.10.3.

| Source | `console.warn` messages |
| --- | --- |
| `state A { state x }` with `B --> x` | 1 |
| `package P { class C }` with `D --> C` | 1 |
| `package P { [C] }` with `[D] --> [C]` | 1 |
| A plain class, state or sequence diagram | 0 |

**The warning itself is faithful.** Native `dot` 16.1.0 prints the same two lines on the
jar's own `svek-2.dot` for `state/bemena-23-zebu249`. The table is the jar's, with
`FIXEDSIZE="TRUE"` and `HEIGHT="9"`. This filing is not about whether to warn.

**The gap is the sink.** PlantUML runs `dot` as a subprocess, so the jar's users never
see this on a diagram that renders. In the port the warning goes straight to the
process-wide console (`src/common/agerr.ts:87-88`), and the public exports offer nothing
to redirect it: names matching `err`, `warn`, `log`, `diag`, `quiet` or `silent` are only
the error classes. A browser-safe library cannot quiet it without replacing the global
`console.warn` around each render, which plantuml-ts should not do to its host.

**What would close this:** any public way for a caller to receive engine messages, such
as a per-render option or a setting on the render context. Native's equivalent is
`agseterrf` (`lib/cgraph/agerror.c`). That choice is dot-engine's to make.
