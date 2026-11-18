# T1a — seam #5 in the `/tmp` clone

**Read first:**
- `FileFormat.java:173-274` on `dot-output` (seams 2 to 4 are at `:180-223`).
- `StringBounderAwt.java` (whole file).
- `klimt/drawing/font/StringBounderFromWidthTable.java`.
- `text/RichText.java`.
- `oracle/patches/0002-*.patch` and `0004-*.patch` for the comment style.
- `.claude/memory/oracle-seam-via-tmp-clone.md`.

## Steps

1. `git clone --branch dot-output ~/git/plantuml /tmp/plantuml-seam5`. Check that `git -C /tmp/plantuml-seam5 rev-parse
   HEAD` is `eb0f3cff7df…`.
2. In `/tmp/plantuml-seam5/src/main/java/net/sourceforge/plantuml/FileFormat.java`, add the D2 arm directly after the
   seam-#2/#4 SVG arm. It applies under `System.getProperty("PLANTUML_DETERMINISTIC_TEXT") != null && this == PNG` and
   returns a `StringBounder` whose:
   - `calculateDimension` keeps `StringBounderAwt`'s `RichText.isRich` split (`StyledString.build`, `mutateFont`, width
     summed, height max) and measures each piece as the seam-#4 bounder does: `text.replace(' ', '!')` through
     `StringBounderFromWidthTable(SVG_DETERMINISTIC)`, width cast to `float`;
   - `getFileFormat()` returns `PNG`;
   - `matchesProperty` and `getDescent` are not overridden.

   The comment block, `[plantuml-engine oracle seam #5]`, cites #170, `AtomMath.java:63-70`, `ScientificEquationSafe.java:116-129`
   and `WireDiagram.java:133`, and says that stock (property unset) is untouched.
3. Commit in the clone as `fix(oracle): deterministic PNG bounder under PLANTUML_DETERMINISTIC_TEXT`, author the
   repository's git user, with a body that gives the why (#170 option 3).
4. Run `node plans/png-bounder-seam/measurements/build-seam5.mjs`. It must exit 0 with `restored=true`. Journal both md5s.
5. Probe before recording anything, with `measurements/recapture.mjs -- --verify --jar /tmp/pbs-jar/plantuml-seam5.jar
   --only '<target>' --report /tmp/pbs-T1a/probe-<n>.json` (one target per run, or a comma list):
   - `test-results/dot-cache/unknown/cunotu-47-bute165` (a creole rollback, `AtomMath#calculateDimensionSlow`): expect
     CHANGED.
   - One `tests/fixtures/wire/*.svg` whose source has a `print` line: expect CHANGED.
   - `tests/fixtures/factories/cov-math-unknown.svg`: expect **SAME**. A standalone `@startmath` rollback goes through
     `ScientificEquationSafe#export`'s SVG branch (`ScientificEquationSafe.java:145-151`, `getSvg`), which never calls
     `getImage`, so the PNG bounder is not reached. Planning confirmed that this fixture is a byte-exact reference-jar
     render.
   - Unset-property stock behaviour is not separately probed: the arm is property-gated like seams 2 to 4.
6. Run `git -C /tmp/plantuml-seam5 format-patch -1 -o /tmp/pbs-T1a/` and copy the result to
   `oracle/patches/0005-oracle-png-bounder.patch`.
7. Update `oracle/pin.json`:
   - `seamCommit` is the clone's HEAD and `seamCommitCount` is `5`;
   - `patches[]` gains `patches/0005-oracle-png-bounder.patch`;
   - `seamHistory[]` gains `{seamCommit: "eb0f3cff7df7b48100bd2fc00b0a2e8812574199", seamCommitCount: 4, retiredOn:
     <today>, why: "seam #5 (pbs, #170 ruling 2026-11-11): FileFormat.PNG's bounder was StringBounderAwt even under
     PLANTUML_DETERMINISTIC_TEXT, so rollback atoms (AtomMath.java:63-70) and wire print (WireDiagram.java:133) were sized
     by host AWT fonts"}`.

   Add one `oracle/README.md` provenance line naming seam #5 and the D8 fact that the user applies it to the fork.
8. Do not copy the seam-5 jar into `oracle/dist` yet (`.claude/memory/recapture-reference-jar-order.md`). T2a does that.
9. Commit `chore(oracle): record seam #5, the deterministic PNG bounder` (`Refs: #170`).

## Acceptance

- Given the clone, when T1a ends, then `git -C /tmp/plantuml-seam5 rev-list --count 97a5992201a..dot-output` prints 5
  and `oracle/pin.json#seamCommit` equals the clone's HEAD.
- Given `cunotu-47-bute165` and a wire `print` fixture, when probed with the seam-5 jar, then both are CHANGED, and
  `cov-math-unknown` is SAME.
- Given `md5 -q oracle/dist/plantuml-oracle.jar` after T1a, then it still prints `7066a3b4e28e696791a4bfc617efd85f`.
- Given `npm test`, then it passes (no oracle byte changed).

Observability: N/A, no new observable operations. Rollback: Reversible (revert the commit; delete the clone).
