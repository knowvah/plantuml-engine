# T1a: the byte gates

**Writes:** `tests/oracle/svg-conformance/class.golden.ratchet.test.ts`, `object.golden.ratchet.test.ts`, a shared
`svgComments` helper in `tests/oracle/svg-conformance/` (new file, or an existing module if one fits),
`oracle/goldens/svg-class/comment-open.json`, `oracle/goldens/svg-object/comment-open.json`,
`tests/fixtures/class-comment-bytes/*.{puml,svg}`, `tests/oracle/svg-conformance/class-comment-bytes.authored.test.ts`.
**Reads:** D4 in `decisions.md`, `emoji-edge-artwork.authored.test.ts` (the `ZERO`/`OPEN` model),
`plans/class-comment-bytes/measurements/measure-ccb.mts` (the multiset count the gates must agree with).

## Steps

1. Write `svgComments(svg): string[]` and `commentMismatch(ours, jar): number` (multiset difference size, plus 1 when
   the multisets agree and the order does not). Unit-test both on literal strings.
2. In each ratchet `it`, after `compareSvg`, assert on the same `ours` string:
   - not in the open list: `svgComments(ours)` equals `svgComments(golden)`;
   - in the open list: `commentMismatch` ≤ the recorded count, and > 0 (a fixed row must leave the list).
   Do not render twice. A failure message names the slug and the first differing comment.
3. Seed both `comment-open.json` files from `measure-ccb.mts`'s JSON at T0: one entry per differing pin,
   `{ slug, tree?, count, reason }`, with `reason` `"D1"`, `"D2"` or `"D3"` from the measurer's bucket
   (`C-ours-extra` → D1, `A-hidden` → D2, `B-name` → D3). Any other bucket means a mechanism planning did not see:
   journal it and read the Java before you label it.
4. `git mv` the 7 probes from `plans/class-comment-bytes/measurements/probes/` to `tests/fixtures/class-comment-bytes/`
   with their `.svg` beside them. Re-render each oracle with `scripts/oracle-render.sh <abs dir> <puml...>`, delete the
   `svek-N.dot` files, and confirm `git diff --stat` shows no SVG change.
5. Write the authored gate. It renders with `renderClassFixture(…, censusClassFixtureOptions())`. Rows are the `.puml`
   files on disk plus `tests/fixtures/c4dd-T2c/class-namespace-separator-comment.puml` (oracle in its `oracle/`).
   `ZERO`: `remove-class`. `OPEN` with a reason: every other row at its T0 count. A file with no entry fails, and so
   does an entry with no file.
6. Run both ratchets and the gate alone and read the counts.

## Acceptance
- Given the base `src/`, when both ratchets run, then every pin passes: 1080 by equality, 154 by never-rises.
- Given a pin's golden with one comment edited in memory, when its assertion runs, then it fails naming the slug.
- Given an open-list row whose comments now match, when it runs, then it fails saying to remove the entry.

Observability is N/A. Rollback is Reversible.
