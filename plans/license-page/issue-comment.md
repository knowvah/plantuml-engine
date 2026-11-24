## Landed on `feature/parity-queue` (unpushed, for review and signing)

Mission `plans/license-page/`, from base `7f7e14cbe`. The mission is squashed into one commit on that base, and the per-task history is kept under the tag `license-page/pre-squash` (T1 `50bf68248` and `4e899040e`, T2a `8b52f6e92`, T2b `338e8e32c`).

The page prints your text through upstream's `header1` / `header2` / `end3` / `addMit`, in upstream's order (`src/diagrams/version/License.ts`). The Professional Edition branch and the statistics branch (still off) are unchanged.

| # | Item | What the page prints now |
|---|---|---|
| 1 | Header and copyright (`License.java:117`, `:133`, `:135`) | your header block, verbatim: the blank and rule lines stay upstream's `" "` / `"| "` |
| 2 | Donation lines (`:139-151`) | dropped, QR row included. `header2` keeps upstream's `(text, licenseInfo, withQrcode)` signature with the last two parameters unused |
| 3 | MIT first line (`:243`) | `plantuml-engine is free software; …`, and the rest of the MIT text is unchanged |
| 4 | Advertising paragraph (`:191-196`) | dropped, with its blank line |
| 5 | Images paragraph (`:199-206`) | `Images (SVG) …`, plus the two lines you marked "wording by Claude". The exception paragraph is unchanged |
| 6 | GraphViz lines (`:218-225`) | your three lines. `LicenseBuild.isThereArchive` and the `ARCHIVE` / `IGY` tables are removed |
| 7 | Credits (`:227-236`) | upstream's kept lines in upstream's order, without CafeUndZopfli and Brotli, with KaTeX, pako and xmldom added after Twemoji |

The page is now 581 × 767 (63 lines, no image). The GPL jar's page is 518 × 842.

**ELK credit:** left out under your condition. `package.json` still depends on `"elkjs": "0.12.1"`, nothing depends on `@knowvah/elk-engine`, and #265 is open. Filed as **#282** (`needs-ruling`): credit elkjs now, or wait for #265.

**Rows:** `cov-license`, `cov-licence` and `cov-license-upper` were 87 diffs / weighted 145. They now measure 159 / 188 and are signed in `oracle/accepted-divergences.json` against this ruling. `DIVERGENCES.md` has the entry "`license` page describes plantuml-engine", which quotes the upstream lines each item replaces. No other row's verdict moved: `verdict-diff.mjs 7f7e14cbe` reports 0 lost in every engine. `cov-refuse-license` (the error page) is unchanged.

## Questions for you

1. **Copyright year.** The page prints your `Ported from PlantUML, (C) Copyright 2009-2024, Arnaud Roques`. The pinned jar prints `2009-2027` (`License.java:133`). Keep 2024 or match the jar?
2. **Position of the added credits.** Your ruling gives no position, so KaTeX, pako and xmldom (and later the ELK line) follow Twemoji, before the closing blank. Is that right?
3. **Themes line.** It still credits only Brett Schwarz. All 22 of his themes are among the 35 that core ships (`NOTICE`), so it credits nothing we don't ship. It does not credit the other core-theme authors (Drakemor, KingPlus-lang, future-architect, The-Lum). Should it?
4. **Wording by Claude.** As you flagged, the two images-paragraph lines and the three added credit lines are Claude's wording and still yours to change.

This issue stays open until the branch merges.
