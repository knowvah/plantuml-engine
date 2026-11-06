# T3b — Upstream's vega sources as fixtures

**Read:** D4, D7, `docs/svg-conformance.md` (error pages), `tests/fixtures/chart/` (naming: `<slug>.puml` and `<slug>.svg` side by side, flat).

**Do:**

```sh
mkdir -p tests/fixtures/packet /tmp/pep-T3b/src
cp ~/git/plantuml/src/test/resources/vega/packet/*.puml /tmp/pep-T3b/src/
```

Rename each to `vega-<name>.puml` under `tests/fixtures/packet/` (a `node -e` one-liner over `readdirSync` is on the allowlist; a shell loop is not), then `scripts/oracle-render.sh tests/fixtures/packet tests/fixtures/packet/vega-*.puml`. Expect 57 `PACKET` and 5 error pages. Then `npx jiti plans/packet-engine-port/measurements/probe-dir.mts tests/fixtures/packet`.

Fix every nonzero row where the jar draws, Java first. Branches vega reaches that the 6 rows do not: `node_height` 0 and 80, `colwidth` 0/1/33, `scale_interval` 0 to 8 and above `colwidth`, RTL with ranges, sparse packets, `len` 0 to 17, `same_height` × `colheight`, `skin rose` (shadow filter, `#FEFECE`, `#A80036` at 1). A row where the jar errors must error in ours too (D7); compare our message with the oracle's and journal any mismatch as a finding, not a target.

## Acceptance
- Given `probe-dir`, then every one of the 57 drawing sources is at 0 diffs, or journaled with mechanism, Java citation and its D7 end.
- Given the 5 error sources, then ours errors on each, and the journal lists the oracle's message beside ours.
- Given `packet-moves` against b0, then lost is 0.

Observability N/A. Rollback Reversible.
