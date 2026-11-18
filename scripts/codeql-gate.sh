#!/usr/bin/env bash
# Local CodeQL gate: run before opening or updating a pull request.
#
# Runs the same analyses as the repository's GitHub code scanning default
# setup (CodeQL default query suite; languages actions, java-kotlin,
# javascript-typescript, python) and GitHub Code Quality (the CodeQL
# <lang>-code-quality suite, where the language has one) over the committed
# HEAD, then fails on any result GitHub has not already dismissed.
#
# Dismissed results are matched by (rule id, path) count: a file may carry as
# many results of a rule as it has dismissed alerts or findings for that
# rule. GitHub's own matching uses line fingerprints the APIs do not return,
# so a new result that replaces a dismissed one of the same rule in the same
# file passes here; the PR's own analysis is the backstop for that case.
# The Code Quality API lists the default branch's findings only, so a
# finding dismissed on a pull request still fails here until it shows as
# dismissed on main.
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

# The Code Quality suite of a CodeQL language; actions has none.
quality_suite() {
  case "$1" in
    javascript-typescript) echo codeql/javascript-queries:codeql-suites/javascript-code-quality.qls ;;
    python) echo codeql/python-queries:codeql-suites/python-code-quality.qls ;;
    java-kotlin) echo codeql/java-queries:codeql-suites/java-code-quality.qls ;;
  esac
}

# Write {"<rule> <path>": count} for the dismissed results an API lists.
dismissed_counts() {
  local endpoint=$1 rule=$2 path=$3 out=$4
  gh api --paginate "repos/$repo/$endpoint?state=dismissed&per_page=100" \
    --jq ".[] | {rule: $rule, path: $path}" \
    | jq -s 'group_by([.rule, .path]) | map({key: "\(.[0].rule) \(.[0].path)", value: length}) | from_entries' \
    > "$out"
}

status=0

# Report a SARIF's results that outnumber the dismissed ones per (rule, path).
check() {
  local label=$1 sarif=$2 dismissed=$3 new total
  new=$(jq -r --slurpfile d "$dismissed" '
    [.runs[].results[] | {rule: .ruleId,
      path: .locations[0].physicalLocation.artifactLocation.uri,
      line: .locations[0].physicalLocation.region.startLine,
      msg: .message.text}]
    | group_by([.rule, .path])
    | map(select(length > ($d[0]["\(.[0].rule) \(.[0].path)"] // 0)))
    | .[][] | "\(.path):\(.line) \(.rule): \(.msg | split("\n")[0])"' "$sarif")
  total=$(jq '[.runs[].results[]] | length' "$sarif")
  if [ -n "$new" ]; then
    echo "codeql-gate: $label: results not dismissed on GitHub:"
    while IFS= read -r line; do echo "  $line"; done <<<"$new"
    status=1
  else
    echo "codeql-gate: $label: pass ($total results, all dismissed on GitHub)"
  fi
}

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
dismissed_counts code-scanning/alerts .rule.id .most_recent_instance.location.path "$work/dismissed.json"
dismissed_counts code-quality/findings .rule.id .location.path "$work/dismissed-quality.json"

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
  check "$lang" "$work/$lang.sarif" "$work/dismissed.json"

  suite=$(quality_suite "$lang")
  [ -n "$suite" ] || continue
  codeql database analyze "$db" "$suite" --format=sarif-latest \
    --output="$work/$lang-quality.sarif" --threads="$threads" \
    >"$work/analyze-$lang-quality.log" 2>&1 \
    || { echo "codeql-gate: quality analyze failed for $lang (see $work/analyze-$lang-quality.log)" >&2; exit 2; }
  check "$lang quality" "$work/$lang-quality.sarif" "$work/dismissed-quality.json"
done
exit "$status"
