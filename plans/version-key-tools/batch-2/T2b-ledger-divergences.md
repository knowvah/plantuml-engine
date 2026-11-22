# T2b: ledger entries and `DIVERGENCES.md`

**Decisions:** D5, D6, D7.

## Read first

- `oracle/accepted-divergences.json` (`comment`, and the #143 entries as the form); `tests/oracle/svg-conformance/
  emitter.golden.test.ts:102-160` (schema and survey-verdict gates).
- `DIVERGENCES.md` "`version` page prints the port's own environment" and "`about`, `authors` and `version` credit
  the TypeScript port" (around `:1411-1417`), the neighbours of the new entry.

## Do

1. **Ledger.** One in-force entry per diverging authored row from T2a: `match.id` `authored-utility/<slug>`;
   `scope` `"authored utility rows (tests/fixtures/utility/, oracle/goldens/svg-utility/authored-baseline.json) --
   version-family pages adapted to plantuml-engine (ruling 2026-11-13, #182)"`; `acceptedAt` `2026-11-13`;
   `acceptedBy` `maintainer (ruling 2026-11-13, #182)`; a `reason` over 80 chars naming the ruling, the measured
   diff count and weighted score, and which D5 lines differ. Insert as text, not through a JSON round-trip, so the
   existing escapes stay byte-identical (vb journal row 6). No entry for a 0-diff row (D6).
2. **`DIVERGENCES.md`.** One `###` entry after "`about`, `authors` and `version` credit the TypeScript port":
   "Key tools and `testdot` describe plantuml-engine". Give the **Category** (kept by user ruling 2026-11-13, #182:
   rulings 1-4, quoted briefly), the six regexes (`PSystemVersionFactory.java:62-87`), each page's kept and replaced
   lines (D5, in prose or a short table), the unreachable branches (D3), the `DOT_ENGINE_VERSION` pin (D4), the
   `version`-page asymmetry (D7), and the ledgered rows by slug. Keep every heading unique
   (`tests/architecture/divergences-ledger.test.ts`).
3. Run `npx vitest run tests/oracle/svg-conformance/emitter.golden.test.ts tests/architecture/divergences-ledger.test.ts`;
   read the count.

## Acceptance
- Given the ledger, when the schema gate runs, then every new entry passes, and their count equals the number of
  nonzero authored rows from T2a.
- Given `DIVERGENCES.md`, when the ledger-shape test runs, then it passes, and the new entry names each signed slug.

Observability: N/A, no new observable operations. Rollback: Reversible.
