# T4e: `{{json}}` and `{{yaml}}` embeds

**Rows:** `juxugu-89-beki062`, `mocatu-19-jivi646`, `vanadi-41-geru001`.

- `juxugu` and `mocatu`: `label l [ {{json { "<color:D4312C>0x00": "<color:D4312C>string：+0个字符 …" , … } }} ]`, with
  CJK text and colour creole in keys and values. The embedded image is 690 wide in ours and 484 in the jar's (656 / 452
  for `mocatu`). Height matches.
- `vanadi`: `node n [ {{yaml !theme amiga / title hello / … }} ]`. The page is 1 px wider.

## Lead (verify before acting)

The embedded document's size is the nested `UImageSvg` (oracle seam #3, `EmbeddedDiagram.java:129-133`). So measure the
nested json document alone: render the inner `@startjson` through our json engine and compare its width with the jar's
(`scripts/oracle-render.sh` on the inner source). If the inner document already differs, the gap is in the json
engine, not the embed. If the inner document matches, read how the class embed path takes its size. For `vanadi`,
check whether `!theme amiga` inside the embed reaches the yaml engine.

`JsonDiagram` is a Smetana path (CLAUDE.md), so the inner json/yaml **node positions** fall under the settled
Smetana ruling (`DIVERGENCES.md:17`). But these embeds are each a single node with no edges, so their size comes from
text measurement, which is a target: 690 / 484 is not Smetana arithmetic. A residue that is only Smetana node
placement can be added to that existing divergence, citing the row (D4). Anything else is fixed here.

## Acceptance
- Given each row, when it is measured, then `n=0`.
- Given a unit test in `tests/unit/class/cogr-T4e.test.ts`, then the embedded image's `width`/`height` match the
  oracle.

Observability is N/A. Rollback is Reversible.
