# Decisions — insecure-path-egg (ipe)

Source: issue #178, with the maintainer ruling of 2026-11-13 (option 2). Planned unattended on 2026-11-17 at
`feature/parity-queue` `88356232e`.

> Ruling (#178 comment): register `PSystemPathFactory` only under `SecurityProfile.INSECURE`, as
> `PSystemBuilder.java:178-179` does. Draw `GraphicsPath`'s 50×50 motif as an SVG page with one black polyline, in place
> of the PNG the jar writes. Name it in `DIVERGENCES.md` as forced by the SVG-only `renderSync` API, and cite the ruling.
> Characters outside `A-Z`/`a-w` still reach the crash page, as `UMotif.convertFromChar` (`UMotif.java:93-101`) does.

The ruling settles the divergence. D1 to D5 are how to build it.

## D1 — The INSECURE gate is a registration condition the registry checks on each render

- **Context:** upstream checks the profile once, when `PSystemBuilder` is constructed (`PSystemBuilder.java:178-179`). The
  port fills one module-level registry when the module loads (`src/registered-plugins.ts`, `src/core/dispatcher.ts:243`),
  and the profile arrives per render as `RenderOptions.securityProfile` (`src/core/render-options.ts:73`). `ParseOptions`
  does not carry it today (`src/core/dispatcher-types.ts:41-49`).
- **Decision:**
  - Add `securityProfile` to `ParseOptions`, forwarded verbatim from `RenderOptions`.
  - Register `pathPlugin` in its upstream slot, between `ripPlugin` (java:177) and `charliePlugin` (java:181).
  - The plugin declares `registeredOnlyUnder: SecurityProfile.INSECURE`.
  - `DiagramRegistry#resolve` skips a plugin whose `registeredOnlyUnder` differs from
    `options?.securityProfile ?? DEFAULT_SECURITY_PROFILE`, before `isCandidate`. A skipped plugin makes no attempt and
    adds no refusal, so it is absent from the merge, as an unregistered factory is upstream.
- **Rejected:**
  - (B) Register it always and make its `parse` return `NULL_SYSTEM` unless INSECURE. That makes it a candidate under
    LEGACY, and leans on the merge skipping null (`PSystemErrorUtils.java:120-121`) to look absent. Upstream has no such
    candidate.
  - (C) Build one registry per profile. 84 test files import the dispatcher or the registrations (counted at
    planning), and only one plugin varies.
- **Consequences:**
  - LEGACY, INTERNET, ALLOWLIST and SANDBOX renders are unchanged. The three `cov-path-*` factories rows stay at
    weightedScore 5 (`oracle/goldens/svg-factories/authored-baseline.json:1077-1121`).
  - `isEmptyDescription` needs no gate. The path plugin is a `PSystemSingleLineFactory`, which is neither a command
    factory nor a bare factory. Its always-registered siblings (`eggPlugin`, `ripPlugin`, …) already make the answer
    `false` for every `@startuml` source. T1a pins that with a test.
  - `src/index.ts` is at 496 lines. T1a builds `ParseOptions` in a helper in `render-options.ts`, so the file does not
    grow.

## D2 — The SVG page is GraphicsPath drawn through the port's klimt SVG driver

- **Context:** `GraphicsPath#createImage` (`GraphicsPath.java:72-88`) makes a 50×50 white image, applies
  `HColors.BLACK`, and calls `UMotif#drawHorizontal(ug, 20, 20, 1)`. That builds a `DotPath` of degenerate cubics
  (`UMotif.java:114-147`), drawn with the default 1 px stroke. The ruling's "one black polyline" describes that drawing.
- **Decision:** port `GraphicsPath` on `UGraphicSvg` in place of `UGraphicG2d`:
  - a 50×50 page with a white background;
  - `ug.apply(HColors.BLACK)`, then `motif.drawHorizontal(ug, 20, 20, 1)`;
  - `DriverDotPathSvg` (`src/core/klimt/drawing/svg/driver-dot-path-svg.ts`) emits the one `<path>`: no fill, black
    stroke, width 1, each segment a straight `C` whose control points are its own end points.
  - The page stays 50×50 whatever the motif's extent. The PNG is fixed at 50×50 (`EmptyImageBuilder(null, 50, 50, …)`,
    `GraphicsPath.java:74`), and ink past it is clipped.
