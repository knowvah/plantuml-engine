# T4: docs and e2e CI build the stdlib; chunk payload check

**Writes:** `.github/workflows/docs.yml`, `.github/workflows/ci.yml` (`e2e` job only).
**Reads:** decisions.md D4; `.github/actions/vendored-stdlib/action.yml`; `ci.yml:100-140` (a job that already uses
the action) and `ci.yml:302-345` (`e2e`); `docs.yml:30-60`.

## Task

1. **docs.yml `build`.** After `npm ci`, add `- uses: ./.github/actions/vendored-stdlib`, then `npm run build:stdlib`.
   `docs:build` now runs `docs:stdlib` itself (T3).
   - `timeout-minutes: 5` was sized from 41-46 s runs. Re-size it from a measurement. Cite a `ci.yml` run's
     vendored-stdlib step time (`gh run list --workflow ci.yml --limit 5`, then
     `gh run view <id> --json jobs`), for both a cache hit and a miss if one exists. Add `build:stdlib`'s time from
     journal row T0, and keep the comment's style (run ids, observed range, backstop rationale).
   - The cache is keyed `stdlib-<sha>`. Caches written on `main` by `ci.yml` are readable by `docs.yml` on `main`; say so
     in the comment.
2. **ci.yml `e2e`.** Add the same two steps before `npm run test:e2e`, and re-size its `timeout-minutes` the same way.
3. **Payload check (local).** Run `npm run docs:build`, then:
   - list `dist/assets/*.js` by size, and diff against T0's journal row;
   - grep the dist for a C4-only string (e.g. `C4_Container`) and a tupadr3 manifest key, and confirm each appears only
     in its own chunk, never in the playground page's entry chunk or `app.*.js` (stop 4);
   - journal the per-bundle chunk sizes, the `/stdlib/` size and file count, and the total dist size before and after.

`actionlint`, if installed, must pass on both workflows. Otherwise note in the journal that the YAML is unverified until
CI runs (README, "not stops").

## Acceptance
- Given the new workflows, when read, then both jobs restore the vendored stdlib and run `build:stdlib` before
  `docs:build` / `test:e2e`, and every timeout cites its measurement.
- Given `docs:build`, when the dist is grepped, then no stdlib bundle content sits in the entry chunk.

Commit: `ci(docs): build the stdlib packages for the docs site and e2e`, with `Refs: #172`.
Observability is N/A. Rollback is Reversible.
