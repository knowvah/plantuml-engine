# Decisions (edp)

## Auto-confirmed (unattended)

Planned with nobody present (`/plan-mission --unattended next --branch feature/parity-queue`, 2026-11-21). `next`
resolved to #185:
- no issue is `queue:planned`;
- #136 has 31 open blockers;
- #179 is blocked by #158, which is open and `needs-ruling`;
- #185 has no "Blocked by" reference and no `needs-ruling` label, and its ruling (option C, 2026-11-16) is in the body.

Each decision lists what was rejected and the evidence, so the user can audit it.

### D1: Re-measure and pin; write no divergence entry

**Ruling.** Option C: keep preprocessing embeds and record the two rows as an accepted divergence. Then: "When
upstream ships it, the two rows should turn conformant: re-measure then."

**Evidence.**
- Upstream `58b9b3d53ee` (#3016, merged 2026-11-17) is an ancestor of the pin `a720bdd`
  (`git merge-base --is-ancestor`).
- The re-captured oracles are 215×313 with a 167×136 embed.
- The 2026-11-21 survey has both rows `conformant`.

The ruling's condition has already happened, so its last instruction applies and the divergence clause has nothing
left to describe.

**Decision.** Pin both rows (T1a). Add no `oracle/accepted-divergences.json` entry and no `DIVERGENCES.md` section.

**Rejected.**
- *Write the option-C entry anyway, as the ruling literally asks.* The ledger gate
  (`emitter.golden.test.ts:132-160`, "no in-force entry names a fixture a fix has since made conformant") fails on it.
  Adding it as already `retired` records a divergence that never stood against the pinned jar.
- *Add the rows to `DIVERGENCES.md` "Rows pinned to unreleased upstream fixes".* That section is for fixes absent
  from the pin, whose rows take a fork-build oracle (#3030, #3032). #3016 is in the pin, so these rows use the stock
  pinned oracle like every other row.

### D2: Pin through a copy of cogr's `pin-goldens.mts`

`plans/class-oracle-gap-rows/tools/pin-goldens.mts` copies the cache pair into `oracle/goldens/svg-class/<slug>/`,
appends to `ratchet.json`, clones the twin rows in the routing and refusal baselines, and validates all of this before
writing anything. Its own comment says each mission copies it and bumps `MISSION` (cogr copied it from cdd5). T1a
copies it to `plans/embedded-diagram-preprocess/tools/`, sets `MISSION = 'embedded-diagram-preprocess'`, and runs it
with source tag `edp-T1a`.

**Rejected.**
- *Edit `ratchet.json` by hand.* It skips the byte-equality and twin-row checks.
- *Run cogr's copy unchanged.* That stamps the wrong mission into the baselines' `$comment`.

### D3: Upstream's `group3015` fixtures, verbatim, compared outer and nested

The five sources go to `tests/fixtures/embedded-diagram-3015/`, verbatim with their `output: svg` front matter, as
`tests/fixtures/class-2846/` does (precedent: `class-command-package-2846.test.ts:1-12`). Their oracles come from
`scripts/oracle-render.sh`.

**Two edits, documented in the test header:**
- `mono_line_note_theme` and `multi_line_note_theme` carry `!pragma layout smetana`. The capture policy strips it
  (`stripLayoutPragma`, G0; DIVERGENCES.md "`!pragma layout smetana|vizjs` — always laid out with graphviz"), so the
  committed `.puml` keeps the line, and the oracle is rendered from a stripped copy.
- If the test reads the sources through the same strip, write that down. Planning measured n=0 with the pragma
  stripped.

**Nested compare.** `compareSvg` skips `data:` hrefs (`compare.ts:374`). The test also decodes each
`data:image/svg+xml;base64` payload and runs `compareSvg` on the pair (cogr follow-on 5 in
`planning/next-missions.md`). Keep that helper local to the test unless a second caller appears.

**Citation refresh.** `EmbeddedDiagram.ts`'s module JSDoc gains the constructor citation at the pin
(`EmbeddedDiagram.java:89-103`, `noDefinitions` :105-127, the exact span read at execution). It also says that the
nested `renderSync` preprocessing mirrors it. A citation in a file this mission edits that has gone stale is
corrected.

**Rejected.**
- *Re-cite all 41 files that cite `EmbeddedDiagram.java:N`.* The citations drifted at re-pins, not because of #185.
  The sweep is separable and is logged in `.agent-notes/edp-plan.md` for its own cleanup.
- *Synthesised fixtures only.* CLAUDE.md prefers upstream fixtures. The authored probes are added only where
  upstream has no case: the outer variable, `!includedef`, and the error page (T1c).

### D4: An embed's source is labelled `block`, through an internal render option

**Upstream.**
- `EmbeddedDiagram.from` → `BlockUml.convert(strings)` (`EmbeddedDiagram.java:146-147`).
- `convert` → `new LineLocationImpl("block", null)` (`BlockUml.java:119-127`).
- So the jar's embedded error page prints `[From block (line 2) ]`, measured at planning.

**Ours.**
- The nested render is `renderSync(nested, options)` (`src/index.ts:321`), which reads lines with
  `SOURCE_STRING_DESCRIPTION` = `'string'` (`ReadLineReader.ts:37`, via `BlockUmlBuilder.ts:146` and
  `error-diagrams.ts:123`).

**Decision.** Add one field to `InternalRenderOptions` (`src/core/internal-render-options.ts`), for example
`sourceDescription`, with an accessor in the file's existing style (`clockOfOptions`). The nested-render callback at
`src/index.ts:321` sets it to `'block'`, held in one named constant that cites `BlockUml.java:121`. Every `readLines`
on that render's path reads it, and every other call keeps the `'string'` default.

**Constraints.**
- No `RenderOptions` field and no `src/index.ts` export (stop 5).
- Before reusing `filename` for this, read how `filename` reaches `%filename()` (`render-options.ts:93-94`,
  `Defines.java:89-94`); the two are separate in the Java.

**Rejected.**
- *Leave it.* The label is an element the jar draws differently, and its width can set the embed's size when it is
  the widest line. No library forces the difference.
- *Pass `filename: 'block'`.* That also changes `%filename()` inside the embed, which the jar's
  `Defines.createEmpty()` does not do.
- *A public option.* It changes the published API for a conformance detail.

### D5: The embedded error page's version banner is not decided here

#185 asked, as point 2, whether an embedded error page's size can carry our own banner
(`plantuml-engine version 0.2.0 / unknown`). The 2026-10-10 ruling covers top-level error pages only. Since #3016,
only a broken embed shows an error page, and no corpus row has one. T1c's oracle test therefore compares only the
`[From …]` line and its box. The banner line stays ours, and this mission does not decide it. The issue comment that
reports this brief names the question.

**Rejected.**
- *Copy the jar's banner into embedded error pages.* That decides a ruling the issue left open.
- *Park #185 on it.* The skill parks only when the whole issue waits on a person. This question is about a case no
  row exercises.

## Operational readiness

- **Observability:** N/A. A pure library; no new operation, log or metric.
- **Rollback:** Reversible. Revert the squash commit; goldens, ratchet rows and baselines revert with it.
- **Scalability:** N/A. One string per nested render.
- **On-call:** N/A. The failure mode is a wrong label on an embedded error page, caught by T1c's test.
- **Backwards compatibility:** output change only, and only for an embed that renders an error page. No API, type or
  data contract changes. Not a breaking change.
