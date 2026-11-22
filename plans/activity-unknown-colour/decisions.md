# Decisions (auc)

## Auto-confirmed (unattended)

Planned without a person present (`/plan-mission --unattended next`, 2026-11-22). Each decision lists what was
rejected and the evidence, so the user can audit it.

### D1: Keep drawing, and paint the #143 neutral at every activity `getColor` site where the jar errors

**Decision.** At each activity site where the jar calls the throwing `HColorSet#getColor` (`HColorSet.java:69-76`) and
errors with `No such color`, resolve the token with `colorOrNeutral` (`src/core/klimt/color/HColorSet.ts:375`): the
token itself when the jar accepts it, else `UNKNOWN_COLOR_NEUTRAL` (`#D3D3D3`). Resolvable tokens are untouched.

**Evidence.**
- The maintainer ruled on 2026-11-04 (#143) that an unknown bare colour where the jar errors paints neutral grey, and
  signed `unknown/duluve-89-mati167`, which is this very mechanism (`-[#toto]->` in activity), as "jar errors, we draw".
- The #152 ruling (2026-11-05) mirrored the jar for duplicate `map`/`object`, and said in the same comment: "The colour
  probes listed above stay as they are: an unknown colour keeps painting neutral grey under #143. This ruling covers
  duplicates only."
- `DIVERGENCES.md` ("We draw where the jar errors", the paragraph on unknown bare colours) states the policy.
- The issue's own text: "If we draw, #143's neutral (`colorOrNeutral`, `HColorSet.ts`) is the colour for a `getColor`
  site, not the default."
- Activity already does this at three sites: `activity-scoped-colors.ts:26-27` (partition, `CommandPartition3`),
  `dispatch-stereogroup.ts:84-85,102`, and the circle spot (`act-circlespot` paints neutral today).
- The stock jar and release v1.2026.8 both error on all 17 rows (measured at planning).

**Rejected.**
- *Error as the jar does (mirror).* That is the project's default where no ruling exists, but here one does: #152
  carved unknown colours out of its mirror ruling. It would also retire the signed `duluve-89` entry, and the ledger is
  the maintainer's to change (#152: "`oracle/accepted-divergences.json` is yours to change"; #165 to #167 retirements
  were each confirmed by the maintainer). Reversal cost if the maintainer prefers it: one `throw new
  NoSuchColorException()` per parse site, caught into `refuse('execution', …, 'No such color', 10)`
  (`CommandExecutionResult.badColor()` scores 10, `CommandExecutionResult.ts:76-78`).
- *Keep the default colour.* It reads as "a valid arrow", which hides the error, and it is not what #143 rules for a
  `getColor` site.
- *Park as `needs-ruling`.* The question the issue asks is already answered by #143 and #152 for colours; parking
  would ask the maintainer to repeat a ruling.

### D2: Fix at the port of the upstream site, with the existing helper

| Site | Upstream | Ours |
|---|---|---|
| Arrow colour, every `Rainbow.build` caller and `link #c` | `HtmlColorAndStyle.java:95-104` (`set.getColor(s)` at `:100`); `CommandLink3.java:84` | `activity-rainbow.ts#memberLook`, the loop that ports `HtmlColorAndStyle.build`; `link #c` lowers to the same node (`dispatch-common-commands.ts#tryLink3`) |
| Swimlane colour | `CommandSwimlane.java:98`, `CommandSwimlane2.java:105` | `dispatch-support.ts#setCurrentSwimlane` (`ctx.swimlaneColors`), read by `layout/assign-coordinates-full.ts:296` |
| Note colour | `Colors.java:101-103` via `CommandNote3.java:127`, `CommandNoteLong3.java:129` | `note-dispatch.ts#noteColorSpread` (raw token today) |

Each site keeps the colour it stores today for a resolvable token, so resolvable output is byte-identical. Where our
port resolves later than upstream (the arrow at render time), the fix goes where our port does the resolving.

**Rejected.**
- *A sanitiser at SVG emission.* It cannot tell a `getColor` site from a `getColorOrNull` one, and it hides the
  mechanism from every test (ucol D2).
