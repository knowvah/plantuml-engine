# T1: the object-colour-refusal authored gate

**Writes:** `tests/fixtures/object-colour-refusal/<slug>.{puml,svg}`: 31 rows, copied from
`plans/object-colour-refusal/measurements/probes/`, with each `jar/<slug>.svg` placed beside its `.puml`. Also
`tests/oracle/svg-conformance/object-colour-refusal.authored.test.ts`.
**Reads:** `class-oneline-body.authored.test.ts` (the whole shape), decisions.md D5, `README.md` starting-state table.

## What the gate holds

Row lists, whose union is exactly the `.puml` files on disk, each listed once:

- `ZERO`: the seven `ocr-ctl-*` rows other than `ocr-ctl-transparent`. Each has 0 diffs and 0 comment mismatches.
- `ERROR_PAGE`: rows that pass D5 items 1 to 5. At T1 that is `ocr-dup-and-colour` only. Confirm it passes. If it does
  not, put it in `OPEN` with its true reason and journal it.
- `OPEN`: every other row. Each entry has `maxDiffs` (today's count, from `plan-baseline.txt`), a `reason` that is true
  today, and the jar's `{ label, line, welcome }` read from its `.svg`. Extra fields:
  - `welcome: false` rows also carry `issue283: true`. Once ours is an error page, the gate asserts D5 items 1 to 4
    for them (D5, "Rows with no Welcome block").
  - `ocr-unknown-bare` has `drawn: true`. The gate asserts it is **not** an error page and that its svg contains
    `fill="#D3D3D3"`. Reason: the 2026-11-04 neutral ruling (DIVERGENCES.md "We draw where the jar errors").
  - `ocr-ctl-transparent`: reason "separable (D6): `#transparent` fills `#000`, also on `class C #transparent`; filed
    at exit".

Reasons at T1:
- For object rows: "port draws: `class-object-commands.ts:241/260` stores the capture, and
  `parseDeclarationColors` accepts `line:` (jar: `CommandCreateEntityObject.java:145-147` throws)".
- For json rows: the same, at `CommandCreateJson.ts:370-397`.
- For the two dup rows: "refused at the opener line (D4, M3)".

The manifest test also asserts these:
- every `ERROR_PAGE`/`OPEN` error row's jar svg contains its label;
- every `ZERO` jar svg contains no `No such color`;
- every row's `.svg` exists.

For each error row, the stock and release checks are already in `measurements/jar-error-check.txt`. Rerun them only for
rows you add.

## Acceptance
- Given the fixtures dir, when the manifest test runs, then the lists' union equals the `.puml` files and every row has
  its jar `.svg`.
- Given the base tree, when the gate runs, then it is green: `ZERO` rows at 0, `ocr-dup-and-colour` passing D5,
  `ocr-unknown-bare` drawn neutral, and each `OPEN` row at or under its `maxDiffs`.
- Given a deliberately broken D5 check (for example, a wrong expected line), when the gate runs locally, then a row
  fails. Revert that before you commit, and journal that the check bites.

Observability: N/A. Rollback: Reversible. Commit: `test(object): add the object-colour-refusal authored gate`, footer
`Refs: #190`.
