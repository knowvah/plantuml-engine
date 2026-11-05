/**
 * ChartAnnotation — text at a data coordinate, with an optional arrow. Java's
 * `Object xPosition` is a `Double` or a `String`, tested with `instanceof`; here
 * it is `number | string`, tested with `typeof`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/ChartAnnotation.java
 */
export class ChartAnnotation {
  private readonly text: string;
  private readonly xPosition: number | string;
  private readonly yPosition: number;
  private readonly showArrow: boolean;

  /** @see ChartAnnotation.java:56-61 */
  constructor(text: string, xPosition: number | string, yPosition: number, showArrow: boolean) {
    this.text = text;
    this.xPosition = xPosition;
    this.yPosition = yPosition;
    this.showArrow = showArrow;
  }

  getText(): string {
    return this.text;
  }

  getXPosition(): number | string {
    return this.xPosition;
  }

  getYPosition(): number {
    return this.yPosition;
  }

  isShowArrow(): boolean {
    return this.showArrow;
  }
}
