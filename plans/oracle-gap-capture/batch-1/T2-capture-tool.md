# T2 — the capture tool

Commit: `feat(oracle): add a tool that captures missing oracles by jar type`.

## Context
Rows land by the jar's type, not their manifest bucket ([D2](../decisions.md)), and the pin tool needs
a tree holding only new rows ([D4](../decisions.md)). So the tool renders to a stage first.

## Task (TDD: tests first for the pure parts)

1. `scripts/lib/oracle-route.ts`: `routeBucket(manifestBucket, jarType, jarErrored): string`, the D2
   table, with its citations in the doc comment. Re-use `diagramTypeOf`, `isJarErrorPage` and `readHead`
   from `scripts/pin-corpus-tree-measure.ts`: importing them keeps the gates' classifiers as one copy.
2. `scripts/capture-oracle-cache.ts`:
   - Export `renderFixture`, and give it an optional `cwd` passed to `execFileSync`, so
     `!pragma svek_trace on` cannot write `svek.svg` into the repo root.
   - Extend `classifyOutput`: with no `in.svg`, a stem `<name>.svg` beside only `<name>_NNN.svg` pages
     renames to `in.svg` and `in_NNN.svg`, kind `renamed`. Anything else with two or more stays
     `ambiguous`. `tests/unit/scripts/` holds its existing test; add `xobebi`'s shape.
3. `scripts/capture-missing-oracles.ts`, a thin shell over those:
   - `--stage <dir> [--limit N]`: for each row from `oracleCoverage(...).missing`, in manifest order, so
     a rerun resumes: skip a row the report already holds, keyed `<manifest>/<slug>` because
     `style-node-background` is two different sources in the `dot` and `hcl` manifests. Render under
     `<dir>/.work/<manifest>/<slug>/` with a scratch cwd, classify, read the head, `routeBucket`, then move to `<dir>/<bucket>/<slug>/` keeping
     only `.done`, `in.puml`, `in.svg`, `in_NNN.svg` and `svek-N.dot`. Append
     `{manifest, slug, bucket, jarType, jarErrored, kind, startedAt}` to `<dir>/capture-report.json` after
     each row. A row with kind `none` or `ambiguous` keeps its report row and writes no fixture dir.
   - `--install <dir>`: move each reported fixture to `test-results/dot-cache/<bucket>/<slug>/`, refuse if
     the target exists, then `recordCaptureClock(<dest>/in.puml, startedAt)`.
   - CLI block under `/* v8 ignore */`, matching its neighbours. Split helpers if the hooks ask.
4. `oracle/README.md`: a "Capturing a fixture with no oracle" section naming both commands and D2's rule.
5. `scripts/populate-corpus.py:22`: a comment that `r"--|>"` is an unescaped alternation, that `tests/corpus`
   is not the population of record (the coverage gate is), and why it stays: correcting it would reclassify
   a local tree that many test comments cite by path. Do not change the regex.

## Write-set
`scripts/lib/oracle-route.ts`, `scripts/capture-missing-oracles.ts`, `scripts/capture-oracle-cache.ts`,
their tests under `tests/unit/scripts/`, `oracle/README.md`, `scripts/populate-corpus.py`, `docs/catalog.md`
if the drift gate asks.

## Read-set
[D2, D4](../decisions.md), `scripts/capture-oracle-cache.ts`, `scripts/record-capture-clock.ts:30-44`,
`scripts/lib/oracle-minute-guard.ts`, `scripts/pin-corpus-tree-measure.ts:27-85`.

## Interface contracts
Input from T1: `oracleCoverage`, `loadManifestRows`, `cachedOracleSlugs`, `loadNoOracleReasons`.
Output to T3–T5: `<stage>/capture-report.json` is `{ rows: [{manifest, slug, bucket, jarType, jarErrored,
kind, startedAt}] }`, and `<stage>/<bucket>/<slug>/` is the shape `pin-corpus-tree.ts --tree` reads.

## Acceptance
- Given manifest `sequence`, jar ACTIVITY, then `routeBucket` returns `activity`.
- Given manifest `sequence`, a jar error page, then it returns `unknown`; given manifest `dot`, a jar error
  page, then it returns `dot`; given manifest `object`, CLASS, then `object`; given manifest `class`,
  DESCRIPTION, then `unknown`.
- Given a directory with `file4.svg` and `file4_001.svg`, when `classifyOutput` runs, then `in.svg` and
  `in_001.svg` exist and kind is `renamed`; given `a.svg` and `b.svg`, then kind is `ambiguous`.
- Given a stage holding one row and `--install` into a temp root, then the row moves and a second install
  refuses. Test the function, with the root injected.
- Given `--stage --limit 3` run on the real manifests into `/tmp`, then the report has 3 rows, each in its
  D2 bucket, and `git status` shows no stray `svek.*`. Journal the command and result: a manual check.

Observability: N/A — no new observable operations. Rollback: Reversible.
