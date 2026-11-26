# T2b: sibling over-accepts

**Writes:** the authored gate, new fixtures under push-forward, GitHub issues. `src/` only under push-forward.
**Reads:** D4, `src/diagrams/description/parse-helpers.ts:395-414`, `command-table-containers.ts:160-250`,
`class-declaration-extractors.ts:387-500`, `CommandCreateElementFull.java:83-132`,
`CommandCreateClassMultilines.java:92-94`, `NameAndCodeParser.java:40-70`.

## Steps

1. For each OPEN row left after T2 (expected: `ocb-interface`, `ocb-entity`, `ocb-circle`, `ocb-unclosed`), find the
   command that claims the line. Use temporary tracing and remove it before you commit. Quote ours and upstream's
   `file:line`.
2. Confirm that the description sibling reproduces with no class keyword: author `ocb-desc-circle-alone`
   (`circle Z { a }` under `@startuml` with a description-only line before it, such as `[C1]`). Give it an oracle and
   a stock check.
3. Decide per mechanism (push-forward rule): fix it in-mission if the change is under ~20 lines, has a `file:line`
   origin, and verdict-diff shows 0 rows moved. Otherwise file a `queue:ready` issue:
   - Title: `Description: KEYWORD_RE accepts a brace tail that CommandCreateElementFull refuses` /
     `Class: parseIdDisplay's bareword fallback accepts a code upstream's CODE refuses`.
   - Body: repro, jar and port output, mechanism with `file:line`, and the gate row names.
   - Use `gh issue create --label queue:ready --label parity --body-file <file>`.
4. Give each still-OPEN row a reason that names the issue number. Author the push-forward probes from the README as
   time allows, each joining the gate.

## Acceptance
- Given every OPEN row, then its reason names a mechanism with `file:line` and an issue number, or the row moved to
  `ERROR_PAGE`.
- Given any in-mission fix, then verdict-diff over every engine reports 0 lost and the journal holds its `file:line`.

Observability N/A. Rollback Reversible. Commit (only if files changed): `test(class): pin the one-line body sibling
rows`, footer `Refs: #223`.
