# vkt planning (issue #182, 2026-11-21)

## Observation: the oracle draws six version-family regexes, not five
- **Context**: rendering planning probes for #182's five commands with `scripts/oracle-render.sh`, one file per run.
- **Finding**: `keycheck abc123` (one argument, `PSystemVersionFactory.java:84-87`, upstream 3a4d1675141) draws the same page as `keycheck <sig> <key>`. Both end with `No valid license found. A named license is bound to the machine it was issued for.` (`PSystemKeycheck.java:71-72`), a line the issue body, written against an older pin, does not list.
- **Impact**: the issue's "five" counts commands. The port needs six regexes.
- **Confidence**: High (jar probes)

## Observation: the ledger's survey gate throws on an `svg-<type>` id with no survey file
- **Context**: choosing ledger ids for authored (non-corpus) utility rows.
- **Finding**: `emitter.golden.test.ts:150-155` maps every `svg-<type>/<slug>` id to `tests/oracle/svg-conformance/parity-<type>.json` and reads it with `readFileSync`. There is no `parity-utility.json`, so an `svg-utility/...` id would make the test throw. An id without the `svg-` prefix passes the schema test and is skipped by the verdict test.
- **Impact**: authored rows are ledgered as `authored-utility/<slug>` (vkt D6). Before this mission no ledger entry named a non-corpus row.
- **Confidence**: High (read the test)

## Observation: @knowvah/dot-engine 2.12.3 still exports no runtime version
- **Context**: #182 ruling 2 prints `<b>@knowvah/dot-engine</b> ""<version>""`.
- **Finding**: `dist/index.d.ts` exports no version string, and the `exports` map has no `./package.json`, as `ufp-T3d.md` found at 2.3.0.
- **Impact**: the version is a `src/core/version.ts` constant, drift-pinned by a test to the installed package (vkt D4).
- **Confidence**: High
