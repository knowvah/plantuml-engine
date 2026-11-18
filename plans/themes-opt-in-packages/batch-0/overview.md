# Batch 0 — brief, baseline and the before-hashes

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the baseline, hash every moved-theme render | orchestrator | `plans/themes-opt-in-packages/**` | — | [x] |

## T0

1. Check that `git status` is clean apart from this brief. Check that the branch is `feature/parity-queue`, at the base
   sha named in the execution prompt.
2. Check the reference jar: `md5 -q oracle/dist/plantuml-oracle.jar` must print `1e912cade94fbf96c06a22f4d44ef9b0`.
3. Write `plans/themes-opt-in-packages/measurements/render-moved-themes.ts`, run with `npx jiti`. It:
   - lists every `.puml` under `tests/corpus` and `tests/fixtures` that matches
     `!theme\s+(amiga|blueprint|crt-amber|crt-green|mimeograph|plain|mono|carbon-gray|sunlust)\b`. There were 56 at
     planning. Add `tests/fixtures/factories/cov-help-theme.puml` and `cov-help-two.puml`, which list theme names;
   - renders each with `renderPagesSync(source, { includeStore: fixtureIncludeStore() })`;
   - prints `<sha256 of all pages joined>  <repo-relative path>`, one line per file, sorted by path.

   Save the output as `measurements/before.sha256`. Exit-task T3 reruns the same script, unchanged, and diffs. The
   script must not import anything this mission creates, so it runs on both trees.
4. Run `npm run typecheck && npm run build`. Planning ran only `npm test` and `npm run lint` (journal row 0). Journal
   the result. A red result here is pre-existing, so halt as blocked.
5. Commit `docs(top): add the themes-opt-in-packages mission brief` (`Refs: #180`), with `measurements/`.

## Acceptance

- Given the base sha, when T0 ends, then the brief, the script and `before.sha256` are committed, and the journal row
  records the jar md5 and the hashed file count (58 expected: 56 plus the two help fixtures).
- Given the jar md5 differs, then stop: the oracle is not the one this brief was planned against.

Observability: N/A, no new observable operations. Rollback: Reversible (revert the commit).
