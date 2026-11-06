# T3a — `<#transparent,...>` on a creole table is transparent

**Row:** `vakasu-51`, `svg/g[1]/g[3]/rect[2]/@fill` and six `line/@stroke`, ours `#FFF` with a `stroke-width`, jar `none` with neither. Source: `<#transparent,#transparent>|<color:...>**Legend **</color> |` (`C4.puml:1423`).

**Read:** `StripeTable.java:104-117` (`getColorOrWhite`), `HColorSet.java:58-63,78-92` (`parseColor` maps `transparent` and `background` to `HColors.none()`), `AtomTable.java`'s line and back drawing; `src/core/klimt/creole/legacy/StripeTable.ts:116-122,214-230`, `src/core/klimt/color/HColorSet.ts:125-140`.

**Mechanism:** `StripeTable.ts:122` validates with `parseSimpleColor`, the helper `HColorSet.java:91-93` calls after the keyword check, so `transparent` falls to `'white'`. Mirror `parseColor`, keyword branch included.

**Red:** authored oracle rows: `<#transparent,#transparent>`, `<#transparent,#red>`, `<#red,#transparent>`, a per-cell `<#transparent>`, and `background`. An oracle rendered in planning showed `fill="none" style="stroke:none;"` for the first form.

**Measure:** `c4`, then the full survey at batch close: every engine draws creole tables.

## Acceptance
- Given each authored row, when compared with its oracle, then 0 diffs.
- Given `vakasu-51`, then `rect[2]/@fill` and every `line/@stroke` under `g[3]` are gone.
- Given a table with a garbage colour, then it still falls to white (`HColorSet.java:60-61`).

Observability N/A. Rollback Reversible.
