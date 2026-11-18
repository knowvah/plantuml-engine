# Decisions — png-bounder-seam (pbs)

Pre-made. A finding that contradicts one is a stop: amend this file with the date, then halt.

## The ruling this mission executes (#170, maintainer, 2026-11-11)

> rollback sizing = option 3, extend the oracle deterministic-text seam to the PNG bounder (StringBounderAwt). Build the
> seam as commit 5 on dot-output in a /tmp clone of ~/git/plantuml (PLANTUML_FORK=/tmp/...), never in ~/git/plantuml
> itself; record oracle/patches/0005-*.patch and seamCommitCount 5 in oracle/pin.json; re-capture and confirm only the
> rollback rows move; I apply the patch to the fork afterwards. Shared SymbolAtom state = document as a divergence (done
> in DIVERGENCES.md).

The second half (shared `SymbolAtom` state) is done (`6813e1536`) and out of scope.

## Auto-confirmed (unattended)

Planned unattended 2026-11-17 on `feature/parity-queue` `44420271f`. Each decision lists what was rejected and why.

### D1 — Seam #5 gates `FileFormat.PNG`'s bounder, not one call site

`FileFormat#getDefaultStringBounder` (`FileFormat.java:177-274`) gains, beside seam #2's SVG arm, an arm for
`this == PNG` under `PLANTUML_DETERMINISTIC_TEXT`. Stock (property unset) is untouched.

**Consequence the ruling did not name.** Planning grepped every `FileFormat.PNG` bounder reacher in
`src/main/java/net/`. Two are reached from an SVG render:
- `ScientificEquationSafe#getImage` (`math/ScientificEquationSafe.java:116-129`), the rollback export
  `AtomMath#calculateDimensionSlow` sizes with (`klimt/creole/atom/AtomMath.java:63-70`): the ruling's target.
- `WireDiagram#print` (`wire/WireDiagram.java:131-134`): `FileFormat.PNG.getDefaultStringBounder()`. The cursor
  advance after a wire `print` is a real AWT line height today (wire-engine-port D3, `migaki-17-jori275`: step
  11.777 at 10 pt where the table gives 10). 1 corpus row and 29 authored `tests/fixtures/wire/` sources use `print`.

The two not reached: `eggs/GraphicsPath.java:73` writes a PNG and measures no text; `UGraphicNull`'s constructors
(`klimt/drawing/UGraphicNull.java:54-60`) have no caller outside the class.

So the wire `print` oracles move too. "Only the rollback rows move" is read as **only rows that reach the PNG bounder
move**, because those are the rows the ruling's mechanism reaches. The port follows them (D3), so wire stays
conformant.

- **Rejected B: gate only `ScientificEquationSafe#getImage`'s export.** It would keep the ruling's "only the rollback
  rows" literally. But it is a seam at a call site rather than on the bounder the ruling names (`StringBounderAwt`), and
  it leaves wire `print` as the oracle's last host-font dependence: the problem #170 exists to remove.
- **Rejected C: gate every format that falls through to `new StringBounderAwt()`** (`FileFormat.java:272`). No SVG
  render reaches the others, so C moves nothing more than A and widens the patch for nothing.

If the user reads the ruling as B, only `0005` and T2b change. T2c, the rollback sizing, stands either way.

### D2 — Seam #5's bounder replaces only the metrics

Same precedent as seam #3 (`FileFormat.java:187-191`: "The width table replaces only the METRICS"). The new bounder:
- measures each piece as seam #4 does (`StringBounderFromWidthTable(SVG_DETERMINISTIC)`, U+0020 measured as U+0021,
  width rounded to `float`; `FileFormat.java:204-222`);
- keeps what `StringBounderAwt` (`StringBounderAwt.java`) answers apart from metrics: the `RichText.isRich`
  `BOLD_START`/`BOLD_END` split into `StyledString` pieces, each measured with its mutated font and summed;
  `getFileFormat()` is `PNG`; `matchesProperty` stays the interface default `false`;
- takes `getDescent` from the table bounder (the interface default, `size / 4.5`), as seams 2 to 4 already do for SVG.

Rejected: returning seam #4's SVG bounder unchanged. It answers `matchesProperty("SVG")` true, and
`EmbeddedDiagram#calculateDimensionSlow` would take the SVG arm for a PNG bounder (`EmbeddedDiagram.java:129-152`).

### D3 — The port's PNG bounder follows the render's measurer mode

New module `src/core/png-string-bounder.ts`, `@see FileFormat.java:177-274`: the port's
`FileFormat.PNG.getDefaultStringBounder()`. When the render's measurer is a `DeterministicMeasurer` (the port's
`PLANTUML_DETERMINISTIC_TEXT`, `src/core/measurer-deterministic.ts` module doc) it returns D2's bounder over
`DeterministicMeasurer`. Otherwise it returns the AWT bounder over `jarMeasurer`, moved here from
`src/diagrams/wire/WireDiagram.ts:56-70` (`isBoldFont`, `awtMeasurer`, `AWT_BOUNDER`).

- Rejected: a `RenderOptions` flag. It is a public API change for a test-only mode.
- Rejected: a new `StringMeasurer` member. Every measurer implementation would change.

