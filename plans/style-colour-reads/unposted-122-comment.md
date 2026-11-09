# Unposted comment for #122

`gh issue comment 122` was denied on 2026-11-06 (auto-mode classifier, External System Writes). Post the text below as
the #122 comment.

---

**style-colour-reads (scr) ran on `feature/parity-queue`.** It is not pushed. It is one unsigned commit on `8fe32c695`,
with per-task history on the local tag `style-colour-reads/pre-squash`.

The dss follow-ons 17-22 were re-measured with 100 authored rows, now in `tests/fixtures/diagram-style-scope/` and
pinned. 85 were already at 0 and stay as guards. 15 were open in 4 families, and all 15 are now at 0:

| Family | Rows | Mechanism (upstream) |
|---|---|---|
| F1 kermor group note | `component__kgn-style-comp`, `-style-seq`, `-stereo-style`, `-bottom-colour` (2 each → 0) | `Cluster#getCucaNote` builds an `EntityImageNoteLink` from the note's own `Colors` (`Cluster.java:393-399`), signed `ComponentType.NOTE`. The group note now draws through the link-note block, and the parser carries its `#colour`. |
| F2 state arrow `HeadColor` | `state__head-arrow`, `-element`, `-skinparam` (4 → 0), `-transparent` (1 → 0) | `Rainbow.build` over the merged `{root, element, stateDiagram, arrow}` style (`SvekEdge.java:874-877`, `Rainbow.java:84-95`). A transparent head is drawn as a line (`SvekEdge.java:1113-1118`). |
| F3 state note under `skinparam noteBackgroundColor` | `state__noteskin-bg`, `-bg-floating`, `-bg-link` (2 → 0) | With no `<style>` block, the merged `note { BackGroundColor }` lives on the flat theme field. State fell back to a constant there instead. |
| F4 sequence `FontColor transparent` | `sequence__transparent-font` 15, `-note` 39 (both were error pages), `-participant` 1, `-arrow` 1 → 0 | `DriverTextSvg.java:91-93` measures the text but writes no `<text>`. The note no longer throws, and text runs keep the transparent colour through to the driver. |

- dss rows `1172 open 39`, down from 54. Of the remaining 39, 12 are `stockError` pins, 26 are the json/yaml Smetana
  cascade rows (out of scope) and 1 is `activity__probe-legacy`.
- Full survey vs `8fe32c695`: 0 conformant rows lost, no verdict moved in any engine, and no corpus row was open on
  these mechanisms.
- `dist/*.d.ts` is byte-identical. `oracle/accepted-divergences.json` is unchanged. Gates: `npm test` (2057 files,
  42886 tests), typecheck, lint, build and format:check all pass.
- Tidying: the stale `EntityImageState.java` citations are corrected. The nested class `<text>` spot is recorded in
  `DIVERGENCES.md` as a seam artefact, verified against the stock jar.
- Ruling needed, blocking no row: #156, the unread public `businessActorFill`/`businessUsecaseFill` Theme fields.
