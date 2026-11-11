import type { Colors } from '../../core/abel/Colors.js';
import { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import { DEFAULT_CLOCK } from '../../core/clock.js';
import { BigDecimal } from '../../core/decimal/BigDecimal.js';
import type { Display } from '../../core/klimt/creole/Display.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { TextBlockUtils } from '../../core/klimt/shape/TextBlockUtils.js';
import { ULine } from '../../core/klimt/shape/ULine.js';
import { URectangle } from '../../core/klimt/shape/URectangle.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import type { UStroke } from '../../core/klimt/UStroke.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { Stereotype } from '../../core/stereo/Stereotype.js';
import { StyleSignatureBasic } from '../../core/style/StyleSignatureBasic.js';
import type { HColor } from '../../core/style/Value.js';
import { checkSimpleDateFormatPattern } from '../../core/tim/builtin/date-format.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import type { Clocks } from './Clocks.js';
import { Highlight } from './Highlight.js';
import type { Panels } from './graphic/Panels.js';
import { TimeArrow } from './graphic/TimeArrow.js';
import type { Player, PlayerBaseArgs } from './Player.js';
import { PlayerAnalog } from './PlayerAnalog.js';
import { PlayerBinary } from './PlayerBinary.js';
import { PlayerClock } from './PlayerClock.js';
import { PlayerConcise } from './PlayerConcise.js';
import { PlayerRectangle } from './PlayerRectangle.js';
import { PlayerRobust } from './PlayerRobust.js';
import { TickInPlayer } from './TickInPlayer.js';
import { TimeAxisStategy } from './TimeAxisStategy.js';
import { TimeMessage } from './TimeMessage.js';
import { TimeTick } from './TimeTick.js';
import { TimingChrome, type UmlSource } from './TimingChrome.js';
import { TimingFormat } from './TimingFormat.js';
import { TimingRuler } from './TimingRuler.js';
import { back, fore } from './timing-klimt.js';
import * as layout from './timing-diagram-layout.js';
import type { SkinParam } from './timing-skin-param.js';

/** `withMargin(result, 10, 10)`, java:113 */
const DIAGRAM_MARGIN = 10;

/** `createPlayerClock`'s arguments (D16: more than five parameters). @see TimingDiagram.java:317-318 */
export interface CreatePlayerClockArgs {
  readonly code: string;
  readonly full: string;
  readonly period: BigDecimal;
  readonly pulse: BigDecimal;
  readonly offset: BigDecimal;
  readonly compact: boolean;
  readonly stereotype: Stereotype | undefined;
}

/**
 * One `@startuml` timing diagram, drawn as one `TextBlock` with a 10 px margin (`undefined` is Java's `null`).
 * D7 quirks: clock, analog and binary players ignore the command's `compact` and leave `lastPlayer` alone; the ruler
 * is built from the skin param at construction.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/TimingDiagram.java:74-430
 */
export class TimingDiagram extends TimingChrome implements Clocks {
  /** @see TimingDiagram.java:76 */
  public static readonly marginX1 = 5;
  /** @see TimingDiagram.java:77 */
  private readonly marginX2 = 5;

  /** `HashMap`: `TimingRuler#getLabel` replays Java's iteration order itself (D6). @see java:79 */
  private readonly codes = new Map<string, TimeTick>();
  /** `LinkedHashMap`: a re-put keeps its first position, as `Map#set` does. @see java:80 */
  private readonly players = new Map<string, Player>();
  /** `HashMap`; only looked up, never iterated. @see java:81 */
  private readonly clocks = new Map<string, PlayerClock>();
  private readonly messages: TimeMessage[] = [];
  private readonly highlights: Highlight[] = [];
  private readonly ruler: TimingRuler;
  private now: TimeTick | undefined = undefined;
  private lastPlayer: Player | undefined = undefined;
  private timeAxisStategy: TimeAxisStategy = TimeAxisStategy.AUTOMATIC;
  private compactByDefault = false;
  /** `sdf`: the `use date format` pattern, or `undefined` for `TimingFormat.DATE`. @see java:403 */
  private sdfPattern: string | undefined = undefined;
  private readonly skinParam: SkinParam;
  /** The zone `SimpleDateFormat` formats in: the JVM default zone upstream, the injected clock's here (D4). */
  private readonly zone: string;

  /** The skin param is built by the factory, as nwdiag's is (D2). @see TimingDiagram.java:89-91 */
  public constructor(
    source: UmlSource,
    preprocessing: PreprocessingArtifact,
    skinParam: SkinParam,
    zone: string = DEFAULT_CLOCK.zone,
  ) {
    super(source, 'TIMING', undefined, preprocessing);
    this.skinParam = skinParam;
    this.zone = zone;
    // `new TimingRuler(getSkinParam())` runs in a field initializer, before any `skinparam` command (D7).
    this.ruler = new TimingRuler(skinParam);
  }

  public getSkinParam(): SkinParam {
    return this.skinParam;
  }

  public getDescription(): string {
    return '(Timing Diagram)';
  }

  /** `TextBlockUtils.withMargin(result, 10, 10)` around upstream's anonymous `TextBlock`. @see java:98-114 */
  public getTextBlock(): TextBlock {
    const result: TextBlock = {
      drawU: (ug) => this.drawInternal(ug),
      calculateDimension: (stringBounder) => {
        const withBeforeRuler = this.getPart1MaxWidth(stringBounder);
        const totalWith = withBeforeRuler + this.ruler.getWidth() + TimingDiagram.marginX1 + this.marginX2;
        return new XDimension2D(totalWith, this.getHeightTotal(stringBounder));
      },
    };
    return TextBlockUtils.withMargin(result, DIAGRAM_MARGIN, DIAGRAM_MARGIN);
  }

  private getStyleSignature(): StyleSignatureBasic {
    return StyleSignatureBasic.of('root', 'element', 'timingDiagram');
  }

  /** @see TimingDiagram.java:120-124 */
  private black(): HColor {
    const style = this.getStyleSignature().getMergedStyle(this.skinParam.getCurrentStyleBuilder());
    return style!.value('LineColor').asColor(this.skinParam.getIHtmlColorSet());
  }

  /** @see TimingDiagram.java:126-166 */
  private drawInternal(ug: UGraphic): void {
    this.ruler.ensureNotEmpty();
    const stringBounder = ug.getStringBounder();
    const part1MaxWidth = this.getPart1MaxWidth(stringBounder);

    this.drawGeneralBackgrounds(ug);

    const widthPart1 = UTranslate.dx(part1MaxWidth);
    if (this.compactByDefault === false) this.drawBorder(ug);

    ug = ug.apply(UTranslate.dx(TimingDiagram.marginX1));

    this.drawHighlightsBack(ug.apply(widthPart1));
    this.ruler.drawVlines(ug.apply(widthPart1), this.getHeightInner(stringBounder));

    this.drawPlayers(ug, part1MaxWidth);

    ug = ug.apply(widthPart1);
    this.ruler.drawTimeAxis(ug.apply(this.getLastTranslate(stringBounder)), this.timeAxisStategy, this.codes);

    for (const timeMessage of this.messages) this.drawMessages(ug, timeMessage);

    this.drawHighlightsLines(ug);
  }

  /** @see TimingDiagram.java:130-140 */
  private drawGeneralBackgrounds(ug: UGraphic): void {
    const stringBounder = ug.getStringBounder();
    for (const player of this.players.values()) {
      const generalBackgroundColor = player.getGeneralBackgroundColor();
      if (generalBackgroundColor === undefined) continue;
      let ugPlayer = ug.apply(this.getUTranslateForPlayerFrame(player, stringBounder));
      const fullHeight = player.getFrameHeight(stringBounder) + player.panels().getFullHeight(stringBounder);
      ugPlayer = ugPlayer.apply(fore(generalBackgroundColor)).apply(back(generalBackgroundColor));
      ugPlayer.draw(URectangle.build(this.getWidthTotal(stringBounder), fullHeight));
    }
  }

  /** @see TimingDiagram.java:150-159 */
  private drawPlayers(ug: UGraphic, part1MaxWidth: number): void {
    const stringBounder = ug.getStringBounder();
    const widthPart1 = UTranslate.dx(part1MaxWidth);
    for (const player of this.players.values()) {
      const ugPlayer = ug.apply(this.getUTranslateForPlayer(player, stringBounder));
      const ugFrame = ug.apply(this.getUTranslateForPlayerFrame(player, stringBounder));
      if (player.isCompact() === false) this.drawHorizontalSeparator(ugFrame);

      player.drawFrameTitle(ugFrame);
      const panels: Panels = player.panels();
      panels.drawLeftPanel(ugPlayer, part1MaxWidth);
      panels.drawRightPanel(ugPlayer.apply(widthPart1));
    }
  }

  /** @see TimingDiagram.java:168-175 */
  private drawHorizontalSeparator(ug: UGraphic): void {
    const stringBounder = ug.getStringBounder();
    ug = ug.apply(fore(this.black()));
    ug = ug.apply(this.getBorderStroke());
    ug = ug.apply(UTranslate.dx(-TimingDiagram.marginX1));
    ug.draw(ULine.hline(this.getWidthTotal(stringBounder)));
  }

  /** @see TimingDiagram.java:177-183 */
  private drawBorder(ug: UGraphic): void {
    const stringBounder = ug.getStringBounder();
    const border = ULine.vline(this.getLastTranslate(stringBounder).getDy());
    ug = ug.apply(fore(this.black())).apply(this.getBorderStroke());
    ug.draw(border);
    ug.apply(UTranslate.dx(this.getWidthTotal(stringBounder))).draw(border);
  }

  /** @see TimingDiagram.java:185-187 */
  private getBorderStroke(): UStroke {
    return this.getStyleSignature().getMergedStyle(this.skinParam.getCurrentStyleBuilder())!.getStroke();
  }

  /** @see TimingDiagram.java:189-191 */
  private getLastTranslate(stringBounder: StringBounder): UTranslate {
    return this.getUTranslateForPlayer(undefined, stringBounder);
  }

  /** @see TimingDiagram.java:193-198 */
  private drawHighlightsBack(ug: UGraphic): void {
    const height = this.getHeightInner(ug.getStringBounder());
    for (const highlight of this.highlights) highlight.drawHighlightsBack(ug, this.ruler, height);
  }

  /** @see TimingDiagram.java:200-208 */
  private drawHighlightsLines(ug: UGraphic): void {
    const height = this.getHeightInner(ug.getStringBounder());
    for (const highlight of this.highlights) {
      highlight.drawHighlightsLines(ug, this.ruler, height);
      const start = this.ruler.getPosInPixel(highlight.getTickFrom());
      highlight.getCaption(this.skinParam).drawU(ug.apply(new UTranslate(start + 3, 2)));
    }
  }

  /** @see TimingDiagram.java:210-212 */
  private getHeightTotal(stringBounder: StringBounder): number {
    return this.getHeightInner(stringBounder) + this.ruler.getHeight(stringBounder);
  }

  /** @see TimingDiagram.java:214-216 */
  private getHeightInner(stringBounder: StringBounder): number {
    return this.getLastTranslate(stringBounder).getDy();
  }

  /** @see TimingDiagram.java:218-220 */
  private getWidthTotal(stringBounder: StringBounder): number {
    return this.getPart1MaxWidth(stringBounder) + this.ruler.getWidth() + TimingDiagram.marginX1 + this.marginX2;
  }

  /** @see TimingDiagram.java:222-229 */
  private getPart1MaxWidth(stringBounder: StringBounder): number {
    return layout.getPart1MaxWidth(this.players.values(), stringBounder);
  }

  /**
   * Returns silently when either projection is `null` (java:246-247, D7).
   * @see TimingDiagram.java:231-253
   */
  private drawMessages(ug: UGraphic, message: TimeMessage): void {
    const player1 = message.getPlayer1();
    const player2 = message.getPlayer2();

    const stringBounder = ug.getStringBounder();

    const translate1 = this.getUTranslateForPlayer(player1, stringBounder);
    const translate2 = this.getUTranslateForPlayer(player2, stringBounder);

    const pt1 = player1.panels().getTimeProjection(stringBounder, message.getTick1());
    const pt2 = player2.panels().getTimeProjection(stringBounder, message.getTick2());

    if (pt1 === undefined || pt2 === undefined) return;

    const timeArrow = TimeArrow.create(
      pt1.translated(translate1),
      pt2.translated(translate2),
      message.getLabel(),
      this.skinParam,
      message,
    );
    timeArrow.drawU(ug);
  }

  /** @see TimingDiagram.java:255-272 */
  private getUTranslateForPlayer(candidate: Player | undefined, stringBounder: StringBounder): UTranslate {
    return layout.getUTranslateForPlayer(this.players.values(), candidate, stringBounder);
  }

  /** @see TimingDiagram.java:274-290 */
  private getUTranslateForPlayerFrame(candidate: Player | undefined, stringBounder: StringBounder): UTranslate {
    return layout.getUTranslateForPlayerFrame(this.players.values(), candidate, stringBounder);
  }

  /**
   * The constructor arguments every player shares. Clock, analog and binary pass `compact = false`, so the
   * `compactByDefault || compact` is `compactByDefault`, as upstream passes (java:320,330,336); their background is
   * `null` (those constructors take none).
   */
  private stateArgs(
    title: string,
    compact: boolean,
    stereotype: Stereotype | undefined,
    generalBackgroundColor: HColor | undefined,
  ): PlayerBaseArgs {
    return {
      title,
      skinParam: this.skinParam,
      ruler: this.ruler,
      compact: this.compactByDefault || compact,
      stereotype,
      generalBackgroundColor,
    };
  }

  /** @see TimingDiagram.java:292-299 */
  public createPlayerRobust(
    code: string,
    full: string,
    compact: boolean,
    stereotype: Stereotype | undefined,
    backColor: HColor | undefined,
  ): Player {
    const player = new PlayerRobust(this.stateArgs(full, compact, stereotype, backColor));
    this.players.set(code, player);
    this.lastPlayer = player;
    return player;
  }

  /** @see TimingDiagram.java:301-308 */
  public createPlayerConcise(
    code: string,
    full: string,
    compact: boolean,
    stereotype: Stereotype | undefined,
    backColor: HColor | undefined,
  ): Player {
    const player = new PlayerConcise(this.stateArgs(full, compact, stereotype, backColor));
    this.players.set(code, player);
    this.lastPlayer = player;
    return player;
  }

  /** @see TimingDiagram.java:310-317 */
  public createPlayerRectangle(
    code: string,
    full: string,
    compact: boolean,
    stereotype: Stereotype | undefined,
    backColor: HColor | undefined,
  ): Player {
    const player = new PlayerRectangle(this.stateArgs(full, compact, stereotype, backColor));
    this.players.set(code, player);
    this.lastPlayer = player;
    return player;
  }

  /**
   * Passes `compactByDefault`, not `compact`, and does not set `lastPlayer` (java:320); adds the period as a ruler
   * tick (java:324-325).
   * @see TimingDiagram.java:319-328
   */
  public createPlayerClock(args: CreatePlayerClockArgs): PlayerClock {
    const player = new PlayerClock({
      ...this.stateArgs(args.full, false, args.stereotype, undefined),
      period: args.period,
      pulse: args.pulse,
      offset: args.offset,
    });
    this.players.set(args.code, player);
    this.clocks.set(args.code, player);
    const tick = new TimeTick(args.period, TimingFormat.DECIMAL);
    this.ruler.addTime(tick);
    return player;
  }

  /** Passes `compactByDefault`, not `compact`, and does not set `lastPlayer` (java:330). @see java:330-335 */
  public createPlayerAnalog(
    code: string,
    full: string,
    _compact: boolean,
    stereotype: Stereotype | undefined,
  ): PlayerAnalog {
    const player = new PlayerAnalog(this.stateArgs(full, false, stereotype, undefined));
    this.players.set(code, player);
    return player;
  }

  /** Passes `compactByDefault`, not `compact`, and does not set `lastPlayer` (java:336). @see java:336-341 */
  public createPlayerBinary(code: string, full: string, _compact: boolean, stereotype: Stereotype | undefined): Player {
    const player = new PlayerBinary(this.stateArgs(full, false, stereotype, undefined));
    this.players.set(code, player);
    return player;
  }

  /** @see TimingDiagram.java:343-349 */
  public createTimeMessage(
    player1: Player,
    time1: TimeTick,
    player2: Player,
    time2: TimeTick,
    label: string | null,
  ): TimeMessage {
    const message = new TimeMessage(
      new TickInPlayer(player1, time1),
      new TickInPlayer(player2, time2),
      label,
      this.skinParam,
    );
    this.messages.push(message);
    return message;
  }

  /** @see TimingDiagram.java:351-357 */
  public addTime(time: TimeTick, code: string | undefined): void {
    this.now = time;
    this.ruler.addTime(time);
    if (code !== undefined) this.codes.set(code, time);
  }

  /** @see TimingDiagram.java:359-361 */
  public getCodeValue(code: string): TimeTick | undefined {
    return this.codes.get(code);
  }

  /** @see TimingDiagram.java:363-365 */
  public updateNow(time: TimeTick | undefined): void {
    this.now = time;
  }

  /** @see TimingDiagram.java:367-369 */
  public getPlayer(code: string): Player | undefined {
    return this.players.get(code);
  }

  /** @see TimingDiagram.java:371-373 */
  public getNow(): TimeTick | undefined {
    return this.now;
  }

  /** @see TimingDiagram.java:375-381 */
  public getClockValue(clockName: string, nb: number): TimeTick | undefined {
    const clock = this.clocks.get(clockName);
    if (clock === undefined) return undefined;

    return new TimeTick(clock.getPeriod().multiply(BigDecimal.valueOf(nb)), TimingFormat.DECIMAL);
  }

  /** @see TimingDiagram.java:383-385 */
  public setLastPlayer(player: Player): void {
    this.lastPlayer = player;
  }

  /** @see TimingDiagram.java:387-389 */
  public getLastPlayer(): Player | undefined {
    return this.lastPlayer;
  }

  /** @see TimingDiagram.java:391-393 */
  public scaleInPixels(tick: number, pixel: number): void {
    this.ruler.scaleInPixels(tick, pixel);
  }

  /** @see TimingDiagram.java:395-398 */
  public setTimeAxisStategy(newStrategy: TimeAxisStategy): CommandExecutionResult {
    this.timeAxisStategy = newStrategy;
    return CommandExecutionResult.ok();
  }

  /** @see TimingDiagram.java:400-404 */
  public highlight(tickFrom: TimeTick, tickTo: TimeTick, caption: Display, colors: Colors): CommandExecutionResult {
    this.highlights.push(new Highlight(this.skinParam, tickFrom, tickTo, caption, colors));
    return CommandExecutionResult.ok();
  }

  /** @see TimingDiagram.java:406-408 */
  public goCompactMode(): void {
    this.compactByDefault = true;
  }

  /**
   * `new SimpleDateFormat(dateFormat, Locale.US)`; its `IllegalArgumentException` is `Bad date format`.
   * @see TimingDiagram.java:411-419
   */
  public useDateFormat(dateFormat: string): CommandExecutionResult {
    try {
      checkSimpleDateFormatPattern(dateFormat);
      this.sdfPattern = dateFormat;
    } catch {
      return CommandExecutionResult.error('Bad date format');
    }
    return CommandExecutionResult.ok();
  }

  /** @see TimingDiagram.java:421-426 */
  public getTimingFormatDate(): TimingFormat {
    if (this.sdfPattern === undefined) return TimingFormat.DATE;
    return TimingFormat.create({ pattern: this.sdfPattern, zone: this.zone });
  }

  /** @see TimingDiagram.java:428-430 */
  public setStopAt(timeTick: TimeTick): void {
    this.ruler.setStopAt(timeTick);
  }
}
