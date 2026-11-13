/**
 * `CrashDiagramFactory` (crash/*.java): `@startcrash` draws a 349x273 page
 * typed `BPM` (`CrashDiagram.java:59`) unless a `crash when …` line set a
 * crash type; PARSING throws inside `ProtectedCommand`, FINALIZING from
 * `checkFinalError`, DRAWING from `getTextBlock`.
 *
 * Jar values: ftp planning probes (`scripts/oracle-render.sh`), `cov-crash-*`.
 */
import { describe, expect, it } from 'vitest';
import { buildBlockUmls } from '../../../src/core/BlockUmlBuilder.js';
import type { UmlSource } from '../../../src/core/block-extractor.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { parseRefusalOf } from '../../../src/core/parse-refusal.js';
import { CommandCrashAny } from '../../../src/diagrams/crash/CommandCrashAny.js';
import { CommandSelectCrash, PARSING_CRASH } from '../../../src/diagrams/crash/CommandSelectCrash.js';
import { CrashDiagram, DRAWING_CRASH, FINALIZING_CRASH } from '../../../src/diagrams/crash/CrashDiagram.js';
import { initCommandsList, parseCrash } from '../../../src/diagrams/crash/CrashDiagramFactory.js';
import { CrashType, valueOf } from '../../../src/diagrams/crash/CrashType.js';
import { crashPlugin } from '../../../src/diagrams/crash/index.js';
import { renderSync } from '../../../src/index.js';
import { StringLocated } from '../../../src/core/tim/StringLocated.js';
import { CommandControl } from '../../../src/core/command/CommandControl.js';

/** The jar's `<text>` runs: 18 `Display` lines (`CrashDiagram.java:66-83`), bold/italic/monospace segments split
 *  into their own runs (`cov-crash-banner` oracle). */
const TEXT_RUN_COUNT = 26;

function sourceOf(text: string): UmlSource {
  const block = buildBlockUmls(text)[0];
  if (block?.ok !== true) throw new Error(`no block in ${text}`);
  return {
    ...block.source,
    seedSourceLines: block.seedSource,
    rawSourceLines: block.rawSource.map((s) => s.getString()),
  };
}

function crash(body: string): string {
  return `@startcrash\n${body}\n@endcrash`;
}

function textRuns(svg: string): string[] {
  return [...svg.matchAll(/<text [^>]*>/g)].map((m) => m[0]);
}

describe('CommandSelectCrash (CommandSelectCrash.java:57-65)', () => {
  const cmd = new CommandSelectCrash();
  it.each([
    'crash when parsing',
    'crash when finalizing',
    'crash when drawing',
    'CRASH WHEN DRAWING',
    'crash   when   drawing',
  ])('claims %j', (line) => expect(cmd.isValid(new StringLocated(line, undefined))).toBe(CommandControl.OK));
  it.each(['crash when later', 'crashwhen drawing', 'crash when'])('does not claim %j', (line) =>
    expect(cmd.isValid(new StringLocated(line, undefined))).toBe(CommandControl.NOT_OK),
  );
  it('explains the phase', () => {
    expect(cmd.explain(new StringLocated('crash when drawing', undefined))).toBe(
      'Deliberately crashing PlantUML during the drawing phase (internal test command)',
    );
  });
});

describe('CommandCrashAny (CommandCrashAny.java:57-59)', () => {
  it.each(['anything goes', 'title Hello', '', 'crash when later'])('claims %j and explains nothing', (line) => {
    const cmd = new CommandCrashAny();
    expect(cmd.isValid(new StringLocated(line, undefined))).toBe(CommandControl.OK);
    expect(cmd.explain(new StringLocated(line, undefined))).toBeUndefined();
  });
  it('lists the two commands, select first (CrashDiagramFactory.java:54-58)', () => {
    const [first, second, ...rest] = initCommandsList();
    expect(first).toBeInstanceOf(CommandSelectCrash);
    expect(second).toBeInstanceOf(CommandCrashAny);
    expect(rest).toEqual([]);
  });
});

describe('CrashType.valueOf', () => {
  it('maps a name to its constant and throws for any other', () => {
    expect(valueOf('DRAWING')).toBe(CrashType.DRAWING);
    expect(() => valueOf('LATER')).toThrow(
      'java.lang.IllegalArgumentException: No enum constant net.sourceforge.plantuml.crash.CrashType.LATER',
    );
  });
});

