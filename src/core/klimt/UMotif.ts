import type { UGraphic } from './UGraphic.js';
import { DotPath } from './shape/DotPath.js';
import { XPoint2D } from './geom/XPoint2D.js';

/** `A`..`Z` encode 0..25 (`UMotif.java:95-96`). */
const UPPER_FIRST = 'A'.charCodeAt(0);
const UPPER_LAST = 'Z'.charCodeAt(0);
/** `a`..`w` encode 26..48 (`UMotif.java:98-99`). */
const LOWER_FIRST = 'a'.charCodeAt(0);
const LOWER_LAST = 'w'.charCodeAt(0);
const LOWER_OFFSET = 26;
/** A code is a cell of a 7-wide grid centred on (0, 0): `v % 7 - 3`, `v / 7 - 3` (`UMotif.java:87-92`). */
const GRID = 7;
const GRID_CENTRE = 3;

/** The two `drawHorizontal`/`drawVertical` overloads' parameter lists: `(ug, x, y, nb)` or `(x, y, nb)`. */
type DrawArgs = [UGraphic, number, number, number] | [number, number, number];

/**
 * A polyline motif: a list of points, each relative to the motif's origin, that
 * `drawHorizontal`/`drawVertical` repeat end to end as a {@link DotPath} of
 * degenerate cubics (each control point is its own end point). The string form
 * encodes one relative step per character (`convertPoint`); `PSystemPath`'s
 * egg draws it (`GraphicsPath.java:80-81`).
 *
 * Mutation contract: the point list is built in the constructor and never
 * changes afterwards; `getPoints` hands out a read-only view.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/UMotif.java
 */
export class UMotif {
  private readonly points: XPoint2D[] = [];

  /**
   * `UMotif(String s)`: each character is a step from the previous point,
   * starting at (0, 0). Throws `IllegalArgumentException` on a character
   * outside `A-Z`/`a-w` (`convertFromChar`).
   * @see ~/git/plantuml/.../klimt/UMotif.java:60-67
   */
  constructor(s: string) {
    let last = new XPoint2D(0, 0);
    for (let i = 0; i < s.length; i++) {
      const read = UMotif.convertPoint(s.charAt(i));
      last = last.moveByPoint(read);
      this.points.push(last);
    }
  }

  /**
   * `UMotif(int... data)`: absolute points, read as (x, y) pairs. Upstream's
   * `if (TeaVM.a()) assert data.length % 2 == 0;` is a no-op in the port (the
   * port has no TeaVM build and no JVM assertions), so an odd trailing value is
   * read with an `undefined` partner exactly where the JVM would index past it.
   * @see ~/git/plantuml/.../klimt/UMotif.java:53-58
   */
  static fromInts(...data: number[]): UMotif {
    const result = new UMotif('');
    for (let i = 0; i < data.length; i += 2) {
      result.points.push(new XPoint2D(data[i]!, data[i + 1]!));
    }
    return result;
  }

  /** @see ~/git/plantuml/.../klimt/UMotif.java:69-71 */
  getLength(): number {
    return this.points[0]!.distance(this.points[this.points.length - 1]!);
  }

  /** `Collections.unmodifiableList(points)`. @see ~/git/plantuml/.../klimt/UMotif.java:73-75 */
  getPoints(): readonly XPoint2D[] {
    return this.points;
  }

  /**
   * `floor(width / len)` horizontal repetitions, then `floor(height / len)`
   * vertical ones from the horizontal run's end point, joined.
   * @see ~/git/plantuml/.../klimt/UMotif.java:77-85
   */
  getRectangle(width: number, height: number): DotPath {
    const len = this.getLength();
    const nb1 = Math.trunc(width / len);
    let h1 = this.drawHorizontal(0, 0, nb1);
    const nb2 = Math.trunc(height / len);
    const v1 = this.drawVertical(h1.getEndPoint().x, h1.getEndPoint().y, nb2);
    h1 = h1.addAfter(v1);
    return h1;
  }