- *Move arrow resolution to parse time by porting `Rainbow`/`HtmlColorAndStyle` as classes.* The most literal mirror,
  but it re-plumbs every activity edge colour. CLAUDE.md: "Do not refactor while porting."

### D3: Hold the rows in the existing authored gate, with a `NEUTRAL` kind

- The 30 probes move to `tests/fixtures/unresolved-colour/act-*.puml` + `.svg`, held by
  `tests/oracle/svg-conformance/unresolved-colour.authored.test.ts`. Its manifest test already requires the rows to be
  exactly the files on disk.
- 13 rows join `ZERO` (0 diffs, no invalid colour on either side).
- 17 rows go in a new `NEUTRAL: Record<string, { jar: string; pending?: string }>`. Each asserts:
  1. the jar `.svg` is an error page carrying `jar` (`No such color`, or `Syntax Error?` for `act-partition-back`);
  2. ours is not an error page (`setErrorPageObserver`, `src/core/error/error-renderer.ts:45`; reset after each row);
  3. `invalidColours(ours)` is `[]`;
  4. ours contains `UNKNOWN_COLOR_NEUTRAL`, imported, never retyped.
  A row with `pending: '<task id>'` inverts (3)-(4) together: it must still lack the neutral, so a stale flag fails.
  Each task removes the flag from the rows it lands.
- No diff count is asserted for `NEUTRAL` rows: the jar's error page is not compared (2026-10-10 ruling).

**Rejected.** *A new authored test file.* The rows are the same question as ucol's (what an unresolved colour paints),
and the existing gate already owns `invalidColours` and the fixture folder.

### D4: Scope is the 17 jar-error rows and 13 guards; one finding is separable

- **In:** the README table.
- **Separable, filed at exit:** `swimlane L1` (and `swimlane L1 #red`, `swimlane L1 #zzblue`): the jar draws, we draw
  an error page, with or without a colour (21 diffs). That is `CommandSwimlane2` routing, not colour resolution.
- **Not added:** `if (x?) then (yes) #zzblue`, where both sides error (conformant under the 2026-10-10 rule, and not a
  colour site).
- **Not measured:** release v1.2026.10, the latest GitHub release (published 2026-11-11). The planning session's
  download was refused. Under D1 we draw, so the release check matters only for signing, which is the maintainer's;
  v1.2026.8 errors on all 17 and the stock jar agrees. Do not try to download a jar during execution: T3 records the
  gap in the #189 comment.

### D5: No ledger change; `DIVERGENCES.md` gains the activity sites

- `oracle/accepted-divergences.json` does not change (stop 5). `duluve-89-mati167` stays signed and `diverged`; its two
  arrows go from `#181818` to `#D3D3D3`. Its entry ("jar errors, we draw") stays true. T3's issue comment names the
  colour change so the maintainer sees it at signing.
- `DIVERGENCES.md`'s paragraph on unknown bare colours lists `Colors.java:103` and `StereotypeDecoration.java:163`.
  T3 adds the activity sites (`HtmlColorAndStyle.java:100`, `CommandLink3.java:84`, `CommandSwimlane.java:98`,
  `CommandSwimlane2.java:105`). No new divergence class: this is the existing one, at more sites.

### D6: The public d.ts does not move

Every touched module is internal. T0 snapshots `dist/*.d.ts`, and T3 diffs them. Any change is stop 5.

## Operational readiness

- **Observability:** N/A. A browser-safe pure library with no service, SLIs or traces. The gates are the monitors.
- **Rollback:** Reversible. Revert the squash commit; the `pre-squash` tag keeps the per-task history.
- **Scalability:** N/A. One `parseColor` call per colour token, as today.
- **On-call:** N/A (library). The failure mode is a resolvable colour changing, caught by the `ZERO` rows, the activity
  ratchets and `verdict-diff.mjs`.
- **Backwards compatibility:** no API, d.ts or data contract changes (D6). Only the SVG for unresolvable activity
  tokens changes: default or raw → `#D3D3D3`.
- **Irreversible changes:** none.
