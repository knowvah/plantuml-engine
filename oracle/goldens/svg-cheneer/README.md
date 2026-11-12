# svg-cheneer conformance ratchet

Regression-proof gate for the Chen EER engine (`net/sourceforge/plantuml/cheneer/`, `@startchen`; mission
`chen-eer-engine-port`, #133), laid out flat as `oracle/goldens/svg-regex/` is. A fixture holds once it renders
byte-for-byte identical to the jar oracle under a **deterministic** text measurer. See
`tests/oracle/svg-conformance/cheneer.golden.ratchet.test.ts` and `cheneer.diff-baseline.ratchet.test.ts`.

## Population

The corpus has no `@startchen` row (ceep D6), so `ratchet.json` is empty and every row is authored.

## Authored root

`tests/fixtures/cheneer/` is a flat tree of `<slug>.puml` fixtures, each with the jar's `<slug>.svg` beside it,
rendered by `scripts/oracle-render.sh`: upstream's four `vega-chen-*` fixtures, the planning probes and fixtures
authored for every command branch no probe covered (ceep T3b-T3d, including the `cov-elk*` rows under
`!pragma layout elk`). `authored-baseline.json` tracks them (`cheneer.diff-baseline.ratchet.test.ts`): rows = the
`.puml` files on disk; `weightedScore` never rises; a nonzero row is a jar error page where we also error, with its
`jarError` (ruling 2026-10-10). Re-measure:

```
npx jiti plans/chen-eer-engine-port/measurements/build-authored-baseline.mts <commit> [--write]
```

## DOT parity

Chen reaches real graphviz (one `svek-1.dot` per fixture with two or more leaves), so the jar's DOT is a target:
`oracle/goldens/cheneer/<slug>/{input.puml,svek-1.dot}`, held by `tests/oracle/cheneer-dot-parity.test.ts` and pinned by
`npx jiti plans/chen-eer-engine-port/measurements/pin-cheneer-dot.mts --authored <dir> [--write]`. One-leaf diagrams
(`GraphvizImageBuilder.java:149-158`), error pages and `cov-elk*` write no DOT.