  /** @see ~/git/plantuml/.../klimt/UMotif.java:87-92 */
  static convertPoint(c: string): XPoint2D {
    const v = UMotif.convertFromChar(c);
    const x = v % GRID;
    const y = Math.trunc(v / GRID);
    return new XPoint2D(x - GRID_CENTRE, y - GRID_CENTRE);
  }

  /**
   * Throws an `Error` named `IllegalArgumentException` outside `A-Z`/`a-w`,
   * following the chart precedent (`ChartDiagramFactory.ts`); it reaches the
   * render's error page as the jar's crash page does (ipe D3).
   * @see ~/git/plantuml/.../klimt/UMotif.java:94-102
   */
  static convertFromChar(c: string): number {
    const code = c.charCodeAt(0);
    if (code >= UPPER_FIRST && code <= UPPER_LAST) {
      return code - UPPER_FIRST;
    }
    if (code >= LOWER_FIRST && code <= LOWER_LAST) {
      return code - LOWER_FIRST + LOWER_OFFSET;
    }
    const error = new Error('IllegalArgumentException');
    error.name = 'IllegalArgumentException';
    throw error;
  }

  /**
   * Both overloads: `drawHorizontal(UGraphic, x, y, nb)` draws the path
   * (java:104-107); `drawHorizontal(x, y, nb)` builds it (java:114-122), each
   * repetition starting at the previous one's end point.
   */
  drawHorizontal(ug: UGraphic, x: number, y: number, nb: number): void;
  drawHorizontal(x: number, y: number, nb: number): DotPath;
  drawHorizontal(...args: DrawArgs): DotPath | void {
    if (args.length === 4) {
      const [ug, x, y, nb] = args;
      ug.draw(this.drawHorizontal(x, y, nb));
      return;
    }
    let [x, y] = args;
    let path = new DotPath();
    for (let i = 0; i < args[2]; i++) {
      path = this.addHorizontal(x, y, path);
      x = path.getEndPoint().x;
      y = path.getEndPoint().y;
    }
    return path;
  }

  /** As {@link drawHorizontal}, x and y swapped (java:109-112, :124-132). */
  drawVertical(ug: UGraphic, x: number, y: number, nb: number): void;
  drawVertical(x: number, y: number, nb: number): DotPath;
  drawVertical(...args: DrawArgs): DotPath | void {
    if (args.length === 4) {
      const [ug, x, y, nb] = args;
      ug.draw(this.drawVertical(x, y, nb));
      return;
    }
    let [x, y] = args;
    let path = new DotPath();
    for (let i = 0; i < args[2]; i++) {
      path = this.addVertical(x, y, path);
      x = path.getEndPoint().x;
      y = path.getEndPoint().y;
    }
    return path;
  }

  /** @see ~/git/plantuml/.../klimt/UMotif.java:134-147 */
  private addHorizontal(x: number, y: number, pathIn: DotPath): DotPath {
    let path = pathIn;
    let lastx = 0;
    let lasty = 0;
    for (const p of this.points) {
      const x1 = lastx + x;
      const y1 = lasty + y;
      const x2 = p.getX() + x;
      const y2 = p.getY() + y;
      path = path.addAfter({ x1, y1, ctrlx1: x1, ctrly1: y1, ctrlx2: x2, ctrly2: y2, x2, y2 });
      lastx = p.getX();
      lasty = p.getY();
    }
    return path;
  }

  /** @see ~/git/plantuml/.../klimt/UMotif.java:149-162 */
  private addVertical(x: number, y: number, pathIn: DotPath): DotPath {
    let path = pathIn;
    let lastx = 0;
    let lasty = 0;
    for (const p of this.points) {
      const x1 = lastx + x;
      const y1 = lasty + y;
      const x2 = p.getY() + x;
      const y2 = p.getX() + y;
      path = path.addAfter({ x1, y1, ctrlx1: x1, ctrly1: y1, ctrlx2: x2, ctrly2: y2, x2, y2 });
      lastx = p.getY();
      lasty = p.getX();
    }
    return path;
  }
}
