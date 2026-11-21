#!/usr/bin/env bash
# Dumps a diagram's StyleBuilder storage in the shape of ../*-storage.json.
#
# The port's style engine mirrors the OLD StyleStorage engine (upstream
# 97a5992); upstream replaced it with StyleIndex in c9d62097ff5, so the
# dumps come from the stock 97a5992 jar. `new` puts the oracle jar's
# skin/plantuml.skin and style/SName*.class ahead of it on the classpath:
# the old engine over the re-pinned skin and SName. The port has a720bdd's
# SName (pie, radar, digital: SName.java:88,199-200), which the stock jar
# lacks, so without the newer SName the old engine would store the skin's
# `chartDiagram { pie {...} radar {...} }` as stereotypes where the port
# stores element names. The a720bdd SName only adds constants to the old
# API. Re-porting the StyleIndex engine itself is #222.
#
# Usage: run.sh <old|new> <case.puml> [ideas] > out.json
# All three fixtures at once: regen-fixtures.py (same directory).
#   ideas: {storage, ideas} with every mindmap Idea.getStyle() (regular
#   branch then reverse, preorder) — mindmap-idea-styles.json.
# Sources: r.puml (plantuml-skin-storage.json), stereo.puml and
# test-results/dot-cache/mindmap/cejije-94-xibi793/in.puml (depth) for
# mindmap-idea-styles.json, each case's `source` for style-parser-storage.json.
set -euo pipefail
D="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$D/../../../../../.." && pwd)"
STOCK="$(ls "$REPO"/oracle/dist/stock/plantuml-stock-97a5992*.jar)"
OUT="${TMPDIR:-/tmp}/style-storage-probe"
mkdir -p "$OUT/classes" "$OUT/newskin"
unzip -o -q "$REPO/oracle/dist/plantuml-oracle.jar" skin/plantuml.skin \
  'net/sourceforge/plantuml/style/SName*.class' -d "$OUT/newskin"
javac -nowarn -cp "$STOCK" -d "$OUT/classes" "$D/StorageDump.java" 2>&1 | grep -v '^Note:' >&2 || true
if [ "$1" = new ]; then CP="$OUT/newskin:$OUT/classes:$STOCK"; else CP="$OUT/classes:$STOCK"; fi
java -Djava.awt.headless=true -DPLANTUML_DETERMINISTIC_TEXT=true -cp "$CP" StorageDump "$2" ${3:-}
