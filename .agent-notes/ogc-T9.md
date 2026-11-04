# ogc-T9 — cache versus manifest facts (oracle-gap-capture, 2026-11-04)

## Observation: cached source that differs from its manifest row
- **Context**: T9 of oracle-gap-capture compared every `tests/visual/data/<bucket>.json` row's `markup` with `test-results/dot-cache/<any bucket>/<slug>/in.puml` after the capture (5927 cache directories, 5855 manifest rows).
- **Finding**: after CRLF normalisation and the smetana/vizjs pragma strip that `capture-oracle-cache.ts` applies, 43 pairs differ: 7 only by `colour` vs `color` (usecase rows `cuzuci-92-dugi933`, `fuvosu-10-lixu251`, `kijufe-84-colu239`, `nenedo-78-fiva569`, `seneso-72-cuje674`, `tanuna-53-neko979`, and one more), 23 only by a blank line, 5 by a stray token at the block edge (`@endumls`, `@enduml */`, `@startuml Test`, two added lines), and 7 are same-slug pairs across two manifests that are different fixtures (`style-node-background` dot/hcl, `potatu-55-pave291` component/class, `nuduzi-26-nese890`, `ratevu-84-coji558`, `zazajo-40-jupi046` sequence/class, `xilosu-00-taju695` sequence/unknown). Raw string compare without normalisation reports 145.
- **Impact**: the coverage gate matches by slug, not markup (D3), so these rows count as covered; a markup-based gate would fail them on spelling. The brief's "9 differing rows" came from a stricter token compare at planning time.
- **Confidence**: High (computed; script in the T9 journal row).

## Observation: cache directories no manifest names
- **Context**: same comparison, the other direction.
- **Finding**: 34 cache directories carry a slug in NO manifest: sequence 15 (for example `TeozTimelineIssues_0007_Test`, `SequenceArrows_0002_Test`), class 5, activity 4, usecase 4, yaml 3, state 1. Counting instead by "slug absent from the SAME bucket's manifest" gives 869 (sequence 275, unknown 223, activity 157, class 156, state 27): that is D2's routing by jar type, not missing rows. The brief's "282 (245 sequence)" was measured before the capture by the same-bucket rule.
- **Impact**: the 34 are survey-only rows (nonreg `*_Test` sequence sources and others captured outside the manifests); nothing reads them as manifest coverage. No cleanup was done here.
- **Confidence**: High.

## Observation: stray `test-results/dot-cache/class/.serena/`
- **Context**: listing hidden entries under the cache during T9.
- **Finding**: `test-results/dot-cache/class/.serena/` exists, untracked, a Serena scaffold from a session whose cwd was that directory (see memory `serena-cd-scaffolding`). The capture tool's loaders skip dot-prefixed names.
- **Impact**: harmless to every walker (they require `in.puml`/`in.svg`), but `git add -A` from inside that directory would stage it.
- **Confidence**: High.
