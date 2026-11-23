## Observation: the error page echoes the source, so substring label checks pass on it
- **Context**: Writing a red e2e spec for `!include <C4/…>` in the docs playground (#172).
- **Finding**: The library's error SVG prints the whole source, so `expect(svg).toContainText('Wanderer')` passed on the base playground's error page. The jar also splits multi-word labels into one `<text>` per word. The spec matches a `<text>` whose entire content is a single-word label (`tests/e2e/playground-stdlib.spec.ts`, `drawnLabel`).
- **Impact**: Any e2e/visual test asserting "label drawn" must match whole `<text>` elements, not page substrings.
- **Confidence**: High
