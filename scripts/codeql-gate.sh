#!/usr/bin/env bash
# Local CodeQL gate: run before opening or updating a pull request.
#
# Runs the same analysis as the repository's GitHub code-scanning default
# setup (CodeQL default query suite; languages actions, java-kotlin,
# javascript-typescript, python) over the committed HEAD, then fails on any
# result GitHub has not already dismissed.
#
# Dismissed alerts are matched by (rule id, path) count: a file may carry as
# many results of a rule as it has dismissed alerts for that rule. GitHub's
# own matching uses line fingerprints the alerts API does not return, so a
# new result that replaces a dismissed one of the same rule in the same file
# passes here; the PR's own code-scanning run is the backstop for that case.
#
# Usage: npm run codeql            (all four languages)
#        npm run codeql -- python  (named languages only)
# Needs: codeql CLI, gh (authenticated), jq.
set -euo pipefail

LANGUAGES=(javascript-typescript python actions java-kotlin)
[ $# -gt 0 ] && LANGUAGES=("$@")

for tool in codeql gh jq; do
  command -v "$tool" >/dev/null || { echo "codeql-gate: $tool not found" >&2; exit 2; }
done

root=$(git rev-parse --show-toplevel)
work="$root/test-results/codeql"
src="$work/src"
threads="${CODEQL_THREADS:-4}"

if [ -n "$(git -C "$root" status --porcelain --untracked-files=no)" ]; then
  echo "codeql-gate: uncommitted changes are not analysed; HEAD is" >&2
fi

# The committed tree only, without the corpus, oracle and survey data that no
# extractor reads. The JavaScript extractor takes only config JSON
# (package.json, tsconfig; the largest is 4 KB); the JSON over 1 MB is survey
# output under plans/, 4.6 GB of it.
rm -rf "$src" && mkdir -p "$src"
git -C "$root" archive HEAD -- . \
  ':(exclude,glob)**/*.svg' ':(exclude,glob)**/*.puml' \
  ':(exclude,glob)**/*.dot' ':(exclude,glob)**/*.txt' \
  ':(exclude,glob)**/*.log' ':(exclude,glob)**/*.done' \
  ':(exclude,glob)**/*.png' | tar -x -C "$src"
find "$src" -name '*.json' -size +1M -delete

repo=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
gh api --paginate "repos/$repo/code-scanning/alerts?state=dismissed&per_page=100" \
  --jq '.[] | {rule: .rule.id, path: .most_recent_instance.location.path}' \
  | jq -s 'group_by([.rule, .path]) | map({key: "\(.[0].rule) \(.[0].path)", value: length}) | from_entries' \
  > "$work/dismissed.json"

status=0
for lang in "${LANGUAGES[@]}"; do
  db="$work/db-$lang"
  mode=()
  [ "$lang" = java-kotlin ] && mode=(--build-mode=none)
  codeql database create "$db" --language="$lang" "${mode[@]}" \
    --source-root="$src" --threads="$threads" --overwrite >"$work/create-$lang.log" 2>&1 \
    || { echo "codeql-gate: database create failed for $lang (see $work/create-$lang.log)" >&2; exit 2; }
  codeql database analyze "$db" --format=sarif-latest --output="$work/$lang.sarif" \
    --threads="$threads" >"$work/analyze-$lang.log" 2>&1 \
    || { echo "codeql-gate: analyze failed for $lang (see $work/analyze-$lang.log)" >&2; exit 2; }

  new=$(jq -r --slurpfile d "$work/dismissed.json" '
    [.runs[].results[] | {rule: .ruleId,
      path: .locations[0].physicalLocation.artifactLocation.uri,
      line: .locations[0].physicalLocation.region.startLine,
      msg: .message.text}]
    | group_by([.rule, .path])
    | map(select(length > ($d[0]["\(.[0].rule) \(.[0].path)"] // 0)))
    | .[][] | "\(.path):\(.line) \(.rule): \(.msg | split("\n")[0])"' "$work/$lang.sarif")
  total=$(jq '[.runs[].results[]] | length' "$work/$lang.sarif")
  if [ -n "$new" ]; then
    echo "codeql-gate: $lang: results not dismissed on GitHub:"
    while IFS= read -r line; do echo "  $line"; done <<<"$new"
    status=1
  else
    echo "codeql-gate: $lang: pass ($total results, all dismissed on GitHub)"
  fi
done
exit "$status"
