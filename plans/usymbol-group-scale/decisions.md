# Decisions (ugs)

## Auto-confirmed (unattended)

Planned with nobody present (`/plan-mission --unattended next --branch feature/parity-queue`, 2026-11-16). `next`
resolved to #149: no issue was `queue:planned`, #136 is blocked by open issues (#149 among them), and #149 has no
"Blocked by". Each decision lists what was rejected and the evidence, so the user can audit it.

### D1: A USymbol group draws in layout units, and `SvgOption.scale` does the multiplying

**Decision.** `renderNamespaceUSymbol` mirrors the leaf fix from #140 (`renderer-usymbol-entity.ts:318-357`):
- it undoes the class scale on the geo it draws (`x`, `y`, `width`, `height`) and on the theme (`fontSize / k`,
  `scaleK: 1`);
- it builds the same `ClusterDecoration` (`ClusterDecoration.java:66-92`) in layout units;
- it passes `scale: k` to `renderDrawableToFragment`, so every number is multiplied once on the way out
  (`SvgGraphics.java:467-474`);
- the hand-applied `scaleK` factors on this path go: the stroke's (`class-namespace-usymbol-shape.ts:239-257`, which now
  sees `scaleK` 1) and the round corner's (`renderer.ts:63-66`). The corner must be passed unscaled, or divided back on
  entry. Pick whichever keeps the folder and rect paths, which still need their own `scaleK`, untouched.

At `k === 1` nothing changes: no unscale and no `scale` option, so the output is byte-identical.

**Rejected.**
- *Scale each `asBig` literal by hand* (thread `scaleK` into `USymbolRectangle`, `USymbolNode` and the rest). That
  forks 16 ported, jar-verified `asBig`s with a factor upstream never passes, and the description engine shares
  those classes (`desc-rectangle` is 0 today). CLAUDE.md: "A structural divergence IS the bug."
- *Fix only the title offset the issue names.* 15 other probed symbols (action through storage) have unscaled
  literals: `scale-node` alone has 15 diffs. The issue says to "check the other USymbol groups".

**Evidence.** The planning experiment (README, "Starting state") took 21 of 26 open rows to 0. The 5 left are D2's
(3 rows) and D3's (2 mechanisms, unchanged by the patch).

### D2: The header stereo is built with deferred numbers and formatted once, after the multiply

**Decision.** `ClusterHeaderStereo` (`class-cluster-header.ts:268-286`) holds a pre-formatted SVG string, so at
`k ≠ 1` it is spliced at the wrong size on both draw paths. T1c builds its body inside `withDeferredFormat(true, …)`
(`svg-format.ts:135-155`) whenever the diagram's scale is not 1, and formats it once at `k` where it is placed:
- **USymbol path:** in `clusterHeaderStereoTextBlock`'s splice, at `(dx·k, dy·k)`. The block keeps reporting layout-unit
  dimensions to `asBig`.
- **Folder and rect paths:** in `class-namespace-shape.ts#placeHeaderStereo`. `width` and `height` scale by `k` there,
  since those paths draw pre-scaled geometry.

For the single format step, use `scaleActivityBody` (`TextBlockExporter.ts:273`). It covers the extra length attributes
(`x1`/`y1`/`cx`/`stroke-dasharray`) a legend body can carry. Confirm that the header builders' output goes through the
deferred formatter before relying on it: read `svg-format.ts` and the emitters the header calls.

**Rejected.**
- *Rescale the formatted body* (`scaleFragmentBody` on the 3-dp string). Measured in the planning experiment:
  `node-thick-dashed` keeps `textLength` `157.324` against the jar's `157.325`. That is the double rounding
  `svg-format.ts:142-143` describes.
- *Measure the header at the scaled font size.* Upstream measures in layout units and multiplies at format time.
  Measuring at `14·k` is a different computation, and it stops matching once the measurer is non-linear.

If deferring the header turns out to need a change outside the class engine, take the smallest seam and journal why.
Changing a shared emitter is fine once `verdict-diff` shows 0 lost.

### D3: Separable residuals are filed, not chased

A probe whose diffs remain after D1/D2 is re-measured at `scale 1`. If the residue is the same at `scale 1`, it is a
different mechanism. File it as a `queue:ready` + `parity` issue with the probe, both outputs' key attributes and the
upstream `file:line`, then move the row to `OPEN` naming it. Two such residues are known at planning:
- **R1, `package G <<Group>>` / `<<Partition>>`:** 84 diffs at both scales. The jar draws `<rect rx="2.5">` plus a
  `path` tab, and we draw a frame `path` plus a `line`. `USymbols.java` registers `GROUP` and `PARTITION` as
  `new USymbolFrame(SName.group|partition)`. Read `USymbolFrame#asBig` and the style the jar reads before filing.
- **R2, `skinparam packageFontSize 20` on a `<<Node>>` group:** 101 diffs at scale 1. The jar's title is
  `font-size="14"`, and ours is 20 because `class-namespace-usymbol-shape.ts#clusterTitleFont` reads
  `elements.package.fontSize`. The title style is `{root, element, <diagram>, node, composite, title}`, with no
  `package_` (`ClusterHeader.java:152-160`, the same reason `renderer.ts:67-69` gives for `packageFontColor`). The DOT
  title table sizes the title from the same value. File it; do not fix it here. It changes layout, not scale.

"Hard" is not separable. A mechanism that D1's own change exposes belongs to T1b, for example a sizer or ink path that
reads the old pre-scaled value.

### D4: No new divergence, no public d.ts change

Nothing here is library-forced. `DIVERGENCES.md` and `oracle/accepted-divergences.json` stay unchanged. T0 snapshots
`dist/*.d.ts` and T2 diffs them; any change is stop 5.

### Measurement surface: an authored gate

The 29 probes move to `tests/fixtures/usymbol-group-scale/` and are held by
`tests/oracle/svg-conformance/usymbol-group-scale.authored.test.ts`, modelled on `usecase-title-style.authored.test.ts`:
- rows are the `.puml` files on disk;
- `ZERO` rows assert 0 diffs;
- `OPEN` rows assert that their count never rises, with a `reason` naming an issue.

**Rejected:** registering them in the class parity corpus. That route needs `svek-N.dot` parity rows and a survey
re-run per fixture, and the gate holds the same assertion for a fraction of the CI cost (#145, uts, edge-label-embed).

## Operational readiness

- **Observability:** N/A. This is a browser-safe library with no service, SLIs or traces. The gates are the monitors.
- **Rollback:** Reversible. Revert the squash commit; the `pre-squash` tag keeps the per-task history.
- **Scalability:** N/A. 29 more renders in the test suite, each under 0.1 s.
- **On-call:** N/A (library). The failure mode is a lost conformant row, which `verdict-diff.mjs`, the class ratchets
  and the censuses catch.
- **Backwards compatibility:** no API, d.ts or data contract change (D4). Only scaled class/object SVG changes, towards
  the jar.
- **Irreversible changes:** none.
