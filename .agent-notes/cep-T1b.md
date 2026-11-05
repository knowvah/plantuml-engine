## Observation: lint-staged leaves an eslint type-import fix unformatted
- **Context**: `npm run format:check` at cep batch 1 close failed on a file the pre-commit hook had just processed.
- **Finding**: lint-staged runs `prettier --write` and then `eslint --fix`. The `consistent-type-imports` autofix writes `import type { X} from` with no space before the brace, after prettier has run, so the hook can commit a file `prettier --check` rejects.
- **Impact**: A green commit hook does not imply a green `format:check`. Write split type imports by hand, or run `eslint --fix` then `prettier --write` before staging.
- **Confidence**: High
