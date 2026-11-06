# Batch 2 — entity style

The largest family: 80 or so rows have a corner, a stroke or a font the jar reads from one merged style and we read from nowhere. T2a builds the seam (D2) the others use.

`EntityImageDescription.java:151-183` is the reference: `styleTitle`, `styleStereo` and `style` come from `StyleSignatureBasic.of(root, element, <diagram>, <symbol>[, title|stereotype])`, `.withTOBECHANGED(stereotype)` or `.forStereotypeItself(stereotype)`, `.getMergedStyle(entity.getCurrentStyleBuilder())`, `.eventuallyOverride(colors)`. `Cluster.java:314-326,385-407` and `EntityImageEmptyPackage.java:91-124` read the same values for containers.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T2a | The style seam; `DiagonalCorner` and stereotype `RoundCorner` | orchestrator | new `description-entity-style.ts`, `core/elk/elk-backend.ts`, `src/index.ts`, `renderer-entity.ts`, `renderer-cluster.ts` | T1c | [x] |
| T2b | Stroke: `LineStyle`, `BorderStyle`, `BorderThickness` | orchestrator | `description-entity-style.ts`, `renderer-entity.ts`, `renderer-cluster.ts` | T2a | [x] |
| T2c | Fonts: family, stereotype, alignment | orchestrator | `description-entity-style.ts`, `core/svg-text-font.ts`, `core/svek/image/leaf-sizing*.ts` | T2a | [x] |
| T2d | Positional `<style>` | orchestrator | `core/preprocessor.ts` or parser, `description-entity-style.ts` | T2a | [x] |
| T2e | Colour specs: `text:`, `line.`, `#?a:b` | orchestrator | `core/abel/Colors`, `core/klimt/color/HColorSet.ts`, description readers | T2a | [x] |

Close: [task-contract.md](../task-contract.md).
