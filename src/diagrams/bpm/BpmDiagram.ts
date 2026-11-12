/**
 * BpmDiagram — `@startbpm`: the recorded events replay into a grid of
 * lines and columns, three cleaners simplify it, and `GridArray` draws it.
 *
 * Not ported (D1): the commented-out `getUDrawable` (java:78-86).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/BpmDiagram.java:53-187
 */
import type { UmlSource } from '../../core/block-extractor.js';
import { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { SkinParamFresh } from '../../core/skin/SkinParamFresh.js';
import type { SkinParamClasspath } from '../../core/skin/SkinParamFresh.js';
import { OptionKey } from '../../core/tim/EaterOption.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import { TitledDiagram } from '../../core/TitledDiagram.js';
import { BpmBranch } from './BpmBranch.js';
import { BpmElement } from './BpmElement.js';
import { BpmElementType } from './BpmElementType.js';
import type { BpmEvent } from './BpmEvent.js';
import { BpmEventAdd } from './BpmEventAdd.js';
import { BpmEventGoto } from './BpmEventGoto.js';
import { BpmEventResume } from './BpmEventResume.js';
import type { Cell } from './Cell.js';
import { CleanerEmptyLine } from './CleanerEmptyLine.js';
import { CleanerInterleavingLines } from './CleanerInterleavingLines.js';
import { CleanerMoveBlock } from './CleanerMoveBlock.js';
import { Col } from './Col.js';
import { Coord } from './Coord.js';
import { Grid } from './Grid.js';
import { Line } from './Line.js';

/** `ArrayDeque#getLast`/`removeLast` on an empty deque (D5, D9). */
function noSuchElement(): never {
  throw new Error('NoSuchElementException: no open branch');
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/BpmDiagram.java:53 */
export class BpmDiagram extends TitledDiagram {
  /** @see BpmDiagram.java:65 */
  private readonly start = new BpmElement(null, BpmElementType.START);
  /** @see BpmDiagram.java:67 */
  private readonly events: BpmEvent[] = [];
  /** An `ArrayDeque`, used from its tail. @see BpmDiagram.java:68 */
  private readonly branches: BpmBranch[] = [];
  /** `TitledDiagram`'s `SkinParam` (no command here can reach it). */
  private readonly skinParam: SkinParamFresh;
  /** @see BpmDiagram.java:93 */
  private current: Coord | undefined;
  /** @see BpmDiagram.java:94 */
  private last: Cell | undefined;

  /** `classpath` is port-only (ADR-2). @see BpmDiagram.java:74-76 */
  constructor(
    source: UmlSource,
    preprocessing: PreprocessingArtifact,
    private readonly classpath?: SkinParamClasspath,
  ) {
    super(source, 'BPM', undefined, preprocessing);
    this.skinParam = new SkinParamFresh(classpath);
  }

  /** @see BpmDiagram.java:70-72 */
  getDescription(): string {
    return '(Bpm Diagram)';
  }

  getSkinParam(): SkinParamFresh {
    return this.skinParam;
  }

  /**
   * `skinParam.handwritten()` (always false: no `skinparam` can run), else
   * `!option handwritten` through the artifact.
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/TitledDiagram.java:114-118
   */
  isHandwritten(): boolean {
    return this.preprocessing.getOptions().get(OptionKey.HANDWRITTEN)?.toLowerCase() === 'true';
  }

  /** The recorded events, for the tests. */
  getEvents(): readonly BpmEvent[] {
    return this.events;
  }

  /** The three cleaners until none changes the grid. @see BpmDiagram.java:54-63 */
  private cleanGrid(grid: Grid): void {
    for (;;) {
      const v1 = new CleanerEmptyLine().clean(grid);
      const v2 = new CleanerInterleavingLines().clean(grid);
      const v3 = new CleanerMoveBlock().clean(grid);
      if (!v1 && !v2 && !v3) return;
    }
  }

  /** @see BpmDiagram.java:88-91 */
  addEvent(event: BpmEvent): CommandExecutionResult {
    this.events.push(event);
    return CommandExecutionResult.ok();
  }

  /** @see BpmDiagram.java:96-145 */
  private createGrid(): Grid {
    const grid = new Grid();
    this.current = grid.getRoot();
    this.last = grid.getCell(this.current);
    grid.getCell(this.current).setData(this.start);
    for (const event of this.events) {
      if (event instanceof BpmEventAdd) this.addInGrid(grid, event.getElement());
      else if (event instanceof BpmEventResume) this.resumeInGrid(grid, event.getId());
      else if (event instanceof BpmEventGoto) this.gotoInGrid(grid, event.getId());
      else throw new Error('IllegalStateException: an unknown event');
    }
    grid.addConnections();
    return grid;
  }

  /**
   * The `BpmEventResume` branch. Java's `if (last == null)` guard (java:111)
   * cannot fire: `getCell` creates a cell or throws first.
   * @see BpmDiagram.java:107-118
   */
  private resumeInGrid(grid: Grid, idDestination: string): void {
    this.current = grid.getById(idDestination);
    this.last = grid.getCell(this.current);
    this.current = this.newLineUnder(grid, this.current!);
  }

  /** The `BpmEventGoto` branch; its `last == null` guard (java:125) cannot fire either. @see BpmDiagram.java:119-133 */
  private gotoInGrid(grid: Grid, idDestination: string): void {
    this.current = grid.getById(idDestination);
    const src = this.last!;
    this.last = grid.getCell(this.current);
    this.current = this.newLineUnder(grid, this.current!);
    src.addConnectionTo2(this.last.getData());
  }

  /** `nav.insertAfter(new Line())`, then the coord there in the same column. @see BpmDiagram.java:114-118,128-132 */
  private newLineUnder(grid: Grid, target: Coord): Coord {
    const nav = grid.linesOf(target);
    const newLine = new Line();
    nav.insertAfter(newLine);
    const row = target.getCol();
    return new Coord(newLine, row);
  }

  /** @see BpmDiagram.java:147-156 */
  private addInGrid(grid: Grid, element: BpmElement): void {
    const nav = grid.colsOf(this.current!);
    const newRow = new Col();
    nav.insertAfter(newRow);
    this.current = new Coord(this.current!.getLine(), newRow);
    grid.getCell(this.current).setData(element);
    this.last!.addConnectionTo2(grid.getCell(this.current).getData());
    this.last = grid.getCell(this.current);
  }

  /** @see BpmDiagram.java:158-162 */
  newBranch(): CommandExecutionResult {
    const branch = new BpmBranch(this.events.length);
    this.branches.push(branch);
    return this.addEvent(new BpmEventAdd(branch.getEntryElement()));
  }

  /** The second arm adds the exit merge; later arms `goto` it. @see BpmDiagram.java:164-173 */
  elseBranch(): CommandExecutionResult {
    const branch = this.branches[this.branches.length - 1] ?? noSuchElement();
    const counter = branch.incAndGetCounter();
    if (counter === 2) {
      this.addEvent(new BpmEventAdd(branch.getElseElement()));
      return this.addEvent(branch.getResumeEntryEvent());
    }
    this.addEvent(branch.getGoToEndEvent());
    return this.addEvent(branch.getResumeEntryEvent());
  }

  /** @see BpmDiagram.java:175-178 */
  endBranch(): CommandExecutionResult {
    const branch = this.branches.pop() ?? noSuchElement();
    return this.addEvent(branch.getGoToEndEvent());
  }

  /** @see BpmDiagram.java:180-186 */
  getTextBlock(): TextBlock {
    const grid = this.createGrid();
    this.cleanGrid(grid);
    return grid.toArray(new SkinParamFresh(this.classpath, this.preprocessing.getOptions()));
  }
}
