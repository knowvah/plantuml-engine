# Decisions (pre-made)

D1 is the maintainer's ruling. D2 to D6 were auto-confirmed at unattended planning on 2026-11-21 (section at the end).
Amend a decision only by appending a dated line under it, then halting (README stop 4).

## D1. Option 1: a host-font divergence. No dot-engine change, no `src/` change.

**Ruling** (sseely, 2026-11-16, on #186): "option 1, a host-font divergence. The oracle host's graphviz measures labels
with pango/CoreText and the machine's Times New Roman, kern pairs included; a browser-safe engine cannot load the host's
fonts. Same family as #169 (host font list) and #170 (host AWT fonts). Record it in DIVERGENCES.md as library-forced
(host fonts), cite the evidence above (`textspan.c:73-92`, dot-engine `textmeasure.ts:292-296`, the kern-pair table,
the `Node X` control), and sign `dot/quoted-labels` and `dot/skinparam-font-color` as accepted. No kern table in
dot-engine (option 2 not taken)."

- No kern table, in this repo or in `@knowvah/dot-engine`. No change under `src/`.
- Done when: the DIVERGENCES.md entry exists, both rows are signed, and no other row's verdict moves.

## D2. Pin both rows in the svg-dot ratchet as a new `accepted` kind, with the score held

`oracle/goldens/svg-dot/ratchet.json` gains two entries:
`{ slug, addedAt, source: "dhk-T1", accepted: "svg-dot/<slug>", weightedScore, diffCount }`, measured, never typed
from this brief. `dot.golden.ratchet.test.ts` gains a third row kind beside `drawn` and `jarErrors`:

- the score never rises above its pin (the jar error-page pattern, `dot.golden.ratchet.test.ts:189-196`);
- the row still diverges: a zero-diff result fails with the ledger's "GOOD NEWS ... retire" message
  (`emitter.golden.test.ts:121-160`), because the survey cannot see these rows (D3) and nothing else would notice;
- `accepted` names an in-force `oracle/accepted-divergences.json` entry with that exact `id`;
- the passthrough is still byte-exact (graphviz's document, no `<marker>`), as for `drawn`.

`drawn` excludes `accepted` rows, so the zero-diff block never sees them. The "only a jar error-page row carries a score"
case becomes "only jar error-page and accepted rows carry a score, and each carries both halves". The corpus count goes
60 to 62 with a dated derivation comment.

**Rejected:** ledger entry only. The dot survey is blind to these rows (D3), so a further regression in their geometry
would reach no gate. **Rejected:** a zero-diff pin. The rows differ from the jar by design now.

## D3. Ledger entries carry `surveyBlind`

Two entries in `oracle/accepted-divergences.json`, `match.id` `svg-dot/quoted-labels` and `svg-dot/skinparam-font-color`,
`acceptedBy` "maintainer (ruling 2026-11-16, #186)", `acceptedAt` "2026-11-16", in the shape of the newest entries.
Each carries `surveyBlind`, because `parity-dot.json` surveys the `dot-cache` tree, which the a720bdd re-pin
(cfb9ecd55) recaptured under the default LEGACY profile. There both sides are `PSystemDot`'s suppression page
(`PSystemDot.java:77-84`), so the survey reads all 62 dot rows `conformant` and cannot see graphviz geometry. Without
`surveyBlind`, `no in-force entry names a fixture a fix has since made conformant`
(`emitter.golden.test.ts:131-160`) fails at once. The `surveyBlind` text names that exemption and says that the dot
ratchet's `accepted` block holds the row instead (D2).

**Rejected:** recapturing `dot-cache` under INSECURE, or giving the survey INSECURE for `dot`. Either changes how
all 62 dot rows are surveyed, against `scripts/lib/golden-security-profile.ts:16-26` and `recapture-render.ts:66-69`,
which keep every non-golden tree LEGACY on purpose. That is a harness question beyond #186. Log it in the T3 notes.

## D4. Oracles come from a fresh INSECURE render, one file per jar run

- `PLANTUML_SECURITY_PROFILE=INSECURE scripts/oracle-render.sh <abs-out-dir> <one.puml>`, **one file per invocation**.
  At planning, two `@startdot` files in one invocation came back corrupted twice, differently each time: an extra edge,
  then no edges, with `Error: <stdin>: syntax error in line 1 near '}'` appended
  (`.agent-notes/dhk-planning.md`).
- Never copy `test-results/dot-cache/dot/<slug>/in.svg`. Since cfb9ecd55 it is the LEGACY suppression page.
- Never run `plans/dot-oracle-gap-rows/tools/pin-goldens.mts`. It copies from that cache.
- `in.puml` is copied from `test-results/dot-cache/dot/<slug>/in.puml`, which is unchanged since 2026-11-04.
- graphviz must be 16.1.1 (`dot -V`), the version every pinned golden names since d94d25ace.
- The routing and refusal baselines gain a `goldens`/`svg-dot` twin per row, cloned from the row's `dot-cache` twin.
  `measuredAt` and `measuredAgainstCommit` are the T1 date and base sha. The gates confirm them (task contract step 5).

## D5. DIVERGENCES.md: a new entry under "DOT-passthrough diagrams"

- Heading: `### @startdot labels are measured without the host font's kerning`.
- Category: "library-forced (host fonts), by maintainer ruling (2026-11-16, #186)".
- Body: the mechanism and evidence in #186, the 16.1.1 re-measurement from T1, and both row ids with their pinned
  scores. The `Node X` control comes from #186, or from T1 if T1 re-runs it.
- Cite with `file:line`: `textspan.c:73-92` (`~/git/graphviz/lib/common/`), `textspan_lut.c:19-21`, dot-engine 2.12.3
  `src/common/textmeasure.ts:292-296` (the 2.12.3 `node_modules` copy has the comment at :293), and the Java at
  the oracle pin.
- The retired U2 entry's "node widths differ by up to 1 pt" sentence (DIVERGENCES.md:929) gains a pointer to the new
  entry.

## D6. Serial, main checkout, one squashed commit

- One unsigned commit per task, in the main checkout, serially, with no worktrees, on `feature/parity-queue`.
- Batch-squash collapses the mission onto the base sha with `git commit-tree`, tagged `dot-host-font-kerning/pre-squash`.
- Footer `Refs: #186`. Never push.

## Auto-confirmed (unattended)

Planned unattended on 2026-11-21 at `feature/parity-queue` `613a61649`. Each decision below was taken from the
planner's recommendation, with the evidence noted.

- **D2 (pin with a held score).** Alternatives: ledger only (rejected: no gate would hold the INSECURE geometry); a
  zero-diff pin (impossible). Evidence: the measurement below, and `parity-dot.json` (2026-11-21T16:30Z) reading 62/62
  `conformant`.
- **D3 (`surveyBlind`).** Alternative: change how the dot survey captures or renders (rejected: it re-scopes the
  harness for 62 rows, against the LEGACY-by-default design in `golden-security-profile.ts:16-26`). Evidence:
  `emitter.golden.test.ts:131-160` reads `parity-dot.json` by slug.
- **D4 (fresh one-file renders).** Alternative: the dogr pin tool from the cache (rejected: the cache is LEGACY).
  Evidence: `test-results/dot-cache/dot/*/in.svg`, where 54 of 62 were rewritten 2026-11-21 15:17 and all 54 are
  the suppression page, plus the two corrupted multi-file renders.
- **Measurement at planning** (graphviz 16.1.1, dot-engine 2.12.3, `measure-accepted.mts` against single-file INSECURE
  renders): `quoted-labels` diffs 18, score 18; `skinparam-font-color` diffs 17, score 17. In both, node `a` has
  `rx` 40.09 in ours and 39.58 in the jar, and node `b` has 39.58 in both. Native `dot -Tsvg` on each row's DOT body
  equals the jar's SVG apart from the `Generated by` comment. The #186 mechanism holds under 16.1.1.