describe('parseCrash (PSystemCommandFactory.java:106-160)', () => {
  it('builds a BPM-typed diagram for any line', () => {
    const parsed = parseCrash(sourceOf(crash('anything goes')));
    expect(parsed).toBeInstanceOf(CrashDiagram);
    const diagram = parsed as CrashDiagram;
    expect(diagram.getDiagramType()).toBe('BPM');
    expect(diagram.getDescription()).toBe('Crash Diagram');
    expect(diagram.getCrashType()).toBeUndefined();
  });

  it('PARSING is a ProtectedCommand execution error on its line', () => {
    const refusal = parseRefusalOf(parseCrash(sourceOf(crash('crash when parsing'))));
    expect(refusal?.kind).toBe('execution');
    expect(refusal?.line).toBe(1);
    expect(refusal?.message).toMatch(/^You should send a mail to plantuml@gmail\.com with this log \(V[^)]+\) /);
    expect(refusal?.message.endsWith(PARSING_CRASH)).toBe(true);
  });

  it('a later line overwrites the type (CommandSelectCrash.java:82)', () => {
    const parsed = parseCrash(sourceOf(crash('crash when finalizing\ncrash when drawing'))) as CrashDiagram;
    expect(parsed.getCrashType()).toBe(CrashType.DRAWING);
  });

  it('FINALIZING throws out of checkFinalError', () => {
    expect(() => parseCrash(sourceOf(crash('crash when finalizing')))).toThrow(FINALIZING_CRASH);
  });

  it('refuses a source that does not open with a start directive', () => {
    expect(() => parseCrash({ type: 'crash', lines: [], seedSourceLines: ['x', '@endcrash'] })).toThrow(
      'UnsupportedOperationException',
    );
  });
});

describe('crashPlugin export (CrashDiagram.java:62-88)', () => {
  it('draws the jar page: BPM, 349x273, 26 text runs from x=10', () => {
    const svg = renderSync(crash('anything goes'), { measurer: new DeterministicMeasurer() });
    expect(svg).toContain('data-diagram-type="BPM"');
    expect(svg).toContain('width="349px" height="273px"');
    const runs = textRuns(svg);
    expect(runs).toHaveLength(TEXT_RUN_COUNT);
    expect(runs[0]).toContain('x="10" y="20.889"');
    expect(runs[0]).toContain('textLength="94.15" font-weight="700"');
    expect(svg).toContain('>Crash Diagram<');
  });

  it.each(['title Hello\nscale 2', 'skinparam backgroundColor #EEEEEE', 'crash when later'])(
    '%j draws the same page',
    (body) => {
      const banner = renderSync(crash('anything goes'), { measurer: new DeterministicMeasurer() });
      expect(renderSync(crash(body), { measurer: new DeterministicMeasurer() })).toBe(banner);
    },
  );

  it('!option handwritten draws through UGraphicHandwritten (TitledDiagram.java:114-118)', () => {
    // A text-only page: the handwritten wrapper jitters shapes, not text, so the SVG is the banner's.
    const block = buildBlockUmls(crash('!option handwritten true\nanything goes'))[0];
    if (block?.ok !== true) throw new Error('no block');
    const source = { ...sourceOf(crash('!option handwritten true\nanything goes')), styleSource: block.preprocessed };
    const parsed = parseCrash(source) as CrashDiagram;
    expect(parsed.isHandwritten()).toBe(true);
    const geo = crashPlugin.layoutSync(parsed, undefined as never, new DeterministicMeasurer());
    const fragment = crashPlugin.render(geo, undefined as never) as { diagramType: string; width: number };
    expect(fragment.diagramType).toBe('BPM');
    expect(fragment.width).toBe(349);
  });

  it('DRAWING throws from the draw', () => {
    const parsed = parseCrash(sourceOf(crash('CRASH   WHEN   DRAWING'))) as CrashDiagram;
    const geo = crashPlugin.layoutSync(parsed, undefined as never, new DeterministicMeasurer());
    expect(() => crashPlugin.render(geo, undefined as never)).toThrow(DRAWING_CRASH);
  });

  it('an empty block is Empty description (Assumed diagram type: crash)', () => {
    const svg = renderSync('@startcrash\n@endcrash');
    expect(svg).toContain('Empty description');
    expect(svg).toContain('Assumed diagram type: crash');
  });
});
