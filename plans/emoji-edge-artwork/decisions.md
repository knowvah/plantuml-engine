# Decisions (eea)

## Auto-confirmed (unattended)

Planned with nobody present (`/plan-mission --unattended next --branch feature/parity-queue`, 2026-11-16). `next`
resolved to #150: no issue was `queue:planned`, #136 is blocked by open issues (#150 among them), and #150 has no
"Blocked by". Each decision lists what was rejected and the evidence, so the user can audit it.

### D1: The atom resolver carries the emoji artwork, and `drawAtoms` draws it

**Decision.**
- `AtomImageResolver` (`src/core/creole-atoms.ts:205`) becomes the function type intersected with
  `{ readonly emojiArtwork?: EmojiArtworkResolver }`. Every existing function literal stays assignable.
- `makeAtomImageResolverFor(registry)` (`creole-atoms-image-resolver.ts:472-495`) attaches
  `emojiArtwork: emojiArtworkResolverFor(registry?.emoji)` (`internal-emoji-store.ts:68`) to each resolver it returns.
  Use `Object.assign` or an equivalent typed construction, not a cast.
- `drawAtoms`'s emoji arm (`EntityImageDescriptionTextBlock.ts:175-183`) calls
  `drawEmojiAtom(ug.apply(new UTranslate(x, top)), atom, resolveAtomImage?.emojiArtwork)`. That one call covers both
  outcomes: artwork when it resolves, and the platform-glyph run otherwise (`EntityImageDescriptionEmoji.ts:46-60`).
  The advance stays `emojiBoxDim(atom.factor).width`. Before you fold the glyph fallback into `drawEmojiAtom`, check
  that its `y` (`m.height - m.descent` from the `ug` origin) equals the arm's current
  `top + runM.height - runM.descent`. If it does not, keep the current glyph lines and call `drawEmojiAtom` only when
  artwork resolves.

This mirrors upstream's reach. `Emoji.retrieve` is one global table (`Emoji.java:111-118`), so every creole line draws
artwork (`AtomEmoji.java:66-68`, `Emoji.java:175-182`). The registry is this port's render-scoped equivalent of that
table, and every `buildTextBlock` site that can see sprites already holds a resolver built from it.

At no store, `emojiArtwork` returns `undefined`, so output is byte-identical (the accepted platform-glyph fallback in
`DIVERGENCES.md`).

**Rejected.**
- *A 7th positional parameter on `buildTextBlock` and a 6th on `drawAtoms`.* `drawAtoms` is at 5 parameters, and the
  complexity hook blocks a 6th. Each caller would also have to thread a value its registry already holds. Sites with a
  registry resolver but no explicit thread (cluster titles, stereotypes, class sites) would keep drawing the glyph.
- *Route the edge label through the real `Display#create0` → `BodyFactory`/`Sea` path with `descAtomOps` (upstream's
  structure).* `buildTextBlock` is the port's documented substitute for `create0` at about 15 sites, and c4dd T1b just
  made it lay a line through `Sea` (6 authored rows at 0). Retiring it is a separate cross-engine mission (description,
  legacy activity, cheneer). The resolver field added here survives that retirement, because `descAtomOps` can read
  the same field.
- *Resolve the artwork when the atom is built* (`AtomEmoji` holds its `Emoji` upstream). The store would have to reach
  `StripeSimple#addEmoji` through every engine's creole parser. That is a much larger change for the same pixels.

**Evidence.** The planning experiment (README, "Starting state") took `issue-150` and `desc-edge-emoji-only` from 1 to
0 and moved no other probe.

### D2: Every `SvekEdge` creole block uses the label's resolver, at its sizer and its draw

**Decision.**
- **Quantifier (T1c).** Upstream builds `startTailText`/`endHeadText` with the label's `skinParam`
  (`SvekEdge.java:328-340`). `SvekEdge#drawEndText` (`SvekEdge.ts:433-443`) passes
  `this.input.resolveAtomImage?.(end.font)` to both of its `buildTextBlock` calls. `measureQuantifierBlock`
  (`quantifier-block.ts:24-38`) gains the same optional resolver, and its description callers
  (`link-edge-attrs.ts`, `layout-geo-post.ts`) pass the one they hold, or the registry's. An emoji's size does not
  depend on its artwork (`AtomEmoji.java:57-60`), but a sprite's does. The sizer and the drawer must see the same atoms
  (`.agent-notes/s1l-wave3-emoji-sizer-channel.md`: wire both sites).
