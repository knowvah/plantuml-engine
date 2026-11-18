## Observation: DIVERGENCES.md carries its General/Output format sections three times
- **Context**: Planning #155 (version-builtin), reading DIVERGENCES.md for the TIM section.
- **Finding**: `## General` appears at lines 15, 492 and 864, and `## Output format` at 470, 841 and 1213. The copies are not identical: the first has text the second lacks (for example the `@startgit` SmetanaForGit sizing sentence, around line 29). It looks like a bad merge or a regeneration that appended instead of replacing.
- **Impact**: An edit to one copy leaves the other two stale, and a grep for a heading lands on whichever copy comes first. This needs its own cleanup PR; version-builtin doesn't touch these sections.
- **Confidence**: High (line numbers from `grep -n "^## " DIVERGENCES.md` on `c84de6c60`)

## Observation: the #155 ruling is in the issue body, not a comment
- **Context**: Selecting `next` for unattended planning.
- **Finding**: The maintainer edits the ruling into the issue body (`[sseely] …`) and swaps `needs-ruling` for `queue:ready`. The issue has no comments. A title that starts "Ruling:" doesn't mean a ruling is still pending.
- **Impact**: Before parking a "Ruling:" issue, read the body and the label history (`gh api …/issues/N/timeline`).
- **Confidence**: High
