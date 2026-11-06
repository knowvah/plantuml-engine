## Observation: a signed "we draw" row blocks mirroring the jar's error
- **Context**: odd T4a mirrored `Object already exists` and `Map already exists`.
- **Finding**: `dulone-62` and `losote-76` are signed in `oracle/accepted-divergences.json` (#143), so mirroring them turns `emitter.golden.test.ts` red until the entries are retired. `kepife-84` and `leseku-63` carry the ruling that an unknown colour paints neutral grey, which covers `object a #nosuch` too.
- **Impact**: grep the ledger for the jar's message before mirroring any error. Backed out and filed as #152.
- **Confidence**: High

## Observation: an object's name and fields go through `Display`, not a plain measure
- **Context**: odd T4a probes `multiline-name`, `field-newline`.
- **Finding**: the name block and each field split on `\n` and read creole (`EntityImageObject.java:98`, `MethodsOrFieldsArea#createTextBlock`). `measureNameBlock` keeps a plain line at the bounder's own height, because `buildHeaderLineMetrics` answers the font size and a measurer can differ.
- **Impact**: class `godage-48` went conformant on this path; other engines' object-like leaves should not assume one line.
- **Confidence**: High

## Observation: dot-engine routes the second of five parallel port edges differently
- **Context**: odd T4a probe `ports-decors`.
- **Finding**: `DE.render(DE.parse(svek-1.dot), 'dot')` differs from native `dot -Tdot` on one line. Filed as `docs/graphviz-issues/41-parallel-port-edges-second-route.md`.
- **Impact**: no corpus row reaches it.
- **Confidence**: High
