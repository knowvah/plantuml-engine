import { describe, expect, it } from 'vitest';
import { DiagramType } from '../../../src/core/diagram-type-set.js';
import { DiagramRegistry } from '../../../src/core/dispatcher.js';
import { Rankdir } from '../../../src/core/klimt/geom/Rankdir.js';
import { initCommandsList } from '../../../src/diagrams/cheneer/ChenEerDiagramFactory.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { chenPlugin } from '../../../src/diagrams/cheneer/index.js';
import { parseLines, parseOk, parseRefused, sourceOf } from './helpers.js';

/** `ChenEerDiagramFactory.java:58-69`, one entry per `cmds.add`. */
const UPSTREAM_ORDER = [
  'CommonCommands.addCommonCommands1',
  'CommandRankDir',
  'CommandCreateEntity',
  'CommandCreateAttribute',
  'CommandAssociate',
  'CommandEndGroup',
  'CommandSimpleSubclass',
  'CommandMultiSubclass',
];

describe('ChenEerDiagramFactory#initCommandsList', () => {
  it('lists the commands in upstream order', () => {
    expect(initCommandsList().map((command) => command.name)).toEqual(UPSTREAM_ORDER);
  });
});

describe('plugin', () => {
  it('is the chen plugin and prints the CHEN_EER type', () => {
    expect(chenPlugin.type).toBe('chen');
    expect(parseOk().getDiagramType()).toBe('CHEN_EER');
  });

  it('lays out and renders into a CHEN_EER fragment', () => {
    const diagram = parseOk('entity A {', '}', 'entity B {', '}', 'A -1- B');
    const measurer = new DeterministicMeasurer();
    const layout = chenPlugin.layoutSync(diagram, undefined as never, measurer, undefined);
    expect(layout.geometry.nodes).toHaveLength(2);
    const fragment = chenPlugin.render(layout, undefined as never, undefined) as { diagramType: string };
    expect(fragment.diagramType).toBe('CHEN_EER');
  });

  it('parses through the plugin entry', () => {
    const result = chenPlugin.parse(sourceOf('left to right direction'));
    expect((result as ReturnType<typeof parseOk>).getSkinParam().getRankdir()).toBe(Rankdir.LEFT_TO_RIGHT);
  });
});

describe('parse: empty diagram', () => {
  it('is answered by the dispatcher (the Welcome page of cov-empty), never reaching the plugin', () => {
    const registry = new DiagramRegistry();
    registry.register(chenPlugin);
    const emptySource = { ...sourceOf(), types: new Set([DiagramType.CHEN_EER]) };

    expect(registry.isEmptyDescription(emptySource)).toBe(true);
  });

  it('would, if reached, build a diagram with no leaf', () => {
    expect(parseOk().leafs()).toHaveLength(0);
  });
});

describe('parse: common commands and rank direction', () => {
  it('accepts "left to right direction" as the first line and sets the rank direction', () => {
    expect(parseOk().getSkinParam().getRankdir()).toBe(Rankdir.TOP_TO_BOTTOM);
    expect(parseOk('left to right direction').getSkinParam().getRankdir()).toBe(Rankdir.LEFT_TO_RIGHT);
    expect(parseOk('left to right direction', 'top to bottom direction').getSkinParam().getRankdir()).toBe(
      Rankdir.TOP_TO_BOTTOM,
    );
  });

  it('puts title and header on the annotations', () => {
    const diagram = parseOk('title X', 'header H');

    expect(diagram.annotations.title.display?.toString()).toBe('X');
    expect(diagram.annotations.header.display?.toString()).toBe('H');
  });

  it('scale lands on the diagram', () => {
    expect(parseOk('scale 2').scale).toEqual({ kind: 'simple', factor: 2 });
  });

  it('!pragma lands on the diagram pragma', () => {
    expect(parseOk('!pragma layout elk').isUseElk()).toBe(true);
  });
});

describe('parse: refusals', () => {
  it('"left  to right direction" (two spaces) is not a direction: CommandRankDir uses one [%s], and the attribute grammar claims it', () => {
    expect(parseRefused('left  to right direction').message).toBe(
      'Attribute must be inside an entity, relationship or another attribute',
    );
  });

  it('"}" with nothing open is "Unbalanced brackets" (err-unbalanced)', () => {
    const refusal = parseRefused('}');

    expect(refusal.kind).toBe('execution');
    expect(refusal.message).toBe('Unbalanced brackets');
    expect(refusal.line).toBe(0);
  });

  it('a line no command matches is "Syntax Error?"', () => {
    const refusal = parseRefused('left to right direction', '%%%');

    expect(refusal.kind).toBe('syntax');
    expect(refusal.message).toBe('Syntax Error?');
    expect(refusal.line).toBe(1);
  });

  it('a second "}" after a balanced pair is refused', () => {
    const diagram = parseLines('}');

    expect('refused' in diagram).toBe(true);
  });
});
