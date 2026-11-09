import { describe, expect, it } from 'vitest';
import { DiagramType } from '../../../src/core/diagram-type-set.js';
import { DiagramRegistry } from '../../../src/core/dispatcher.js';
import { Rankdir } from '../../../src/core/klimt/geom/Rankdir.js';
import { parseRefusalOf } from '../../../src/core/parse-refusal.js';
import { PragmaKey } from '../../../src/core/skin/PragmaKey.js';
import { OptionKey } from '../../../src/core/tim/EaterOption.js';
import type { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';
import type { ActivityDiagram } from '../../../src/diagrams/activity-legacy/ActivityDiagram.js';
import { initCommandsList } from '../../../src/diagrams/activity-legacy/ActivityDiagramFactory.js';
import { activityLegacyPlugin } from '../../../src/diagrams/activity-legacy/index.js';
import type { HideOrShow } from '../../../src/core/cucadiagram/HideOrShow.js';
import { parseLines, parseOk, sourceOf } from './helpers.js';

/** `ActivityDiagramFactory.java:75-100`, one entry per `cmds.add` (the `CommandInnerConcurrent` line is commented out). */
const UPSTREAM_ORDER = [
  'UBrexCommandFootboxIgnored',
  'CommonCommands.addCommonCommands1',
  'UBrexCommandRankDir',
  'UBrexCommandPartition',
  'UBrexCommandEndPartition',
  'CommandLinkLongActivity',
  'CommandFactoryNoteActivity.createSingleLine',
  'CommandFactoryNoteActivity.createMultiLine(false)',
  'CommandFactoryNoteOnLink.createSingleLine',
  'CommandFactoryNoteOnLink.createMultiLine(false)',
  'UBrexCommandIf',
  'UBrexCommandElse',
  'UBrexCommandEndif',
  'CommandLinkActivity',
  'UBrexCommandHideShow2',
];

describe('ActivityDiagramFactory#initCommandsList', () => {
  it('lists the commands in upstream order', () => {
    expect(initCommandsList().map((command) => command.name)).toEqual(UPSTREAM_ORDER);
  });

  it('has no pending placeholder: every command claims lines and the note commands are registered', () => {
    const commands = initCommandsList();
    expect(commands).toHaveLength(UPSTREAM_ORDER.length);
    expect(
      parseOk('(*) --> A', 'note right: n')
        .leafs()
        .map((e) => e.getName()),
    ).toContain('GN4');
  });
});

describe('parse: empty diagram', () => {
  const emptySource = { ...sourceOf(), types: new Set([DiagramType.ACTIVITY]) };

  it('is answered by the dispatcher, never reaching the plugin (PSystemCommandFactory.java:117-122)', () => {
    const registry = new DiagramRegistry();
    registry.register(activityLegacyPlugin);

    expect(registry.isEmptyDescription(emptySource)).toBe(true);
  });

  it('would, if reached, build a diagram with no leaf', () => {
    expect(parseOk().leafs()).toHaveLength(0);
  });
});

describe('parse: common commands and rank direction', () => {
  it('accepts "hide empty" (HideShow2) and records it as a hide of "empty"', () => {
    const diagram = parseOk('hide empty');

    const hides = (diagram as unknown as { hides2: HideOrShow[] }).hides2;
    expect(hides).toHaveLength(1);
    expect(hides[0]!.toString()).toContain('empty');
  });

  it('accepts "left to right direction" and sets the skin param rank direction', () => {
    expect(parseOk().getSkinParam().getRankdir()).toBe(Rankdir.TOP_TO_BOTTOM);
    expect(parseOk('left to right direction').getSkinParam().getRankdir()).toBe(Rankdir.LEFT_TO_RIGHT);
    expect(parseOk('left to right direction', 'top to bottom direction').getSkinParam().getRankdir()).toBe(
      Rankdir.TOP_TO_BOTTOM,
    );
  });

  it('accepts both together, and "hide footbox" through UBrexCommandFootboxIgnored', () => {
    const diagram = parseOk('hide empty', 'left to right direction', 'hide footbox', 'show footbox');

    expect(diagram.getSkinParam().getRankdir()).toBe(Rankdir.LEFT_TO_RIGHT);
    expect((diagram as unknown as { hides2: HideOrShow[] }).hides2).toHaveLength(1);
  });

  it('accepts the hides that are ignored on an activity diagram', () => {
    const diagram = parseOk('hide empty description', 'hide members', 'hide circle', 'hide private methods');

    expect((diagram as unknown as { hides2: HideOrShow[] }).hides2).toHaveLength(0);
  });

  it('title/legend land on the annotations', () => {
    const diagram = parseOk('title My Title');

    expect(diagram.annotations.title.display?.toString()).toBe('My Title');
  });

  it('scale lands on the diagram', () => {
    expect(parseOk('scale 2').scale).toEqual({ kind: 'simple', factor: 2 });
  });

  it('accepts page, minwidth, rotate and blank lines', () => {
    const result = parseLines('page 2x2', 'minwidth 10', 'rotate', '   ');

    expect(parseRefusalOf(result)).toBeUndefined();
  });

  it('refuses a page of 0 with CommandPage\'s "Argument must be positive"', () => {
    const refusal = parseRefusalOf(parseLines('page 0x2'));

    expect(refusal).toMatchObject({ kind: 'execution', message: 'Argument must be positive', line: 0 });
  });
});

describe('parse: namespace separator and pragma', () => {
  it('"set separator ::" sets it, "set separator none" clears it (CommandNamespaceSeparator.java:95-104)', () => {
    expect(parseOk('set separator ::').getNamespaceSeparator()).toBe('::');
    expect(parseOk('set separator ::', 'set namespaceseparator none').getNamespaceSeparator()).toBeUndefined();
  });

  it('"!pragma ratio 0.5" fills the diagram pragma', () => {
    expect(parseOk('!pragma ratio 0.5').getPragma().getValue(PragmaKey.RATIO)).toBe('0.5');
  });

  it('"!pragma layout smetana" and "!pragma layout elk" select the engines', () => {
    expect(parseOk('!pragma layout smetana').isUseSmetana()).toBe(true);
    expect(parseOk('!pragma layout elk').isUseElk()).toBe(true);
  });

  it('"!pragma graphviz_dot jdot" is the renamed-directive error (CommandPragma.java:117-118)', () => {
    const refusal = parseRefusalOf(parseLines('!pragma graphviz_dot jdot'));

    expect(refusal).toMatchObject({
      kind: 'execution',
      message: "This directive has been renamed to '!pragma layout smetana'. Please update your diagram.",
    });
  });
});

describe('parse: refusal', () => {
  it('refuses a line no command claims with "Syntax Error?", naming the line and counting it as consumed', () => {
    const refusal = parseRefusalOf(parseLines('hide empty', 'not a command'));

    expect(refusal).toMatchObject({ kind: 'syntax', line: 1, consumed: 2, message: 'Syntax Error?' });
  });

  it('claims the legacy link line through CommandLinkActivity', () => {
    expect(parseRefusalOf(parseLines('(*) --> "First activity"'))).toBeUndefined();
  });

  it("refuses lap-url's link line, which the jar answers with a syntax error", () => {
    expect(parseRefusalOf(parseLines('(*) --> [[http://example.com]] A'))).toMatchObject({ kind: 'syntax', line: 0 });
  });
});

describe('activityLegacyPlugin', () => {
  it('is keyed activity-legacy and parses to the populated ActivityDiagram', () => {
    expect(activityLegacyPlugin.type).toBe('activity-legacy');
    const ast = activityLegacyPlugin.parse(sourceOf('hide empty'));

    expect(parseRefusalOf(ast)).toBeUndefined();
    expect((ast as ActivityDiagram).getDescription()).toBe('(0 activities)');
  });

  it('collects the preprocessor options onto the preprocessing artifact', () => {
    const source = {
      ...sourceOf(),
      styleSource: {
        skinparam: new Map<string, string>(),
        styles: [],
        options: new Map([[OptionKey.HANDWRITTEN, 'true']]),
      },
    };
    const ast = activityLegacyPlugin.parse(source);

    expect(parseRefusalOf(ast)).toBeUndefined();
    const artifact = (ast as unknown as { preprocessing: PreprocessingArtifact }).preprocessing;
    expect(artifact.getOptions().get(OptionKey.HANDWRITTEN)).toBe('true');
  });
});
