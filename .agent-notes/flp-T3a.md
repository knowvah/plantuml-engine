# flp-T3a — turning the flow engine on

## Observation: verdict-diff.mjs takes a git ref, and a directory silently compares against nothing
- **Context**: Measuring T3a with `node plans/description-divergence-drive/measurements/verdict-diff.mjs /tmp/flp-b0 /tmp/flp-T3a`.
- **Finding**: The first argument is passed to `git show <ref>:<path>`; a directory makes every lookup fail inside a
  `try`, so `baseRows` returns `[]` and the tool prints `lost 0` whatever the survey says.
- **Impact**: Always pass the mission base sha (`verdict-diff.mjs <sha> <dir>`). A "lost 0" from a path argument is vacuous.
- **Confidence**: High

## Observation: the port never emits `<?plantuml-src …?>`, and compare.ts ignores it
- **Context**: `multiset.mjs` reported bemixo `jar+1` against its oracle.
- **Finding**: The one extra tag was the jar's `<?plantuml-src …?>` processing instruction. `renderSync` emits none for
  any engine (bpm checked), and positional `compareSvg` passes rows that differ only there. The tool's header claimed to
  drop it; it did not until flp T3a added the filter (`svg-multiset.ts` has it too).
- **Impact**: Any tag-multiset comparison of our SVG against a jar oracle must drop `<?plantuml…` tags.
- **Confidence**: High