- **Rejected:** (B) a hand-written `<svg><polyline points=…>`. It matches the ruling's words, but drops upstream's
  `UMotif` → `DotPath` → `UGraphic` structure, which the project says is authoritative (CLAUDE.md, "Porting
  discipline").
- **Consequences:** no oracle can compare this page, because the jar writes PNG bytes. The tests assert the coordinates
  `UMotif` computes. Planning checked them against the jar's own PNG pixels
  (`measurements/decode-motif.py`, `measurements/jar-insecure-path-ABCabc.png`):
  `path ABCabc` → `M20,20` then 17,17 · 15,14 · 14,11 · 16,11 · 19,11 · 16,12.

## D3 — An invalid motif character throws at export and reaches the error page

- **Context:** the factory regex accepts `[0-9A-Za-z]+` (`PSystemPathFactory.java:49`), but `UMotif.convertFromChar`
  throws `IllegalArgumentException` for anything outside `A-Z`/`a-w` (`UMotif.java:94-102`). `UMotif` is built in
  `createImage` (`GraphicsPath.java:80`), at export time, not at parse time. The jar's INSECURE render of `path abc123` is the crash page
  `An error has occurred : java.lang.IllegalArgumentException` (`measurements/jar-insecure-path-abc123-crash.svg`).
- **Decision:** `UMotif.convertFromChar` throws an `Error` named `IllegalArgumentException`, at export, following the
  chart precedent (`src/diagrams/chart/ChartDiagramFactory.ts:127-131`). The error reaches `renderPagesSync`'s catch
  (`src/index.ts:376-378`), and from there `errorSvg`.
- **Consequences:** jar errors and we error, which is conformant (user ruling 2026-10-10, `docs/svg-conformance.md`,
  "Error pages"). No new divergence.

## D4 — The whole of UMotif is ported, plus DotPath#addAfter

- **Context:** the port has no `UMotif`. `DotPath` leaves `addBefore`/`addAfter` unported
  (`src/core/klimt/shape/DotPath.ts:170-172`).
- **Decision:**
  - Port `UMotif` into `src/core/klimt/UMotif.ts`, matching upstream's `klimt/UMotif.java`: both constructors (the
    `int...` one as a static factory), `getLength`, `getPoints`, `getRectangle`, `convertPoint`, `convertFromChar`, and
    both `drawHorizontal`/`drawVertical` overloads.
  - Port `DotPath#addAfter`, both overloads (`DotPath.java:328-338`), and update the "Deferred" note.
- **Rejected:** porting only the `drawHorizontal` path. The rule in CLAUDE.md is not to trim upstream classes.
  `getRectangle` has no caller upstream outside `UMotif`, but it is part of the class.

## D5 — The divergence is one DIVERGENCES.md entry, signed by the #178 ruling

- **Decision:** add `### path under INSECURE draws an SVG page, not the jar's PNG` beside "Ditaa is not included".
  - Category: library-forced. `renderSync` returns an SVG string (`src/index.ts`), by user ruling 2026-11-13 (#178).
  - The entry names `PSystemPath.java:60-63`, `GraphicsPath.java:66-88`, D2's page, and that no corpus row reaches this
    factory.
- **Consequences:**
  - `oracle/accepted-divergences.json` does not change. No surveyed row diverges, because surveys render under LEGACY.
  - The `cov-path-*` topics in `authored-baseline.json` change from "unregistered under LEGACY" to "registered under
    INSECURE only". This is text only; pins do not change.
  - `PSystemVersion.ts:218-220` and `DIVERGENCES.md`'s version entry say the page "cannot see
    `RenderOptions.securityProfile`". That stops being true once `ParseOptions` carries it. T3 rewords only the reason:
    the page still omits `Loaded from` and Word mode, because the port has no jar path and no Word mode. The behaviour is
    unchanged.

## Operational readiness (Phase 4, auto-confirmed)

- **Observability:** N/A. This is a pure library and has no service, metrics or traces.
- **Rollback:** Reversible. Revert the squash commit.
- **Scalability:** the gate adds one comparison per plugin per resolve, which is negligible.
- **Failure modes:**
  1. A LEGACY page changes because the gate leaked: the `cov-path-*` ratchet rows and the full test suite catch it.
  2. The INSECURE page grows past 50×50 for a long motif: a T2a test pins that it does not.
  3. `isEmptyDescription` changes for an empty block under INSECURE: a T1a test pins that it does not.
- **Backwards compatibility:** `ParseOptions` gains an optional field. `RenderOptions` is unchanged. `SyncPlugin` gains
  an optional field. No consumer breaks.

## Auto-confirmed (unattended)

Every phase was auto-confirmed on 2026-11-17 by an `--unattended next` run. Each decision follows from the evidence
cited, and none needs a new ruling, because #178 carries it.

| ID | Took | Rejected | Evidence |
|---|---|---|---|
| D1 | a registration condition checked in `resolve` | B (parse returns `NULL_SYSTEM`), C (a registry per profile) | `PSystemBuilder.java:178-179`; `dispatcher.ts:129-143`; `dispatcher-types.ts:41-49` |
| D2 | a klimt `UGraphicSvg` drawing of `UMotif`'s `DotPath` | B (a hand-written `<polyline>`) | `GraphicsPath.java:72-88`; `UMotif.java:114-147`; the jar PNG decoded at planning |
| D3 | throw at export, then the error page | — | `UMotif.java:94-102`; the jar's crash page; ruling 2026-10-10 |
| D4 | port the whole of `UMotif`, plus `DotPath#addAfter` | a partial port | `UMotif.java`; `DotPath.java:328-338`; CLAUDE.md "do not trim" |
| D5 | one entry, library-forced, citing #178 | — | #178 ruling text |
