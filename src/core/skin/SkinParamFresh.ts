/**
 * A fresh `SkinParam`: `SkinParam.create(md5map, pathSystem, type,
 * Pragma.createEmpty(), option)` for a diagram whose source no command can
 * reach -- `PSystemCreole#getTextBlock` (java:83-84) and `Help`, whose
 * factory has only the five `help` commands (`HelpFactory#initCommandsList`).
 * Every `getValue` is `null`, so each member answers its default, and the
 * style builder is the default skin's (`createMindmapSkinParam` over no
 * source).
 *
 * `BpmDiagram#getTextBlock` (BpmDiagram.java:181-186) builds one too, with
 * the preprocessing artifact's options: no `BpmDiagramFactory` command can
 * set a skinparam, a style or a pragma. The members its activity Ftiles
 * read (`options`, `getHtmlColor`, `getDefaultTextAlignment`) answer
 * `SkinParam`'s no-value result.
 *
 * The `ISkinParam` members no reader of these diagrams reaches throw, as
 * the engines' own `SkinParam` copies do (`wire-skin-param.ts`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/skin/SkinParam.java
 */
import type { FontParam, ISkinParamWithSimple, UFont } from '../abel/ISkinParam.js';
import type { HColor } from '../abel/Colors.js';
import { chromeAtomOps } from '../annotations/blocks-creole.js';
import type { NestedDiagramRenderer } from '../EmbeddedDiagram.js';
import type { InternalEmojiStore } from '../internal-emoji-store.js';
import type { InternalSpriteStore } from '../internal-sprite-store.js';
import { HColorSet } from '../klimt/color/HColorSet.js';
import { addFontStyle } from '../klimt/creole/command/AddStyle.js';
import type { CreoleMode } from '../klimt/creole/CreoleMode.js';
import { CreoleParser } from '../klimt/creole/legacy/CreoleParser.js';
import { MONOSPACED } from '../klimt/creole/Parser.js';
import type { AtomOps } from '../klimt/creole/Sea.js';
import type { SheetBuilder } from '../klimt/creole/SheetBuilder.js';
import { ClockwiseTopRightBottomLeft } from '../klimt/geom/ClockwiseTopRightBottomLeft.js';
import type { ParsedColor } from '../klimt/color/HColorSet.js';
import type { HorizontalAlignment } from '../klimt/geom/HorizontalAlignment.js';
import type { TextBlock } from '../klimt/shape/TextBlock.js';
import { FontStyle } from '../klimt/shape/UText.js';
import type { FontConfiguration } from '../klimt/shape/UText.js';
import type { Sprite } from '../klimt/sprite/Sprite.js';
import type { UStroke } from '../klimt/UStroke.js';
import { getNestedDiagramRenderer } from '../nested-diagram-registry.js';
import { createSpriteRegistry, getSprite } from '../sprite-registry.js';
import type { SpriteRegistry } from '../sprite-registry.js';
import type { Stereotype } from '../stereo/Stereotype.js';
import { createMindmapSkinParam } from '../style/mindmap-style-builder.js';
import type { SkinParam as StyleSkinParam } from '../style/mindmap-style-builder.js';
import type { StyleBuilder } from '../style/StyleBuilder.js';
import { GUILLEMET_DEFAULT } from '../text/Guillemet.js';
import type { GuillemetPair } from '../text/Guillemet.js';
import type { OptionKey } from '../tim/EaterOption.js';
import type { ColorParam } from './ColorParam.js';
import { Pragma } from './Pragma.js';
import type { LegacyColorSkin } from './SkinParamUtils.js';

/** `getAsInt("tabsize", 8)`. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/skin/SkinParam.java:1096-1098 */
const DEFAULT_TAB_SIZE = 8;

/** `getDpi()`'s default with no `dpi` skinparam. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/skin/SkinParam.java */
const DEFAULT_DPI = 96;

/** The jar-resident stores standing in for upstream's classpath (ADR-2). */
export interface SkinParamClasspath {
  readonly sprites?: InternalSpriteStore | undefined;
  readonly emoji?: InternalEmojiStore | undefined;
}

/**
 * The read half of `ConfigurationStore<OptionKey>` that `SkinParam#options()`
 * hands out: `values.get(key)`, Java `null` when absent.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/preproc/ConfigurationStore.java:68-70
 */
export interface OptionStore {
  getValue(key: OptionKey): string | null;
}

function unported(member: string): never {
  throw new Error(`unported: SkinParam#${member} is not reached by a fresh skin param`);
}

/** No renderer registered (a unit test importing klimt directly): the
 *  `EmbeddedDiagram` catch turns the throw into its fallback block. */
function nestedRenderer(): NestedDiagramRenderer {
  return (
    getNestedDiagramRenderer() ?? {
      render(): TextBlock {
        throw new Error('SkinParamFresh: no nested-diagram renderer is registered');
      },
    }
  );
}

