# T1a — `:Name: as Code`, `(Name)/ as (Code)`, `:Name:/ <<a>> ... <<b>> #c`

Commit: `fix(description): accept the full element forms`.

## Context
`CommandCreateElementFull` (*lead*: `descdiagram/command/CommandCreateElementFull.java:83-115`, DISPLAY2 branch `:89-94`, CODE and DISPLAY patterns `:126,130`, STEREOTYPE `:110`, registered `DescriptionDiagramFactory.java:121`) takes a keyword-less `:display:` or `(display)` head with `as`. Our shorthand takes only decorations after `:Name:` (`command-table-shorthand.ts:36`, `SHORTHAND_TRAILER` in `command-table-helpers.ts:18`), so these lines fall to `Syntax Error?` (`parser.ts:340`) and the source falls through to activity3 or the error page.

Mirror the Java's regex as one command, not one more shorthand arm. `corevo-13` is the odd one: the lazy `(\<\<.+?\>\>)` (`StereotypePattern.java:67`) extends to the last `>>`, so the whole line is ONE element and `CommandLinkElement` does not match. Do not "fix" that.

## Rows
`gugapu-35`, `tipado-10`, `corevo-13` (we draw activity), `mideva-42`, `popufa-55`, `vajeje-58`, `zisuvu-18`, `virobu-13` (error page).

## Acceptance
- Given `zisuvu-18`, when rendered, then `data-diagram-type` is `DESCRIPTION` and no `Syntax Error?` appears.
- Given `corevo-13`, then the jar's one element is drawn, with no link.
- Given the routing gate after the flip, then these rows are `agree`, and no `agree` row moved.

Observability: N/A — no new observable operations. Rollback: Reversible.
