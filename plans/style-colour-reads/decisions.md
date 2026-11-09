# Decisions

All recorded unattended; the user audits them here.

## Auto-confirmed (unattended)

### D1 — Scope: 100 authored rows, 15 open in 4 families
The issue names dss follow-ons 17 to 22 and points at `.agent-notes/dss-*.md` for the rest of item 22. Each item and
each open note was re-measured on `8fe32c695` with an authored row (`measurements/gen-rows.mjs`). 85 rows are at 0:
those items closed under ddd, stdd, #116-#118, aar and smc (README, "Already closed"). 15 rows are open, in the four
families F1-F4 of the README table. All 100 rows join the dss fixture set as guards (D6). **Left out:** dss follow-ons
5-8 (they need rulings, and are not #122's), #138's partition order, `json__cascade-*`/`yaml__cascade-*` (Smetana,
CLAUDE.md ruling, named in the dss README), and smc's 11 `stockError` rows. **Rejected:** surveying the corpus alone.
Every cached source using these features is already conformant (3 `kermor`, 11 `HeadColor`, 5 `FontColor transparent`,
9 `skinparam noteBackgroundColor`), so only authored rows show the families.
**Evidence:** `measurements/planning-rows.json`, reproduced by T0.

### D2 — Kermor group note: the `ComponentType.NOTE` signature and the note's own colours
`Cluster#getCucaNote` (`Cluster.java:393-399`) passes `note.getColors()` to `EntityImageNoteLink`, which signs the style
`ComponentType.NOTE`, `{root, element, sequenceDiagram, note}` (`EntityImageNoteLink.java:61-65`,
`ComponentType.java:98-99`). The `note on link` block already reads that signature through `LINK_NOTE_BUCKET`
(`link-note-block.ts`, D2a of ddd). **Decision:** `drawKermorGroupNote` reads the same bucket and the group note's
parsed colour, as `link-note-block.ts` does, carried on `KermorNoteGeo` from the parser. **Rejected:** a third note
bucket. Both draws are one upstream class over one signature, so one bucket keeps them in step.

### D3 — State arrow heads: `Rainbow.build` over the merged arrow style
`SvekEdge#drawU` (`SvekEdge.java:873-892`) reads `LineColor` and `HeadColor` from one merged style
(`Rainbow.java:84-94`; no `HeadColor` means the line colour). A link's own colour replaces both. `drawRainbow`
(`:1108-1135`) draws `drawLineIfTransparent` with the line colour when the head is transparent. Class, component and
usecase already match. **Decision:** state takes `HeadColor` from the merged arrow style its `LineColor` already comes
from, so `arrow`, `element`, `stateDiagram` and `skinparam ArrowHeadColor` (`FromSkinparamToStyle.java:153`) all
reach it, and it mirrors the transparent branch. Find where class does this and share that read if it fits. `stateArrowHeadColor` stays on the
public `Theme` (D7). **Rejected:** widening the `stateArrowHeadColor` selector, which would copy the star-priority
merge for one property.

### D4 — State notes: read the merged note style
`FromSkinparamToStyle.java:125` converts `noteBackgroundColor` to `note { BackGroundColor }`, so every engine's merged note style
holds it. Every engine's row is at 0 except state's leaf, floating and link notes. **Decision:** T1c traces the state
note fill to where it leaves the merged style, and fixes it there, mirroring `EntityImageNote` (`EntityImageNote.java`,
quote the line) for the attached and floating notes and `EntityImageNoteLink` for the link note. **Rejected:** a
state-only skinparam read, which would miss a later `<style>` that overrides it.

### D5 — Sequence `FontColor transparent`: measure the text, draw none
`DriverTextSvg.java:92-93` returns before writing `<text>` when the colour is transparent. Layout still measures the
text. Ours throws (`sequence-note-width.ts:99`) or writes the `<text>`. dss-T3d found that our
`driver-text-svg.ts` already returns on `font.color === null`. **Decision:** sequence carries a transparent
`FontColor` as `color: null` into its `FontConfiguration`, and the throw goes. Measurement does not read the colour.
Other engines' rows are at 0 and are pinned as guards. **Rejected:** a sequence-only check at each text site, which
duplicates the driver rule.

### D6 — Pins
The authored rows join `tests/fixtures/diagram-style-scope/` and its shrink-only pin
`oracle/goldens/diagram-style-scope.json`, under their generated names, as smc D8 did. T0 pins every row at its
measured count, so a later rise fails. **Rejected:** a new pin file. The dss pin already holds this family.

### D7 — Public `Theme` fields: unchanged here, a ruling for the user
`dist/plantuml-ts.d.ts:4618-4619` declares `businessActorFill` and `businessUsecaseFill`. They are written
(`style-map-simple-fields.ts:37,51`, `theme.ts:306-307,357`) and never read: `renderer-entity.ts:201` reads the
`actor-business`/`usecase-business` buckets. Removing them changes the published types, and dss follow-on 8 sends a
d.ts change to the user. **Decision:** `dist/*.d.ts` stays identical to the base build (stop 4). T2a files a
`needs-ruling` issue that names both fields with the line numbers, and journals it. **Rejected:** deleting the writers
and keeping the fields, which leaves two fields that are always the default.

### D8 — Serial, main checkout, one commit per task
T1a-T1d touch separate engines, but they share `style-element-scope.ts`, the theme graph and the dss pin, and
worktrees need symlinked assets and skip git hooks. **Rejected:** parallel worktrees
(`.claude/memory/agents-write-main-via-serena.md`, `.claude/memory/worktrees-skip-git-hooks.md`).

### D9 — What ends a row
In order: conformant; a named divergence with a forcing library or a signed ruling; a `needs-ruling` issue naming the
row; a separable `queue:ready` issue with a "Blocked by" line added to #136. **No row ends unnamed.**
`oracle/accepted-divergences.json` is never edited here.

## Operational readiness (auto-confirmed)

| Question | Answer |
|---|---|
| SLIs and alerts | None: a browser-safe library with no runtime service. The surveys, the dss pin and the ratchets are the signal. |
| Traces and dashboards | N/A. `docs/parity-report.md` is regenerated at T3. |
| Rollback | **Reversible.** Revert the squashed commit. No migration. |
| Scale | Output only. T0 adds 100 dss rows; the dss ratchet renders each once (measured at T0 and journaled). |
| Likely failures | A survey under load writes `timeout`: rerun it alone. D3 moves every state source whose arrow style sets `HeadColor` or `LineColor`; D5 moves sequence text sizing if the colour leaks into measurement. `verdict-diff` names each moved row. |
| Compatibility | No public API change: `dist/*.d.ts` identical, checked at T3 (stop 4). SVG changes on purpose; `plantuml-ts` has no consumers to protect (`.claude/memory/plantuml-ts-has-no-consumers.md`). |
