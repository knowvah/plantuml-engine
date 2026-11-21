# Golden-ratchet re-pin to a720bdd (activity/sequence/description/class/state), agent C

## Observation: glyph-path formulas move geometry, not just element type
- **Context**: formula rows after the a720bdd re-pin (pedulu-06, barufu-21, gevozu-46, sunuju-01, sapofa-97).
- **Finding**: the jar now draws formulas as `UPath`s. `LimitFinder` (LimitFinder.java:118-119) and `Footprint` (Footprint.java:108-111) collect glyph-outline points instead of image corners. Two effects follow. Canvas extents come from the ink: pedulu's whole drawing shifts 4.66 px because the "false" label's ink starts at x=15.0. Usecase ellipses (TextBlockInEllipse.java:59-60) fit around the glyphs and come out smaller: barufu's alpha ellipse goes from rx 17.1 to 11.0, which also changes its `scale 500 width` factor. A `<back:color>` is drawn as a separate rect (ScientificEquationSafe.java:128-133), so the entity's child list shifts by one.
- **Impact**: a formula row's geometry diff is a consequence of the accepted KaTeX divergence. Don't chase it as a sizing bug. The formula's own box size is unchanged: a probe gave `\textrm{false}` 47x22 under both jars.
- **Confidence**: High (x-shift and ellipse measured; pedulu's 2 px vertical shift not isolated)

## Observation: RegexResult now keeps duplicate group names, first non-null wins
- **Context**: unknown/ceboti-36 `archimate #Technology VPN <<technology-device>> [`.
- **Finding**: upstream RegexResult (RegexResult.java:72-84, 128-150) replaced its HashMap with ordered arrays. `getLazzy` returns the first group whose name matches the prefix and has a value. CommandArchimateMultilines names two leaves COLOR, so the leading colour now wins (#C9FFC9). The old map kept the later, empty one (#F1F1F1). The port mirrors the old behaviour on purpose (`src/diagrams/description/command-archimate.ts:75-76`).
- **Impact**: any command with duplicate group names can change the same way. No issue filed yet.
- **Confidence**: High

## Observation: `<<junction>>` is a LeafType upstream now
- **Context**: state/livuni-63.
- **Finding**: Stereogroup.java:127-128 maps `junction` to `LeafType.JUNCTION`, drawn as a small `start_entity` circle (GeneralImageBuilder.java:145, EntityImageCircleStart.java:67). `src/diagrams/state/state-pseudokind.ts:34-38` still documents that no junction case exists.
- **Impact**: livuni fails the golden and AC3 until this is ported.
- **Confidence**: High

## Observation: test-results/dot-cache is tracked, and parity-*.json predate the branch ports
- **Context**: worktree setup and AC3 eligibility.
- **Finding**: `.gitignore` re-includes `test-results/dot-cache/` (`!test-results/dot-cache/`). Replacing it with a symlink deletes thousands of tracked files. parity-class.json and parity-c4.json were surveyed at 8f3997d3a, before role labels (77bb288ef) and stdlib 5535b9a3 (725484fdd). They still say dotEqual=false for class/mugobo-34, nenexe-35 and c4/xizifu-87, which are zero-diff now.
- **Impact**: AC3 in class/description stays red until those parity files are surveyed again.
- **Confidence**: High
