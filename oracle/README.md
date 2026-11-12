# PlantUML oracle

The reference implementation plantuml-engine is verified against: a **patched build
of upstream PlantUML** that can dump the exact DOT it feeds to graphviz, while
otherwise behaving identically to stock.

One patched jar, one render pass, **two reference artifacts**:

| Artifact | Captured how | Verifies | Applies to |
|----------|--------------|----------|------------|
| `svek-N.dot` | `-DPLANTUML_DUMP_DOT=<dir>` taps `DotStringFactory.getSvg` | plantuml-engine's **DOT generation** (Svek port): graph structure + attributes it hands graphviz | Svek-backed types only: class, component, state, object, usecase, activity |
| `*.svg` | normal `-tsvg` output | the **end-to-end picture** (layout + draw) | every diagram type |

The verdict vocabulary (`conformant` / `structural-match` / `diverged`
+ exclusion buckets) is defined in `planning/conformance.md` — adopted from
dot-engine. This section is how the DOT gate is staged; that doc is what the
verdicts mean.

## Staged gate — fail fast at DOT

For Svek-backed types the two checks are **sequential, not parallel**. A
structural DOT mismatch *guarantees* a broken SVG, so comparing the SVG after a
DOT failure adds no signal — it just burns a render and reports a symptom whose
cause is one layer up. Stop at the first failing stage:

```
Svek type:   generate DOT ──▶ [DOT gate] ──pass──▶ render SVG ──▶ [SVG gate] ──▶ PASS
                                  │fail                              │fail
                                  ▼                                  ▼
                            verdict: DOT-mismatch            verdict: SVG-mismatch (DOT ok)

non-Svek:    render SVG ──▶ [SVG gate] ──▶ PASS / SVG-mismatch     (no DOT stage)
```

The stage that fails **is** the triage bucket:

- **DOT gate** — precise and attributable; a diff localizes to "we emitted the
  wrong DOT," independent of render. Split it into **structural** attrs (`shape`,
  edges, `minlen`, ports, ranks — exact match, trips the gate) and **metric**
  attrs (`width`/`height`/label box — tolerant; they bake in Java-measured text
  sizes, the text-metrics sub-problem). Only structural divergence fails fast.
- **SVG gate** — only reached when the layout input already matched, so a failure
  here isolates cleanly to plantuml-engine's **drawing** layer. Keep it **tolerant**:
  plantuml-engine lays out via dot-engine while the oracle lays out via PlantUML's
  own graphviz, so small layout deltas leak in even when the DOT matches. For
  non-Svek types (sequence + bespoke renderers) the SVG gate is the only gate.

## Provenance

See `pin.json`. The oracle is upstream PlantUML at the pinned `upstreamSha`
(tree-identical to fork `master`) plus the one-commit seam on the `dot-output`
branch (`patches/0001-oracle-dot-dump.patch`). The seam is inert unless
`PLANTUML_DUMP_DOT` is set, so the jar doubles as the stock SVG oracle.

## Rebuild

```sh
oracle/build-oracle.sh          # builds dist/plantuml-oracle.jar from the fork
oracle/capture.sh <file.puml> <out-dir>     # one fixture → svek-*.dot + .svg
oracle/capture-corpus.sh [goldens-root]     # (re)baseline every goldens fixture
```

## Goldens

`oracle/goldens/<type>/<slug>/` holds the committed reference corpus, one
directory per fixture:

- `input.puml` — the fixture (the candidate side renders this too)
- `svek-N.dot` — the DOT PlantUML fed graphviz (the **DOT gate** reference)
- `input.svg` — the rendered SVG (the **SVG gate** reference)

`capture-corpus.sh` walks the tree and regenerates the `svek-*.dot`/`.svg`
beside every `input.puml` (idempotent — clears stale artifacts first). Re-run it
to re-baseline whenever `pin.json`'s `upstreamSha` changes. A fixture with no
edges legitimately yields **0 DOT** — PlantUML skips graphviz when there is
nothing to lay out, so parity fixtures need at least one edge.

