# T4a, T4b, T4c — excuses that cite the Java

One commit per fragment: `test(oracle): record why <cohort> rows cannot route yet`.

## Context
`scripts/pin-corpus-tree.ts` refuses a row where the jar and our render disagree, or where we error on a
source the jar draws, unless a ledger row excuses it with `/\w+\.java:\d+/`. This records why each row
disagrees today. **Do not fix anything, and do not change `src/`.** This repo's rule: open the Java that
implements the behavior and read the method body. A reason you cannot quote is unfinished.

## Find the rows

```sh
npx jiti scripts/pin-corpus-tree.ts <bucket> --tree test-results/ogc-stage/<bucket> --ledger tests/oracle/svg-conformance/unknown-ledger --dry
```

`unpinned` is the count. `measurements/trial-rows.json` holds each row's `jarType`, `ourType`, `weErrored`,
`engine` and the line our page reports (`firstLine`). A fixture's source is `in.puml` beside it. Java lives
under `~/git/plantuml/src/main/java/net/`: grep there, not only `net/sourceforge/plantuml/`.

| Task | Rows (trial) | Mechanism to establish |
|---|---|---|
| T4a | activity with legacy `(*)`: 113. timing: 19 | Two engines not ported: `ActivityDiagramFactory` at `PSystemBuilder.java:137`, `TimingDiagramFactory` at `PSystemBuilder.java:187`. Quote the command that accepts the first refused line. Open -> #123, #127. |
| T4b | activity3: 15. class: 3. object: 1. sequence: 1 | Per row: the upstream command that accepts the refused line, as `File.java:line`. `robitu-34-vupe367` and `xugipu-29-fobo006` report engine `unknown`: read why. |
| T4c | unknown: 41 | 24 are jar error pages whose signature sits past the 4096-byte head window (add4 precedent, `PSystemError.java:217-218`): confirm by reading the full SVG, and say which of the 24 we also refuse. 17 are DESCRIPTION: as T4b. |

## Fragment shape

`tests/oracle/svg-conformance/unknown-ledger/ogc-T4{a,b,c}.json`, as `add4-T0b-activity.json`:

```json
{ "$comment": "...", "rows": [
  { "slug": "...", "cohort": "ogc-legacy-activity", "disposition": "known-misroute", "task": "ogc-T4a",
    "reason": "<what the jar does, File.java:line>; <what we do>. Open -> #123." } ] }
```

`disposition` is `known-misroute` or `known-gap`, never `fix-candidate` or `fixed`: the pin tool refuses the
first, and the second asserts a clean measurement. A slug in two fragments is a tool error.

A uniform mechanism may repeat its citation across rows, but the first refused line must be that row's own.

## Write-set
One fragment per task, as named above. Nothing else: no baseline, no `src/`.

## Read-set
[D5](../decisions.md), `tests/oracle/svg-conformance/unknown-ledger/add4-T0b-activity.json`,
`scripts/pin-corpus-tree.ts:70-130`, `measurements/trial-rows.json`.

## Interface contracts
Output to T5: fragments the pin tool merges by slug. After T4a–c, `--dry` reports `unpinned 0` for all 10
buckets.

## Acceptance
- Given all three fragments, when `--dry` runs per bucket, then every bucket reports `unpinned 0`.
- Given any row, then its `reason` matches `/\w+\.java:\d+/` and names a method you read, not only a factory.
- Given the fragments, then no row's disposition is `fix-candidate` or `fixed`.

Observability: N/A — no new observable operations. Rollback: Reversible.
