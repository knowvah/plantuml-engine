## Observation: three of #109's four yaml rows are byte-identical copies of named rows
- **Context**: Planning #142 (hcl/yaml rows #109 captured), comparing the new yaml `-N` rows with existing cache rows.
- **Finding**: `YAML-list-key-value-pair-0` and `YAML-space-indent-0` equal the rows without `-0` in both `in.puml` and `in.svg`; `YAML-attribute-hierarchy-1` equals `yaml/vaceci-80-lezo436` in both; `YAML-attribute-hierarchy-0` shares `in.svg` with `YAML-attribute-hierarchy`, whose `in.puml` holds two blocks (the cache keeps the first block's oracle).
- **Impact**: `classify-corpus.ts`'s per-block split re-files already-diagnosed rows under new slugs. A "new row" count from #109 can include oracle twins; `cmp` against the same bucket before planning a diagnosis.
- **Confidence**: High

## Observation: pinning a json-family row forces its positional entry out
- **Context**: Planning the pin of 7 zero-diff hcl rows.
- **Finding**: `json-family-positional.test.ts:41-46` fails on any `json-family-positional.json` row that a golden ratchet (`svg-<type>/ratchet.json`) lists, so a pin must drop the row's all-zero positional entry in the same commit. `json-family-ratchet.ts` has no count guard of its own.
- **Impact**: A json/yaml/hcl pin task writes four files (ratchet, two baselines, positional pin), not three.
- **Confidence**: High
