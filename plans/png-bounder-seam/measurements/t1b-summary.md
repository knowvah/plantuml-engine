# T1b — seam #5 `--verify` re-capture (D7)

Seam-5 jar md5 `1e912cade94fbf96c06a22f4d44ef9b0` (`/tmp/pbs-jar/plantuml-seam5.jar`), reference `7066a3b4e28e696791a4bfc617efd85f`.
Full manifest, 16,783 targets, in 27 foreground `--only` chunks (`t1b-chunks.txt`, plus `test-results/dot-cache/unknown/**`
as chunk 00). `manifest-count.mts` over the chunk globs: `manifest=16783 covered=16783 uncovered=0 overlapping=0`.
`t1b-report.json` holds every non-SAME row (178), `t1b-movers.json` the classifier output.

## Counts

| Class | Rows |
|---|---|
| SAME | 16,605 |
| CHANGED / `rollback` | 8 (#170's eight rows, all `test-results/dot-cache/unknown`) |
| CHANGED / `wire-print` | 27 (`migaki-17-jori275` in dot-cache and `oracle/goldens/svg-wire`, 25 `tests/fixtures/wire/*.svg`) |
| CHANGED / `unexpected` | 22, all proven not seam-5 movers (below) |
| FAILED | 2 (`xobebi-29-jilu859`, dot-cache and `svg-sequence`) |
| not-a-jar-render | 119 (hand-made or noisy fixtures, skipped by the tool as at every re-capture) |

## Unexpected rows: re-rendered 3 times with the reference jar

None is SAME under the reference jar, so none is a seam-5 mover. T2a writes none of them.

- **Jar error pages, random per render (9):** `class/zuduxu-90-kosi876`, `mindmap/susipa-95-tedu015`,
  `salt/lakari-33-mone874`, `unknown/cazace-10-nebi625`, `unknown/rakidu-53-mopu785`, `unknown/rubebe-45-sura795`,
  `unknown/teoz-ng-001-10`, `wbs/ledama-83-xoko366`, `wbs/link-URL-tooltip-0`. Jar exit 200 every time; a seam-5 and a
  reference render differ from each other in the quote text and the PNG image of the error page.
- **Flow identity-hash order (11):** `dot-cache/unknown/bemixo-79-xulu250`, `oracle/goldens/svg-flow/unknown/bemixo-79-xulu250`,
  and 9 `tests/fixtures/flow/cov-*.svg`. The reference jar's set of differing flow fixtures changes from run to run
  (`.claude/memory/jar-identity-hash-nondeterminism.md`, flp D4).
- **Gantt `sakibi-88-zuci243` (2, dot-cache and `svg-gantt`):** CHANGED 3 of 3 under the reference jar, and a seam-5
  render is byte-identical to a reference render. Pre-existing drift of the committed bytes, not seam #5.

## FAILED

`xobebi-29-jilu859` writes two pages (`file4.svg`, `file4_001.svg`); `recapture-oracles.ts` reports "ambiguous SVG output"
for the reference jar too. Its source has no `<math>`, `<latex>` or `print`. Rendered by hand, both pages are
byte-identical between the seam-5 and the reference jar.

## Multi-page pages

23 `*_NNN.svg` pages sit beside a source. None of those sources has `<math>`, `<latex>` or a wire `print`.

## Sample diffs, committed svg against a seam-5 render (`/tmp/pbs-T1b/render`)

Element counts equal in every row; 0 text changes; 0 `<image>` payload changes.

- `cunotu-47-bute165`: canvas height, `image@y` ×14.
- `marese-34-xaro137`: canvas height, `image@y` ×6, `text@y` ×6.
- `pecafo-64-rili177`: canvas height, `image@y` ×21.
- `vocalo-20-dixu237`: canvas height, `image@y` ×28.
- `xanuke-94-tope429`: canvas height, `image@y` ×7.
- `kebadi-11-fula439`: canvas height, `image@y` ×23.
- `rozesu-56-suve592`: canvas height, `image@y` ×46.
- `roxita-24-tixu731`: canvas width and height, `image@y` ×2 (its rollback sets the canvas width).
- `migaki-17-jori275`: canvas height, `rect@y` ×4, `text@y` ×7, and the `Big_Chip` block's `rect@height`
  473.555 → 470: each `print` advances 10 instead of 11.777 (`WBlock.java:192`), and a block's size includes its cursor.
- `cov-print-multiline`: canvas height, `rect@y`, `text@y`.
- `cov-print-after-component`: canvas height, `rect@y`, `text@y` ×2.
- `cov-print-table`: canvas height and the table's own column `x`/row `y`: `SkinParam#sheet` caches one `Sheet` per
  `Display` (`SkinParam.java:1291-1303`, `CreoleParser.java:129-139`), so `AtomTable`'s memoized positions
  (`AtomTable.java:175`) come from the PNG bounder that measures first (wrp journal row 11). Still what the PNG bounder
  sizes.