Production output does not change: the AWT arm is what wire uses today. The rollback has never used it (D5).

### D4 — Wire measures `print` at command time with that bounder

`WireDiagram#print` keeps the Java's position (`WireDiagram.java:131-134`): it measures while commands execute. So
`parseWire` (`src/diagrams/wire/WireDiagramFactory.ts:205`) receives the PNG bounder that the render entry builds from its
measurer, and passes it to `WireDiagram`. Rejected: deferring `print` measurement to draw time. That is a structural
divergence (CLAUDE.md: re-mirror, do not patch).

### D5 — The rollback atom is sized by its PNG export

`AtomMath#calculateDimensionSlow` (`src/core/klimt/creole/atom/AtomMath.ts:127-134`) today sizes a rollback by its SVG
document. It changes to mirror `math.getImage(BLACK, WHITE).withScale(1).getImage()`: the PNG export of
`getRollback()` (`ScientificEquationSafe.java:116-129`) through `TextBlockExporter` with `FileFormat.PNG`, measured with
D3's PNG bounder. The image is `(int) (dim * scaleFactor)` per axis (`TextBlockExporter.java:335-346`,
`createUGraphicPNG`). `drawU` keeps drawing the SVG export (`AtomMath.java:79-90`).

Mirror the structure even if the numbers come out equal to today's under the table. The jar sizes by PNG and draws by
SVG, and production (AWT) keeps the two different.

### D6 — Order: instrument, verify, then oracle bytes and port together

- Batch 1 builds the jar and commits the seam record (pin, patch). It writes no oracle bytes, so the gates stay green.
- T1b re-captures with `--verify` only.
- Batch 2 writes the oracle bytes first (T2a, red), then the port follows (T2b, T2c). Gates must be green at batch
  close; per-task commits inside batch 2 may be red, and the journal names the failing tests.

Rejected: writing oracle bytes in batch 1. That leaves a red tree across a batch close.

### D7 — "Only the intended rows move" is measured, not assumed

A full-manifest `--verify` with `--jar <seam5>` (16,783 targets at planning, run in chunks; T1b) is classified by `measurements/classify-movers.mjs`
into `rollback`, `wire-print`, and `unexpected`.
- An `unexpected` CHANGED row is re-rendered 3 times with the **reference** jar. If the reference itself varies, the row
  is jar noise (`.claude/memory/jar-identity-hash-nondeterminism.md`); journal it and do not write it.
- A stable `unexpected` mover is a stop.
- A `rollback` or `wire-print` row whose diff touches anything beyond what the PNG bounder sizes (the rollback image's
  layout box, the `print` cursor advance) is also a stop.

### D8 — The fork stays the user's

- Clone: `git clone --branch dot-output ~/git/plantuml /tmp/plantuml-seam5`. Commit seam #5 there.
- Patch: `git -C /tmp/plantuml-seam5 format-patch -1 -o <repo>/oracle/patches/`, renamed `0005-oracle-png-bounder.patch`.
- `pin.json`:
  - `seamCommit` is the clone's sha and `seamCommitCount` is 5;
  - `patches[]` gains 0005;
  - `seamHistory[]` gains an entry retiring `eb0f3cff7df…` with its why.
- Never write `~/git/plantuml`. The exit comment hands the user two ways to apply it:
  - `git -C ~/git/plantuml fetch /tmp/plantuml-seam5 dot-output && git -C ~/git/plantuml merge --ff-only FETCH_HEAD`
    keeps the sha `pin.json` records;
  - `git -C ~/git/plantuml am <repo>/oracle/patches/0005-oracle-png-bounder.patch` works if `/tmp` was cleared, but
    makes a new sha, which then goes into `pin.json#seamCommit`.
- Until the user applies it, `oracle/build-oracle.sh` and `checkDriftGuard` against `~/git/plantuml` fail
  (`dot-output~5` is not the pinned tree). That is the intended loud signal. Say so in the exit comment and the
  morning-report text.

## Operational readiness (auto-confirmed)

| Item | Answer |
|---|---|
| Observability | N/A. A pure library, and the change touches no runtime operation. The conformance surveys are the measure. |
| Rollback | **Reversible.** Revert the squash commit: oracle bytes, pin and patch return together. The fork commit is the user's to apply, and they can drop it with `git reset`. |
| Scalability | N/A. Re-capture is 16,783 one-JVM renders at `--workers 6` (about 90 min), run in foreground chunks at `uptime` below about 10. |
| Failure modes | (1) A non-PNG row moves: D7 stop. (2) The gradle build fails offline in the clone: journal it; this is an environment stop (blocked), not a fit. (3) `--write` refuses on drift: run it through `measurements/recapture.mjs`, which sets `PLANTUML_FORK`. |
| Compatibility | No public API change. `RenderOptions` is untouched (D3). SVG output changes only in conformance mode for rollback atoms. Production rollback sizing moves from the SVG export to the AWT PNG export (D5), and production wire output does not change. |

## Baseline

Recorded at Phase 8 on `44420271f`: see README "Baseline".
