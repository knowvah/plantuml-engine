# T1c: an embed's source is labelled `block` (D4)

## Context

The jar reads an embed's lines through `BlockUml.convert`. That labels every line `new LineLocationImpl("block",
null)` (`BlockUml.java:119-127`, called from `EmbeddedDiagram.java:146-147`), so a broken embed's error page prints
`[From block (line 2) ]`. Our nested `renderSync` reads with the default `'string'` (`ReadLineReader.ts:37`). At
planning that gave `[From string (line 2) ]`, with the box 130.887 wide against the jar's 129.4.

## Steps

1. **Read the Java first.** Quote `BlockUml.java:119-127` and `LineLocationImpl`. Find the error page's `[From …]`
   writer: grep `From ` in `~/git/plantuml/src/main/java/net/sourceforge/plantuml/error/` and
   `PSystemError*.java`. Then trace ours from `errorSvg` (`error-diagrams.ts:115-130`) and
   `BlockUmlBuilder.ts:137-147` to `readLines`.
2. **Oracle.** Author `tests/fixtures/embedded-diagram-3015/embed-syntax-error.puml`: a one-line embed whose body is a
   non-directive syntax error, for example `Alice -> Bob : {{\nfoo bar baz qux\n}}`. A `!` line would hit the Python
   preprocessor (#214).
   - Render it with `scripts/oracle-render.sh`.
   - The jar's error page draws clock-dependent banners: planning saw a 92 px offset without an injected clock. Read
     `oracle/capture-clock.json` and `tests/oracle/svg-conformance/capture-clock.ts` and render both sides on the same
     clock.
   - If no clock can be matched, assert only the `[From …]` text, its `textLength` and its box width, not the whole
     page.
3. **Red.** In T1b's test file, add a case: the nested payload of our render contains `[From block (line 2) ]`, and
   that text element's `textLength` and box width equal the jar's. It fails on `string`.
4. **Green (D4).**
   - Add a field and accessor to `InternalRenderOptions`.
   - Name the `'block'` constant beside `SOURCE_STRING_DESCRIPTION` in `ReadLineReader.ts`, citing `BlockUml.java:121`.
   - Have the nested callback at `src/index.ts:321` set the field.
   - Thread it to every `readLines` on that render's path, at least the block split and `errorSvg`.
   - Do not touch `filename`.
5. Measure alone (contract step 5): the class pins and the class survey. Every embed row in every engine keeps its
   verdict, because a successful nested render prints no source label.
6. Run `npm run build` and diff `dist/*.d.ts` against `/tmp/edp-base-dts/`. Any change is stop 5.
7. Commit, for example `fix(embed): label an embedded diagram's source "block"`, with a body citing
   `BlockUml.java:119-127`.

## Write-set
- `src/core/internal-render-options.ts`, `src/index.ts` (nested callback), `src/core/tim/ReadLineReader.ts`,
  `src/core/BlockUmlBuilder.ts`, `src/core/error/error-diagrams.ts`
- `tests/fixtures/embedded-diagram-3015/embed-syntax-error.{puml,svg}`
- `tests/unit/core/embedded-diagram-preprocess-3015.test.ts` (append); a unit test of the accessor if coverage asks
- `docs/catalog.md` if a new export lands

## Read-set
- `~/git/plantuml/src/main/java/net/sourceforge/plantuml/BlockUml.java:100-160`, `EmbeddedDiagram.java:140-150`, the
  error page's `[From` writer
- `src/core/internal-render-options.ts` (all), `src/index.ts:300-420`, `src/core/tim/ReadLineReader.ts`

## Interface contracts
Consumes T1b's `nestedPayloads` and fixture directory. Produces none.

## Acceptance
- Given a one-line embed with a syntax error, when rendered, then its nested error page prints `[From block (line 2)
  ]`, with `textLength` and box width equal to the jar's.
- Given the same body as a top-level diagram, when rendered, then the page still prints `[From string (line 2) ]`.
- Given any embed that renders a real diagram, then its output is byte-identical to before (class pins and survey
  unchanged).
- Given `npm run build`, then `dist/*.d.ts` is byte-identical to the T0 snapshot.

Observability: N/A. Rollback: Reversible.
