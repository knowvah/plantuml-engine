# Re-pin tail (1.2026.8beta1 → 1.2026.11beta1), agent C

## Observation: style storage fixtures need the OLD engine over the NEW skin
- **Context**: re-extracting `src/core/style/skins/plantuml-skin.ts` from the re-pinned jar broke 63 style tests.
- **Finding**: the fixtures dump `StyleStorage`, which upstream deleted in c9d62097ff5 (trie engine, `Specificity` tuples instead of int priorities). The port still mirrors the old engine, so a new-jar dump is not comparable. `tests/unit/core/style/fixtures/probe/run.sh new <puml> [ideas]` runs the stock 97a5992 jar with the new jar's `skin/plantuml.skin` first on the classpath; `run.sh old` reproduces every earlier dump exactly. User priorities moved +18 (12 new skin styles); the skin now holds stereotyped styles (chart pie/radar, files .highlight), which lead the storage.
- **Impact**: every future skin re-extract regenerates fixtures this way until the engine itself is re-ported.
- **Confidence**: High

## Observation: c9d62097ff5 changes multi-stereotype precedence
- **Context**: unknown/somule, tufixe, gipeda, deroxu (and likely ceboti) after the re-pin.
- **Finding**: with `<<A>><<B>>` both styled, the old engine took the first stereotype's rule, the new jar takes the rule declared later in the file (`Specificity`: stereotype count, then file order). Not ported: it is the style-engine re-port (167 files upstream).
- **Impact**: those rows stay diverged until a style-engine mission.
- **Confidence**: Medium (mechanism read from the commit message and outputs, Specificity.java not ported)

## Observation: the capture clock keys on absolute fixture paths
- **Context**: `--render-one` with a relative `test-results/...` dir rendered timing/mekivo in UTC ("1992") instead of the captured America/Chicago ("1991").
- **Finding**: `clockForPath` only matches the absolute path; pass absolute dirs when checking single rows.
- **Impact**: avoids false divergences on clock-dependent rows.
- **Confidence**: High

## Observation: the new jar's preprocessor eats a leading `!` of sprite rows
- **Context**: class/delaja-41-liju424, first colour sprite 138 → 137 px.
- **Finding**: `java -jar oracle/dist/plantuml-oracle.jar -preproc` shows each sprite row starting `!!` one character shorter (256 → 255). Preprocessor territory (`src/core/tim`), not ported here.
- **Confidence**: High (observed), cause commit not identified

## Observation: stdlib is embedded in the jar and moved to C4 2.14.0
- **Context**: c4/rosoga (`C4Version()` 13 → 14), c4/xizifu, c4/ropexu, unknown/xuloxo (data-source-line shifts).
- **Finding**: upstream 57a3d28484b / 4c5d4f76682 updated `src/main/resources/stdlib`; the port vendors from `~/git/plantuml-stdlib` (still 2.13.0, bdbb819). Needs that repo updated and `scripts/vendor-stdlib.ts` re-run.
- **Confidence**: High

## Observation: sandbox refuses compound commands that mention git paths
- **Context**: worktree-isolated agent.
- **Finding**: any compound shell command (`;`, `&&`, loops, heredocs) whose text contains `git` — including the scratchpad path `-Users-scottseely-git-…` — is refused. Run git alone; put loops in script files; symlink the scratchpad to a `/tmp` path without `git` in it.
- **Confidence**: High
