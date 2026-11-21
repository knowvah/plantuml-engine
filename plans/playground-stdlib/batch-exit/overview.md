# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T6 | Final gates, d.ts check, next-missions, summary | orchestrator | gates, `planning/next-missions.md`, README | T4, T5 | [x] |

## T6

1. Run `npm run build` and diff `dist/*.d.ts` against `/tmp/ps-base-dts/`. Any change is stop 1.
2. Confirm `git diff <base> --stat -- src/` is empty. If it is not, run the survey and `verdict-diff.mjs <base>`
   (README) and require 0 lost.
3. Add a "playground-stdlib (ps)" section to `planning/next-missions.md`: what landed, and the issues filed in T5.
4. Run the batch close, with every README gate including `test:e2e` and `docs:build`. Then write the README's
   `## Summary`, following `plans/version-builtin/README.md`: tasks, gates, chunk sizes before and after, `/stdlib/`
   payload, d.ts, follow-ons, and the CI risk. The workflow changes are unverified until CI runs.

## Acceptance
- Given the d.ts snapshot, when diffed, then it is byte-identical.
- Given `npm run test:e2e`, then every non-fixme playground-stdlib case passes, and the existing specs still pass.

Observability is N/A. Rollback is Reversible.
