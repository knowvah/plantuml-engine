import { Display } from '../../core/klimt/creole/Display.js';
import { HColorSet } from '../../core/klimt/color/HColorSet.js';
import { UStroke } from '../../core/klimt/UStroke.js';
import { LinkDecor } from '../../core/decoration/LinkDecor.js';
import { LinkType } from '../../core/decoration/LinkType.js';
import { WithLinkType } from '../../core/decoration/WithLinkType.js';
import type { Style } from '../../core/style/Style.js';
import type { StyleBuilder } from '../../core/style/StyleBuilder.js';
import type { HColor } from '../../core/style/Value.js';
import type { Player } from './Player.js';
import type { TickInPlayer } from './TickInPlayer.js';
import type { TimeTick } from './TimeTick.js';
import { timingStyleFrom, type TimingSkinParam } from './timing-klimt.js';

/** `getUStroke` of a diagram with no style builder (TimeMessage.java:73). */
const NO_STYLE_THICKNESS = 1.5;
/** `HColors.MY_RED = set.getColorOrWhite("#A80036")` (HColors.java:96): the colour with no style builder. */
const MY_RED = '#A80036';

/**
 * A message arrow `A -> B : label` between a tick of one player and a tick of another.
 *
 * Mirrored as written: `getUStroke` answers the style's `arrow` stroke whatever the link type says, so the `dotted`
 * and `bold` of `-[dotted]>` and `-[#blue,bold]>` change nothing on screen (probe cov-message-dotted); only the
 * colour reaches the drawing, through `setSpecificColor`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/TimeMessage.java:51-117
 */
export class TimeMessage extends WithLinkType {
  readonly #tickInPlayer1: TickInPlayer;
  readonly #tickInPlayer2: TickInPlayer;
  readonly #label: Display;
  readonly #skinParam: TimingSkinParam;
  /** `StyleBuilder` or Java's `null`; the `null` branches below are upstream's. */
  readonly #styleBuilder: StyleBuilder | undefined;

  /** java:60-69 */
  public constructor(
    tickInPlayer1: TickInPlayer,
    tickInPlayer2: TickInPlayer,
    label: string | null,
    skinParam: TimingSkinParam,
  ) {
    super();
    this.#skinParam = skinParam;
    this.#styleBuilder = skinParam.getCurrentStyleBuilder();
    this.#tickInPlayer1 = tickInPlayer1;
    this.#tickInPlayer2 = tickInPlayer2;
    this.#label = Display.getWithNewlines(skinParam.getPragma(), label);
    this.setSpecificColor(this.#getColor());
    this.type = new LinkType(LinkDecor.NONE, LinkDecor.NONE);
  }

  /** java:70-76 */
  public override getUStroke(): UStroke {
    if (this.#styleBuilder === undefined) return UStroke.withThickness(NO_STYLE_THICKNESS);
    return this.#getStyle().getStroke();
  }

  /** java:78-84 */
  #getColor(): HColor {
    if (this.#styleBuilder === undefined) return HColorSet.instance().getColorOrWhite(MY_RED);
    return this.#getStyle().value('LineColor').asColor(this.#skinParam.getIHtmlColorSet());
  }

  /** java:86-93: `root, element, timingDiagram, arrow`. */
  #getStyle(): Style {
    return timingStyleFrom(this.#styleBuilder, 'arrow');
  }

  public getPlayer1(): Player {
    return this.#tickInPlayer1.getPlayer();
  }

  public getPlayer2(): Player {
    return this.#tickInPlayer2.getPlayer();
  }

  public getTick1(): TimeTick {
    return this.#tickInPlayer1.getTick();
  }

  public getTick2(): TimeTick {
    return this.#tickInPlayer2.getTick();
  }

  public getLabel(): Display {
    return this.#label;
  }

  /** java:113-116 */
  public override goNorank(): void {
    // Nothing to do
  }
}
