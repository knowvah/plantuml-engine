import type { UmlSource as ExtractedSource } from '../../core/block-extractor.js';
import { createAnnotations, setTitle, singleDisplayPositioned } from '../../core/annotations/index.js';
import { getWithNewlines3 } from '../../core/klimt/creole/DisplayNewlines.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import { VerticalAlignment } from '../../core/klimt/geom/VerticalAlignment.js';
import type { DiagramAnnotations } from '../../core/annotations/index.js';
import type { ParseOptions } from '../../core/dispatcher.js';
import { internalEmojiStoreFrom } from '../../core/internal-emoji-store.js';
import { internalSpriteStoreFrom } from '../../core/internal-sprite-store.js';
import { Pragma } from '../../core/skin/Pragma.js';
import { createSpriteRegistry } from '../../core/sprite-registry.js';
import type { SpriteRegistry } from '../../core/sprite-registry.js';
import {
  createMindmapSkinParam,
  executeDeclaration,
  positionedDeclarationsOf,
} from '../../core/style/mindmap-style-builder.js';
import { StyleParsingException } from '../../core/style/parser/StyleParser.js';
import { extractStyle, upstreamSourceLines } from '../json/StyleExtractor.js';
import { TitledDiagram } from '../../core/TitledDiagram.js';
import { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import type { FilesDiagramAST } from './ast.js';
import { SkinParam } from './files-skin-param.js';
import { hasStyleDirective, isExtended, isHandwrittenRequested, styleDirectivesOf } from './files-extensions.js';
import { FilesParser } from './files-parser.js';
import { FilesListing } from './renderer.js';

/** A hand-built source's style sources: no skin, no skinparam, no style. */
const EMPTY_STYLE_SOURCE: NonNullable<ExtractedSource['styleSource']> = {
  skinparam: new Map<string, string>(),
  styles: [],
};

/**
 * The style source `FilesDiagram` runs: the `skin` and the `<style>` blocks, no `skinparam`.
 * `StyleExtractor` consumes a `skinparam` line without executing it (only `handwritten` is kept,
 * StyleExtractor.java:88-96) and `FilesDiagram` never reads that (FilesDiagram.java:62-80), so no skinparam
 * reaches the diagram. The same cut as `files-style-input.ts`, which the jar-compatible render applies to the
 * theme; the parse sees the preprocessor's output before that cut, so it makes it itself. The extended-mode
 * skinparams a user may add (DIVERGENCES.md "Extensions") are honoured by {@link FilesDiagram#forMode}, which
 * parses again with the style directives of `files-extensions.ts` kept.
 */
function jarStyleSource(styleSource: NonNullable<ExtractedSource['styleSource']>): typeof styleSource {
  const order = styleSource.declarationOrder;
  return {
    ...styleSource,
    skinparam: new Map<string, string>(),
    ...(order === undefined ? {} : { declarationOrder: { ...order, skinparam: new Map<string, number>() } }),
  };
}

/**
 * The sprite registry of one render: the jar-resident sprite bundle and the
 * Twemoji artwork both come from `options.assetStore` (ADR-2), the way the
 * json parser threads them.
 */
function spriteRegistryFor(options: ParseOptions | undefined): SpriteRegistry {
  const store = options?.assetStore;
  if (store === undefined) return createSpriteRegistry();
  return createSpriteRegistry(internalSpriteStoreFrom(store), internalEmojiStoreFrom(store));
}

/**
 * `FilesDiagram` -- one `@startfiles` block: the style applied up front, the
 * `root.element.filesDiagram` font, and the listing the `/path` and `<note>`
 * lines fill. Every other line is ignored, as upstream does -- except the
 * `title`/`legend`/... chrome and `sprite` definitions the common commands
 * take (mission G0b, SI5b), tried at the same "everything else" position.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/filesdiagram/FilesDiagram.java:58-112
 */
export class FilesDiagram extends TitledDiagram {
  /** @see FilesDiagram.java:60 */
  readonly list: FilesListing;
  readonly skinParam: SkinParam;
  /** `TitledDiagram`'s title/caption/legend/header/footer/mainframe. */
  readonly annotations: DiagramAnnotations = createAnnotations();
  /**
   * The error a `skin`/`<style>` block raised. Upstream prints it and carries
   * on without the style (`e.printStackTrace()`, FilesDiagram.java:68-70).
   */
  readonly styleError: StyleParsingException | undefined;
  /** What {@link forMode} parses again. */
  private readonly extractedSource: ExtractedSource;
  private readonly parseOptions: ParseOptions | undefined;

  /**
   * `extended` keeps the style directives of `files-extensions.ts` among the skinparams (default: the jar's
   * cut, none).
   * @see FilesDiagram.java:62-90
   */
  constructor(source: ExtractedSource, options?: ParseOptions, extended = false) {
    super(source, 'FILES', undefined, new PreprocessingArtifact());
    this.extractedSource = source;
    this.parseOptions = options;
    const given = source.styleSource ?? EMPTY_STYLE_SOURCE;
    const styleSource = extended ? styleDirectivesOf(given) : jarStyleSource(given);
    const style = createMindmapSkinParam(styleSource);
    this.skinParam = new SkinParam({
      style,
      skinparam: styleSource.skinparam,
      sprites: spriteRegistryFor(options),
      pragma: Pragma.createEmpty(),
    });
    // `styleExtractor.applyStyles(skinParam)`: every `<style>` block before a single line is read (java:67).
    // Upstream parses them all in one go and mutes nothing when one fails; here an earlier one stays applied.
    this.styleError = applyDeclarations(style, source, styleSource);
    const extractor = extractStyle(upstreamSourceLines(source, 'files'));
    const parser = new FilesParser();
    parser.parse(extractor.list);
    // `FilesDiagramFactory#createSystem`: the title the extractor took, centred (java:62-66).
    if (extractor.title !== undefined) {
      const display = getWithNewlines3(extractor.title) ?? [];
      setTitle(
        this.annotations,
        singleDisplayPositioned(display, HorizontalAlignment.CENTER, VerticalAlignment.CENTER),
      );
    }
    this.list = new FilesListing(this.skinParam, parser.getRoot(), parser.getIcons());
  }

  /**
   * The diagram and drawing flag of this render's mode. Jar-compatible (`files-style-input.ts` marked the
   * source): this diagram, not handwritten. Otherwise the diagram parsed again with the style directives when the
   * source declares any, and `handwritten` as `skinparam handwritten true` asks (DIVERGENCES.md "Extensions").
   * Port-only; the jar has neither.
   */
  forMode(): { readonly diagram: FilesDiagram; readonly handwritten: boolean } {
    // Idempotent; here because `styleInput` (the jar-compatible mark) runs after the parse, so the mode is unknown then.
    if (!isExtended(this.extractedSource)) return { diagram: this, handwritten: false };
    const given = this.extractedSource.styleSource ?? EMPTY_STYLE_SOURCE;
    return {
      diagram: hasStyleDirective(given) ? new FilesDiagram(this.extractedSource, this.parseOptions, true) : this,
      handwritten: isHandwrittenRequested(given),
    };
  }

  getSkinParam(): SkinParam {
    return this.skinParam;
  }

  /** @see FilesDiagram.java:103-105 */
  getDescription(): string {
    return '(Files)';
  }

  /** @see FilesDiagram.java:107-110 */
  getTextBlock(): FilesListing {
    return this.list;
  }
}

/** Executes every `skinparam`/`<style>` declaration in source order; answers the first style error. */
function applyDeclarations(
  style: ReturnType<typeof createMindmapSkinParam>,
  source: ExtractedSource,
  styleSource: NonNullable<ExtractedSource['styleSource']>,
): StyleParsingException | undefined {
  for (const declaration of positionedDeclarationsOf(styleSource, source.stylePositions ?? [])) {
    try {
      executeDeclaration(style, declaration, styleSource.skinparam);
    } catch (e) {
      if (!(e instanceof StyleParsingException)) throw e;
      return e;
    }
  }
  return undefined;
}

/**
 * Parses one `@startfiles` block, as `FilesDiagramFactory#createSystem` does:
 * a {@link FilesDiagram} over the source. The tree is `ast.root`, the
 * chrome `ast.annotations`, the `sprite` definitions `ast.sprites`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/filesdiagram/FilesDiagramFactory.java:46-52
 */
export function parseFiles(source: ExtractedSource, options?: ParseOptions): FilesDiagramAST {
  const diagram = new FilesDiagram(source, options);
  return {
    root: diagram.list.getRoot(),
    annotations: diagram.annotations,
    sprites: diagram.skinParam.getSprites(),
    diagram,
  };
}
