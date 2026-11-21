# Squash

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T7 | Collapse the mission into one commit on the base | orchestrator | branch history | T6 | [x] |

## T7

`<base>` is the mission base sha named in the execution prompt.

1. Record each batch's close sha in the journal, then run `git tag playground-stdlib/pre-squash`.
2. Build one commit with `git commit-tree` from the final tree, with `<base>` as its only parent. Move the branch to it
   with `git merge --ff-only` or `git reset --soft`. Never `rebase -r`.
3. Verify that `git diff playground-stdlib/pre-squash HEAD` is empty and `git rev-list --count <base>..HEAD` prints 1.
4. Write the message in Conventional Commits, lines ≤80, for example
   `feat(docs): resolve stdlib includes in the playground`.
   - The body explains why: the playground called `renderSync` with no include store, so every `<bundle/…>` include
     errored. It now registers the packaged bundles lazily, and self-hosts the remote assets with their licences. The
     legacy `aws` v1 bundle in the issue's repro waits on the filed ruling. Name the follow-ons.
   - The footer says `Refs: #172`, not `Closes`: the issue closes when the branch merges.
   - End with the harness's `Co-Authored-By` trailer.
5. Leave the commit unsigned, and do not push. Keep `commit.gpgsign` as it is.

## Acceptance
- Given the squash, then `git diff playground-stdlib/pre-squash HEAD` is empty, and exactly one commit sits on `<base>`.

Observability is N/A. Rollback is Reversible (`playground-stdlib/pre-squash`).
