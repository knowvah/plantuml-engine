# Batch 2: refuse the inline body, triage siblings

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T2](T2-decline.md) | Gate declines a non-empty brace tail; `extractBody` keeps upstream's two forms; drop `inlineMembers` | orchestrator or `typescript-pro` | class declaration files, 2 unit tests, a new unit test, the gate | T1 | [x] |
| [T2b](T2b-siblings.md) | Trace the description and bareword siblings; fix under push-forward or file | orchestrator | the gate, fixtures, issues | T2 | [x] |

Serial: T2b measures the tree that T2 leaves. Close with the task contract's "Batch close". The verdict-diff over
**every** engine matters here, because D1 can move engine selection.
