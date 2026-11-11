import { Position } from '../../core/abel/Position.js';
import { CreoleMode } from '../../core/klimt/creole/CreoleMode.js';
import type { Display } from '../../core/klimt/creole/Display.js';
import type { Sheet } from '../../core/klimt/creole/Sheet.js';
import { SheetBlock1 } from '../../core/klimt/creole/SheetBlock1.js';
import type { CreoleAtom } from '../../core/klimt/creole/atom/Atom.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import { LineBreakStrategy } from '../../core/klimt/LineBreakStrategy.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { Style } from '../../core/style/Style.js';
import { Opale } from '../../core/svek/image/Opale.js';
import type { Player } from './Player.js';
import type { TimeTick } from './TimeTick.js';
import { drawable, fontConfigurationOf, type TimingSkinParam } from './timing-klimt.js';

/** `getMarginY` (TimingNote.java:100-102). */
const MARGIN_Y = 10;

/** The six `TimingNote` constructor arguments (D16: more than five parameters take an args object). */
export interface TimingNoteArgs {
  readonly when: TimeTick | undefined;
  readonly player: Player;
  readonly note: Display;
  readonly position: Position;
  readonly skinParam: TimingSkinParam;
  readonly style: Style;
}

/**
 * A `note top of`/`note bottom of` on a player: an `Opale` around the note's creole sheet, in the
 * `note` style of the timing diagram.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/TimingNote.java:57-110
 */
export class TimingNote {
  readonly #when: TimeTick | undefined;
  readonly #note: Display;
  readonly #position: Position;
  readonly #skinParam: TimingSkinParam;
  readonly #style: Style;

  /** java:67-75. `when` is Java's nullable tick (`note top of X` with no time). */
  public constructor(args: TimingNoteArgs) {
    this.#style = args.style;
    this.#note = args.note;
    this.#when = args.when;
    this.#skinParam = args.skinParam;
    this.#position = args.position;
    // `player` is stored upstream (java:73) and never read; the port keeps no field for it.
  }

  /** java:77-83 */
  public drawU(ug: UGraphic): void {
    if (this.#position === Position.BOTTOM) ug = ug.apply(UTranslate.dy(this.#getMarginY() / 2));
    this.#createOpale().drawU(ug);
  }

  /** java:85-98: rebuilt on every call, as upstream does. */
  #createOpale(): Opale {
    const skinParam = this.#skinParam;
    const style = this.#style;
    const colorSet = skinParam.getIHtmlColorSet();
    const fc = fontConfigurationOf(skinParam, style);
    const shadowing = style.getShadowing();
    const borderColor = style.value('LineColor').asColor(colorSet);
    const noteBackgroundColor = style.value('BackGroundColor').asColor(colorSet);
    const stroke = style.getStroke();

    // `SheetBuilder#createSheet` widens to `Sheet<StripeAtom>`; `SheetBlock1` takes the narrow `Sheet`
    // (the cast FloatingNote and files/layout.ts#createOpale make).
    const sheet = skinParam
      .sheet(fc, skinParam.getDefaultTextAlignment(HorizontalAlignment.LEFT), CreoleMode.FULL)
      .createSheet(this.#note) as unknown as Sheet<CreoleAtom>;
    const sheet1 = new SheetBlock1(sheet, LineBreakStrategy.NONE, skinParam.atomOps, skinParam.getPadding());
    return new Opale(shadowing, drawable(borderColor), drawable(noteBackgroundColor), sheet1, false, stroke);
  }

  /** java:100-102 */
  public getHeight(stringBounder: StringBounder): number {
    return this.#createOpale().calculateDimension(stringBounder).getHeight() + this.#getMarginY();
  }

  /** java:104-106 */
  #getMarginY(): number {
    return MARGIN_Y;
  }

  public getWhen(): TimeTick | undefined {
    return this.#when;
  }

  public getPosition(): Position {
    return this.#position;
  }
}
