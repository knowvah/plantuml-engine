# T3b — Multi-colour `-[#a;#b]->`, `colorArrowSeparationSpace`, coloured `inc`/`out` labels

**State at planning:** 17 corpus rows, Σ 2,920. Every one uses a multi-colour arrow, most with
`skinparam colorArrowSeparationSpace N`.

| Row | Diffs | Source |
|---|---|---|
| `pegimu-03-duli081`, `temeku-00-noga270` | 28 each | `-[#red;#blue;#green;#orange]-> label;` between two boxes (with and without `colorArrowSeparationSpace 3`); width 85 / 100 and 85 / 91 |
| `gefomi-83-fifi398`, `surefo-98-fata672` | 40, 45 | `-[#green;#red]->` ending a fork or split branch |
| `lokulo-09-coko477` | 41 | `-[#green;#maroon,dashed]->` into a partition holding only a note |
| `sizoce-41-muvu721` | 87 | `-[#red;#blue]->` across swimlanes with notes ("order becomes blue then red") |
| `furutu-44-daxu731`, `zikebe-71-cuge624` | 96 each | rainbows with `dashed`/`dotted`/`bold` into `if` branches |
| `fuximi-08-dovo257` | 100 | `repeat while(a)is(b) -[#red;#blue,dashed]->` |
| `kicofo-41-fazi136` | 165 | rainbows into and out of `if`/`elseif` |
| `nomimi-19`, `zujopo-40` | 221 each | rainbows into a `!definelong` partition holding a note |
| `jofaru-38`, `lagive-89` | 309 each | a four-line label on a four-colour arrow, then branches |
| `dukocu-46-mibo641` | 312 | five colours into an `if` with an empty branch |
| `didixe-34`, `suniro-51` | 411 each | rainbows through nested `if`s and a `!definelong` partition |

**Read (leads):** `decoration/Rainbow.java` (`build`, `getColors`, `getColorArrowSeparationSpace`), where the
separation space reaches the drawing (`Snake.java`, `Worm.java`, and grep `getColorArrowSeparationSpace` under
`src/main/java/net/`), and how a rainbow's width is counted in a tile's dimension (if it is: `pegimu-03`'s canvas
grows 15 px with the space at 3). Ours: how a multi-colour arrow is parsed and drawn (`docs/catalog.md`).

**Do:** red with `temeku-00` (no separation space), then `pegimu-03` (space 3). The rest compose those two with
branches, so re-read them after.

**Measure:** the 17 rows; activity survey; every bucket whose corpus uses `colorArrowSeparationSpace`, if the seam is
shared (grep the corpus).

## Acceptance
- Given `temeku-00` and `pegimu-03`, then each is conformant and pinned.
- Given the other 15 rows, then each is conformant and pinned, or journaled with its remaining mechanism and owner.
- Given the surveys, then 0 lost.

Observability N/A. Rollback Reversible.