Observed Svek DOT shape (the parity target): nodes are `sh<id>
[shape=rect,label="",width=<in>,height=<in>,color="#..."]` (synthetic ids,
empty labels — Svek draws text itself; `color` reverse-maps to the source
entity); edges are `shA->shB[arrowtail=none,arrowhead=none,minlen=1,...]` with
labeled edges carrying an HTML-`<TABLE FIXEDSIZE>` that reserves the label box;
clusters are nested `subgraph clusterN`. The eventual DOT gate normalizes ids
and treats `width`/`height`/label boxes as tolerant metrics (they bake in
Java-measured text sizes), matching structure exactly.

### Description ratchet

`oracle/goldens/description/<slug>/` is a **pinned-EQUAL** subset for the
component/usecase description engine, distinct from the harness-health check
in `class-dot-parity.test.ts`. `tests/oracle/description-parity.ratchet.test.ts`
*asserts* `compareStructural(...).structurallyEqual` per fixture (including
the tightened rankdir/nodesep/ranksep checks) — a fixture only enters this set
once plantuml-engine's DOT output is a real structural match, and any later
regression fails `npm test` by name. The set starts empty (or near-empty): the
tightened bar catches nodesep/ranksep defaults plantuml-engine does not yet match.
Grow it by re-running the selection pass over the warm
`test-results/dot-cache/{component,usecase}/<slug>/` cache (`in.puml` +
`svek-N.dot` + `.done`), and for every newly-qualifying slug copying
`in.puml` → `input.puml` and its `svek-N.dot` files verbatim into a new
`oracle/goldens/description/<slug>/` directory. No jar run, no network —
purely a data-driven extension of an already-warm offline cache.

`build-oracle.sh` reads the fork from `$PLANTUML_FORK` (default `~/git/plantuml`)
and builds the `dot-output` branch. On a machine without the fork, clone
`forkRepo`, `git checkout dot-output` (or apply the patch onto `upstreamSha`),
then run gradle.

## Capturing a fixture with no oracle

Every row of `tests/visual/data/*.json` must have a jar oracle under
`test-results/dot-cache/<bucket>/<slug>/` (`.done` + `in.puml` + `in.svg`) in
**any** bucket, or an entry in `no-oracle-reasons.json` naming what the jar did.
`tests/oracle/svg-conformance/oracle-coverage.test.ts` fails on a row with
neither, and on a stale reason. To close a gap, stage the capture, then install
it (`scripts/capture-missing-oracles.ts`):

```sh
npx jiti scripts/capture-missing-oracles.ts --stage /tmp/ogc-stage   # resumable; [--limit N]
npx jiti scripts/pin-corpus-tree.ts <bucket> --tree /tmp/ogc-stage/<bucket> --ledger ... --dry
npx jiti scripts/capture-missing-oracles.ts --install /tmp/ogc-stage
```

A staged row lands by the **jar's** `data-diagram-type`, not its manifest file
(`scripts/lib/oracle-route.ts`, oracle-gap-capture D2): `dot`, `hcl` and `yaml`
rows keep their keyword bucket; an `object` row the jar stamps CLASS stays
`object`; a jar error page goes to `unknown`; SEQUENCE, ACTIVITY, CLASS, STATE
and TIMING go to their engine's bucket; anything else (DESCRIPTION, no type)
goes to `unknown`. `--install` refuses to overwrite an existing oracle and
records the capture clock for clock-dependent sources, which the staged render
(outside `dot-cache`) could not.

## Maintenance

`master` tracks upstream and stays pristine. The seam lives only on `dot-output`.
To bump PlantUML: sync `master` from upstream, `git rebase master dot-output`,
update `pin.json`, rebuild the jar, and re-baseline DOT/SVG goldens.
