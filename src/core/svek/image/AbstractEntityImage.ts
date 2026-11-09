/**
 * `AbstractEntityImage` — the base of every svek leaf image built from an `Entity` (the legacy activity
 * images of laep T2a). Mirrors `svek/AbstractEntityImage.java` over this port's `TextBlockMemoized`.
 *
 * **Port-only constructor parameter.** Upstream reads `entity.getSkinParam()`; this port's `Entity` carries
 * `abel/ISkinParam`, whose `getCurrentStyleBuilder()` returns an opaque `object`. The caller (the engine that
 * owns the entity's diagram) hands in the same skin param, typed as {@link LeafImageSkinParam} with the real
 * `StyleBuilder`, instead of a cast from the stub.
 *
 * Not ported: `getBackcolor` (`skinParam.getBackgroundColor()`; the port's skin params have no such member
 * yet — the renderer task T2c owns it).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/AbstractEntityImage.java:46-100
 */
import type { Entity } from '../../abel/Entity.js';
import type { Rankdir } from '../../klimt/geom/Rankdir.js';
import { TextBlockMemoized } from '../../klimt/shape/TextBlockMemoized.js';
import type { Stereotype } from '../../stereo/Stereotype.js';
import type { SName } from '../../style/SName.js';
import type { StyleBuilder } from '../../style/StyleBuilder.js';
import type { StyleSignature } from '../../style/StyleSignature.js';
import type { ISkinParamWithSimple } from '../../abel/ISkinParam.js';
import type { AtomOps } from '../../klimt/creole/Sea.js';
import { getStyleName } from '../diagram-type-style-name.js';
import { Margins } from './EntityImageDescriptionSupport.js';

/** The skin-param surface the leaf images read (`ISkinParam` upstream), with the real `StyleBuilder`. */
export interface LeafImageSkinParam extends ISkinParamWithSimple {
  getCurrentStyleBuilder(): StyleBuilder;
  /** The creole atom capability `Display#create` renders with (ADR-9): port-only. */
  readonly atomOps: AtomOps;
  /** @see SkinParam.java:1022-1024 */
  getRankdir(): Rankdir;
  /** @see SkinParam.java:1031-1047 */
  useOctagonForActivity(stereotype: Stereotype | undefined): boolean;
}

/** @see AbstractEntityImage.java:46-100 */
export abstract class AbstractEntityImage extends TextBlockMemoized {
  private readonly entity: Entity;
  private readonly skinParam: LeafImageSkinParam;

  constructor(entity: Entity, skinParam: LeafImageSkinParam) {
    super();
    this.entity = entity;
    this.skinParam = skinParam;
  }

  /** @see AbstractEntityImage.java:50-52 */
  getStyleSignature(): StyleSignature {
    throw new Error('UnsupportedOperationException: wip');
  }

  /** @see AbstractEntityImage.java:63-66 */
  isHidden(): boolean {
    return this.entity.isHidden();
  }

  /** @see AbstractEntityImage.java:68-70 */
  protected getEntity(): Entity {
    return this.entity;
  }

  /** @see AbstractEntityImage.java:72-74 */
  protected getSkinParam(): LeafImageSkinParam {
    return this.skinParam;
  }

  /** @see AbstractEntityImage.java:81-83 */
  protected getStereo(): Stereotype | undefined {
    return this.entity.getStereotype();
  }

  /** @see AbstractEntityImage.java:85-88 */
  getShield(_stringBounder: unknown): Margins {
    return Margins.NONE;
  }

  /** @see AbstractEntityImage.java:90-93 */
  getOverscanX(_stringBounder: unknown): number {
    return 0;
  }

  /** @see AbstractEntityImage.java:95-97 */
  getStyleName(): SName {
    return getStyleName(this.entity.getDiagramType());
  }
}
