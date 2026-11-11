/**
 * `TimingDiagramFactory`: the planning probes the jar draws as TIMING parse and draw to the oracle body; the jar's
 * error probes and corpus rows error at the jar's line (the document line is the jar's minus one: `@startuml` is
 * not a source line); `initCommandsList` keeps upstream's order.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/TimingDiagramFactory.java:55-110
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { ParseRefusal } from '../../../src/core/parse-refusal.js';
import { initCommandsList } from '../../../src/diagrams/timing/TimingDiagramFactory.js';
import type { TimingDiagram } from '../../../src/diagrams/timing/TimingDiagram.js';
import { drawBody } from './helpers/commands.js';
import { diagramOf, ORACLE_ZONE, oracleBody, parseText, PROBES, probeText, TIMING_CACHE } from './helpers/factory.js';

/** Probes the jar draws as something else, or that T4a's tag handling owns. */
const NOT_THIS_FACTORY = ['cov-embedded', 'cov-empty', 'cov-starttiming-tag'];
/** Probes the jar refuses at a line, with the message it prints. */
const ERROR_PROBES: ReadonlyArray<readonly [string, number, string]> = [
  ['cov-unknown-player', 3, 'Unknown "X"'],
  ['cov-bad-date-format', 1, 'Bad date format'],
];
/** Chrome (title, legend, header, footer, scale, banner, background) the plugin draws around the body: T4a. */
const CHROME_PROBES = ['cov-chrome-all', 'cov-mode-dark', 'cov-scale-2', 'cov-skinparam'];
const slugs = readdirSync(PROBES)
  .map((f) => f.replace('.puml', ''))
  .filter((s) => !NOT_THIS_FACTORY.includes(s));
const drawn = slugs.filter(
  (s) => !ERROR_PROBES.some(([e]) => e === s) && !CHROME_PROBES.includes(s) && s !== 'cov-date-julian',
);

function refusalOf(result: TimingDiagram | ParseRefusal): ParseRefusal {
  if (!('refused' in result)) throw new Error('expected a refusal');
  return result;
}

describe('the 40 probes the jar draws as TIMING', () => {
  it('has 40 probes', () => {
    expect(drawn.length + CHROME_PROBES.length).toBe(40);
  });

  it.each(slugs.filter((s) => !ERROR_PROBES.some(([e]) => e === s)))('%s parses without error', (slug) => {
    expect('refused' in parseText(probeText(slug), ORACLE_ZONE)).toBe(false);
  });

  it.each(drawn)('%s draws the oracle body', (slug) => {
    expect(drawBody(diagramOf(probeText(slug), ORACLE_ZONE))).toEqual(oracleBody(`${slug}.svg`));
  });

  it.each(['cov-concise-basic', 'cov-messages', 'cov-notes', 'cov-highlight', 'cov-scale-unit'])(
    '%s is among the drawn probes (the five end-to-end checks)',
    (slug) => {
      expect(drawn).toContain(slug);
    },
  );
});

describe('the probes that carry chrome around the body (T4a)', () => {
  it.each(CHROME_PROBES)('%s parses; its title/legend/scale sit on the diagram for the chrome step', (slug) => {
    expect('refused' in parseText(probeText(slug))).toBe(false);
  });

  it('cov-chrome-all: title, caption, header, footer and legend reach the annotations', () => {
    const a = diagramOf(probeText('cov-chrome-all')).annotations;
    expect(
      [a.title, a.caption, a.header, a.footer, a.legend].map((d) => d.display !== null && d.display !== undefined),
    ).toEqual([true, true, true, true, true]);
  });

  it('cov-scale-2: `scale 2` is the diagram scale', () => {
    expect(diagramOf(probeText('cov-scale-2')).scale).toEqual({ kind: 'simple', factor: 2 });
  });
});