- **Legacy activity (T1d).** Its `SvekEdge` input (`activity-legacy/renderer-edge.ts:278`) gains
  `resolveAtomImage: makeAtomImageResolverFor(sprites)`, from the skin param's registry
  (`activity-legacy-skin-param.ts:89-111`). If its label sizer measures with `buildTextBlock`, pass the same resolver
  there.

**Rejected.** *Emoji-only plumbing (an `emojiArtwork` field on `SvekEdgeInput`).* It would leave sprites in a
quantifier undrawn. Upstream has a single `skinParam`, and a second channel beside the resolver would split it.

### D3: Emoji residues at other sites are filed, not chased

A probe whose diffs remain after D1/D2 is re-measured with each `<:name:>` replaced by `XX`. If that control is 0, the
residue is emoji-specific at a site this mission does not own. File it as a `queue:ready` + `parity` issue with the
probe, both outputs' key attributes and the upstream `file:line`, then move the row to `OPEN` naming it. Four are known
at planning, and each control is already 0:

- **R1, class edge label** (`class-edge-emoji`, 58; `class-quantifier-emoji`, 97). Our root is 38 px and 9 px wider
  than the jar's, which suggests the class engine measures `<:rocket:>` as text. Before filing, read
  `class-edge-label-measure.ts` and the class quantifier sizer. One issue covers both rows if they share a seam.
- **R2, description cluster title** (`desc-cluster-title-emoji`, 39). The title tab path is `7.167` against `6`, and
  the root is 1 px taller. `EntityImageDescriptionClusterTitle.ts` takes `emojiArtwork`. Check whether the sizer and
  the drawer both receive it.
- **R3, state edge label** (`state-edge-emoji`, 3). The label `x` is 36.575 against 56.075, and childCount is 3 against
  9: the state engine's own edge label path.

"Hard" is not separable. A mechanism that D1's own change exposes belongs to T1b, for example a sizer or ink path that
now sees the artwork.

### D4: No new divergence, no public d.ts change

Nothing here is library-forced. `DIVERGENCES.md` (including the "Emoji shorthand" entry) and
`oracle/accepted-divergences.json` stay unchanged. `AtomImageResolver` is internal: `grep AtomImageResolver dist/*.d.ts`
is empty at planning. T0 snapshots `dist/*.d.ts` and T2 diffs them; any change is stop 5.

### Measurement surface: an authored gate

The 8 planning probes move to `tests/fixtures/emoji-edge-artwork/`, held by
`tests/oracle/svg-conformance/emoji-edge-artwork.authored.test.ts`. Model it on
`usymbol-group-scale.authored.test.ts`, with one difference: it renders with `assetStore: buildEmojiAssetsStore()`
(`tests/helpers/emoji-assets-store.ts`), as `scripts/svg-parity-survey.ts` does.
- Rows are the `.puml` files on disk.
- `ZERO` rows assert 0 diffs.
- `OPEN` rows assert that their count never rises, with a `reason` naming an issue.

The issue's own fixture stays in `tests/fixtures/c4dd-T1b/`. Its gate, `c4dd-t1b-text-atoms.test.ts`, gains the same
store in T1b.

**Rejected:** registering the probes in a parity corpus. That needs `svek-N.dot` rows and a survey re-run per fixture,
and the gate holds the same assertion for a fraction of the CI cost (the ugs and uts precedent).

## Operational readiness

- **Observability:** N/A. This is a browser-safe library with no service, SLIs or traces. The gates are the monitors.
- **Rollback:** Reversible. Revert the squash commit; the `pre-squash` tag keeps the per-task history.
- **Scalability:** N/A. 8 more renders in the test suite, each under 0.1 s.
- **On-call:** N/A (library). The failure mode is a lost conformant row, which `verdict-diff.mjs`, the description
  ratchet and the censuses catch.
- **Backwards compatibility:** no API, d.ts or data contract change (D4). Only emoji drawing with a store wired changes,
  towards the jar.
- **Irreversible changes:** none.
