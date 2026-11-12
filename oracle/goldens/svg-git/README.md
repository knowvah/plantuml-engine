# svg-git conformance ratchet

Regression-proof gate for the git engine (`net/sourceforge/plantuml/gitlog/`, `@startgit`; mission
`git-engine-port`, #131), laid out as `oracle/goldens/svg-bpm/` is, with a second tier (gip D8). git is a Smetana
path laid out by dot-engine (ruling 2026-08-09), so most rows end as `structural-match`, their residue named in
`DIVERGENCES.md`'s git row table. See `tests/oracle/svg-conformance/git.golden.ratchet.test.ts` and
`git.diff-baseline.ratchet.test.ts`.

## Tiers

- **conformant** — zero `compareSvg` diffs under the deterministic measurer, held forever.
- **structural** — the survey's own `structural-match` verdict (`scripts/svg-parity-survey.ts#diffVerdict`: same
  elements and strings, numeric deltas only) plus a per-row `maxDelta` ceiling that may only fall. A structural row
  that turns conformant fails with a message to promote it; no row moves back.

## Population

The 4 `@startgit` rows of `plans/git-engine-port/measurements/planning-rows.json`, all in the `unknown` bucket, each at
`unknown/<slug>/{in.puml,golden.svg}`:

- `ratchet.json` — `juzane-95-fose365` and `mebafo-26-fupu096`, tier `structural`.
- `diff-baseline.json` — `lagapi-44-lemu042` and `figagi-40-mila236`: `diverged` only because some curves have a
  different cubic-piece count (U-NS routing), held at that verdict, their `maxDelta` and weighted score.

## Add rule

```
npm run svg:survey -- unknown --out /tmp/x/parity-unknown.json   # copy over tests/oracle/svg-conformance/parity-unknown.json
npx jiti plans/git-engine-port/measurements/pin-git.mts [--write]
npx jiti plans/git-engine-port/measurements/build-diff-baseline.mts <commit> [--write]
npx jiti plans/git-engine-port/measurements/repin-routing-refusal.mts <commit> [--write]
```

A pin copies `in.puml` and `in.svg` to `unknown/<slug>/`, adds `{ slug, type, addedAt, source, tier, maxDelta? }` to
`ratchet.json`, and appends `goldens` twins (slug `unknown/<slug>`) to the routing and refusal baselines.

## Authored root

`tests/fixtures/git/` is a flat tree of original fixtures (38 planning probes + 17 authored, gip T3b), each with the
jar's `.svg` beside it, rendered by `scripts/oracle-render.sh`. `authored-baseline.json` tracks them: rows = the
`.puml` files on disk; every drawn row records its survey `verdict` and `maxDelta` and is held there with a weighted
score that never rises; a non-conformant drawn row's `reason` points at its `DIVERGENCES.md` row; a jar crash page
where we also error carries its `jarError` (8 rows, each also a crash in the stock release jar 1.2026.8). Re-measure:
`npx jiti plans/git-engine-port/measurements/build-authored-baseline.mts <commit> [--write]`.

## No DOT parity

`SmetanaForGit` lays out through Smetana upstream, so the jar emits no `svek-N.dot`. The engine-input and
engine-vs-graphviz proofs are in `plans/git-engine-port/diagnosis/`.
