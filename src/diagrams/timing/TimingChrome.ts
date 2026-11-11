/**
 * PORT-ONLY. The `TitledDiagram` state the common commands write and the chrome step reads, which every klimt
 * diagram of this port holds (`NwDiagram.ts`, `PSystemRegex.ts`): `annotations` (title, caption, legend, header,
 * footer, mainframe), `scale` (`UmlDiagram#setScale`) and `sprites`. A base class so `TimingDiagram.ts` stays
 * under the file cap (D16).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/TitledDiagram.java
 */
import { createAnnotations, type DiagramAnnotations } from '../../core/annotations/index.js';
import type { ScaleSpec } from '../../core/scale-command.js';
import type { SpriteRegistry } from '../../core/sprite-registry.js';
import { TitledDiagram, type UmlSource } from '../../core/TitledDiagram.js';
import { OptionKey } from '../../core/tim/EaterOption.js';
import type { SkinParam } from './timing-skin-param.js';

export type { UmlSource };

export abstract class TimingChrome extends TitledDiagram {
  /** `TitledDiagram`'s title/caption/legend/header/footer/mainframe, read by the chrome step. */
  readonly annotations: DiagramAnnotations = createAnnotations();
  /** `CommandScale*`'s target (`UmlDiagram#setScale`). */
  scale: ScaleSpec | undefined = undefined;

  /** The timing skin param, narrowed from `ISkinParam` for the sprite registry. */
  abstract override getSkinParam(): SkinParam;

  /**
   * `skinParam.handwritten()`, else `!option handwritten` through the artifact.
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/TitledDiagram.java:114-118
   */
  isHandwritten(): boolean {
    if (this.getSkinParam().getValue('handwritten')?.toLowerCase() === 'true') return true;
    return this.preprocessing.getOptions().get(OptionKey.HANDWRITTEN)?.toLowerCase() === 'true';
  }

  /** The skin param's sprites, read by the sprite commands and the chrome step. */
  get sprites(): SpriteRegistry {
    return this.getSkinParam().getSprites();
  }
}
