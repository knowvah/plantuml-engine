# T1c — the missing commands

Commit: `feat(description): port the commands the corpus refuses`.

## Context
Each is a *lead* from the ledger. Open the Java, then port the command as it stands.

| Row | Deciding line | Upstream |
|---|---|---|
| `rukitu-26` | `domain "Monitor" as M <<Machine>> {` | `CommandCreateDomain.java:74-85`, `DescriptionDiagramFactory.java:137`. No port. `requirement` is the same command |
| `sifagi-73` | `title Домашняя библиотека ...` | `CommandTitle.java:59-67`: `%pLN` admits Cyrillic; ours is `[\w.]` (`core/annotations/commands.ts:78,97`). Every engine reads this, so `verdict-diff` matters |
| `maxeme-36` | `note left of toto [[http://note]] {` | `CommandFactoryNoteOnEntity.java:122-146`, url slot `:142` |
| `ceboti-36` | `archimate #Technology VPN <<technology-device>> [` | bracket body of `CommandCreateElementMultilines`: read it and find why the colour or stereotype stops ours |
| `gacoxo-93`, `liripi-72` | `json JSON {`, `map "Mappings" as maps #acffa0 {` inside a group | jar draws them in `DESCRIPTION`. Find the factory's own json and map commands first |
| `sifagi-73`'s later lines, `rukitu-26`'s | whatever refuses next | same rule |

`json`, `map` and `archimate` bodies may reach a layout that does not exist on our side: if a row needs a whole entity image, it is T4's, or it follows D7.

## Rows
`rukitu-26`, `sifagi-73`, `maxeme-36`, `ceboti-36`, `gacoxo-93`, `liripi-72`.

## Acceptance
- Given each row, when rendered, then it draws, with `data-diagram-type` `DESCRIPTION`.
- Given `requirement "Requirements" as R {`, then it parses like `domain` (authored fixture, oracle by `scripts/oracle-render.sh`).
- Given a title of non-Latin letters in any engine, then it matches the jar, and `verdict-diff` reports 0 lost.

Observability: N/A — no new observable operations. Rollback: Reversible.
