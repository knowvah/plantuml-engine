## Observation: dot-cache oracles are LEGACY suppression pages since the a720bdd re-pin
- **Context**: Planning #186. Re-measured `dot/quoted-labels` and `dot/skinparam-font-color` with
  `plans/dot-oracle-gap-rows/measurements/measure-rows.mts`.
- **Finding**: 54 of 62 `test-results/dot-cache/dot/*/in.svg` were rewritten 2026-11-21 15:17. All 54 are
  `PSystemDot`'s "This feature has been suppressed" page (`PSystemDot.java:77-84`, LEGACY profile; upstream
  e3d33a8afe5; repo cfb9ecd55). The other 8 are the jar error-page rows. `measure-rows.mts` renders under LEGACY as
  well, so it reports every drawn row as zero-diff and as a "jar error page". `parity-dot.json` (2026-11-21T16:30Z)
  reads 62/62 `conformant` for the same reason. Only `oracle/goldens/svg-dot/` (INSECURE captures, read by
  `dot.golden.ratchet.test.ts`) still measures graphviz parity.
- **Impact**: Do not measure `@startdot` geometry from the dot-cache tree, the dot survey or `measure-rows.mts`. Do not
  pin with `plans/dot-oracle-gap-rows/tools/pin-goldens.mts`, which copies from that cache. A ledger entry for an
  `svg-dot/<slug>` row needs `surveyBlind`, or `emitter.golden.test.ts:131-160` fails.
- **Confidence**: High

## Observation: two @startdot files in one oracle-render.sh run come back corrupted
- **Context**: Rendering INSECURE oracles for the two #186 rows:
  `PLANTUML_SECURITY_PROFILE=INSECURE scripts/oracle-render.sh <out> a.puml b.puml`.
- **Finding**: Twice, both outputs were wrong, and differently each time. Run 1: the first SVG had an extra `edge2`
  and the second ended with `Error: <stdin>: syntax error in line 1 near '}'`. Run 2: neither SVG had an edge, and both
  had the syntax error. One file per invocation gave clean output that matched #186 (widths 103 and 87) and native
  `dot -Tsvg`. Not root-caused. The jar's in-process handling of several `@startdot` graphviz calls is the
  suspect, unverified.
- **Impact**: Render `@startdot` oracles one file per `oracle-render.sh` invocation. Check that each output has the
  expected `class="edge"` count and no `syntax error` text.
- **Confidence**: High (the symptom, reproduced twice); Low (the suspected cause)
