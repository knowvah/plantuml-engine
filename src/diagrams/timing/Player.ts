import type { Colors } from '../../core/abel/Colors.js';
import type { Position } from '../../core/abel/Position.js';
import { Display } from '../../core/klimt/creole/Display.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { TextBlockUtils } from '../../core/klimt/shape/TextBlockUtils.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import type { SName } from '../../core/style/SName.js';
import type { Style } from '../../core/style/Style.js';
import type { HColor } from '../../core/style/Value.js';
import type { Stereotype } from '../../core/stereo/Stereotype.js';
import type { ArrowConfiguration } from '../sequence/sequence-arrowhead.js';
import { PlayerFrame } from './graphic/PlayerFrame.js';
import type { Panels } from './graphic/Panels.js';
import type { TimeTick } from './TimeTick.js';
import { TimingNote } from './TimingNote.js';
import type { TimingRuler } from './TimingRuler.js';
import {
  createDisplayWith,
  fontConfigurationOf,
  timingStyle,
  timingStyleStereotyped,
  type TimingSkinParam,
} from './timing-klimt.js';

/**
 * The six arguments every concrete player's constructor takes (`PlayerConcise.java:54-58`, and its siblings).
 * D16: more than five parameters take an args object; `PlayerConciseArgs` and the other players' are this type.
 * `title` is `full`, the text of `concise "full" as code`.
 */
export interface PlayerBaseArgs {
  readonly title: string;
  readonly skinParam: TimingSkinParam;
  readonly ruler: TimingRuler;
  readonly compact: boolean;
  readonly stereotype: Stereotype | undefined;
  readonly generalBackgroundColor: HColor | undefined;
}

/** The eight arguments of `Player`'s constructor (Player.java:87-99): the base six, the style name and the height. */
export interface PlayerArgs extends PlayerBaseArgs {
  readonly sname: SName;
  readonly suggestedHeight: number;
}

/**
 * What a timing diagram draws for one `concise`/`robust`/`clock`/`binary`/`analog`/`rectangle` line: the title,
 * its notes, and the {@link Panels} built once on first use.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/Player.java:61-162
 */
export abstract class Player {
  readonly #skinParam: TimingSkinParam;
  readonly #ruler: TimingRuler;
  readonly #compact: boolean;
  readonly #title: Display;
  #suggestedHeight: number;
  readonly #stereotype: Stereotype | undefined;
  readonly #generalBackgroundColor: HColor | undefined;
  #cached: Panels | undefined;
  /** `Collections.unmodifiableList(notes)` is a live view, so panels built early still see later notes. */
  readonly #notes: TimingNote[] = [];
  readonly #playerFrame: PlayerFrame;
  readonly #sname: SName;

  /** Player.java:87-99 */
  protected constructor(args: PlayerArgs) {
    this.#generalBackgroundColor = args.generalBackgroundColor;
    this.#sname = args.sname;
    this.#stereotype = args.stereotype;
    this.#skinParam = args.skinParam;
    this.#compact = args.compact;
    this.#ruler = args.ruler;
    this.#suggestedHeight = args.suggestedHeight;
    this.#title = Display.getWithNewlines(args.skinParam.getPragma(), args.title);
    this.#playerFrame = new PlayerFrame(this.#getTitle(), args.skinParam, args.compact);
  }

  /** Player.java:75-84: the note style carries the stereotype. */
  public addNote(now: TimeTick | undefined, note: Display, position: Position, stereotype?: Stereotype): void {
    const style = timingStyleStereotyped(this.#skinParam, stereotype, 'note');
    this.#notes.push(new TimingNote({ when: now, player: this, note, position, skinParam: this.#skinParam, style }));
  }

  /** Player.java:101-104 */
  protected getStyle(): Style {
    return timingStyleStereotyped(this.#skinParam, this.#stereotype, this.#sname);
  }

  /** Player.java:106-108: a live read-only view. */
  public getNotes(): readonly TimingNote[] {
    return this.#notes;
  }

  public getSkinParam(): TimingSkinParam {
    return this.#skinParam;
  }

  public getRuler(): TimingRuler {
    return this.#ruler;
  }

  public getSuggestedHeight(): number {
    return this.#suggestedHeight;
  }

  public isCompact(): boolean {
    return this.#compact;
  }

  /** Player.java:123-125 */
  public getGeneralBackgroundColor(): HColor | undefined {
    return this.#generalBackgroundColor;
  }

  /** Player.java:127-133: the title in the bare `root, element, timingDiagram` style, left aligned. */
  #getTitle(): TextBlock {
    if (this.#title.isWhite()) return TextBlockUtils.EMPTY_TEXT_BLOCK;
    const fc = fontConfigurationOf(this.#skinParam, timingStyle(this.#skinParam));
    return createDisplayWith(this.#title, fc, this.#skinParam, HorizontalAlignment.LEFT);
  }

  public abstract defineState(stateCode: string, label: string): void;

  public abstract setState(
    now: TimeTick | undefined,
    comment: string | undefined,
    color: Colors,
    ...states: string[]
  ): void;

  public abstract createConstraint(
    tick1: TimeTick,
    tick2: TimeTick,
    message: string | null,
    config: ArrowConfiguration,
  ): void;

  public drawFrameTitle(ug: UGraphic): void {
    this.#playerFrame.drawFrameTitle(ug);
  }

  public getFrameHeight(stringBounder: StringBounder): number {
    return this.#playerFrame.getHeight(stringBounder);
  }

  public setHeight(height: number): void {
    this.#suggestedHeight = height;
  }

  /** Player.java:153-158: built on first use, then reused. */
  public panels(): Panels {
    this.#cached ??= this.buildPlayerPanels();
    return this.#cached;
  }

  protected abstract buildPlayerPanels(): Panels;
}
