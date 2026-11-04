# T9 — record the counts

Commit: `docs(ogc): record the new rows and the issues that own them`.

## Task

Numbers come from `measurements/new-rows.md`, never from the trial table.

1. **Comment on each owner,** with `gh issue comment`: the cohort's counts, its conformant count to pin, and 4 example slugs. Say the
   rows are in the bucket's committed survey and the count supersedes the issue's dated evidence. Owners: #123, #121, #112, #115, #127,
   #113, #119 ([D8](../decisions.md)). Do not fix or re-plan them.
2. **File what has no owner,** with `gh issue create`, labels `parity`, `queue:ready`, and a `size:S` or `size:M` by row count. One each:
   sequence; class; dot; hcl and yaml together. A cohort with zero non-conformant rows gets no issue, but its conformant rows go on the
   next one written, so they get pinned. Follow the body shape of #112: Evidence, Start from, Method, Done when. For hcl and yaml, cite the
   Smetana ruling: record the delta, and match elements, labels, colours and structure.
3. **Keep #136 last:** add a `Blocked by #<N>.` line to #136's body for each new `queue:ready` issue, with `gh issue edit`. Read the body first.
4. **The rows that draw where the jar errors:** run each through `oracle/dist/release/plantuml-1.2026.8.jar` with no `-D` flags and `-stdrpt:1`,
   and record each exit status (`docs/svg-conformance.md:112-118`). File one issue, labels `parity`, `needs-ruling`, listing each row, its jar
   message and its release-jar result, asking the maintainer to sign or decline. Do not touch `oracle/accepted-divergences.json`.
5. `.agent-notes/ogc-T9.md`: the 9 covered rows whose cached source differs from the manifest (`colour`/`color` from `434e805dc`, a stray token),
   the 282 cache directories in no manifest (245 sequence, for example `SequenceArrows_0001_Test`), and the stray untracked
   `test-results/dot-cache/class/.serena/`. Factual entries only, in the template from `rules/memory.md`.

## Write-set
GitHub issues, `.agent-notes/ogc-T9.md`, `measurements/issues-filed.md` listing every comment and new issue URL.

## Read-set
[D8](../decisions.md), `measurements/new-rows.md`, `gh issue view 112`, `gh issue view 136`, `docs/svg-conformance.md:100-118`.

## Interface contracts
Input from T8: `measurements/new-rows.{json,md}`.

## Acceptance
- Given `new-rows.md`, then every cohort with a non-conformant row has a comment or an issue, listed in `issues-filed.md` with its URL.
- Given each new `queue:ready` issue, when `gh issue view 136` runs, then #136 names it in a `Blocked by` line.
- Given the draw-where-jar-errors rows, then one `needs-ruling` issue lists every one with its release-jar exit status, and
  `git diff <base> -- oracle/accepted-divergences.json` is empty.

Observability: N/A — no new observable operations. Rollback: Reversible (issues can be closed, comments deleted). These are outward-facing:
the queue's driver authorises them.
