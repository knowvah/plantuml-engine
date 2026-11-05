# T4 — The `svg-board` ratchet

**Read:** D5, `tests/oracle/svg-conformance/packet.golden.ratchet.test.ts`, `packet.diff-baseline.ratchet.test.ts`, `render-fixture-packet.ts`, `oracle/goldens/svg-packet/README.md`, pep journal rows 30-32.

**Do:**

1. `render-fixture-board.ts`, `board.golden.ratchet.test.ts`, `board.diff-baseline.ratchet.test.ts` and `oracle/goldens/svg-board/README.md`, copied from packet's with `board` substituted. `BOARD_CACHED_SLUG_COUNT = 4`. `render-fixture-board.ts` exports `renderFixtureBoard`, `listAuthoredBoardSlugs`, `readAuthoredBoardFixture` and `authoredBoardIncludeStore`: `build-authored-baseline.mts` imports those names. It defaults to the sprite + Twemoji + utility asset store (D5). The routing and refusal gates are split into part files: find the count assertions with `git grep -n "rendering\|agree" tests/oracle/svg-conformance/`.
2. `npx jiti plans/board-engine-port/measurements/pin-board.mts --write`: goldens, `ratchet.json`, and the `goldens` twins in the routing and refusal baselines.
3. Re-pin the 4 `dot-cache` routing rows and their twins `agree`, `ourType: BOARD`; refusal rows `engine: board`. Move the count assertions by exactly the rows moved, and say so in each baseline's `$comment`.
4. `npx jiti plans/board-engine-port/measurements/build-authored-baseline.mts <HEAD sha> --write` for `oracle/goldens/svg-board/authored-baseline.json`. The tool throws on a fixture where the jar draws and diffs remain: name its mechanism first (T3b owns those).
5. `scripts/parity-dashboard-goldens.ts` maps `board: ['svg-board']`; regenerate `docs/parity-report.md` here so the drift gate stays green between T4 and T5.

## Acceptance
- Given `pin-board.mts` without `--write` after this task, then it prints `pins 0`.
- Given the two ratchet tests, then every pinned and authored row passes at its recorded score, and a deliberately broken label (local, not committed) fails them.
- Given the routing and refusal gates, then they pass, and their `$comment`s name this task and the counts moved.

Observability N/A. Rollback Reversible.
