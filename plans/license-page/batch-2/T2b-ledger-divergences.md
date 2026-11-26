# T2b: ledger entries and `DIVERGENCES.md` (D7)

## Read first

- `oracle/accepted-divergences.json`: the `comment`, and the `authored-utility/cov-keygen` entry as the form.
- `tests/oracle/svg-conformance/emitter.golden.test.ts` (schema and survey-verdict gates) and
  `tests/architecture/divergences-ledger.test.ts` (heading uniqueness, entry shape).
- `DIVERGENCES.md` "Key tools and `testdot` describe plantuml-engine" (`:1441`) and "`version` page prints the port's
  own environment" (`:1433`), the neighbours of the new entry.

## Do

1. **Ledger.** One in-force entry per license row (three): `match.id` `authored-utility/<slug>`; `scope`
   `"authored utility rows (tests/fixtures/utility/, oracle/goldens/svg-utility/authored-baseline.json) -- the
   license page describes plantuml-engine (ruling 2026-11-12, #179)"`; `acceptedAt` `2026-11-12`; `acceptedBy`
   `user (ruling 2026-11-12, #179)`; a `reason` over 80 characters naming the ruling, T2a's measured diff count and
   weighted score, and the changed blocks. Insert as text after the last `authored-utility/*` entry, not through a
   JSON round-trip, so existing escapes stay byte-identical.
2. **`DIVERGENCES.md`.** One `###` entry after "Key tools and `testdot` describe plantuml-engine", headed
   "`license` page describes plantuml-engine". **Category:** kept by user ruling (2026-11-12, #179). For each of the
   seven items, quote the upstream line(s) it replaces with `License.java:<line>` and give the new text (a table is
   fine). Name the ELK outcome (D4, with the issue number if one was filed), the year question (D2), the credits
   position (D5) and the two "wording by Claude" lines. Name the signed slugs. Keep every heading unique.
3. Check `README.md` and `docs/` for a sentence that describes the license page (`grep -rn "license page\|licence
   page" README.md docs/`); fix any that is now untrue.
4. Run the ledger gates (README "Measurement commands"); read the count.

## Acceptance
- Given the ledger, when the schema gate runs, then the three new entries pass and no existing entry changed
  (`git diff` shows only insertions in `oracle/accepted-divergences.json`).
- Given `DIVERGENCES.md`, when the ledger-shape test runs, then it passes, and the new entry names each signed slug
  and quotes the upstream lines for all seven items.

Observability: N/A. Rollback: Reversible.