/** The `Arrays.asList(...)` cache key's font part. */
function fontKey(fc: FontConfiguration): readonly unknown[] {
  return [fc.family, fc.size, fc.fontFace, [...fc.styles].sort(), fc.color, fc.hyperlinkColor];
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/skin/SkinParam.java */
export class SkinParamFresh implements ISkinParamWithSimple, LegacyColorSkin {
  private readonly sprites: SpriteRegistry;
  private readonly params = new Map<string, string>();
  private readonly cache = new Map<string, CreoleParser>();
  private style: StyleSkinParam | undefined;
  /** The `Pragma.createEmpty()` the constructor receives, kept: warnings accumulate on it. */
  private readonly pragma = Pragma.createEmpty();
  /** `SkinParam.create(..., option)`'s option store. @see SkinParam.java:1318-1320 */
  private readonly option: OptionStore;

  /**
   * `classpath` is port-only (ADR-2). `options` is the preprocessing
   * artifact's option map (`getPreprocessingArtifact().getOption()`,
   * BpmDiagram.java:184-185); creole and help pass none, an empty store.
   */
  constructor(classpath?: SkinParamClasspath, options?: ReadonlyMap<string, string>) {
    this.sprites = createSpriteRegistry(classpath?.sprites, classpath?.emoji);
    const values = options ?? new Map<string, string>();
    this.option = { getValue: (key) => values.get(key) ?? null };
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/skin/SkinParam.java:1318-1320 */
  options(): OptionStore {
    return this.option;
  }

  /**
   * Every `getValue` is `null`, so neither the stereotype loop nor the plain
   * read finds a value.
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/skin/SkinParam.java:371-396
   */
  getHtmlColor(_param: ColorParam, _stereotype: Stereotype | undefined, _clickable: boolean): ParsedColor | null {
    return null;
  }

  /** The default skin's builder: no `<style>`, `skinparam` or theme can reach this skin. */
  getCurrentStyleBuilder(): StyleBuilder {
    this.style ??= createMindmapSkinParam({});
    return this.style.getCurrentStyleBuilder();
  }

  getIHtmlColorSet(): HColorSet {
    return HColorSet.instance();
  }

  /** `sprites.get(name)`, else `SpriteImage.fromInternal(name)`; no `sprite` command can run here. */
  getSprite(name: string): Sprite | null {
    return getSprite(this.sprites, name) ?? null;
  }

  /** `Guillemet.GUILLEMET.fromDescription(null)`. @see SkinParam.java:1070-1073 */
  guillemet(): GuillemetPair {
    return GUILLEMET_DEFAULT;
  }

  /** `md5map.get(md5)`; embedded diagrams resolve through the nested renderer in this port. */
  getFromMd5(_md5: string): string | null {
    return null;
  }

  /** `svgCharSizes` is filled by `skinparam svgCharSize`, which cannot run. @see SkinParam.java:1250-1255 */
  transformStringForSizeHack(s: string): string {
    return s;
  }

  getValue(_key: string): string | null {
    return null;
  }

  values(): ReadonlyMap<string, string> {
    return this.params;
  }

  /** `getAsDouble("padding")` with no value. @see SkinParam.java:1147-1150 */
  getPadding(): ClockwiseTopRightBottomLeft {
    return ClockwiseTopRightBottomLeft.same(0);
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/skin/SkinParam.java:1091-1093 */
  getMonospacedFamily(): string {
    return MONOSPACED;
  }

  getTabSize(): number {
    return DEFAULT_TAB_SIZE;
  }

  getDpi(): number {
    return DEFAULT_DPI;
  }

  copyAllFrom(other: ReadonlyMap<string, string>): void {
    for (const [key, value] of other) this.params.set(key, value);
  }

  getPragma(): Pragma {
    return this.pragma;
  }

  /**
   * The three-argument overload passes `fontConfiguration.forceFont(null,
   * null)` -- the italic copy -- as the stereotype font; the four-argument
   * one caches by its arguments.
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/skin/SkinParam.java:1285-1303
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/font/FontConfiguration.java:236-238
   */
  sheet(
    fontConfiguration: FontConfiguration,
    horizontalAlignment: HorizontalAlignment,
    creoleMode: CreoleMode,
    stereo?: FontConfiguration,
  ): SheetBuilder {
    const stereotype = stereo ?? addFontStyle(fontConfiguration, FontStyle.ITALIC);
    const key = JSON.stringify([horizontalAlignment, creoleMode, fontKey(fontConfiguration), fontKey(stereotype)]);
    let result = this.cache.get(key);
    if (result === undefined) {
      result = new CreoleParser(
        fontConfiguration,
        horizontalAlignment,
        this,
        { creoleMode, stereotype },
        { atomOps: this.atomOps(fontConfiguration), renderer: nestedRenderer() },
      );
      this.cache.set(key, result);
    }
    return result;
  }

  /** Port-only (ADR-9): the creole `AtomOps` at `fontConfiguration`, over this skin's sprites. */
  atomOps(fontConfiguration: FontConfiguration): AtomOps {
    return chromeAtomOps(this.sprites, fontConfiguration);
  }

  getFontHtmlColor(_stereotype: Stereotype | undefined, ..._param: FontParam[]): HColor {
    return unported('getFontHtmlColor');
  }

  getFont(_stereotype: Stereotype | undefined, _inGroup: boolean, ..._fontParam: FontParam[]): UFont {
    return unported('getFont');
  }

  getHyperlinkColor(): HColor {
    return unported('getHyperlinkColor');
  }

  useUnderlineForHyperlink(): UStroke {
    return unported('useUnderlineForHyperlink');
  }

  /**
   * `HorizontalAlignment.fromString(getValue("defaulttextalignment"))` is
   * `null`, so the default (`FtileBox`'s constructor reaches this).
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/skin/SkinParam.java:731-738
   */
  getDefaultTextAlignment(defaultValue: HorizontalAlignment): HorizontalAlignment {
    return defaultValue;
  }

  strictUmlStyle(): boolean {
    return unported('strictUmlStyle');
  }
}
