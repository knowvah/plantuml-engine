# Squash

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T5 | Collapse the mission into one commit on the base | orchestrator | branch history | T4 | [x] |

## T5

`<base>` is the mission base sha named in the execution prompt.

1. Record each batch's close sha in the journal, then run `git tag hcl-yaml-oracle-gap-rows/pre-squash`.
2. Build one commit with `git commit-tree` from the final tree, with `<base>` as its only parent. Move the branch to it
   with `git merge --ff-only` or `git reset --soft`. Never `rebase -r`.
3. Verify that `git diff hcl-yaml-oracle-gap-rows/pre-squash HEAD` is empty, and that
   `git rev-list --count <base>..HEAD` prints 1.
4. Write the message in Conventional Commits, with lines ≤80, for example
   `test(hcl): pin the 7 #109 hcl rows and name the smetana delta`.
   - The body explains why: #109 captured oracles no gate held; the 9 open rows are Smetana paths, named under the
     2026-08-09 ruling after the jfp D3 proof (or T2a/T2b's fix, in one line).
   - The footer says `Refs: #142`, not `Closes`, because the issue closes when the branch merges.
   - End with the harness's `Co-Authored-By` trailer.
5. Leave the commit unsigned, and do not push. The user reviews the branch, signs all its commits together, and pushes.
   Keep `commit.gpgsign` as it is, for the next mission.

## Acceptance
- Given the squash, then `git diff hcl-yaml-oracle-gap-rows/pre-squash HEAD` is empty, and exactly one commit sits on
  `<base>`.

Observability is N/A: there are no new observable operations. Rollback is Reversible
(`hcl-yaml-oracle-gap-rows/pre-squash`).
