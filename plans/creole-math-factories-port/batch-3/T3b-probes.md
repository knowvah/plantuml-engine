# T3b — probes to fixtures, and the non-math residuals

Read [task-contract.md](../task-contract.md).

**Write:** `tests/fixtures/factories/<slug>.puml` and `<slug>.svg` for every probe (`scripts/oracle-render.sh` on the copy, an absolute
out-dir, and copy the SVG beside the `.puml`), plus any `src/` fix a residual requires.

Probes in [probes/](../probes/). Copy `cov-*.puml` into `tests/fixtures/factories/`. The filename-derived `[From <file>...]` line of
error pages must be a fixture name, so render from the fixtures directory, not `plans/`.

Measure with `fixtures.mts`. Expected branches to confirm, each by its fixture against its oracle:
- `cov-creole-theme` (`!theme` expands to literal lines), `cov-creole-define`, `cov-creole-handwritten` (`isHandwritten`, UgDiagram.java:133),
  `cov-creole-embedded` (`{{ }}`), `cov-creole-emoji` (emoji, `<&check>`), `cov-creole-table`, `-tree`, `-lists`, `-color`, `-code`,
  `-url`, `-tab`, `-mono-cjk`, `-arg`.
- Welcome-page cases: `cov-creole-empty`, `cov-math-empty`, `cov-latex-empty`, `cov-help-bare`, `cov-help-bad`, `cov-help-title`,
  `cov-help-scale`, `cov-help-skinparam`. A Welcome page in ours through the error flow is a jar-error pair, ruling 2026-10-10.
- Error-page cases: `cov-help-style`, `cov-help-theme-cmd`.
- `cov-embedded-note-creole` (a real `<image>`), and `-math`, `-latex`, `-def` (no image, they are plain text in the note).

Any fixture other than the ones owned by T3c–T3f (`cov-math-unknown`, `cov-latex-unknown`, `cov-latex-syntax`) that does not reach 0
gets a Java-cited fix here, or a journal line naming the mechanism and owner.

## Acceptance
- Given `fixtures.mts`, then every non-math fixture prints 0 diffs or `error-pair`, or carries a journal line with its mechanism.
- Given `cov-embedded-note-creole`, then our SVG has one `<image>`, matching the oracle's count.

Observability: N/A — no new observable operations. Rollback: Reversible.
