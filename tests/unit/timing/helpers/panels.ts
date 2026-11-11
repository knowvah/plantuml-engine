/** A concrete `PanelsNoLeft` that exposes `Panels`' protected members, for tests of the base classes. */
import type { Position } from '../../../../src/core/abel/Position.js';
import type { StringBounder } from '../../../../src/core/klimt/font/StringBounder.js';
import type { XPoint2D } from '../../../../src/core/klimt/geom/XPoint2D.js';
import type { ULine } from '../../../../src/core/klimt/shape/ULine.js';
import type { UGraphic } from '../../../../src/core/klimt/UGraphic.js';
import type { Fashion } from '../../../../src/core/klimt/Fashion.js';
import type { UStroke } from '../../../../src/core/klimt/UStroke.js';
import type { FontConfiguration } from '../../../../src/core/klimt/shape/UText.js';
import type { TextBlock } from '../../../../src/core/klimt/shape/TextBlock.js';
import type { PanelsArgs } from '../../../../src/diagrams/timing/graphic/Panels.js';
import { PanelsNoLeft } from '../../../../src/diagrams/timing/graphic/PanelsNoLeft.js';
import type { IntricatedPoint } from '../../../../src/diagrams/timing/graphic/IntricatedPoint.js';
import type { TimeConstraint } from '../../../../src/diagrams/timing/TimeConstraint.js';
import type { TimingNote } from '../../../../src/diagrams/timing/TimingNote.js';

export class TestPanels extends PanelsNoLeft {
  public constructor(args: PanelsArgs) {
    super(args);
  }
  public drawRightPanel(): void {}
  public getFullHeight(): number {
    return 0;
  }
  public getTimeProjection(): IntricatedPoint | undefined {
    return undefined;
  }
  public static constants(): Record<string, number> {
    return {
      MARGIN_Y: PanelsNoLeft['MARGIN_Y'],
      MARGIN_X: PanelsNoLeft['MARGIN_X'],
      BOTTOM_MARGIN: PanelsNoLeft['BOTTOM_MARGIN'],
      LEFT_PANEL_MIN_WIDTH: PanelsNoLeft['LEFT_PANEL_MIN_WIDTH'],
    };
  }
  public constraintList(): readonly TimeConstraint[] {
    return this.getConstraints();
  }
  public noteList(): readonly TimingNote[] {
    return this.getNotes();
  }
  public heightForConstraints(sb: StringBounder): number {
    return this.getHeightForConstraints(sb);
  }
  public heightForNotes(sb: StringBounder, position: Position): number {
    return this.getHeightForNotes(sb, position);
  }
  public drawConstraintsAt(ug: UGraphic): void {
    this.drawConstraints(ug);
  }
  public drawNotesAt(ug: UGraphic, position: Position): void {
    this.drawNotes(ug, position);
  }
  public context(): Fashion {
    return this.getContext();
  }
  public stroke(): UStroke {
    return this.getStroke();
  }
  public fontConfiguration(): FontConfiguration {
    return this.getFontConfiguration();
  }
  public textBlock(value: string): TextBlock {
    return this.getTextBlock(value);
  }
  public createText(value: string): TextBlock {
    return this.createTextBlock(value);
  }
  public hLineFromPoint(ug: UGraphic, start: XPoint2D, length: number): void {
    this.drawHLineFromPoint(ug, start, length);
  }
  public hBetweenTimes(ug: UGraphic, start: number, end: number): void {
    this.drawHorizontalBetweenTimes(ug, start, end);
  }
  public x(time: number): number {
    return this.xOfTime(time);
  }
  public vline(ug: UGraphic, x: number, y: number, line: ULine): void {
    this.drawVline(ug, x, y, line);
  }
}

/** A subclass that moves each constraint up by its own delta (`getConstraintDeltaY`, java:105-107). */
export class DeltaPanels extends TestPanels {
  protected override getConstraintDeltaY(): number {
    return 3;
  }
}
