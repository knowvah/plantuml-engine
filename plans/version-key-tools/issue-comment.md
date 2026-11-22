## version-key-tools landed on `feature/parity-queue` (not pushed)

All five commands (six regexes, with the one-argument `keycheck` of upstream 3a4d1675141) now draw a plantuml-engine page instead of `Syntax Error?`. The per-task history is on the local tag `version-key-tools/pre-squash`.

### Line texts as landed, for review (vkt D5)

These are the unattended planner's proposals. They were kept because each one is true for this port.

| Page | Line | Ours | Jar |
|---|---|---|---|
| `testdot` | 1 | `plantuml-engine version 0.2.0 / unknown [Unknown compile time]` | `PlantUML version $version$ / $git.commit.id$ [Unknown compile time]` |
| `testdot` | 2 | `<b>@knowvah/dot-engine</b> ""2.12.3""` | `<b>GraphViz</b> ""dot - graphviz version 16.1.1 (...)""` |
| `testdot` | 3 | (dropped, ruling 4) | `<b>Installation seems OK. File generation OK` |
| `keygen`, `keyimport [key]` | 1-3 | `<b>plantuml-engine version 0.2.0</b> (Unknown compile time)`, `(MIT source distribution)`, ` ` | `PlantUML version $version$` ..., `(GPL source distribution)`, ` ` |
| `keygen`, `keyimport [key]` | 4 | `plantuml-engine has no <i>Professional Edition License</i>:` | `To get your <i>Professional Edition License</i>,` |
| `keygen`, `keyimport [key]` | 5 | `it is <b>MIT</b> software and needs no license key.` | `please send this qrcode to <b>plantuml@gmail.com</b> :` |
| `keygen`, `keyimport [key]` | — | no QR image (the MIT edition's `FlashCodeUtilsNone`) | zxing QR code at x4 |
| `keycheck` (both forms) | 1-4 | header, `<u>Provided license information</u>:` | same shape |
| `keycheck` (both forms) | 5 | `No license key was checked: plantuml-engine reads none.` | `No valid license found. A named license is bound to the machine it was issued for.` |
| `keydistributor` | 1 | `No license found` | `No license found` |

### Rows

- `cov-keydistributor` measures **0 diffs: conformant**, so it has no ledger entry.
- Signed in `oracle/accepted-divergences.json` against ruling 1, as `authored-utility/<slug>`:
  - `cov-testdot` and `cov-testdot-upper-trailing`: 23 diffs, weighted 29.
  - `cov-keygen`, `cov-keyimport` and `cov-keyimport-key`: 23 diffs, weighted 28.
  - `cov-keycheck` and `cov-keycheck-one-arg`: 9 diffs, weighted 9.
- `cov-keycheck-refuse-dash` and `cov-keyimport-refuse-dash` are refused on both sides and score the usual error-page residual 5.
- `DIVERGENCES.md` has one new entry: "Key tools and `testdot` describe plantuml-engine".

### Question (does not block anything)

Upstream's `version` and `testdot` both call `GraphvizUtils.addDotStatus` (`PSystemVersion.java:175`, `:238`), so the jar prints the same Graphviz block on both pages. Rulings 2-4 are scoped to `testdot`, so `version` still prints `@knowvah/dot-engine library is used!` and the file-generation line. **Should `version` adopt rulings 2-4, so that both pages print the same Graphviz block as upstream's do?**

### Found on the way

The test harness's "our error page" detectors matched any `<text>` equal to `fullDescription()`. The testdot page prints that line, so they took it for an error page. They now share `tests/helpers/our-error-banner.ts`, which also requires the banner's fixed green fill. Separately, `build-authored-baseline.mts` lags the committed manifest: a full `--write` would rewrite 21 rows, and 3 error rows already score below their pins at the base. That is noted in `.agent-notes/vkt-T2a.md` for a cleanup.