describe('the jar errors', () => {
  it.each(ERROR_PROBES)('%s errors at document line %i with "%s"', (slug, line, message) => {
    const refusal = refusalOf(parseText(probeText(slug)));
    expect([refusal.kind, refusal.line, refusal.message]).toEqual(['execution', line, message]);
  });

  it('cov-date-julian parses and crashes while drawing (TimingRuler#getFirstPositiveOrZeroValue)', () => {
    const diagram = diagramOf(probeText('cov-date-julian'));
    expect(() => drawBody(diagram)).toThrow('java.lang.IllegalStateException');
  });

  it('cov-embedded is a sequence diagram: `Alice` is no player, so the factory refuses', () => {
    expect(refusalOf(parseText(probeText('cov-embedded'))).message).toBe('No such element: Alice');
  });

  it('a line no command claims is a syntax error at that line', () => {
    const refusal = refusalOf(parseText('@startuml\nconcise "C" as C\n???\n@enduml'));
    expect([refusal.kind, refusal.line, refusal.message]).toEqual(['syntax', 2, 'Syntax Error?']);
  });

  it('a throw in a common command is the same error (page 99999999999)', () => {
    const refusal = refusalOf(parseText('@startuml\nminwidth 99999999999\nconcise "C" as C\n@enduml'));
    expect(refusal.message).toMatch(/^You should send a mail to plantuml@gmail\.com with this log \(V.*\) /);
  });

  it("a throw in a timing command is ProtectedCommand's message, at its line", () => {
    const refusal = refusalOf(
      parseText('@startuml\nconcise "C" as C\n@0\nC is a\nC is 99999999999 pixels height\n@enduml'),
    );
    expect([refusal.kind, refusal.line]).toEqual(['execution', 4]);
    expect(refusal.message).toMatch(/^You should send a mail to plantuml@gmail\.com with this log \(V.*\) /);
  });
});

describe('the four D8 corpus rows that are timing command errors', () => {
  const ROWS: ReadonlyArray<readonly [string, number, string]> = [
    ['fuseva-46-zare084', 9, 'Syntax Error?'],
    ['pebecu-20-deci596', 10, 'No such element: A'],
    ['sezuvo-55-nose464', 19, 'No such participant WB'],
    ['vufija-57-xoda292', 10, 'What time?'],
  ];

  it.each(ROWS)('%s errors at document line %i (jar line %i+1): %s', (slug, line, message) => {
    const path = `${TIMING_CACHE}/${slug}/in.puml`;
    if (!existsSync(path)) return; // the gitignored cache is absent on a fresh checkout
    const refusal = refusalOf(parseText(readFileSync(path, 'utf8')));
    expect([refusal.line, refusal.message]).toEqual([line, message]);
  });
});

describe('initCommandsList (TimingDiagramFactory.java:83-109)', () => {
  it('registers common commands 1 first, then the commands in upstream order, with no CommandStopAt', () => {
    expect(initCommandsList().map((c) => c.name)).toEqual([
      'CommonCommands.addCommonCommands1',
      'CommandFootboxIgnored',
      'CommandRobustConcise',
      'CommandClock',
      'CommandAnalog',
      'CommandBinary',
      'CommandDefineStateShort',
      'CommandDefineStateLong',
      'CommandChangeStateByPlayerCode',
      'CommandChangeStateByTime',
      'CommandAtTime',
      'CommandAtPlayer',
      'CommandTimeMessage',
      'CommandNote',
      'CommandNoteLong',
      'CommandConstraint',
      'CommandScalePixel',
      'CommandHideTimeAxis',
      'CommandHighlight',
      'CommandModeCompact',
      'CommandTicks',
      'CommandPixelHeight',
      'CommandUseDateFormat',
    ]);
  });

  it('`stop at` is no command: the line is a syntax error', () => {
    const refusal = refusalOf(parseText('@startuml\nconcise "C" as C\nstop at 10\n@enduml'));
    expect(refusal.message).toBe('Syntax Error?');
  });

  it('`hide footbox` and `show footbox` are accepted and ignored (CommandFootboxIgnored)', () => {
    const diagram = diagramOf('@startuml\nhide footbox\nshow footbox\nfootbox\nconcise "C" as C\n@enduml');
    expect(diagram.getPlayer('C')).toBeDefined();
  });
});

describe('authored fixtures rendered by the jar', () => {
  const FIXTURES = readdirSync('tests/fixtures/timing')
    .filter((f) => f.startsWith('t3c-') && f.endsWith('.puml'))
    .map((f) => f.replace('.puml', ''));

  it('has the authored fixtures', () => {
    expect(FIXTURES.length).toBeGreaterThanOrEqual(7);
  });

  it.each(FIXTURES)('%s draws the oracle body', (slug) => {
    const text = readFileSync(`tests/fixtures/timing/${slug}.puml`, 'utf8');
    expect(drawBody(diagramOf(text, ORACLE_ZONE))).toEqual(oracleBody(`${slug}.svg`));
  });

  it('`highlight` of an unknown code draws nothing: the jar crashes while drawing (a null `when`)', () => {
    const diagram = diagramOf('@startuml\nconcise "C" as C\n@0\nC is a\nhighlight :nope to 10\n@enduml');
    expect(() => drawBody(diagram)).toThrow(TypeError);
  });
});
