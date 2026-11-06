# Decisions

All recorded unattended; the user audits them here.

## Auto-confirmed (unattended)

### D1 — Scope is 208 rows, by the survey's verdict
`component` 51, `usecase` 24, and the 133 `unknown` rows whose `jarType` in `routing-baseline.json` is `DESCRIPTION`. A row is done at
`conformant`, the survey's `compareSvg` verdict. **Rejected:** the corpus directory as the type (routing gate D6: the directory builds a path and
does nothing else); `c4` rows (#114 owns them, though T2a will move their `rx` first diffs, which T6 reports on #114); the 200 other open
`unknown` rows (#119, and the issues of engines not yet ported). **Evidence:** fresh surveys of 2026-11-04 moved 0 verdicts against the committed files.

### D2 — Read entity style through the ported `StyleBuilder`, one builder per render, new reads only
**Question:** corners, stroke and stereotype fonts have no value on the flat path. `renderer-entity.ts` hard-codes `diagonalCorner: 0` and
`resolveElementRoundCorner(theme, node.symbol)` takes no labels, while `EntityImageDescription.java:151-183` reads all of them from one merged style.
**Option A:** extend the flat `*ByStereo` tier maps (`skinparam-stereo-keys.ts`) key by key. Every key needs both a skinparam and a `<style>` surface,
and a per-bucket snapshot cannot vary per instance (`style-element-scope.ts` header). **Option B:** move every description read onto the builder at once:
a rewrite under 800 conformant rows. **Option C:** a pure `descriptionEntityStyle(builder, styleName, symbol, labels, colors)` mirroring
`EntityImageDescription.java:151-160`, reached through `LayoutServices` (internal, `core/elk/elk-backend.ts`), for the values the flat path lacks.
**Decision: C.** Existing flat reads stay until a row needs them moved. Sizer and renderer read the same result, stored on the node geo
(`planning/sizer-renderer-parity.md`). **Evidence:** `currentStyleBuilderOf` already builds from skinparams alone (`document-back-color.ts:100-105`; the
dss D3 gate is a choice about flat writes, and `defaultFontStyleBuilder` already steps past it); `class-package-style.ts` shows A's cost. **Reversible:**
each read is a single call site. If building the builder per render shows in `npm test` wall clock, build it lazily behind a thunk, and journal the numbers.

### D3 — Serial, main checkout, one commit per task
**Rejected:** parallel worktrees. The tasks overlap in `renderer-*.ts`, `layout*.ts` and `link-edge-attrs.ts`, a worktree needs symlinked stdlib and oracle
assets and skips git hooks, and Serena agents write the main checkout anyway (`.claude/memory/agents-write-main-via-serena.md`).

### D4 — Pin through `pin-description.mts`, routed rows after their gate rows flip
The svg-description ratchet renders through `renderFixture`, and an `unknown` row is eligible only when `routing-baseline.json` says `ourType`
`DESCRIPTION` (`description-eligibility.ts`). So T1a to T1c flip gate rows with `flip-gate-rows.mjs` before any pin. **Rejected:** hand-editing `ratchet.json`:
the tool's Add rule (zero diff through the ratchet's own path, `dotEqual: true`) is what keeps the ratchet honest.

### D5 — Middle decor: move class's draw to core, then call it from description
`SvekEdge.java:982-990` draws it for every engine. Class already does: `src/diagrams/class/renderer-arrowhead-middle.ts` (`MiddleCircle`, `MiddleCircleCircled`; class row `cenubi-27-xova754`
is conformant with `-0)-`), and `class-layout-edge-labels.ts:50` holds `LABEL_SHIELD = 7`. T3a moves the draw and the constant to `src/core/svek/extremity/` unchanged, then wires description.
**Rejected:** a second copy in description, and importing `diagrams/class` from `diagrams/description`, which would couple two engines. Its signature takes the class `EdgeGeo` and `MiddleDecor` today, so
narrow them to what it reads. A class byte moving means the move was not pure: `verdict-diff.mjs` names it. `SUBSET`/`SUPERSET` (`MiddleFactorySubset.java`) stay unported unless a description row reaches them; T3a
records the check.

### D6 — #145's and others' description rows are fixed here
#145 lists `golati-24`, `kokodo-61`, `koxeca-82`, `gekage-52`, `xekale-36`, `bitujo-81`, `degici-07`, `pexaxo-70`, `baxodi-80`; #122 names `sacupe-57`, `zonamu-61`,
`fupumu-08` and the `note on link` colour on the description side; #120's body names `xefuma-94`, and `component__probe-*` authored rows are its own. Those corpus
rows are in this issue's done-when, so T2e, T2a and T4e fix them here. T6 comments on each issue saying so. #145's other rows and authored probes stay on #145.
**Rejected:** leaving them, which would fail #113. `xefuma-94`'s comment on #120 says it stays with #119; #119's own text excludes jar-DESCRIPTION rows, so it is here.

### D7 — What ends a row
In order: conformant; a named divergence with a forcing library; a `needs-ruling` issue naming the row; a separable `queue:ready` issue chained on #136, with the
measurement that proves it separable. **No row ends unnamed.** A row with only "hard" against it is not ended. New issues get a "Blocked by" line on #136, because the
lowest number runs first (#144 was missed). `oracle/accepted-divergences.json` is never edited here: the user signs.

### D8 — The rows already ended by a standing ruling
- `kezodo-14`, `vimulo-11`, `gevozu-46`, `sunuju-01`, `barufu-21` carry `<latex>`: DIVERGENCES.md "LaTeX rendering engine" (KaTeX, permanent). Their non-LaTeX structure is
  still a target. T5e proves each residual diff sits under the image atom, and names the row there. `.claude/memory/latex-math-is-permanent-divergence.md`.
- `zomoba-18`, `revezi-19` carry `!pragma layout smetana`: CLAUDE.md ruling 2026-08-09, "record the delta and move on". T5e fixes what is not geometry and names the row in DIVERGENCES.md
  "`!pragma layout smetana|vizjs`". No Smetana number is chased.
- `usecase/fepuvo-06` is `oracle-error`: the jar's own comment is not well-formed XML, so `compareSvg` cannot read the oracle (`[xmldom fatalError] comment is not well-formed`). T5e compares with
  both comments stripped, in a test; if that is clean, the row is named in DIVERGENCES.md "Descriptive diagrams" as unreadable by the comparer, not as a divergence.

### D9 — Geometry on real-graphviz paths is a target
Description shells out to graphviz, so `dotEqual` false is a defect in our DOT input. Before blaming dot-engine, run `dot -Tdot` on the cached `svek-N.dot`
(`.claude/memory/dot-engine-blame-needs-real-dot.md`). A verified finding is filed in `docs/graphviz-issues/` and `TRACKER.md` before the iteration closes, and dot-engine is never edited.

### D10 — Mirror the jar's parser order, not a local fallback
T1 mirrors `PSystemBuilder.java:136-140`: class first, description next, activity3 after it. A class refusal must fall through to description the way upstream's does. **Rejected:** teaching the
class parser to accept those lines, or a keyword heuristic in the router: `.claude/memory/routing-heuristic-repair-status.md` holds what that cost.

## Operational readiness (auto-confirmed)

| Question | Answer |
|---|---|
| SLIs and alerts | None: a browser-safe library with no runtime service. The survey, census and ratchets are the signal. |
| Traces and dashboards | N/A. `docs/parity-report.md` is regenerated, and `scripts/parity-dashboard-notes.ts`'s notes are rewritten from measured numbers. |
| Rollback | **Reversible.** Revert the squashed commit. No migration. |
| Scale | Output only. The builder is per render (D2). The ratchet grows by about 77 + up to 208 fixtures of in.puml plus golden.svg, and CI's slowest shard was 506 s of 600 s on #146: T6 names that risk in its summary. |
| Likely failures | Survey under load writes `timeout`: rerun alone. A shared-module change (`SvekEdge`, `Colors`, `USymbolFolder`) moving another engine: `verdict-diff` names it. A routing change breaking an `agree` pin: the routing gate names it. |
| Compatibility | No public API change: `LayoutServices` is internal, and `dist/*.d.ts` must stay identical (check at T6). SVG for description diagrams changes on purpose, and `plantuml-ts` has no consumers to protect (`.claude/memory/plantuml-ts-has-no-consumers.md`). |
