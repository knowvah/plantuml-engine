/**
 * `PSystemWelcomeFactory` (eggs/PSystemWelcomeFactory.java:49-56): a source of
 * exactly two lines is the Welcome page; anything else is `null`, which the
 * merge skips (PSystemErrorUtils.java:120-121).
 *
 * Jar values (ftp planning probes, `scripts/oracle-render.sh`):
 * - `@startuml\n@enduml`, `@startuml foo\n@enduml`, and two-line sources
 *   whose third line is a comment or a `!$a = 1` (both vanish before
 *   `getTotalLineCount`) draw the Welcome page.
 * - `@startuml\n\n@enduml` counts its blank line: *Empty description
 *   (Assumed diagram type: sequence)*.
 */
import { describe, expect, it } from 'vitest';
import { buildBlockUmls } from '../../../src/core/BlockUmlBuilder.js';
import type { UmlSource } from '../../../src/core/block-extractor.js';
import { PSystemWelcome } from '../../../src/core/error/PSystemWelcome.js';
import { NULL_SYSTEM } from '../../../src/core/parse-refusal.js';
import { registry } from '../../../src/core/dispatcher.js';
import { renderSync } from '../../../src/index.js';
import { welcomePlugin } from '../../../src/diagrams/eggs/PSystemWelcomeFactory.js';

const WELCOME = 'Welcome to PlantUML!';
const EMPTY = 'Empty description';

function sourceOf(text: string): UmlSource {
  const block = buildBlockUmls(text)[0];
  if (block?.ok !== true) throw new Error(`no block in ${text}`);
  return { ...block.source, seedSourceLines: block.seedSource };
}

describe('welcomePlugin.parse (PSystemWelcomeFactory.java:52-55)', () => {
  it('answers a two-line source with the Welcome page, logo bottom-right', () => {
    const parsed = welcomePlugin.parse(sourceOf('@startuml\n@enduml'));
    expect(parsed).toBeInstanceOf(PSystemWelcome);
    expect((parsed as PSystemWelcome).getPosition()).toBe('BACKGROUND_CORNER_BOTTOM_RIGHT');
    expect((parsed as PSystemWelcome).getDescription()).toBe('(Empty)');
  });

  it('answers a three-line source with null', () => {
    expect(welcomePlugin.parse(sourceOf('@startuml\n\n@enduml'))).toBe(NULL_SYSTEM);
    expect(welcomePlugin.parse(sourceOf('@startuml\nBob -> Alice\n@enduml'))).toBe(NULL_SYSTEM);
  });

  it('does not count comment or preprocessor lines', () => {
    expect(welcomePlugin.parse(sourceOf("@startuml\n' nothing here\n@enduml"))).toBeInstanceOf(PSystemWelcome);
    expect(welcomePlugin.parse(sourceOf('@startuml\n!$a = 1\n@enduml'))).toBeInstanceOf(PSystemWelcome);
  });

  it('counts a hand-built source as its interior plus @start/@end', () => {
    expect(welcomePlugin.parse({ type: 'sequence', lines: [] })).toBeInstanceOf(PSystemWelcome);
    expect(welcomePlugin.parse({ type: 'sequence', lines: ['x'] })).toBe(NULL_SYSTEM);
  });

  it('is a bare PSystemFactory typed SEQUENCE (java:58-61)', () => {
    expect(welcomePlugin.type).toBe('sequence');
    expect(welcomePlugin.factoryBase).toBe('PSystemFactory');
  });
});

describe('the registry routes two-line @startuml to welcomePlugin (PSystemBuilder.java:133)', () => {
  it('resolves the empty two-line block to welcomePlugin, not Empty description', () => {
    const source = sourceOf('@startuml\n@enduml');
    expect(registry.isEmptyDescription(source)).toBe(false);
    expect(registry.resolve(source, undefined, undefined, true).plugin).toBe(welcomePlugin);
  });

  it('leaves the blank-line block to Empty description', () => {
    expect(registry.isEmptyDescription(sourceOf('@startuml\n\n@enduml'))).toBe(true);
  });

  it.each(['@startuml\n@enduml', '@startuml foo\n@enduml', "@startuml\n' nothing here\n@enduml"])(
    'renderSync(%j) draws the Welcome page',
    (puml) => {
      const svg = renderSync(puml);
      expect(svg).toContain(WELCOME);
      expect(svg).not.toContain(EMPTY);
    },
  );

  it('renderSync of a blank-line block is Empty description (Assumed diagram type: sequence)', () => {
    const svg = renderSync('@startuml\n\n@enduml');
    expect(svg).toContain(EMPTY);
    expect(svg).toContain('Assumed diagram type: sequence');
  });
});
