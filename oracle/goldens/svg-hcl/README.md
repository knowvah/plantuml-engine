# `svg-hcl` — SVG-conformance goldens for `@starthcl`

Mission **A5** (json family). Sibling of `svg-description`, `svg-class`,
`svg-object`, `svg-state`, `svg-dot`.

## Current state

**8 pinned (hyogr, 2026-11-15, #142).** `ratchet.json` holds `citoda-80-dimi195`
(pinned 2026-08-09) and the 7 zero-diff `@starthcl` rows #109 captured
(`source: hyogr-T1`), each copied byte-for-byte from
`test-results/dot-cache/hcl/` by `plans/hcl-yaml-oracle-gap-rows/tools/pin-goldens.mts`.
`json-family-ratchet.ts` holds a shrink-only floor of 8 (`RATCHET_FLOOR`).

The rest of the hcl corpus is not byte-conformant, and that is expected: upstream
lays this family out with Smetana and this port uses dot-engine (CLAUDE.md "One
layout engine", ruling 2026-08-09). For those rows the bar is the json-family
structural pin (`oracle/goldens/json-family-structural.json`), the shrink-only
positional ceiling (`oracle/goldens/json-family-positional.json`), and a named
mechanism in DIVERGENCES.md's Smetana row-level table.

The A5-era note that this directory was empty because of a root `childCount`
mismatch is history: that structure was fixed, and the 8 pins above are
zero-diff on the ratchet path.

## Where this type's layout lives

**No layout of its own.** `src/diagrams/hcl/index.ts` parses with `parseHcl` and then imports `layoutJson`/`renderJson` directly. Every json layout change is transitively this type's.

## Why there is no DOT-parity file, and no AC3

(hyogr, 2026-11-15: the SVG survey does write `tests/oracle/svg-conformance/parity-hcl.json`
now, via `npm run svg:survey -- hcl --out …`. That file is a per-row SVG verdict report.
What this section explains is the absence of a DOT-equality gate.)

The sibling suites gate ratchet eligibility on a fixture already being
DOT-equal, so a residual SVG diff is attributable to SVG assembly rather than
layout. **That gate cannot exist here.** Upstream lays this family out through
`jsondiagram/SmetanaForJson.java` — in-process Smetana, never an external dot
process — so the jar writes no `svek-N.dot` to compare against. Verified by
experiment: running the pinned jar with `-DPLANTUML_DUMP_DOT=<dir>` over a
`@starthcl` diagram produces the SVG and no `.dot` file at all.

Consequence, worth stating plainly: a diff here could be layout OR assembly,
and nothing in the harness distinguishes them. That attribution has to come
from diagnosis. See mission A5's `decisions.md` ADR-3, and `svg-dot/README.md`
for the precedent of a ratchet with no parity file.

## Oracle note

Goldens are captured under `-DPLANTUML_DETERMINISTIC_TEXT=true` from the
pinned jar (`oracle/pin.json`, currently `1.2026.7beta11`). Captures made
before the pin advanced on 2026-08-07 carry AWT text metrics and the
pre-size-reduction SVG form (`#000000`, per-element font attributes) — if a
golden here shows those, it predates the pin and must be re-captured.

## Add rule

A fixture ratchets in when it renders zero-diff against its `golden.svg` under
`compareSvg(…, 'deterministic')`. Add its directory (`in.puml` +
`golden.svg`) and a `ratchet.json` row. Shrink-only: a pinned fixture never
comes back out.
