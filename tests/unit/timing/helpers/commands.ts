/** Drives timing commands over source lines, as `TimingDiagramFactory` does for the commands built so far. */
import { CommandControl } from '../../../../src/core/command/CommandControl.js';
import type { CommandExecutionResult } from '../../../../src/core/command/CommandExecutionResult.js';
import { ParserPass } from '../../../../src/core/command/ParserPass.js';
import type { SingleLineCommand2 } from '../../../../src/core/command/SingleLineCommand2.js';
import { UTranslate } from '../../../../src/core/klimt/UTranslate.js';
import { PreprocessingArtifact } from '../../../../src/core/tim/PreprocessingArtifact.js';
import { StringLocated } from '../../../../src/core/tim/StringLocated.js';
import { CommandAnalog } from '../../../../src/diagrams/timing/command/CommandAnalog.js';
import { CommandAtPlayer } from '../../../../src/diagrams/timing/command/CommandAtPlayer.js';
import { CommandAtTime } from '../../../../src/diagrams/timing/command/CommandAtTime.js';
import { CommandBinary } from '../../../../src/diagrams/timing/command/CommandBinary.js';
import { CommandChangeStateByPlayerCode } from '../../../../src/diagrams/timing/command/CommandChangeStateByPlayerCode.js';
import { CommandChangeStateByTime } from '../../../../src/diagrams/timing/command/CommandChangeStateByTime.js';
import { CommandClock } from '../../../../src/diagrams/timing/command/CommandClock.js';
import { CommandDefineStateLong } from '../../../../src/diagrams/timing/command/CommandDefineStateLong.js';
import { CommandDefineStateShort } from '../../../../src/diagrams/timing/command/CommandDefineStateShort.js';
import { CommandConstraint } from '../../../../src/diagrams/timing/command/CommandConstraint.js';
import { CommandHideTimeAxis } from '../../../../src/diagrams/timing/command/CommandHideTimeAxis.js';
import { CommandHighlight } from '../../../../src/diagrams/timing/command/CommandHighlight.js';
import { CommandModeCompact } from '../../../../src/diagrams/timing/command/CommandModeCompact.js';
import { CommandNote } from '../../../../src/diagrams/timing/command/CommandNote.js';
import { CommandPixelHeight } from '../../../../src/diagrams/timing/command/CommandPixelHeight.js';
import { CommandScalePixel } from '../../../../src/diagrams/timing/command/CommandScalePixel.js';
import { CommandTicks } from '../../../../src/diagrams/timing/command/CommandTicks.js';
import { CommandTimeMessage } from '../../../../src/diagrams/timing/command/CommandTimeMessage.js';
import { CommandUseDateFormat } from '../../../../src/diagrams/timing/command/CommandUseDateFormat.js';
import { CommandRobustConcise } from '../../../../src/diagrams/timing/command/CommandRobustConcise.js';
import { TimingDiagram } from '../../../../src/diagrams/timing/TimingDiagram.js';
import type { SkinParam } from '../../../../src/diagrams/timing/timing-skin-param.js';
import { stringBounder, svgGraphic } from '../../mindmap/helpers/mindmap-skin.js';
import { svgElements, timingSkinParam } from './timing.js';

/** `TimingDiagramFactory#initCommandsList` order (java:83-109), every single-line command (`CommandNoteLong` is multi-line). */
export function singleLineCommands(): SingleLineCommand2<TimingDiagram>[] {
  return [
    new CommandRobustConcise(),
    new CommandClock(),
    new CommandAnalog(),
    new CommandBinary(),
    new CommandDefineStateShort(),
    new CommandDefineStateLong(),
    new CommandChangeStateByPlayerCode(),
    new CommandChangeStateByTime(),
    new CommandAtTime(),
    new CommandAtPlayer(),
    new CommandTimeMessage(),
    new CommandNote(),
    new CommandConstraint(),
    new CommandScalePixel(),
    new CommandHideTimeAxis(),
    new CommandHighlight(),
    new CommandModeCompact(),
    new CommandTicks(),
    new CommandPixelHeight(),
    new CommandUseDateFormat(),
  ];
}

export function newDiagram(skinParam: SkinParam = timingSkinParam() as SkinParam): TimingDiagram {
  return new TimingDiagram({ lines: [] }, new PreprocessingArtifact(), skinParam);
}

/** The first command (in factory order) that accepts `line`, executed; throws when none does. */
export function runLine(diagram: TimingDiagram, line: string): CommandExecutionResult {
  const located = new StringLocated(line, undefined);
  for (const command of singleLineCommands()) {
    if (command.isValid(located) === CommandControl.OK) return command.execute(diagram, located, ParserPass.ONE);
  }
  throw new Error(`no command accepts: ${line}`);
}

/** Every line run in order; the diagram and each result. */
export function runLines(...lines: string[]): { diagram: TimingDiagram; results: CommandExecutionResult[] } {
  const diagram = newDiagram();
  return { diagram, results: lines.map((line) => runLine(diagram, line)) };
}

/** A probe source (its `@startuml` and `@enduml` lines dropped) run through the commands. */
export function runSource(source: string): TimingDiagram {
  const lines = source.split('\n').filter((l) => l !== '' && !l.startsWith('@startuml') && !l.startsWith('@enduml'));
  return runLines(...lines).diagram;
}

/** Every element the diagram's text block draws, as the jar prints the body (chrome at 10, 10). */
export function drawBody(diagram: TimingDiagram): string[] {
  const root = svgGraphic();
  diagram.getTextBlock().drawU(root.apply(new UTranslate(10, 10)));
  return svgElements(root.getSvgString());
}

export function blockDimension(diagram: TimingDiagram): [number, number] {
  const dim = diagram.getTextBlock().calculateDimension(stringBounder());
  return [dim.getWidth(), dim.getHeight()];
}
