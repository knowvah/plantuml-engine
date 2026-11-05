## Observation: stdlib sprites are compiled in the jar, verbatim in assets/stdlib
- **Context**: `biluko-70`'s filter id; seeds hash the TIM result list.
- **Finding**: The jar's `puml.spm` holds one reference line per sprite, so `BlockUml#data` differs from a TIM run over `assets/stdlib`. The compiled line names the folder a `link:` alias lands on: `<material/x>` gives `#material2.1.19#`. `-preproc` shows it.
- **Impact**: Any seed-bearing row with a stdlib sprite include. `dataLines` is the fold's only output; `lines` still holds the block, so a future row needing compiled `lines` needs D2 option C.
- **Confidence**: High (45/45 probes equal).

## Observation: oracle-render.sh needs an absolute out dir
- **Context**: Authoring fixtures with `scripts/oracle-render.sh tests/fixtures/x/oracle tests/fixtures/x/*.puml`.
- **Finding**: The jar resolves `-o` against each source's directory, so a relative out dir lands under the fixture dir, nested. It also leaves `svek-N.dot` files in the out dir.
- **Impact**: Pass `"$PWD/..."` and delete `svek-*` afterwards.
- **Confidence**: High.
